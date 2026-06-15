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
  }
})