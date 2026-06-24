<template>
  <div class="password-page">
    <el-card shadow="never" class="password-card">
      <template #header>
        <div class="card-header">
          <el-icon><Lock /></el-icon>
          <span>修改密码</span>
        </div>
      </template>

      <p class="tip-text">
        为了保证账号安全，修改密码后，除当前设备外，其他设备需要重新登录。
      </p>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="120px"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前登录密码"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
            确认修改
          </el-button>
          <el-button size="large" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const passwordFormRef = ref<FormInstance>()
const loading = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const validateNewPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else if (value.length < 6) {
    callback(new Error('新密码长度不能少于 6 位'))
  } else if (value === passwordForm.oldPassword) {
    callback(new Error('新密码不能与旧密码相同'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

function handleReset() {
  passwordFormRef.value?.resetFields()
}

async function handleSubmit() {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      ElMessage.success('密码修改成功，请使用新密码重新登录')
      try {
        await ElMessageBox.confirm(
          '密码已修改，需要重新登录。是否立即前往登录页？',
          '提示',
          { confirmButtonText: '去登录', cancelButtonText: '取消', type: 'success' }
        )
        await authStore.doLogout()
        router.push('/login')
      } catch {
        /* user chose not to logout - force logout anyway since backend invalidates token */
        await authStore.doLogout()
        router.push('/login')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.password-page {
  height: 100%;
  overflow-y: auto;
  max-width: 600px;
  margin: 0 auto;
}
.password-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.tip-text {
  background: #eff6ff;
  color: #1e40af;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin: 0 0 20px 0;
}
</style>