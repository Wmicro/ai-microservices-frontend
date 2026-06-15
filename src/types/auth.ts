// 认证领域类型定义（与后端 ai-auth-service 对应）

/** 登录请求体 */
export interface LoginRequest {
  username: string
  password: string
}

/** 注册请求体 */
export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

/** 登录 / 刷新 Token 响应体 */
export interface LoginResponse {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
  email: string
}

/** 用户基础信息（后端返回） */
export interface UserInfo {
  id: number
  username: string
  email: string
  createTime: string
  updateTime: string
}

/** 用户资料信息（用于个人中心展示） */
export interface UserProfile {
  id: number
  username: string
  email: string | null
  createTime: string
  updateTime: string
}

/** 修改用户资料请求 */
export interface UpdateProfileRequest {
  email?: string
}

/** 修改密码请求 */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

/** 用户登录设备信息 */
export interface UserDevice {
  id: number
  deviceId: string
  deviceInfo: string | null
  loginTime: string
  ipAddress: string | null
  status: number
}