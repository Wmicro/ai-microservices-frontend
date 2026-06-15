// 普通（非流式）聊天组合函数
// 与 useChatStream 对称：每次发送 → 一次性拿到完整回答
import { ref, nextTick } from 'vue'
import type { ChatMessage } from '@/types/chat'
import * as chatApi from '@/api/chat'
import { generateMessageId, formatMessageTime } from './_chatUtils'

/** 从 chat() 返回值中提取回答内容
 *  chat() 拦截器已统一处理：无 sessionId 返回 string，有 sessionId 返回 ChatResult
 */
function extractAnswer(raw: string | chatApi.ChatResult): string {
  if (typeof raw === 'string') return raw || '(未收到回答)'
  return raw?.answer || '(未收到回答)'
}

/** 从 chat() 返回值中提取 sessionId（仅多轮对话时存在） */
function extractSessionId(raw: string | chatApi.ChatResult): string | undefined {
  if (typeof raw === 'string') return undefined
  return raw?.sessionId
}

/**
 * 普通聊天 Hook
 * 用法：
 *   const { messages, isLoading, sendMessage, clearMessages, scrollToBottom } = useChatNormal(containerRef)
 */
export function useChatNormal(containerRef?: { value: HTMLElement | undefined }) {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  /** 当前会话 ID（后端返回，用于多轮对话上下文关联） */
  const sessionId = ref<string | undefined>(undefined)

  /** 滚动容器到底部 */
  function scrollToBottom() {
    nextTick(() => {
      if (containerRef?.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight
      }
    })
  }

  /** 发送一条消息（普通非流式） */
  async function sendMessage(question: string, model?: string) {
    if (!question.trim() || isLoading.value) return

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: question,
      time: formatMessageTime()
    }
    messages.value.push(userMsg)
    scrollToBottom()

    // ⚠️ push 后从数组尾部拿响应式 proxy，直接修改才能触发渲染
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

    isLoading.value = true
    try {
      // 传入 sessionId 让后端保持多轮对话上下文
      const raw = await chatApi.chat(question, sessionId.value, model)
      assistantMsg.content = extractAnswer(raw)
      // 保存后端返回的 sessionId，用于下一轮对话
      const newSessionId = extractSessionId(raw)
      if (newSessionId) sessionId.value = newSessionId
      assistantMsg.streaming = false
    } catch (error) {
      assistantMsg.content = '抱歉，服务出现问题，请稍后重试'
      assistantMsg.streaming = false
      console.error('[chat-normal] request failed:', error)
    } finally {
      isLoading.value = false
      scrollToBottom()
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

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    scrollToBottom
  }
}