<template>
  <div class="conversation-sidebar">
    <div class="sidebar-header">
      <el-button
        type="primary"
        :icon="Plus"
        class="new-conv-btn"
        @click="handleNewConversation"
      >
        新对话
      </el-button>
    </div>

    <div class="conversation-list" v-if="sortedConversations.length > 0">
      <div
        v-for="conv in sortedConversations"
        :key="conv.id"
        :class="['conversation-item', { active: conv.id === chatStore.currentId }]"
      >
        <div class="conv-icon"
             @click="chatStore.selectConversation(conv.id)">
          <el-icon :size="16" v-if="conv.mode === 'stream'">
            <Lightning />
          </el-icon>
          <el-icon :size="16" v-else>
            <ChatDotRound />
          </el-icon>
        </div>
        <div class="conv-content"
             @click="chatStore.selectConversation(conv.id)">
          <div class="conv-title">
            <span v-if="editingId !== conv.id">{{ conv.title || '新对话' }}</span>
            <el-input
              v-else
              ref="titleInputRef"
              v-model="tempTitle"
              size="small"
              class="title-input"
              @blur="handleRenameConfirm(conv.id)"
              @keyup.enter="handleRenameConfirm(conv.id)"
              @keyup.esc="handleRenameCancel"
            />
          </div>
          <div class="conv-meta">
            <span class="conv-mode">{{ conv.mode === 'stream' ? '流式' : '普通' }}</span>
            <span class="conv-dot">·</span>
            <span class="conv-time">{{ formatTime(conv.updateTime) }}</span>
          </div>
        </div>
        <div class="conv-actions">
          <el-button
            link
            type="primary"
            class="rename-btn"
            :icon="EditPen"
            @click.stop="handleRenameStart(conv.id, conv.title)"
          >
            重命名
          </el-button>
          <el-button
            link
            type="danger"
            class="delete-btn"
            :icon="Delete"
            @click.stop="handleDelete(conv.id)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-icon :size="32" color="#d1d5db"><ChatDotRound /></el-icon>
      <p>暂无对话</p>
      <p class="empty-hint">点击上方按钮开始第一个对话</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { Plus, Delete, ChatDotRound, Lightning, EditPen } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const sortedConversations = computed(() => chatStore.sortedConversations)
const editingId = ref<string | null>(null)
const tempTitle = ref('')
const titleInputRef = ref<{ focus: () => void } | null>(null)

function handleNewConversation() {
  const currentMode = chatStore.current?.mode || 'stream'
  const currentModel = chatStore.current?.model
  chatStore.createConversation(currentMode, currentModel)
}

function handleDelete(id: string) {
  if (confirm('确定要删除这个对话吗？')) {
    chatStore.deleteConversation(id)
  }
}

function handleRenameStart(id: string, currentTitle: string) {
  editingId.value = id
  tempTitle.value = currentTitle
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

async function handleRenameConfirm(id: string) {
  const conv = chatStore.conversations.find(c => c.id === id)
  const newTitle = tempTitle.value.trim()
  
  if (!newTitle || newTitle === conv?.title) {
    editingId.value = null
    return
  }
  
  if (await chatStore.renameConversation(id, newTitle)) {
    editingId.value = null
  }
}

function handleRenameCancel() {
  editingId.value = null
}

/**
 * 格式化时间：显示为友好的相对时间或具体时间
 */
function formatTime(isoString: string): string {
  if (!isoString) return '刚刚'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '刚刚'
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays < 7) return `${diffDays} 天前`

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped>
.conversation-sidebar {
  width: 300px;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-header {
  padding: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.new-conv-btn {
  width: 100%;
  height: 38px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  background: transparent;
  transition: background 0.15s;
  position: relative;
}

.conversation-item:hover {
  background: #eef2ff;
}

.conversation-item.active {
  background: #4f6ef7;
}

.conversation-item.active .conv-title,
.conversation-item.active .conv-mode,
.conversation-item.active .conv-dot,
.conversation-item.active .conv-time {
  color: #fff;
}

.conv-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #e0e7ff;
  color: #4f6ef7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.conversation-item.active .conv-icon {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.conv-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.conv-title {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
  /* 最多 2 行，让标题尽量显示完整，超出才用省略号 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.title-input {
  width: 100%;
  font-size: 13px;
  font-weight: 500;
}

.conv-meta {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
}

.conv-mode {
  font-weight: 500;
}

.conv-dot {
  margin: 0 4px;
}

.conv-actions {
  /* 绝对定位悬浮显示，不挤压标题内容空间 */
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 6px;
  background: #eef2ff;
  opacity: 0;
  transition: opacity 0.15s;
  /* hover 时悬浮在右侧，让标题右侧留出视觉空间 */
}

.conversation-item.active .conv-actions {
  background: rgba(255, 255, 255, 0.25);
}

.conversation-item:hover .conv-actions {
  opacity: 1;
}

.rename-btn,
.delete-btn {
  padding: 4px 6px;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  color: #9ca3af;
}

.empty-state p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.empty-state .empty-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}
</style>