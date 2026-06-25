/**
 * 应用程序的入口文件
 * 
 * 这个文件是 Vue 应用的起点，负责：
 * 1. 导入必要的依赖和样式
 * 2. 创建 Vue 应用实例
 * 3. 配置插件（路由、状态管理、UI组件库等）
 * 4. 将应用挂载到 DOM 中
 */

// 从 Vue 框架中导入 createApp 函数，用于创建应用实例
import { createApp } from 'vue'

// 导入全局样式文件，这些样式会应用到整个应用
import './style.css'

// 导入根组件 App.vue，这是应用的核心组件
import App from './App.vue'

// 导入路由配置，用于管理页面导航
import router from '@/router'

// 导入 Pinia，Vue 的状态管理库
import { createPinia } from 'pinia'

// 导入 Element Plus 组件库及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入 vue-virtual-scroller 虚拟滚动（用于长消息列表性能优化）
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// 创建 Vue 应用实例 传入 App 组件（根组件）作为参数
const app = createApp(App)

// 先注册 Pinia（全局状态管理），再注册 Router — 确保路由守卫能访问 store
app.use(createPinia())
app.use(router)

// 使用 Element Plus 插件，注册所有 UI 组件
app.use(ElementPlus)
// 注册全局 RecycleScroller 组件
app.component('RecycleScroller', RecycleScroller)
app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)

// 将应用挂载到 index.html 中的 #app 元素上
// 这是应用真正开始运行的地方
app.mount('#app')