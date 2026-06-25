// 聊天相关工具函数（被 useChatNormal / useChatStream 共享使用）
import { nextTick } from 'vue'
import type { ChatResult, ChatMessage } from '@/types/chat'

export const ERROR_MESSAGE = '抱歉，服务出现问题，请稍后重试'
export const ERROR_MESSAGE_PERMISSION = '抱歉，服务出现问题，请稍后重试（或检查当前模型的使用权限）'

export function generateMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function formatMessageTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/** 创建带默认值的消息对象 */
export function createMessage(role: 'user' | 'assistant', content: string, model?: string, streaming = false): ChatMessage {
  return {
    id: generateMessageId(),
    role,
    content,
    time: formatMessageTime(),
    model,
    streaming
  }
}

export function extractAnswer(raw: ChatResult | string | unknown): string {
  if (raw && typeof raw === 'object' && 'answer' in (raw as any)) {
    return (raw as ChatResult).answer || '(未收到回答)'
  }
  return String(raw || '(未收到回答)')
}

export function extractSessionId(raw: ChatResult | string | unknown): string | undefined {
  if (raw && typeof raw === 'object' && 'sessionId' in (raw as any)) {
    return (raw as ChatResult).sessionId
  }
  return undefined
}

export function extractChunk(chunk: string): string {
  return chunk
}

export function createScrollToBottom(scrollerRef?: { value: { scrollToBottom: () => void } | undefined }) {
  return function scrollToBottom() {
    nextTick(() => {
      requestAnimationFrame(() => {
        const el = scrollerRef?.value as any
        if (el?.$el) {
          const $el = el.$el as HTMLElement
          $el.scrollTop = $el.scrollHeight
        } else if (el && typeof el.scrollTop === 'number') {
          el.scrollTop = el.scrollHeight
        }
      })
    })
  }
}