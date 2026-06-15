<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="layout-aside">
      <div class="logo-area">
        <svg viewBox="0 0 1024 1024" width="32" height="32">
          <path fill="#409eff" d="M512 128C299.93 128 128 277.42 128 464c0 104.23 58.8 197.42 151.85 263.38L256 896h288l128-96c90.4-55.8 144-133.6 144-220.62 0-186.58-171.93-347.38-384-347.38z"/>
        </svg>
        <span class="logo-text">AI 平台</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="side-menu"
        @select="handleMenuSelect"
        background-color="#001529"
        text-color="#c9d1d9"
        active-text-color="#ffffff"
      >
        <el-menu-item index="chat" @click="router.push('/chat')">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI 对话</span>
        </el-menu-item>
        <el-menu-item index="files" @click="router.push('/files')">
          <el-icon><Folder /></el-icon>
          <span>文件管理</span>
        </el-menu-item>
        <el-menu-item index="profile" @click="router.push('/profile')">
          <el-icon><UserFilled /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
        <el-menu-item index="about" @click="router.push('/about')">
          <el-icon><InfoFilled /></el-icon>
          <span>关于</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" style="background: #409eff" />
              <span class="username">{{ authStore.username || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><UserFilled /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, Folder, InfoFilled, UserFilled, ArrowDown, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path.replace('/', '') || 'chat')
const pageTitle = computed(() => route.meta.title || 'AI 智能平台')

function handleMenuSelect(index: string) {
  router.push(`/${index}`)
}

async function handleCommand(command: string) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      authStore.doLogout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      /* cancel */
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: #f5f7fa;
}
.layout-aside {
  background: #001529;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}
.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.side-menu {
  border-right: none;
  padding-top: 12px;
}
.layout-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid #e5e7eb;
  height: 60px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}
.user-info:hover {
  background: #f0f2f5;
}
.username {
  font-size: 14px;
  color: #374151;
}
.layout-main {
  padding: 20px;
  overflow: hidden;        /* 禁止整体滚动，由各子页面（如聊天页）内部控制滚动 */
  height: calc(100vh - 60px); /* 锁定高度 = 视口 - 顶部 header */
  box-sizing: border-box;
}
:deep(.el-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
  height: 44px;
  line-height: 44px;
}
:deep(.el-menu-item.is-active) {
  background: #409eff !important;
}
</style>