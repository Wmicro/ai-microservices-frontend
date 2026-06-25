import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Vitest 单元测试配置 — 仅运行 src 目录下的测试文件
// e2e 测试使用独立的 `npm run test:e2e`（playwright）命令，不会被 vitest 扫描
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'e2e'],
    globals: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})