// 普通（非流式）对话 Hook —— 基于多对话架构
// 通过 Pinia chat-store 维护状态，调用 /api/chat 接口
import * as chatApi from '@/api/chat'
import { useChatStore } from '@/stores/chat'
import {
  createMessage,
  extractAnswer,
  createScrollToBottom,
  ERROR_MESSAGE_PERMISSION
} from './chatUtils'

export function useChatNormal(
  _convIdGetter: () => string | null,
  scrollerRef?: { value: { scrollToBottom: () => void } | undefined }
) {
  const chatStore = useChatStore()
  const scrollToBottom = createScrollToBottom(scrollerRef)

  async function sendMessage(question: string, model?: string) {
    const conv = chatStore.current
    if (!conv) return
    if (!question.trim()) return
    if (chatStore.isLoading(conv.id) || chatStore.isStreaming(conv.id)) return

    const convId = conv.id
    const effectiveModel = model || conv.model

    chatStore.setLoading(convId)

    // 1. 推入用户消息
    chatStore.appendMessage(convId, createMessage('user', question, effectiveModel))
    scrollToBottom()

    // 2. 推入占位 AI 消息
    const assistantMsg = createMessage('assistant', '正在思考...', effectiveModel, true)
    chatStore.appendMessage(convId, assistantMsg)
    scrollToBottom()

    try {
      const result = await chatApi.chat(question, conv.sessionId, effectiveModel)
      chatStore.updateMessage(convId, assistantMsg.id, {
        content: extractAnswer(result),
        streaming: false
      })
    } catch (e: any) {
      console.warn('[chat-normal] 对话失败:', e)
      chatStore.updateMessage(convId, assistantMsg.id, {
        content: ERROR_MESSAGE_PERMISSION,
        streaming: false
      })
    } finally {
      chatStore.setLoading(null)
      scrollToBottom()
    }
  }

  async function clearMessages() {
    const conv = chatStore.current
    if (!conv) return
    await chatStore.clearMessagesInConversation(conv.id)
  }

  return { sendMessage, clearMessages }
}