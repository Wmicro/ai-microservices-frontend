<template>
  <div class="chat-input-area">
    <div class="quick-actions">
      <button
        v-for="item in quickItems"
        :key="item"
        :class="['quick-pill', currentMode]"
        @click="$emit('quick', item)"
      >
        <span class="pill-icon">✦</span>
        {{ item }}
      </button>
    </div>
    <div class="input-row">
      <div class="input-wrapper">
        <input
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled"
          class="input-field"
          @keyup.enter.exact="handleSend"
          autocomplete="off"
        />
        <el-button
          :class="['send-btn', currentMode, { active: inputText.trim() }]"
          :disabled="disabled || !inputText.trim()"
          :loading="loading"
          circle
          size="default"
          @click="handleSend"
        >
          <svg v-if="!loading" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13" stroke-linecap="round"/>
            <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  disabled?: boolean
  loading?: boolean
  currentMode?: string
  quickItems?: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [text: string]
  quick: [text: string]
}>()

const inputText = ref('')

function handleSend() {
  if (!inputText.value.trim() || props.disabled) return
  emit('send', inputText.value.trim())
  inputText.value = ''
}
</script>

<style scoped>
.chat-input-area {
  padding: 16px 24px 20px;
  background: #fff;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}
.quick-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.pill-icon {
  font-size: 10px;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}
.quick-pill:hover {
  border-color: #4f6ef7;
  color: #4f6ef7;
  background: #f5f3ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(79, 110, 247, 0.12);
}
.quick-pill:hover .pill-icon {
  opacity: 1;
  transform: translateX(0);
}
.quick-pill.stream:hover {
  border-color: #f5576c;
  color: #f5576c;
  background: #fff5f5;
  box-shadow: 0 2px 8px rgba(245, 87, 108, 0.12);
}
.input-row {
  display: flex;
  gap: 8px;
}
.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 4px 4px 4px 16px;
  transition: all 0.25s ease;
}
.input-wrapper:focus-within {
  border-color: #4f6ef7;
  box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.08);
  background: #fff;
}
.input-field {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1f2937;
  background: transparent;
  padding: 8px 0;
  line-height: 1.5;
}
.input-field::placeholder {
  color: #c4c4cd;
}
.input-field:disabled {
  opacity: 0.5;
}
.send-btn {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border: none;
  background: #e5e7eb;
  color: #9ca3af;
  transition: all 0.25s ease;
}
.send-btn.active {
  background: #4f6ef7;
  color: #fff;
  box-shadow: 0 2px 12px rgba(79, 110, 247, 0.3);
}
.send-btn.active:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.4);
}
.send-btn.stream.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 2px 12px rgba(245, 87, 108, 0.3);
}
.send-btn.stream.active:hover {
  box-shadow: 0 4px 16px rgba(245, 87, 108, 0.4);
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .chat-input-area {
    padding: 10px 12px calc(10px + var(--safe-bottom, 0px));
  }

  .quick-actions {
    gap: 6px;
    margin-bottom: 10px;
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
  }

  .quick-pill {
    padding: 6px 12px;
    font-size: 13px;
    flex-shrink: 0;
    background: #f9fafb;
  }
  /* 移动端 hover 无效，使用 active 按下态 */
  .quick-pill:active {
    transform: scale(0.96);
    background: #eef2ff;
    border-color: #c7d2fe;
  }

  .input-wrapper {
    padding: 4px 4px 4px 12px;
    border-radius: 22px;
    border-width: 1.5px;
  }

  .input-field {
    font-size: 16px; /* 防止 iOS 自动放大 */
    padding: 10px 0;
  }

  .send-btn {
    width: 42px;
    height: 42px;
  }
}
</style>