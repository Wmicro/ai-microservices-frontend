<template>
  <AuthLayout>
    <template #brand-subtitle>智能对话 · 文档分析 · 知识问答</template>
    <template #title>创建账号</template>
    <template #subtitle>注册一个新的账号</template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleRegister"
    >
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          size="large"
          :prefix-icon="User"
          clearable
        />
      </el-form-item>

      <el-form-item prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          size="large"
          :prefix-icon="Message"
          clearable
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          size="large"
          :prefix-icon="Lock"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请确认密码"
          size="large"
          :prefix-icon="Lock"
          show-password
          clearable
          @keyup.enter="handleRegister"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="submit-btn"
          @click="handleRegister"
        >
          {{ loading ? '注册中...' : '注 册' }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="auth-footer">
      <span>已有账号？</span>
      <router-link to="/login" class="link">立即登录</router-link>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const validateConfirmPassword = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2-50 个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleRegister() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.doRegister({
      username: form.username,
      email: form.email,
      password: form.password
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: unknown) {
    const msg = (error as { message?: string })?.message || '注册失败'
    ElMessage.error(msg)
    console.error('Register error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}
.auth-footer {
  display: flex;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
}
.link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}
.link:hover {
  text-decoration: underline;
}
</style>