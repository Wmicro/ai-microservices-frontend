// 聊天相关 API 封装
// 后端接口文档：http://localhost:10000/swagger-ui.html
import axios from '@/utils/axios'
import type { ChatResult, ChatSession, ChatHistory } from '@/types/chat'

/**
 * 普通对话接口（POST + JSON body）
 * - 长文本参数放 body 传输，避免 URL 长度限制触发 414
 * - 与流式接口风格保持一致
 * - 后端需同步：@PostMapping("/api/chat") + @RequestBody { question, sessionId, model }
 * @param question 用户问题
 * @param sessionId 会话 ID（可选，首次对话可不传，后端自动创建）
 * @param model 模型名称（可选，使用后端默认值）
 * @returns ChatResult
 */
export function chat(question: string, sessionId?: string, model?: string) {
  const body: Record<string, string> = { question }
  if (sessionId) body.sessionId = sessionId
  if (model) body.model = model
  return axios.post<unknown, ChatResult>('/api/chat', body)
}

/**
 * 创建会话（参数通过 JSON body 传递）
 * @param title 会话标题（可选）
 * @param model 模型名称（可选，使用后端默认值）
 * @returns ChatSession
 */
export function createSession(title?: string, model?: string) {
  const body: Record<string, string> = {}
  if (title) body.title = title
  if (model) body.model = model
  return axios.post<unknown, ChatSession>('/api/chat/session', body)
}

/**
 * 获取会话列表
 * @returns ChatSession[]
 */
export function listSessions() {
  return axios.get<unknown, ChatSession[]>('/api/chat/sessions')
}

/**
 * 删除会话（注意：后端路径是 /chat/session/{sessionId} 单数）
 * @param sessionId 会话 ID
 * @returns void
 */
export function deleteSession(sessionId: string) {
  return axios.delete<unknown, void>(`/api/chat/session/${sessionId}`)
}

/**
 * 获取对话历史（注意：后端使用 query 参数 sessionId）
 * @param sessionId 会话 ID
 * @returns ChatHistory[]
 */
export function getChatHistory(sessionId: string) {
  const params = { sessionId }
  return axios.get<unknown, ChatHistory[]>('/api/chat/history', { params })
}

/**
 * 清空对话历史（参数通过 JSON body 传递）
 * @param sessionId 会话 ID
 * @returns void
 */
export function clearChatHistory(sessionId: string) {
  return axios.post<unknown, void>('/api/chat/clear', { sessionId })
}

/**
 * 更新会话标题（PATCH + JSON body）
 * - 用 body 传 title，避免 query 参数 URL 编码破坏中文/特殊字符
 * - 后端需同步：@RequestBody { title }
 * @param sessionId 会话 ID
 * @param newTitle 新标题
 * @returns void
 */
export function updateSessionTitle(sessionId: string, newTitle: string) {
  return axios.patch<unknown, void>(`/api/chat/session/${sessionId}`, { title: newTitle })
}

/**
 * 流式对话接口（POST + JSON body）
 * ————————————————————————————————————
 * 用 fetch + ReadableStream 替代原生 EventSource，解决以下问题：
 *   1. 原生 EventSource 不支持自定义 headers → 无法在 header 中传 Authorization token
 *   2. 原生 EventSource 只支持 GET → 长文本会触发 URL 长度限制（414）
 *   3. 原生 EventSource 无法控制超时、重试策略
 *
 * 改用 POST 后：参数放在 JSON body 中传输，不再受 URL 长度限制；
 * 流式输出效果完全不变（SSE 是"响应体"的格式，与请求 method 无关）。
 *
 * 后端需同步：
 *   - 方法：@PostMapping("/api/stream")
 *   - 取参：@RequestBody StreamRequest { question, sessionId, model }
 *   - 响应头/响应体输出逻辑：完全不变（Content-Type: text/event-stream + 逐块写）
 *
 * 后端 SSE 事件格式：
 *   event: session        ← 新会话创建（首次请求时触发）
 *   data: <sessionId>
 *   (空行)
 *   event: message        ← 流式内容片段
 *   data: <text>
 *   (空行)
 *   data: [DONE]          ← 结束标记
 * ————————————————————————————————————
 */
export function createStreamConnection(
  question: string,
  sessionId?: string,
  model?: string,
  callbacks?: {
    onSession?: (id: string) => void
    onMessage?: (chunk: string) => void
    onError?: (error: Event | Error) => void
    onComplete?: () => void
  }
) {
  // 用与 axios 一致的 baseURL（空字符串 = 走 vite 代理）
  const apiBase = ''
  const headers: Record<string, string> = {
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json'
  }

  // 从 localStorage 读 token（与 axios 拦截器保持一致的来源）
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 参数放 body（JSON），不再拼到 URL query，避免长文本触发 414 URL Too Long
  const body = JSON.stringify({
    question,
    ...(sessionId ? { sessionId } : {}),
    ...(model ? { model } : {})
  })

  const url = `${apiBase}/api/stream`

  const abortController = new AbortController()

  // 异步发起请求 + 解析 SSE 流
  ;(async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: abortController.signal,
        credentials: 'include'
      })

      if (!response.ok || !response.body) {
        throw new Error(`流式请求失败: ${response.status} ${response.statusText}`)
      }

      // 逐块读取 SSE 文本流
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''           // 缓冲未完整解析的文本
      let currentEvent = ''     // 当前事件名（来自 event: 字段）
      let currentData = ''      // 当前累积数据（可能跨多个 data: 行）

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 逐行处理
        let lineBreakIndex: number
        while ((lineBreakIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, lineBreakIndex).replace(/\r$/, '') // 兼容 \r\n
          buffer = buffer.slice(lineBreakIndex + 1)

          if (line === '') {
            // 空行 → 事件分隔，派发当前累积的事件
            if (currentData !== '') {
              const data = currentData
              const evtName = currentEvent || 'message'

              if (data === '[DONE]') {
                callbacks?.onComplete?.()
              } else if (evtName === 'session') {
                callbacks?.onSession?.(data)
              } else {
                // event: message 或无 event 标记的默认事件
                callbacks?.onMessage?.(data)
              }
            }
            currentEvent = ''
            currentData = ''
            continue
          }

          // 解析字段
          const colonPos = line.indexOf(':')
          if (colonPos === -1) continue // 忽略无法解析的行

          const field = line.slice(0, colonPos)
          // 标准 SSE：冒号后如果第一个字符是空格，应去掉
          let value = line.slice(colonPos + 1)
          if (value.startsWith(' ')) value = value.slice(1)

          if (field === 'event') {
            currentEvent = value
          } else if (field === 'data') {
            // 多个 data: 行用 \n 连接
            currentData = currentData ? currentData + '\n' + value : value
          }
          // id / retry 字段此处不关心
        }
      }

      // 流结束后检查缓冲中是否还有未派发的事件
      if (currentData !== '') {
        const data = currentData
        const evtName = currentEvent || 'message'
        if (data === '[DONE]') {
          callbacks?.onComplete?.()
        } else if (evtName === 'session') {
          callbacks?.onSession?.(data)
        } else {
          callbacks?.onMessage?.(data)
        }
      }

      // —— 重要：流正常结束时（无论是因为 [DONE] 还是服务端直接关闭连接）——
      // 一定要触发一次 onComplete，确保前端知道对话已完成，
      // 否则 streaming 状态会永久残留，光标不会停止，"停止生成"按钮也不会消失
      callbacks?.onComplete?.()
    } catch (error) {
      // 用户主动 abort 不视为错误
      if ((error as Error).name === 'AbortError') return
      callbacks?.onError?.(error as Error)
    }
  })()

  return { abort: () => abortController.abort() }
}