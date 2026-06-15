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
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const userId = ref<number | null>(
    localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
  )
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

  /** 登出（清空本地状态） */
  function doLogout() {
    token.value = null
    refreshToken.value = null
    userId.value = null
    username.value = null
    email.value = null
    profile.value = null
    devices.value = []
    localStorage.clear()
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
    doLogout()
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