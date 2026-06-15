<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card v-loading="authStore.profileLoading" class="info-card" shadow="never">
          <div class="avatar-area">
            <el-avatar :size="80" :icon="UserFilled" style="background: #409eff" />
            <h3 class="username">{{ authStore.profile?.username || authStore.username || '用户' }}</h3>
            <p class="user-email">{{ authStore.profile?.email || '(未绑定邮箱)' }}</p>
          </div>
          <el-divider />
          <div class="info-list">
            <div class="info-item">
              <span class="label">用户 ID</span>
              <span class="value">{{ authStore.profile?.id || authStore.userId || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间</span>
              <span class="value">{{ formatDate(authStore.profile?.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">最近更新</span>
              <span class="value">{{ formatDate(authStore.profile?.updateTime) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="edit-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Edit /></el-icon>
              <span>修改个人信息</span>
            </div>
          </template>

          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
          >
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled>
                <template #append>不可修改</template>
              </el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
              <el-button @click="handleRefresh">重新加载</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="action-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>账号安全</span>
            </div>
          </template>

          <div class="action-list">
            <div class="action-item">
              <div>
                <h4 class="action-title">修改密码</h4>
                <p class="action-desc">定期更换密码，保护账号安全</p>
              </div>
              <el-button type="primary" @click="router.push('/profile/password')">前往修改</el-button>
            </div>
            <el-divider />
            <div class="action-item">
              <div>
                <h4 class="action-title">登录设备管理</h4>
                <p class="action-desc">查看当前账号的所有登录设备，远程下线可疑设备</p>
              </div>
              <el-button type="primary" @click="router.push('/profile/devices')">查看设备</el-button>
            </div>
            <el-divider />
            <div class="action-item danger">
              <div>
                <h4 class="action-title danger-text">注销账号</h4>
                <p class="action-desc danger-text">账号注销后不可恢复，所有数据将被永久删除，请谨慎操作</p>
              </div>
              <el-button type="danger" :loading="deleting" @click="handleDeleteAccount">注销账号</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { UserFilled, Edit, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const profileFormRef = ref<FormInstance>()
const saving = ref(false)
const deleting = ref(false)

const profileForm = reactive({
  username: '',
  email: ''
})

const profileRules: FormRules = {
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return date.replace('T', ' ').split('.')[0]
}

async function handleRefresh() {
  try {
    await authStore.loadProfile(true)
    syncForm()
    ElMessage.success('已刷新')
  } catch {
    /* handled by axios interceptor */
  }
}

function syncForm() {
  profileForm.username = authStore.profile?.username || authStore.username || ''
  profileForm.email = authStore.profile?.email || ''
}

async function handleSave() {
  if (!profileFormRef.value) return
  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await authStore.updateProfile({ email: profileForm.email || undefined })
      ElMessage.success('保存成功')
    } finally {
      saving.value = false
    }
  })
}

async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm(
      '注销账号是不可恢复的操作，确认要继续吗？',
      '危险操作',
      {
        confirmButtonText: '确认注销',
        cancelButtonText: '再想想',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    const { value: inputPassword } = await ElMessageBox.prompt(
      '请输入当前账号的登录密码以最终确认注销',
      '密码二次校验',
      {
        confirmButtonText: '最终确认',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '输入登录密码',
        inputValidator: (value) => {
          if (!value || value.length < 6) {
            return '密码至少 6 位'
          }
          return true
        }
      }
    )
    deleting.value = true
    try {
      await authStore.deleteAccount(inputPassword)
      ElMessage.success('账号已注销')
      router.push('/login')
    } finally {
      deleting.value = false
    }
  } catch {
    /* user cancelled or failed */
  }
}

onMounted(async () => {
  await authStore.loadProfile()
  syncForm()
})
</script>

<style scoped>
.profile-page {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.info-card,
.edit-card,
.action-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.avatar-area {
  text-align: center;
  padding: 20px 0;
}
.username {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 16px 0 4px 0;
}
.user-email {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}
.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.info-item .label {
  color: #6b7280;
}
.info-item .value {
  color: #374151;
  font-weight: 500;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.action-list {
  display: flex;
  flex-direction: column;
}
.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.action-item.danger {
  padding: 16px 0 0 0;
}
.action-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}
.action-title.danger-text {
  color: #f56c6c;
}
.action-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}
.action-desc.danger-text {
  color: #f56c6c;
}
</style>