<template>
  <div class="chat-pane">
    <div v-if="currentMessages.length === 0" class="welcome-placeholder">
      <div class="welcome-card">
        <div class="welcome-icon stream">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <h3>流式对话</h3>
        <p>输入问题开始实时对话，AI 会逐字输出回答。</p>
      </div>
    </div>

    <DynamicScroller
      v-else
      ref="scrollerRef"
      :items="currentMessages"
      :min-item-size="60"
      key-field="id"
      class="scroller"
      :buffer="200"
    >
      <template #default="{ item: msg, active }">
        <DynamicScrollerItem
          :item="msg"
          :active="active"
          :size-dependencies="[msg.content, msg.streaming]"
        >
          <div :class="['message-row', msg.role]">
            <div :class="['msg-avatar', msg.role]">
              <svg v-if="msg.role === 'assistant'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div :class="['msg-body', msg.role]">
              <div :class="['msg-content', msg.role, { streaming: msg.streaming }]">
                <MarkdownRenderer :content="msg.content" :streaming="msg.streaming" />
              </div>
              <div class="msg-time">
                <span v-if="msg.model" class="msg-model">{{ msg.model }}</span>
                <span>{{ msg.time }}</span>
              </div>
            </div>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <div v-if="isStreaming" class="stream-actions">
      <button class="stop-btn" @click="stopStreaming">
        <span class="stop-dot"></span>
        停止生成
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useChatStream } from '@/composables/useChatStream'
import MarkdownRenderer from './MarkdownRenderer.vue'

const chatStore = useChatStore()
const scrollerRef = ref()

const { sendMessage, stopStreaming, clearMessages } = useChatStream(
  () => chatStore.currentId,
  scrollerRef
)

const currentMessages = computed(() => chatStore.messages)
const isStreaming = computed(() =>
  chatStore.currentId ? chatStore.isStreaming(chatStore.currentId) : false
)

defineExpose({
  sendMessage,
  stopStreaming,
  clearMessages
})
</script>

<style scoped>
.chat-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #ffffff;
}

/* ====== 欢迎占位 ====== */
.welcome-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.welcome-card {
  text-align: center;
  max-width: 420px;
  padding: 48px 40px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 30px rgba(0, 0, 0, 0.06);
}
.welcome-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  animation: float 3s ease-in-out infinite;
}
.welcome-icon.stream {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.welcome-card h3 {
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.5px;
}
.welcome-card p {
  margin: 0;
  color: #9ca3af;
  font-size: 15px;
  line-height: 1.6;
}

/* ====== 滚动容器 ====== */
.scroller {
  flex: 1;
  padding: 20px 0;
}

/* ====== 消息行 ====== */
.message-row {
  display: flex;
  gap: 14px;
  padding: 16px 24px;
  animation: fadeIn 0.35s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.message-row.user {
  flex-direction: row-reverse;
}

/* 头像 */
.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}
.msg-avatar.assistant {
  background: #eef2ff;
  color: #4f6ef7;
}
.msg-avatar.user {
  background: #fef2f2;
  color: #f5576c;
}

/* 消息体 */
.msg-body {
  max-width: 78%;
  min-width: 0;
}

/* 消息内容 */
.msg-content {
  font-size: 15px;
  line-height: 1.75;
  color: #1f2937;
  position: relative;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}
.msg-content.user {
  background: #4f6ef7;
  color: #fff;
  padding: 12px 18px;
  border-radius: 16px 16px 4px 16px;
  font-size: 14.5px;
}
.msg-content.assistant {
  padding: 0;
}

/* 时间 */
.msg-time {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8px;
}
.message-row.user .msg-time {
  justify-content: flex-end;
}
.msg-model {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

/* ====== 停止生成按钮 ====== */
.stream-actions {
  padding: 12px 24px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
  background: #fafbfd;
}
.stop-btn {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #4b5563;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.stop-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
.stop-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f5576c;
  animation: pulse 1.4s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ========== 移动端气泡适配 ========== */
@media (max-width: 768px) {
  .message-row {
    gap: 8px;
    padding: 10px 12px;
  }
  .msg-avatar {
    width: 30px;
    height: 30px;
  }
  .msg-body {
    max-width: calc(100% - 46px);
  }
  .msg-content {
    font-size: 14.5px;
    line-height: 1.6;
  }
  .msg-content.user {
    padding: 10px 14px;
    font-size: 14px;
    border-radius: 14px 14px 4px 14px;
  }
  .msg-time {
    font-size: 11px;
    margin-top: 6px;
  }
  .scroller {
    padding: 10px 0;
  }
  .welcome-card {
    padding: 32px 20px;
  }
  .welcome-card h3 {
    font-size: 20px;
  }
  .welcome-icon {
    width: 60px;
    height: 60px;
  }
}
</style>