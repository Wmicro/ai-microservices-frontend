// AI 聊天服务 API（对应后端 ai-chat-service：/api/chat/* 和 /api/stream）
import axios from '@/utils/axios'
import type { ChatHistory } from '@/types/chat'

/** 多轮对话接口返回值：AI 回答 + 会话 ID */
export interface ChatResult {
  /** AI 回答内容 */
  answer: string
  /** 后端返回的会话 ID（用于多轮对话上下文） */
  sessionId: string
}

/** 普通文本对话（非流式）— 后端是 @GetMapping，用 query 参数
 * @param question 用户问题
 * @param sessionId 会话 ID（可选，不传则后端自动创建新会话）
 * @param model 模型名称（可选）
 * @returns 首次调用返回字符串；传入 sessionId 后返回 ChatResult（含会话 ID）
 */
export function chat(question: string, sessionId?: string, model?: string) {
  const params: Record<string, string> = { question }
  if (sessionId) params.sessionId = sessionId
  if (model) params.model = model
  return axios.get<unknown, string | ChatResult>('/api/chat', { params })
}

/** 生成流式对话（SSE）的完整访问 URL（含 Token、模型、会话 ID 参数）
 * 浏览器原生 EventSource 不支持自定义 Header，Token 必须放到 query
 */
export function getStreamUrl(question: string, sessionId?: string, model?: string) {
  const token = localStorage.getItem('token') || ''
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'
  let url = `${baseURL}/api/stream?question=${encodeURIComponent(question)}`
  if (sessionId) url += `&sessionId=${encodeURIComponent(sessionId)}`
  if (model) url += `&model=${encodeURIComponent(model)}`
  if (token) url += `&token=${encodeURIComponent(token)}`
  return url
}

/** 获取对话历史记录 */
export function getChatHistory() {
  return axios.get<unknown, ChatHistory[]>('/api/chat/history')
}

/** 清空当前用户对话历史 */
export function clearChatHistory() {
  return axios.delete<unknown, void>('/api/chat/history')
}