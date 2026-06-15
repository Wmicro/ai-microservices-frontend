<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-area">
        <div class="logo-box">
          <svg viewBox="0 0 1024 1024" width="60" height="60">
            <path fill="#409eff" d="M512 128C299.93 128 128 277.42 128 464c0 104.23 58.8 197.42 151.85 263.38L256 896h288l128-96c90.4-55.8 144-133.6 144-220.62 0-186.58-171.93-347.38-384-347.38z"/>
          </svg>
        </div>
        <h1 class="brand-title">AI 智能平台</h1>
        <p class="brand-subtitle">开启您的智能之旅</p>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <h2 class="login-title">创建新账号</h2>
        <p class="login-subtitle">只需几步即可完成注册</p>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
          @submit.prevent="handleRegister"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名（3-50字）"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-100字）"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <el-form-item label="邮箱（可选）" prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              size="large"
              clearable
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? "注册中..." : "注 册" }}
          </el-button>

          <div class="login-footer">
            <span>已有账号？</span>
            <router-link to="/login" class="register-link">返回登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
}

async function handleRegister() {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.doRegister({
        username: registerForm.username,
        password: registerForm.password,
        email: registerForm.email || undefined
      })
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch (error) {
      console.error('Register error:', error)
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
}
.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
}
.brand-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}
.login-right {
  width: 480px;
  background: #fff;
  display: flex;
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
@media (max-width: 900px) {
  .login-left {
    display: none;
  }
  .login-right {
    width: 100%;
  }
}
</style>