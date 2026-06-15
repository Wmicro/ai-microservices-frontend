// 后端统一响应结构（所有接口的外层包装）
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}