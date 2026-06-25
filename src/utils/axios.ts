// HTTP 客户端封装 - 支持 Token 自动注入、响应统一处理
import axios from 'axios'
import { notify } from '@/utils/notify'
import type { ApiResponse } from '@/types/api'

// 创建 Axios 实例 — 默认指向 Gateway（开发环境 10000 / 生产环境 80 经 Nginx 反代）
const instance = axios.create({
  // 开发环境：用相对路径 /api，由 vite.config.ts 的 server.proxy 转发到后端，避免 CORS
// 生产环境：可通过 VITE_API_BASE_URL 指定后端地址（或留空走 Nginx 同域部署）
  baseURL: import.meta.env.VITE_API_BASE_URL || '',  // ✅ 改为空字符串
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
 * 要求存在 success（布尔）字段；data、message、code 为可选字段
 */
function isApiResponse(data: unknown): data is ApiResponse<unknown> {
  return (
    data !== null &&
    data !== undefined &&
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

    // 如果是标准 ApiResponse 结构
    if (isApiResponse(data)) {
      if (data.success) {
        // 正常返回 data 字段；如果 data 为 null/undefined 则返回 message
        if (data.data !== null && data.data !== undefined) {
          return data.data
        }
        return data.message
      } else {
        // 业务逻辑错误 - 对权限不足做特殊提示
        const code = String(data.code ?? '')
        if (code === '403' || (data.message ?? '').includes('权限')) {
          notify.warning(data.message || '没有权限访问该资源')
        } else {
          notify.error(data.message || '操作失败')
        }
        return Promise.reject(new Error(data.message || '操作失败'))
      }
    }

    // 非 ApiResponse 结构（后端直接返回字符串等）— 原样返回
    return data
  },
  (error) => {
    const status = error.response?.status
    // error.response?.data 可能是任何类型（string/object/null），做安全访问
    const respData = error.response?.data as Record<string, unknown> | undefined | null
    const message = (respData && typeof respData.message === 'string')
      ? respData.message
      : error.message

    if (status === 401) {
      notify.error('登录已过期，请重新登录')
      // 只清除认证相关的 key，避免误删其他数据
      const authKeys = ['token', 'refreshToken', 'userId', 'username', 'email']
      authKeys.forEach((key) => localStorage.removeItem(key))
      // redirect 白名单校验：只允许本站相对路径（/ 开头且不是 //），防止 open-redirect 钓鱼
      const rawRedirect = window.location.pathname + window.location.search
      const safeRedirect = /^\/(?!\/)/.test(rawRedirect) ? rawRedirect : '/'
      const redirect = encodeURIComponent(safeRedirect)
      window.location.href = `/login?redirect=${redirect}`
    } else if (status === 403) {
      notify.warning(message || '没有权限访问该资源，请联系管理员')
    } else if (status === 404) {
      notify.error('请求的资源不存在')
    } else if (status === 500) {
      notify.error('服务器错误，请稍后重试')
    } else if (message) {
      notify.error(message)
    }
    return Promise.reject(error)
  }
)

export default instance