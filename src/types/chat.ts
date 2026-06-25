// 聊天领域类型定义（与后端 ai-chat-service 对应）

/** 对话会话 —— 后端 ChatSession 实体 */
export interface ChatSession {
  id: string              // 会话 ID，UUID
  userId: number          // 所属用户 ID
  title: string           // 会话标题（首条提问自动截取，可手动修改）
  model: string           // 使用的模型名称（如 qwen-turbo、gpt-4o）
  createTime: string      // 创建时间（ISO，如 2026-06-18T10:00:00）
  updateTime: string      // 更新时间（ISO）
}

/** 对话历史记录 —— 后端 ChatHistory 实体 */
export interface ChatHistory {
  id: number
  userId: number
  sessionId: string
  question: string
  answer: string
  model: string
  provider?: string       // 厂商名（如 dashscope / openai）
  tokenCount: number
  createTime: string
}

/** 多轮对话接口返回值：AI 回答 + 会话 ID */
export interface ChatResult {
  answer: string
  sessionId: string
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

/**
 * 前端会话（Conversation）—— 扩展自后端 ChatSession，
 * 额外维护：当前使用的模式（普通/流式）、本地消息列表。
 */
export interface Conversation {
  id: string                    // 对应后端 ChatSession.id
  title: string                 // 会话标题
  model: string                 // 使用的模型（从后端同步）
  sessionId: string             // 同 id（与后端一致）
  mode: 'normal' | 'stream'     // 当前使用的对话模式（仅前端区分）
  messages: ChatMessage[]       // 本会话的消息列表（前端内存 / 缓存）
  createTime: string            // 创建时间
  updateTime: string            // 最后更新时间
}