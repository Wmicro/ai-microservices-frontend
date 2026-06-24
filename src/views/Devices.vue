<template>
  <div class="devices-page">
    <el-card shadow="never" class="devices-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Monitor /></el-icon>
            <span>登录设备管理</span>
            <el-tag size="small" type="info" style="margin-left: 8px;">
              共 {{ authStore.devices.length }} 台设备
            </el-tag>
          </div>
          <el-button :icon="Refresh" :loading="loading" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <el-empty
        v-if="!loading && authStore.devices.length === 0"
        description="暂无登录设备记录"
      />

      <el-table
        v-else
        :data="authStore.devices"
        style="width: 100%"
        stripe
        v-loading="loading"
      >
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="deviceId" label="设备 ID" min-width="200">
          <template #default="{ row }">
            <span class="device-id">{{ row.deviceId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备信息" min-width="180">
          <template #default="{ row }">
            <span>{{ row.deviceInfo || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="登录 IP" width="140">
          <template #default="{ row }">
            <span>{{ row.ipAddress || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="登录时间" width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.loginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" size="small">在线</el-tag>
            <el-tag v-else type="info" size="small">已下线</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              title="确认远程登出该设备？该设备上的会话将立即失效。"
              confirm-button-text="确认登出"
              cancel-button-text="取消"
              @confirm="handleLogoutDevice(row)"
            >
              <template #reference>
                <el-button link type="primary" size="small">远程登出</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor, Refresh } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { UserDevice } from '@/types/auth'
import { formatDate } from '@/utils/date'

const authStore = useAuthStore()
const loading = ref(false)

async function handleRefresh() {
  loading.value = true
  try {
    await authStore.loadDevices(true)
    ElMessage.success('已刷新')
  } finally {
    loading.value = false
  }
}

async function handleLogoutDevice(row: UserDevice) {
  try {
    await authStore.logoutDevice(row.deviceId)
    ElMessage.success('已登出该设备')
  } catch {
    /* handled by axios interceptor */
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await authStore.loadDevices()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.devices-page {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.devices-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.device-id {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #374151;
}
</style>