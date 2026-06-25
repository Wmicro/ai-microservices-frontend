<template>
  <div class="chat-pane">
    <div v-if="currentMessages.length === 0" class="welcome-placeholder">
      <div class="welcome-card">
        <div class="welcome-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/>
            <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <h3>你好！</h3>
        <p>输入问题开始对话，我会尽力回答你。</p>
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
          :size-dependencies="[msg.content]"
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
              <div :class="['msg-content', msg.role]">
                <MarkdownRenderer :content="msg.content" />
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

    <div v-if="isLoading" class="loading-indicator">
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <span class="loading-text">AI 正在思考...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useChatNormal } from '@/composables/useChatNormal'
import MarkdownRenderer from './MarkdownRenderer.vue'

const chatStore = useChatStore()
const scrollerRef = ref()

const { sendMessage, clearMessages } = useChatNormal(
  () => chatStore.currentId,
  scrollerRef
)

const currentMessages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isProcessingCurrent && chatStore.currentId && chatStore.isLoading(chatStore.currentId))

defineExpose({
  sendMessage,
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
  background: linear-gradient(135deg, #4f6ef7 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  animation: float 3s ease-in-out infinite;
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
.scroller {
  flex: 1;
  padding: 20px 0;
}
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
.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.msg-avatar.assistant {
  background: #f0f2ff;
  color: #4f6ef7;
}
.msg-avatar.user {
  background: #f0f2ff;
  color: #f5576c;
}
.msg-body {
  max-width: 75%;
  min-width: 0;
}
.msg-content {
  font-size: 15px;
  line-height: 1.75;
  color: #1f2937;
}
.msg-content.user {
  background: #4f6ef7;
  color: #fff;
  padding: 12px 18px;
  border-radius: 16px 16px 4px 16px;
  line-height: 1.6;
}
.msg-content.assistant {
  padding: 0;
}
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

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  border-top: 1px solid #f3f4f6;
}
.loading-dots {
  display: flex;
  gap: 4px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4f6ef7;
  animation: bounce 1.4s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; background: #764ba2; }
.dot:nth-child(3) { animation-delay: 0.4s; background: #f093fb; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
.loading-text {
  font-size: 13px;
  color: #9ca3af;
}
</style>