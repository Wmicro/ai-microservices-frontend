// 用户认证状态管理（Pinia Store）
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserDevice
} from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // ===== 基础登录状态 =====
  const rawUserId = localStorage.getItem('userId')
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const userId = ref<number | null>(rawUserId ? Number(rawUserId) : null)
  const username = ref<string | null>(localStorage.getItem('username'))
  const email = ref<string | null>(localStorage.getItem('email'))
  const isLoggedIn = computed(() => !!token.value)

  // ===== 个人中心状态 =====
  const profile = ref<UserProfile | null>(null)
  const profileLoading = ref(false)
  const devices = ref<UserDevice[]>([])
  const devicesLoading = ref(false)

  /** 将登录响应持久化到 state + localStorage */
  function saveAuth(data: LoginResponse) {
    token.value = data.token
    refreshToken.value = data.refreshToken
    userId.value = data.userId
    username.value = data.username
    email.value = data.email

    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('userId', String(data.userId))
    localStorage.setItem('username', data.username)
    if (data.email) localStorage.setItem('email', data.email)
  }

  /** 登录 */
  async function doLogin(loginData: LoginRequest) {
    const data = await authApi.login(loginData)
    saveAuth(data)
    return data
  }

  /** 注册 */
  async function doRegister(registerData: RegisterRequest) {
    return await authApi.register(registerData)
  }

  /** 刷新 Token */
  async function doRefreshToken() {
    if (!refreshToken.value) return
    const data = await authApi.refreshToken(refreshToken.value)
    saveAuth(data)
  }

  /** 登出：先调用后端注销 token，再清空本地状态
   * 即使后端调用失败（如 token 已过期），也会清空本地状态，保证前端总能正确退出
   */
  async function doLogout() {
    // 先记录 token（清空后就拿不到了）
    const hadToken = !!token.value

    try {
      // 调用后端注销 token，使其在服务端失效，防止被盗用
      if (hadToken) {
        await authApi.logout()
      }
    } catch (e) {
      // 后端调用失败也要清空本地状态，保证前端不会卡住
      console.warn('[auth-store] 登出后端调用失败，已强制清空本地状态', e)
    }

    // 清空本地状态
    token.value = null
    refreshToken.value = null
    userId.value = null
    username.value = null
    email.value = null
    profile.value = null
    devices.value = []

    const authKeys = ['token', 'refreshToken', 'userId', 'username', 'email']
    authKeys.forEach((key) => localStorage.removeItem(key))
  }

  // ===== 个人中心方法 =====

  /** 加载用户资料（带缓存） */
  async function loadProfile(force = false) {
    if (profile.value && !force) return profile.value
    profileLoading.value = true
    try {
      const data = await authApi.getProfile()
      profile.value = data
      if (data) {
        username.value = data.username
        email.value = data.email
        if (data.email) localStorage.setItem('email', data.email)
      }
      return data
    } finally {
      profileLoading.value = false
    }
  }

  /** 更新用户资料 */
  async function updateProfile(data: UpdateProfileRequest) {
    const result = await authApi.updateProfile(data)
    profile.value = result
    if (result && result.email) {
      email.value = result.email
      localStorage.setItem('email', result.email)
    }
    return result
  }

  /** 修改密码 */
  async function changePassword(data: ChangePasswordRequest) {
    return await authApi.changePassword(data)
  }

  /** 加载登录设备列表（带缓存） */
  async function loadDevices(force = false) {
    if (devices.value.length > 0 && !force) return devices.value
    devicesLoading.value = true
    try {
      const data = await authApi.getDevices()
      devices.value = data || []
      return devices.value
    } finally {
      devicesLoading.value = false
    }
  }

  /** 远程登出指定设备 */
  async function logoutDevice(deviceId: string) {
    await authApi.logoutDevice(deviceId)
    devices.value = devices.value.filter((d) => d.deviceId !== deviceId)
  }

  /** 注销账号（需提供登录密码做二次校验） */
  async function deleteAccount(password: string) {
    await authApi.deleteAccount(password)
    await doLogout()
  }

  return {
    // 基础状态
    token,
    refreshToken,
    userId,
    username,
    email,
    isLoggedIn,
    // 个人中心状态
    profile,
    profileLoading,
    devices,
    devicesLoading,
    // 基础方法
    doLogin,
    doRegister,
    doRefreshToken,
    doLogout,
    // 个人中心方法
    loadProfile,
    updateProfile,
    changePassword,
    loadDevices,
    logoutDevice,
    deleteAccount
  }
})