// 聊天领域类型定义（与后端 ai-chat-service 对应）

/** 对话历史记录（后端存储结构） */
export interface ChatHistory {
  id: number
  userId: number
  sessionId: string
  question: string
  answer: string
  model: string
  tokenCount: number
  createTime: string
}

/** 聊天消息（前端渲染用，含流式状态） */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  streaming?: boolean
  model?: string
}