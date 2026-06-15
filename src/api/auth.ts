// 认证服务 API（对应后端 ai-auth-service：/api/auth/* 和 /api/profile/*）
import axios from '@/utils/axios'
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserDevice
} from '@/types/auth'

/** 用户注册 */
export function register(data: RegisterRequest) {
  return axios.post<LoginRequest, UserProfile>('/api/auth/register', data)
}

/** 用户登录 */
export function login(data: LoginRequest) {
  return axios.post<LoginRequest, LoginResponse>('/api/auth/login', data)
}

/** 刷新 Token */
export function refreshToken(refreshTokenValue: string) {
  return axios.post<null, LoginResponse>(
    '/api/auth/refresh',
    null,
    { headers: { 'Refresh-Token': refreshTokenValue } }
  )
}

/** 用户登出 */
export function logout() {
  return axios.post('/api/auth/logout')
}

/** 验证 Token 是否有效 */
export function validateToken() {
  return axios.get('/api/auth/validate')
}

/** 获取用户资料 */
export function getProfile() {
  return axios.get<null, UserProfile>('/api/profile')
}

/** 更新用户资料 */
export function updateProfile(data: UpdateProfileRequest) {
  return axios.put<UpdateProfileRequest, UserProfile>('/api/profile', data)
}

/** 修改密码 */
export function changePassword(data: ChangePasswordRequest) {
  return axios.post<ChangePasswordRequest, void>('/api/profile/password', data)
}

/** 获取登录设备列表 */
export function getDevices() {
  return axios.get<null, UserDevice[]>('/api/profile/devices')
}

/** 远程登出指定设备 */
export function logoutDevice(deviceId: string) {
  return axios.post<null, void>(`/api/profile/devices/${deviceId}/logout`)
}

/** 注销账号（需提供密码二次校验） */
export function deleteAccount(password: string) {
  return axios.post<{ password: string }, void>('/api/profile/account/delete', { password })
}