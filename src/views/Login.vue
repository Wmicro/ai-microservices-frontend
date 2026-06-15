<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-area">
        <div class="logo-box">
          <svg viewBox="0 0 1024 1024" width="60" height="60">
            <path fill="#409eff" d="M512 128C299.93 128 128 277.42 128 464c0 104.23 58.8 197.42 151.85 263.38L256 896h288l128-96c90.4-55.8 144-133.6 144-220.62 0-186.58-171.93-347.38-384-347.38zM512 64c247.07 0 448 174.84 448 390.38 0 108.4-57.4 206.72-149.33 273.28L704 832H320l-32 64h448l128-96 32-64-96-64c85.33-64 128-145.28 128-239.62C928 261.28 742.67 64 512 64z"/>
          </svg>
        </div>
        <h1 class="brand-title">AI 智能平台</h1>
        <p class="brand-subtitle">智能对话 · 文档分析 · 知识问答</p>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-dot">✨</span>
            <span>基于大模型的智能对话体验</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot">📄</span>
            <span>支持文件上传与内容解析</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot">💬</span>
            <span>多轮对话上下文记忆</span>
          </div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <h2 class="login-title">欢迎登录</h2>
        <p class="login-subtitle">请输入您的账号信息</p>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              clearable
            >
              <template #prefix>
                <svg viewBox="0 0 1024 1024" width="16" height="16">
                  <path fill="#909399" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64c-128 0-384 64-384 192v128h768V768c0-128-256-192-384-192z"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <svg viewBox="0 0 1024 1024" width="16" height="16">
                  <path fill="#909399" d="M768 384V256a256 256 0 0 0-512 0v128H192v512h640V384h-64zM320 256a192 192 0 0 1 384 0v128H320V256z"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>

          <div class="login-footer">
            <span>还没有账号？</span>
            <router-link to="/register" class="register-link">立即注册</router-link>
          </div>
        </el-form>
      </div>
      <p class="copyright">© 2024 AI Microservices Platform. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginRequest>({
  username: '',
  password: ''
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.doLogin(loginForm)
      ElMessage.success('登录成功')
      const redirect = (route.query.redirect as string) || '/chat'
      router.push(redirect)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 40px;
}

.brand-area {
  max-width: 440px;
}

.logo-box {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
}

.brand-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 48px 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.feature-dot {
  font-size: 20px;
}

.login-right {
  width: 480px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 360px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  text-align: center;
}

.login-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 32px 0;
  text-align: center;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  font-size: 16px;
  height: 44px;
  border-radius: 8px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.register-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.register-link:hover {
  color: #66b1ff;
}

.copyright {
  position: absolute;
  bottom: 20px;
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 900px) {
  .login-left {
    display: none;
  }
  .login-right {
    width: 100%;
  }
}
</style>