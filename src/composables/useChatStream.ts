// SSE 流式对话 Hook —— 基于多对话架构
// 通过 Pinia chat-store 维护状态，调用 /api/stream 接口
import { onUnmounted } from 'vue'
import * as chatApi from '@/api/chat'
import { useChatStore } from '@/stores/chat'
import {
  createMessage,
  createScrollToBottom,
  ERROR_MESSAGE_PERMISSION
} from './chatUtils'

export function useChatStream(
  _convIdGetter: () => string | null,
  scrollerRef?: { value: { scrollToBottom: () => void } | undefined }
) {
  const chatStore = useChatStore()
  const scrollToBottom = createScrollToBottom(scrollerRef)
  const abortMap = new Map<string, { abort: () => void }>()

  async function sendMessage(question: string, model?: string) {
    const conv = chatStore.current
    if (!conv) return
    if (!question.trim()) return
    if (chatStore.isLoading(conv.id) || chatStore.isStreaming(conv.id)) return

    const convId = conv.id
    const effectiveModel = model || conv.model

    chatStore.setStreaming(convId)

    // 1. 推入用户消息
    chatStore.appendMessage(convId, createMessage('user', question, effectiveModel))
    scrollToBottom()

    // 2. 推入占位 AI 消息
    const assistantMsg = createMessage('assistant', '', effectiveModel, true)
    chatStore.appendMessage(convId, assistantMsg)
    scrollToBottom()

    let streamCompleted = false
    let accumulatedContent = ''

    const stream = chatApi.createStreamConnection(
      question,
      conv.sessionId,
      effectiveModel,
      {
        onSession(id: string) {
          if (id && conv.sessionId !== id) {
            conv.sessionId = id
          }
        },
        onMessage(chunk: string) {
          if (chunk === '[DONE]') return
          accumulatedContent += chunk
          chatStore.updateMessage(convId, assistantMsg.id, { content: accumulatedContent })
          scrollToBottom()
        },
        onError(_error: Event | Error) {
          streamCompleted = true
          chatStore.setStreaming(null)
          chatStore.updateMessage(convId, assistantMsg.id, {
            content: ERROR_MESSAGE_PERMISSION,
            streaming: false
          })
          scrollToBottom()
        },
        onComplete() {
          if (streamCompleted) return
          streamCompleted = true
          chatStore.setStreaming(null)
          chatStore.updateMessage(convId, assistantMsg.id, { streaming: false })
          scrollToBottom()
        }
      }
    )

    abortMap.set(convId, stream)
  }

  function stopStreaming() {
    const conv = chatStore.current
    if (!conv) return
    const controller = abortMap.get(conv.id)
    controller?.abort()
    abortMap.delete(conv.id)
    chatStore.setStreaming(null)

    const streamingMsg = conv.messages[conv.messages.length - 1]
    if (streamingMsg && streamingMsg.streaming) {
      chatStore.updateMessage(conv.id, streamingMsg.id, {
        streaming: false,
        content: streamingMsg.content || '(已停止)'
      })
    }
  }

  async function clearMessages() {
    const conv = chatStore.current
    if (!conv) return
    await chatStore.clearMessagesInConversation(conv.id)
  }

  onUnmounted(() => {
    abortMap.forEach((ctrl) => ctrl.abort())
    abortMap.clear()
    chatStore.setStreaming(null)
  })

  return { sendMessage, stopStreaming, clearMessages }
}