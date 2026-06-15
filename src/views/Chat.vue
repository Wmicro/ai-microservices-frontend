<template>
  <div class="chat-page">
    <div class="chat-container">
      <el-tabs v-model="activeTab" class="chat-tabs" type="card" @tab-change="onTabChange">
        <!-- ========== Tab 1：普通对话 ========== -->
        <el-tab-pane label="💬 普通对话（一次性返回）" name="normal">
          <div class="chat-messages" ref="normalContainer">
            <div v-if="normalMessages.length === 0" class="welcome-section">
              <div class="welcome-icon">
                <svg viewBox="0 0 1024 1024" width="56" height="56">
                  <path fill="#409eff" d="M512 128C299.93 128 128 277.42 128 464c0 104.23 58.8 197.42 151.85 263.38L256 896h288l128-96c90.4-55.8 144-133.6 144-220.62 0-186.58-171.93-347.38-384-347.38z" />
                </svg>
              </div>
              <h2 class="welcome-title">普通对话模式</h2>
              <p class="welcome-desc">发送后等待后端完整生成，再一次性返回全部回答</p>
              <div class="quick-questions">
                <div v-for="(q, idx) in quickQuestions" :key="idx" class="quick-item" @click="onNormalQuick(q)">
                  {{ q }}
                </div>
              </div>
            </div>

            <div
              v-for="msg in normalMessages"
              :key="msg.id"
              :class="['message-row', msg.role === 'user' ? 'is-user' : 'is-assistant']"
            >
              <div class="message-avatar">
                <el-avatar :size="36" :style="{ background: msg.role === 'user' ? '#10b981' : '#409eff' }">
                  {{ msg.role === 'user' ? 'U' : 'AI' }}
                </el-avatar>
              </div>
              <div class="message-body">
                <div class="message-meta">
                  <span class="message-role">{{ msg.role === 'user' ? (authStore.username || '我') : 'AI 助手' }}</span>
                  <span class="message-time">{{ msg.time }}</span>
                </div>
                <div class="message-bubble">
                  <div v-if="msg.streaming" class="typing-indicator"><span></span><span></span><span></span></div>
                  <div v-else class="message-content">{{ msg.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="input-wrapper">
              <div class="input-topbar">
                <el-select v-model="normalModel" size="default" :disabled="isNormalLoading" style="width: 240px">
                  <el-option v-for="m in availableModels" :key="m.value" :label="m.label" :value="m.value" />
                </el-select>
                <span class="mode-badge normal">一次性返回</span>
              </div>
              <el-input
                v-model="normalInput"
                type="textarea"
                :rows="2"
                placeholder="输入您的问题...（Enter 发送，Shift+Enter 换行）"
                resize="none"
                :disabled="isNormalLoading"
                @keydown="onNormalKeyDown"
              />
              <div class="input-actions">
                <el-button
                  type="primary"
                  :loading="isNormalLoading"
                  :disabled="!normalInput.trim()"
                  @click="onNormalSend"
                  class="send-btn"
                >
                  <el-icon><Promotion /></el-icon>
                  <span>{{ isNormalLoading ? '生成中...' : '发送' }}</span>
                </el-button>
                <el-button v-if="normalMessages.length > 0" plain @click="onNormalClear">清空对话</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- ========== Tab 2：流式对话 ========== -->
        <el-tab-pane label="🌊 流式对话（逐字输出）" name="stream">
          <div class="chat-messages" ref="streamContainer">
            <div v-if="streamMessages.length === 0" class="welcome-section">
              <div class="welcome-icon">
                <svg viewBox="0 0 1024 1024" width="56" height="56">
                  <path fill="#10b981" d="M512 128C299.93 128 128 277.42 128 464c0 104.23 58.8 197.42 151.85 263.38L256 896h288l128-96c90.4-55.8 144-133.6 144-220.62 0-186.58-171.93-347.38-384-347.38z" />
                </svg>
              </div>
              <h2 class="welcome-title">流式对话模式</h2>
              <p class="welcome-desc">基于 SSE（Server-Sent Events），后端边生成边推送，前端逐字渲染</p>
              <div class="quick-questions">
                <div v-for="(q, idx) in quickQuestions" :key="idx" class="quick-item stream" @click="onStreamQuick(q)">
                  {{ q }}
                </div>
              </div>
            </div>

            <div
              v-for="msg in streamMessages"
              :key="msg.id"
              :class="['message-row', msg.role === 'user' ? 'is-user' : 'is-assistant']"
            >
              <div class="message-avatar">
                <el-avatar :size="36" :style="{ background: msg.role === 'user' ? '#10b981' : '#409eff' }">
                  {{ msg.role === 'user' ? 'U' : 'AI' }}
                </el-avatar>
              </div>
              <div class="message-body">
                <div class="message-meta">
                  <span class="message-role">{{ msg.role === 'user' ? (authStore.username || '我') : 'AI 助手' }}</span>
                  <span class="message-time">{{ msg.time }}</span>
                </div>
                <div class="message-bubble">
                  <div v-if="msg.streaming && !msg.content" class="typing-indicator"><span></span><span></span><span></span></div>
                  <div class="message-content" :class="{ 'has-cursor': msg.streaming && msg.content }">{{ msg.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="input-wrapper">
              <div class="input-topbar">
                <el-select v-model="streamModel" size="default" :disabled="isStreaming" style="width: 240px">
                  <el-option v-for="m in availableModels" :key="m.value" :label="m.label" :value="m.value" />
                </el-select>
                <span class="mode-badge stream">SSE 逐字推送</span>
              </div>
              <el-input
                v-model="streamInput"
                type="textarea"
                :rows="2"
                placeholder="输入您的问题...（Enter 发送，Shift+Enter 换行）"
                resize="none"
                :disabled="isStreaming"
                @keydown="onStreamKeyDown"
              />
              <div class="input-actions">
                <el-button
                  type="primary"
                  :loading="isStreaming"
                  :disabled="!streamInput.trim()"
                  @click="onStreamSend"
                  class="send-btn"
                >
                  <el-icon><Promotion /></el-icon>
                  <span>{{ isStreaming ? '生成中...' : '发送' }}</span>
                </el-button>
                <el-button v-if="isStreaming" @click="onStreamStop">停止</el-button>
                <el-button v-if="streamMessages.length > 0" plain @click="onStreamClear">清空对话</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useChatNormal } from '@/composables/useChatNormal'
import { useChatStream } from '@/composables/useChatStream'

const authStore = useAuthStore()

// ===== 两个容器 ref（给各自的 composable 做自动滚动） =====
const normalContainer = ref<HTMLElement>()
const streamContainer = ref<HTMLElement>()

const {
  messages: normalMessages,
  isLoading: isNormalLoading,
  sendMessage: normalSend,
  clearMessages: normalClear
} = useChatNormal(normalContainer)

const {
  messages: streamMessages,
  isStreaming,
  sendMessage: streamSend,
  stopStreaming: streamStop,
  clearMessages: streamClear
} = useChatStream(streamContainer)

// ===== 模型选择 =====
const availableModels = [
  { value: 'qwen-turbo', label: '通义千问 Turbo' },
  { value: 'qwen-plus', label: '通义千问 Plus' },
  { value: 'gpt-4o', label: 'GPT-4o' }
]
const normalModel = ref('qwen-turbo')
const streamModel = ref('qwen-turbo')

// ===== 快捷问题 =====
const quickQuestions = [
  '帮我写一段自我介绍',
  '总结一下人工智能的发展趋势',
  '如何学习编程？',
  '给我推荐几本好书'
]

// ===== Tab 切换 =====
const activeTab = ref<'normal' | 'stream'>('stream')
function onTabChange() {
  nextTick(() => {
    // 切 tab 后把滚动条拉到底，保证新消息可见
    const el = activeTab.value === 'normal' ? normalContainer.value : streamContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

// ===== 普通对话：输入 & 操作 =====
const normalInput = ref('')

function onNormalQuick(text: string) {
  normalInput.value = text
  onNormalSend()
}

function onNormalKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !isNormalLoading.value) {
    e.preventDefault()
    onNormalSend()
  }
}

function onNormalSend() {
  normalSend(normalInput.value, normalModel.value)
  normalInput.value = ''
}

async function onNormalClear() {
  try {
    await ElMessageBox.confirm('确定清空普通对话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await normalClear()
    ElMessage.success('对话已清空')
  } catch {
    // cancel
  }
}

// ===== 流式对话：输入 & 操作 =====
const streamInput = ref('')

function onStreamQuick(text: string) {
  streamInput.value = text
  onStreamSend()
}

function onStreamKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !isStreaming.value) {
    e.preventDefault()
    onStreamSend()
  }
}

function onStreamSend() {
  streamSend(streamInput.value, streamModel.value)
  streamInput.value = ''
}

function onStreamStop() {
  streamStop()
  ElMessage.info('已停止生成')
}

async function onStreamClear() {
  try {
    await ElMessageBox.confirm('确定清空流式对话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await streamClear()
    ElMessage.success('对话已清空')
  } catch {
    // cancel
  }
}
</script>

<style scoped>
.chat-page {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.chat-container {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.chat-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0;
  min-height: 0;
}
:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}
:deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  height: 56px;
  line-height: 56px;
}
:deep(.el-tabs__item.is-active) {
  color: #409eff;
}
:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
:deep(.el-tab-pane) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  min-height: 0;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
  min-height: 0;
}
.welcome-section {
  text-align: center;
  padding: 40px 20px;
}
.welcome-icon {
  width: 80px;
  height: 80px;
  background: #eff6ff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.welcome-title {
  font-size: 24px;
  color: #1f2937;
  margin: 0 0 8px 0;
  font-weight: 600;
}
.welcome-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}
.quick-questions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 720px;
  margin: 0 auto;
}
.quick-item {
  padding: 10px 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-item:hover {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}
.quick-item.stream:hover {
  background: #10b981;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}
.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  animation: fadeInUp 0.25s ease-out;
}
.message-row.is-user {
  flex-direction: row-reverse;
}
.message-body {
  max-width: 72%;
}
.message-row.is-user .message-body { text-align: right; }
.message-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}
.message-role {
  margin-right: 8px;
  font-weight: 600;
  color: #4b5563;
}
.message-time { color: #9ca3af; }
.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  display: inline-block;
  text-align: left;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.message-row.is-assistant .message-bubble {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  color: #1f2937;
  border-bottom-left-radius: 4px;
  border: 1px solid #e5e7eb;
}
.message-row.is-user .message-bubble {
  background: linear-gradient(135deg, #409eff 0%, #5cafff 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.25);
}
.message-content {
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
}
.message-row.is-assistant .message-content {
  min-height: 18px;
}
.message-content.has-cursor::after {
  content: '▌';
  margin-left: 3px;
  color: #409eff;
  font-weight: bold;
  animation: blink 0.85s infinite;
}
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.typing-indicator {
  display: inline-flex;
  gap: 4px;
}
.typing-indicator span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9ca3af;
  animation: bounce 1.4s infinite ease-in-out;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.16s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.32s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
.chat-input-area {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
.input-wrapper {
  max-width: 900px;
  margin: 0 auto;
}
.input-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.mode-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}
.mode-badge.normal {
  background: #eff6ff;
  color: #409eff;
}
.mode-badge.stream {
  background: #ecfdf5;
  color: #10b981;
}
.input-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.send-btn {
  min-width: 100px;
}
</style>