// HTTP 客户端封装 - 支持 Token 自动注入、响应统一处理
import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'

// 创建 Axios 实例 — 默认指向 Gateway（开发环境 10000 / 生产环境 80 经 Nginx 反代）
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器 - 自动注入 Token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/** 判断 response.data 是否后端标准 ApiResponse<T> 结构
 * 要求同时存在 success（布尔）和 data 字段
 */
function isApiResponse(data: unknown): data is ApiResponse<unknown> {
  return (
    data !== null &&
    typeof data === 'object' &&
    'success' in (data as Record<string, unknown>) &&
    typeof (data as Record<string, unknown>).success === 'boolean'
  )
}

// 响应拦截器 - 统一处理响应和错误
instance.interceptors.response.use(
  (response) => {
    // 文件下载请求直接返回响应
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }

    const data = response.data
    const url = String(response.config.url || '')

    // 如果是标准 ApiResponse 结构
    if (isApiResponse(data)) {
      if (data.success) {
        // chat-service 特殊处理（两种格式）：
        //   格式 A（单轮）：message = "AI 回答内容"，data = null
        //   格式 B（多轮）：message = "操作成功"，data = { sessionId, answer }
        // 其他服务（auth/file）：数据在 data 字段
        const isChatApi = url.startsWith('/api/chat')
        if (isChatApi) {
          const payload = data.data as Record<string, unknown> | null
          // 多轮对话：回答在 payload.answer，会话 ID 在 payload.sessionId
          if (payload && typeof payload.sessionId === 'string') {
            return {
              answer: (payload.answer as string) || (data.message as string) || '',
              sessionId: payload.sessionId
            }
          }
          // 无 sessionId：回答直接在 message 字段
          return data.message
        }
        // 其他服务：正常返回 data 字段
        if (data.data !== null && data.data !== undefined) {
          return data.data
        }
        return data.message
      } else {
        // 业务逻辑错误 - 对权限不足做特殊提示
        if (data.code === '403' || data.message?.includes('权限')) {
          ElMessage.warning(data.message || '没有权限访问该资源')
        } else {
          ElMessage.error(data.message || '操作失败')
        }
        return Promise.reject(new Error(data.message || '操作失败'))
      }
    }

    // 非 ApiResponse 结构（后端直接返回字符串等）— 原样返回
    return data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.clear()
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?redirect=${redirect}`
    } else if (status === 403) {
      ElMessage.warning(message || '没有权限访问该资源，请联系管理员')
    } else if (status === 404) {
      ElMessage.error('请求的资源不存在')
    } else if (status === 500) {
      ElMessage.error('服务器错误，请稍后重试')
    } else if (message) {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

export default instance