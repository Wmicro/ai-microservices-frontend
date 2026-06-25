// 导入 Vite 配置函数
import { defineConfig } from 'vite'
// 导入 Vue 插件（用于编译 .vue 文件）
import vue from '@vitejs/plugin-vue'
// 导入 Node.js 路径处理模块
import { resolve, dirname } from 'path'
// 导入 URL 工具函数（用于处理 ES Module 中的文件路径）
import { fileURLToPath } from 'url'

// 在 ES Module 中模拟 CommonJS 的 __dirname
const __dirname = dirname(fileURLToPath(import.meta.url))

// 导出 Vite 配置
export default defineConfig({
  // 配置插件列表
  plugins: [vue()],
  // 配置路径解析
  resolve: {
    // 设置路径别名（简化导入路径）
    alias: {
      // @ 符号映射到项目根目录下的 src 文件夹
      '@': resolve(__dirname, 'src')
    }
  },
  // 开发服务器配置 — 解决跨域 + 开放局域网访问
  server: {
    // 监听所有网络接口（允许局域网内其他设备访问，如手机、同事电脑）
    host: '0.0.0.0',
    // API 反向代理 — 前端发起 /api/* 请求时，自动转发到后端 Gateway
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:10000',
        changeOrigin: true,
        // 明确转发所有 header（包括 Authorization、Content-Type 等），避免后端因缺少 header 拒绝
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // 复制所有原始请求头到代理请求
            Object.keys(req.headers).forEach((key) => {
              const value = req.headers[key]
              if (value !== undefined) {
                proxyReq.setHeader(key, value)
              }
            })
          })
          // 打印代理日志，方便调试
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error]', err)
          })
        }
      }
    }
  },
  // Vitest 配置
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: []
  }
})