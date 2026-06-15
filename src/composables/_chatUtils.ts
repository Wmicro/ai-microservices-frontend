// 聊天相关工具函数（被 useChatNormal / useChatStream 共享使用）

/** 生成消息唯一 ID：Date.now(36) + 随机后缀 */
export function generateMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/** 格式化当前时间为 HH:mm */
export function formatMessageTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}