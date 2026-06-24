<template>
  <div class="chat-page">
    <!-- 桌面端：左侧对话列表 -->
    <ConversationSidebar class="desktop-only" />

    <!-- 移动端：对话列表抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="85%"
      :with-header="false"
      class="conv-drawer"
    >
      <ConversationSidebar />
    </el-drawer>

    <!-- 右侧对话主区域 -->
    <div class="chat-main">
      <!-- 顶部工具栏 -->
      <div class="chat-header">
        <div class="header-left">
          <!-- 移动端：汉堡按钮 -->
          <button class="menu-btn mobile-only" @click="drawerVisible = true" aria-label="对话列表">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div class="header-icon desktop-only">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 class="chat-title">{{ chatTitle }}</h2>
          <el-tag
            v-if="chatStore.current?.model"
            size="small"
            type="primary"
            effect="light"
            round
            class="model-badge desktop-only"
          >
            {{ chatStore.current.model }}
          </el-tag>
        </div>
        <div class="header-right">
          <div class="mode-toggle desktop-only" v-if="!isSingleMode">
            <button
              v-for="mode in visibleModes"
              :key="mode"
              :class="['mode-btn', { active: chatStore.currentMode === mode }]"
              @click="handleSwitchMode(mode)"
            >
              <span class="mode-icon">{{ mode === 'normal' ? '💬' : '⚡' }}</span>
              <span>{{ mode === 'normal' ? '普通' : '流式' }}</span>
            </button>
          </div>
          <el-select
            v-model="currentModel"
            size="small"
            placeholder="选择模型"
            clearable
            class="model-picker"
            @change="handleModelChange"
          >
            <el-option
              v-for="m in modelOptions"
              :key="m.value"
              :label="m.label"
              :value="m.value"
            >
              <span class="model-option">
                <span class="model-emoji">{{ m.emoji }}</span>
                {{ m.label }}
              </span>
            </el-option>
          </el-select>
          <el-button
            size="small"
            :icon="Delete"
            @click="handleClear"
            :disabled="isProcessingCurrent"
            class="clear-btn desktop-only"
          >
            清空对话
          </el-button>
          <el-button
            size="small"
            :icon="Delete"
            circle
            @click="handleClear"
            :disabled="isProcessingCurrent"
            class="clear-btn mobile-only"
          />
        </div>
      </div>

      <!-- 移动端：模式切换（放在工具栏下方） -->
      <div class="mobile-mode-bar mobile-only" v-if="!isSingleMode">
        <button
          v-for="mode in visibleModes"
          :key="mode"
          :class="['mobile-mode-btn', { active: chatStore.currentMode === mode }]"
          @click="handleSwitchMode(mode)"
        >
          <span>{{ mode === 'normal' ? '💬 普通对话' : '⚡ 流式对话' }}</span>
        </button>
      </div>

      <!-- 对话内容（根据当前对话的模式显示相应的 pane） -->
      <ChatNormalPane
        v-show="chatStore.currentMode === 'normal'"
        ref="normalPaneRef"
      />
      <ChatStreamPane
        v-show="chatStore.currentMode === 'stream'"
        ref="streamPaneRef"
      />

      <!-- 输入框 -->
      <ChatInput
        :disabled="isProcessingCurrent"
        :loading="isProcessingCurrent"
        :current-mode="chatStore.currentMode"
        :quick-items="quickItems"
        :placeholder="chatStore.currentMode === 'stream' ? '输入问题，实时流式输出...' : '输入问题，按 Enter 发送'"
        @send="handleSend"
        @quick="handleSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import ChatNormalPane from '@/components/chat/ChatNormalPane.vue'
import ChatStreamPane from '@/components/chat/ChatStreamPane.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ConversationSidebar from '@/components/chat/ConversationSidebar.vue'

const chatStore = useChatStore()

// 移动端对话列表抽屉
const drawerVisible = ref(false)

/* ====== 模式切换（从环境变量读取） ====== */
const rawChatModes = import.meta.env.VITE_CHAT_MODES
console.log(`[Chat] 从环境变量读到 VITE_CHAT_MODES = ${JSON.stringify(rawChatModes)}`)

const validModes: ('normal' | 'stream')[] = []
const invalidModes: string[] = []
;(rawChatModes || 'normal,stream')
  .split(',')
  .map((m: string) => m.trim())
  .filter((m: string) => m.length > 0)
  .forEach((m: string) => {
    if (m === 'normal' || m === 'stream') {
      validModes.push(m)
    } else {
      invalidModes.push(m)
    }
  })

if (invalidModes.length > 0) {
  console.warn(
    `[Chat] VITE_CHAT_MODES 中有无效值（已忽略）: ${invalidModes.join(', ')}。合法取值：normal, stream`
  )
}

const visibleModes: ('normal' | 'stream')[] = validModes.length > 0 ? validModes : ['normal']
console.log(
  `[Chat] 最终显示的模式: ${JSON.stringify(visibleModes)}（默认: ${visibleModes[0]}，${visibleModes.length <= 1 ? '单模式，隐藏切换按钮' : '多模式，显示切换按钮'}）`
)

const isSingleMode = computed(() => visibleModes.length <= 1)

/* ====== 模型选择 ====== */
const modelOptions = [
  { label: 'DeepSeek', value: 'deepseek', emoji: '🧠' },
  { label: '千问', value: 'qwen', emoji: '🌐' },
  { label: '文心一言', value: 'ernie', emoji: '🎯' },
  { label: 'GPT', value: 'gpt', emoji: '🤖' }
]

const quickItems = ['介绍一下你自己', '解释微服务架构', '写一个 Hello World 程序']

// 双向绑定的本地模型选择，保持和当前对话的 model 同步
const currentModel = ref<string>(chatStore.current?.model || '')

watch(
  () => chatStore.current?.model,
  (newModel) => {
    currentModel.value = newModel || ''
  }
)

/* ====== 标题和状态 ====== */
const chatTitle = computed(() => {
  const modeLabel = chatStore.currentMode === 'stream' ? '⚡ 流式对话' : '💬 普通对话'
  const convTitle = chatStore.current?.title
  if (convTitle && convTitle !== '新对话') {
    return `${modeLabel} · ${convTitle}`
  }
  return modeLabel
})

const isProcessingCurrent = computed(() => {
  if (!chatStore.currentId) return false
  if (chatStore.currentMode === 'normal') {
    return chatStore.isLoading(chatStore.currentId)
  }
  return chatStore.isStreaming(chatStore.currentId)
})

/* ====== Refs ====== */
const normalPaneRef = ref<InstanceType<typeof ChatNormalPane>>()
const streamPaneRef = ref<InstanceType<typeof ChatStreamPane>>()

/* ====== 事件处理 ====== */
async function handleSend(text: string) {
  if (!text.trim()) return

  // 确保当前对话存在；否则自动创建
  await chatStore.ensureCurrent(visibleModes[0], currentModel.value || undefined)

  if (chatStore.currentMode === 'normal') {
    normalPaneRef.value?.sendMessage(text)
  } else {
    streamPaneRef.value?.sendMessage(text)
  }
}

function handleClear() {
  if (chatStore.currentMode === 'normal') {
    normalPaneRef.value?.clearMessages()
  } else {
    streamPaneRef.value?.clearMessages()
  }
}

/**
 * 切换模式 —— 无消息时直接切换，有消息时新建对话
 */
function handleSwitchMode(mode: 'normal' | 'stream') {
  const current = chatStore.current
  if (!current) {
    chatStore.createConversation(mode, currentModel.value || undefined)
    return
  }
  if (current.mode === mode) return

  if (current.messages.length > 0) {
    chatStore.createConversation(mode, current.model)
  } else {
    chatStore.switchMode(mode)
  }
}

function handleModelChange(value: string) {
  if (!chatStore.current) return
  chatStore.setModel(value || undefined)
}

/* ====== 初始化 ====== */
onMounted(async () => {
  try {
    await chatStore.fetchSessions()
  } catch (e) {
    console.error('[Chat] 加载历史对话失败:', e)
  }
  // 确保页面加载后总有一个会话可用
  await chatStore.ensureCurrent(visibleModes[0], currentModel.value || undefined)
})
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100%;
  background: #f7f8fa;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.header-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4f6ef7 0%, #7c5cfc 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.chat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.3px;
  max-width: 420px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-badge {
  font-weight: 500;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.mode-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.mode-btn.active {
  background: #fff;
  color: #4f6ef7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-weight: 500;
}

.mode-btn:hover:not(.active) {
  color: #374151;
}

.mode-icon {
  font-size: 14px;
}

.model-picker {
  width: 140px;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 6px;
}

.model-emoji {
  font-size: 16px;
}

.clear-btn {
  border-radius: 8px;
}

/* ============================================
   移动端：<= 768px
   ============================================ */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .chat-page {
    background: #fafbfc;
  }

  .chat-header {
    padding: 10px 12px;
    gap: 8px;
  }

  .chat-title {
    font-size: 15px;
    max-width: 140px;
  }

  /* 汉堡菜单按钮 */
  .menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: #eef2ff;
    color: #4f6ef7;
    border-radius: 10px;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }

  /* 模型选择器精简 */
  .model-picker {
    width: 100px;
  }
  :deep(.model-picker .el-select__placeholder),
  :deep(.model-picker .el-select__selected-item) {
    font-size: 12px;
  }

  /* 移动端模式切换横条 */
  .mobile-mode-bar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: #fff;
    border-bottom: 1px solid #f3f4f6;
    flex-shrink: 0;
  }
  .mobile-mode-btn {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 20px;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }
  .mobile-mode-btn.active {
    background: #4f6ef7;
    color: #fff;
    border-color: #4f6ef7;
    font-weight: 500;
  }
}

/* 大屏下隐藏 mobile-only */
.mobile-only {
  display: none !important;
}
@media (max-width: 768px) {
  .mobile-only {
    display: inline-flex !important;
  }
}

/* 抽屉容器背景 */
:deep(.conv-drawer .el-drawer__body) {
  padding: 0;
  background: #f7f8fa;
}
</style>