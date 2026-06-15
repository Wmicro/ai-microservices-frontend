// 聊天 SSE 流式对话组合函数
// 抽离 Chat.vue 中的 EventSource 管理、消息构造、工具方法
import { ref, nextTick, onUnmounted } from 'vue'
import type { ChatMessage } from '@/types/chat'
import * as chatApi from '@/api/chat'
import { generateMessageId, formatMessageTime } from './_chatUtils'

/** 流式事件数据提取 — SSE 的 event.data 就是纯文本片段 */
function extractChunk(chunk: unknown): string {
  if (typeof chunk === 'string') return chunk
  return ''
}

/** 从普通接口回退的返回值中提取回答内容（与 useChatNormal 保持一致） */
function extractAnswer(raw: string | chatApi.ChatResult): string {
  if (typeof raw === 'string') return raw || ''
  return raw?.answer || ''
}

/** 从回退返回值中提取 sessionId */
function extractSessionId(raw: string | chatApi.ChatResult): string | undefined {
  if (typeof raw === 'string') return undefined
  return raw?.sessionId
}

/**
 * 流式聊天 Hook
 * 用法：
 *   const { messages, isStreaming, sendMessage, stopStreaming, clearMessages, scrollToBottom } = useChatStream(messagesContainerRef)
 */
export function useChatStream(containerRef?: { value: HTMLElement | undefined }) {
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  /** 当前会话 ID（后端返回，用于多轮对话上下文关联） */
  const sessionId = ref<string | undefined>(undefined)
  let eventSource: EventSource | null = null

  /** 滚动容器到底部 */
  function scrollToBottom() {
    nextTick(() => {
      if (containerRef?.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight
      }
    })
  }

  /** 发送一条消息（包含 SSE 流式响应 & 失败回退普通接口） */
  async function sendMessage(question: string, model?: string) {
    if (!question.trim() || isStreaming.value) return

    // 1. 推入用户消息
    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: question,
      time: formatMessageTime()
    }
    messages.value.push(userMsg)
    scrollToBottom()

    // 2. 推入 AI 占位消息 — ⚠️ 关键：push 后从数组尾部拿响应式引用
    messages.value.push({
      id: generateMessageId(),
      role: 'assistant',
      content: '',
      time: formatMessageTime(),
      streaming: true,
      model
    })
    const assistantMsg = messages.value[messages.value.length - 1]
    scrollToBottom()

    // 3. 发起 SSE 流式请求（传递 sessionId 实现多轮对话上下文）
    isStreaming.value = true
    let completed = false
    const url = chatApi.getStreamUrl(question, sessionId.value, model)
    eventSource = new EventSource(url)

    // 后端流式事件有两种：
    //   event:session → data 是 sessionId（用于多轮对话上下文关联）
    //   event:message → data 是回答内容片段（逐字输出）
    eventSource.addEventListener('session', (event) => {
      sessionId.value = event.data
    })
    eventSource.addEventListener('message', (event) => {
      assistantMsg.content += extractChunk(event.data)
      scrollToBottom()
    })

    // emitter.complete() 会触发 onerror，在这里处理正常结束
    eventSource.onerror = () => {
      eventSource?.close()
      if (completed) return
      completed = true
      isStreaming.value = false
      assistantMsg.streaming = false

      // 流式失败且没有任何内容时，回退到普通接口（也传递 sessionId）
      if (!assistantMsg.content) {
        chatApi.chat(question, sessionId.value, model).then((answer) => {
          assistantMsg.content = extractAnswer(answer)
          const newSessionId = extractSessionId(answer)
          if (newSessionId) sessionId.value = newSessionId
          scrollToBottom()
        }).catch(() => {
          assistantMsg.content = '抱歉，服务出现问题，请稍后重试（或检查当前模型的使用权限）'
          scrollToBottom()
        })
      } else {
        scrollToBottom()
      }
    }
  }

  /** 停止当前流式响应 */
  function stopStreaming() {
    eventSource?.close()
    isStreaming.value = false
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.streaming) {
      lastMsg.streaming = false
      if (!lastMsg.content) lastMsg.content = '(已停止)'
    }
  }

  /** 清空对话（重置 sessionId + 调用后端清除历史接口） */
  async function clearMessages() {
    messages.value = []
    sessionId.value = undefined
    try {
      await chatApi.clearChatHistory()
    } catch {
      // ignore
    }
  }

  /** 组件卸载时关闭 EventSource */
  onUnmounted(() => {
    eventSource?.close()
  })

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    clearMessages,
    scrollToBottom
  }
}