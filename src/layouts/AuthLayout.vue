<template>
  <div class="auth-layout">
    <div class="auth-left">
      <div class="brand-area">
        <div class="logo-box">
          <svg viewBox="0 0 1024 1024" width="60" height="60">
            <path fill="#409eff" d="M512 128C299.93 128 128 277.42 128 464c0 104.23 58.8 197.42 151.85 263.38L256 896h288l128-96c90.4-55.8 144-133.6 144-220.62 0-186.58-171.93-347.38-384-347.38z"/>
          </svg>
        </div>
        <h1 class="brand-title">AI 智能平台</h1>
        <p class="brand-subtitle">
          <slot name="brand-subtitle">智能对话 · 文档分析 · 知识问答</slot>
        </p>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-dot">✨</span>
            <span>基于大模型的智能对话体验</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot">📄</span>
            <span>支持文件上传与内容解析</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot">💬</span>
            <span>多轮对话上下文记忆</span>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <h2 class="auth-title">
          <slot name="title" />
        </h2>
        <p class="auth-subtitle">
          <slot name="subtitle" />
        </p>
        <slot />
      </div>
      <p class="copyright">© 2024 AI Microservices Platform. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.auth-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 40px;
}
.brand-area {
  max-width: 440px;
}
.logo-box {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}
.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
}
.brand-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 48px 0;
}
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}
.feature-dot {
  font-size: 20px;
}
.auth-right {
  width: 480px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.auth-card {
  width: 100%;
  max-width: 360px;
}
.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  text-align: center;
}
.auth-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 32px 0;
  text-align: center;
}
.copyright {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 16px;
}
@media (max-width: 900px) {
  .auth-left {
    display: none;
  }
  .auth-right {
    width: 100%;
  }
}

/* ========== 手机端进一步优化 ========== */
@media (max-width: 480px) {
  .auth-layout {
    min-height: 100dvh;
  }
  .auth-right {
    padding: 24px 20px;
    padding-top: calc(24px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  }
  .auth-card {
    max-width: 100%;
  }
  .auth-title {
    font-size: 24px;
  }
  .auth-subtitle {
    font-size: 13px;
    margin-bottom: 24px;
  }
}
</style>