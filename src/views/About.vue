<template>
  <div class="about-page">
    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><InfoFilled /></el-icon>
          <span>项目信息</span>
        </div>
      </template>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">项目名称</span>
          <span class="info-value">AI 微服务前端平台</span>
        </div>
        <div class="info-item">
          <span class="info-label">前端框架</span>
          <span class="info-value">Vue 3 + TypeScript</span>
        </div>
        <div class="info-item">
          <span class="info-label">构建工具</span>
          <span class="info-value">Vite</span>
        </div>
        <div class="info-item">
          <span class="info-label">UI 组件库</span>
          <span class="info-value">Element Plus</span>
        </div>
        <div class="info-item">
          <span class="info-label">状态管理</span>
          <span class="info-value">Pinia</span>
        </div>
        <div class="info-item">
          <span class="info-label">路由</span>
          <span class="info-value">Vue Router</span>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="feature-row">
      <el-col :span="8">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
            <el-icon :size="28" color="#fff"><ChatDotRound /></el-icon>
          </div>
          <h3 class="feature-title">AI 智能对话</h3>
          <p class="feature-desc">基于大语言模型的智能对话服务，支持流式输出，上下文记忆多轮对话</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
            <el-icon :size="28" color="#fff"><Document /></el-icon>
          </div>
          <h3 class="feature-title">文件管理</h3>
          <p class="feature-desc">支持多种格式文件上传与解析，包括 TXT、Markdown、PDF、Word、Excel 等</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
            <el-icon :size="28" color="#fff"><User /></el-icon>
          </div>
          <h3 class="feature-title">用户认证</h3>
          <p class="feature-desc">基于 Token 的用户认证系统，支持注册、登录、刷新 Token、登出等完整功能</p>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><Folder /></el-icon>
          <span>项目结构说明</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="src/api">API 接口服务封装</el-descriptions-item>
        <el-descriptions-item label="src/views">页面级组件</el-descriptions-item>
        <el-descriptions-item label="src/layouts">布局组件</el-descriptions-item>
        <el-descriptions-item label="src/components">通用组件</el-descriptions-item>
        <el-descriptions-item label="src/stores">Pinia 状态管理</el-descriptions-item>
        <el-descriptions-item label="src/router">路由配置</el-descriptions-item>
        <el-descriptions-item label="src/types">TypeScript 类型定义</el-descriptions-item>
        <el-descriptions-item label="src/utils">工具函数</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><Link /></el-icon>
          <span>后端接口</span>
        </div>
      </template>
      <el-table :data="apiList" border>
        <el-table-column prop="service" label="服务" width="120" />
        <el-table-column prop="path" label="接口路径" width="220" />
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <el-tag :type="methodTag(row.method)" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound, Document, User, InfoFilled, Folder, Link } from '@element-plus/icons-vue'

const apiList = [
  { service: '认证服务', path: '/api/auth/login', method: 'POST', desc: '用户登录' },
  { service: '认证服务', path: '/api/auth/register', method: 'POST', desc: '用户注册' },
  { service: '认证服务', path: '/api/auth/refresh', method: 'POST', desc: '刷新 Token' },
  { service: '认证服务', path: '/api/auth/logout', method: 'POST', desc: '用户登出' },
  { service: '对话服务', path: '/api/chat', method: 'GET', desc: '普通文本对话' },
  { service: '对话服务', path: '/api/stream', method: 'GET', desc: '流式 SSE 对话' },
  { service: '对话服务', path: '/api/chat/history', method: 'GET', desc: '获取对话历史' },
  { service: '对话服务', path: '/api/chat/history', method: 'DELETE', desc: '清空对话历史' },
  { service: '文件服务', path: '/api/files/upload', method: 'POST', desc: '上传文件' },
  { service: '文件服务', path: '/api/files', method: 'GET', desc: '获取文件列表' },
  { service: '文件服务', path: '/api/files/{id}/content', method: 'GET', desc: '获取文件内容' },
  { service: '文件服务', path: '/api/files/{id}', method: 'DELETE', desc: '删除文件' }
]

function methodTag(method: string) {
  if (method === 'GET') return 'success'
  if (method === 'POST') return 'primary'
  if (method === 'DELETE') return 'danger'
  if (method === 'PUT') return 'warning'
  return 'info'
}
</script>

<style scoped>
.about-page {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}
.info-label {
  font-size: 12px;
  color: #6b7280;
}
.info-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
}
.feature-row {
  row-gap: 16px;
}
.feature-card {
  text-align: center;
  height: 100%;
}
.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.feature-title {
  font-size: 17px;
  color: #1f2937;
  margin: 0 0 8px 0;
  font-weight: 600;
}
.feature-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.7;
}
</style>