# 项目结构说明

本文档介绍 Vue 3 + TypeScript + Vite 前端项目的目录组织。

---

## 📁 目录总览（真实结构）

```
ai-microservices-frontend/
├── 📁 dist/                   # 🔨 构建产物（npm run build 生成，部署用）
├── 📁 public/                 # 📄 静态资源（原样输出，如 vite.svg / favicon）
├── 📁 src/                    # 💻 源代码核心目录
│   ├── 📁 api/                # 🌐 API 接口定义（按后端服务划分）
│   │   ├── auth.ts            #   认证服务 → /api/auth/*, /api/profile/*
│   │   ├── chat.ts            #   对话服务 → /api/chat/*, /api/stream
│   │   └── file.ts            #   文件服务 → /api/files/*
│   ├── 📁 assets/             # 🖼️ 图片、字体（会被 Vite 处理，hash 命名）
│   │   └── vue.svg
│   ├── 📁 composables/        # 🔧 可复用逻辑（Composition API Hooks）
│   │   └── useChatStream.ts   #   SSE 流式对话封装（消息、EventSource 管理）
│   ├── 📁 layouts/            # 📐 页面布局（侧边栏 + 顶部栏 + 内容区）
│   │   └── DefaultLayout.vue
│   ├── 📁 router/             # 🗺️ 路由配置（路由表 + 登录守卫）
│   │   └── index.ts
│   ├── 📁 stores/             # 📦 Pinia 状态管理（全局共享状态）
│   │   └── auth.ts            #   登录态、用户信息、Token 持久化
│   ├── 📁 types/              # 📋 TypeScript 类型定义（按领域划分）
│   │   ├── api.ts             #   通用：ApiResponse<T> 统一响应
│   │   ├── auth.ts            #   认证：LoginRequest, LoginResponse, UserProfile...
│   │   ├── chat.ts            #   对话：ChatHistory, ChatMessage
│   │   └── file.ts            #   文件：FileInfo
│   ├── 📁 utils/              # 🔧 工具函数
│   │   └── axios.ts           #   axios 实例 + 请求/响应拦截器 + Token 注入
│   ├── 📁 views/              # 📄 页面级视图（路由 target）
│   │   ├── Login.vue          #   登录页
│   │   ├── Register.vue       #   注册页
│   │   ├── Chat.vue           #   AI 对话页（流式）
│   │   ├── Files.vue          #   文件管理页
│   │   └── About.vue          #   关于页
│   ├── App.vue                # 🏠 根组件
│   ├── main.ts                # 🚀 应用入口（Vue、Pinia、Router、Element Plus 初始化）
│   ├── style.css              # 🎨 全局样式
│   └── vite-env.d.ts          # 📝 Vite 环境类型声明
├── 📁 deploy/                 # 🚀 部署配置（生产部署相关文件）
│   └── nginx.conf             #   Nginx 反代配置（80 → Gateway 10000）
├── 📁 docs/                   # 📖 项目文档
│   └── project-structure.md   #   （本文件）
├── .env                       # ⚙️ 本地环境变量（Git 忽略，不提交）
├── .env.example               # 📝 环境变量示例（团队参考，可提交）
├── .gitignore
├── index.html                 # 📄 HTML 入口模板
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json          # 📝 应用级 TS 配置（被 tsconfig.json 引用）
├── tsconfig.node.json         # 📝 Node/Vite 级 TS 配置
└── vite.config.ts             # ⚡ Vite 构建配置
```

---

## 🎯 分层职责与后端对应关系

| 前端目录 | 职责 | 与后端的关系 |
|---------|------|-------------|
| `src/api/*.ts` | 定义 HTTP 请求方法 | **一对一对应后端服务**（auth/chat/file） |
| `src/types/*.ts` | TypeScript 类型定义 | **一对一对应后端 DTO / Entity** |
| `src/views/*.vue` | 页面视图 | 按用户场景组织，一个页面可调用多个 API |
| `src/composables/*.ts` | 可复用逻辑封装 | 将复杂的流处理（SSE）、状态组合抽离，便于测试 |
| `src/stores/*.ts` | 全局状态（登录态等） | 对应后端 Session / JWT 的前端持久化 |
| `src/utils/axios.ts` | HTTP 客户端 + 拦截器 | 统一处理 Token 注入、ApiResponse 解包、错误处理 |
| `src/router/index.ts` | URL 路由 + 权限守卫 | 类似后端 Filter，未登录拦截受保护页面 |
| `src/layouts/*.vue` | 页面外层框架 | 纯前端概念，无后端对应 |
| `src/assets/` | 图片、字体资源 | 由 Vite hash 命名后输出到 dist，交给 Nginx 或 CDN |

---

## 🚀 请求调用链示例（登录）

```
用户在 Login.vue 填表单 → 提交
    ↓
authStore.doLogin(loginForm)          ← Pinia 状态管理
    ↓
authApi.login(data)                   ← API 层
    ↓
axios.post('/api/auth/login', data)   ← axios 实例（请求拦截器自动注入 Token）
    ↓
Nginx (80) → /api/auth/login
    ↓ proxy_pass
Gateway (10000) → 路由到用户服务
    ↓
后端 Controller → Service → DB
    ↓ 返回
ApiResponse<LoginResponse>            ← 响应拦截器解包
    ↓
saveAuth(data) → Token 写入 localStorage
    ↓
router.push('/chat')                  ← 跳转对话页
```

---

## 💡 新增功能时的建议流程

以"聊天历史"为例：

1. **`src/types/chat.ts`** —— 新增相关类型（如 `ChatHistoryItem`）
2. **`src/api/chat.ts`** —— 新增接口方法（如 `getChatHistory()`）
3. **`src/views/Chat.vue`** —— 在页面中调用 API，渲染 UI
4. **如果逻辑复杂** → 抽离到 `src/composables/` 作为可复用 Hook
5. **如果需要跨页面共享状态** → 在 `src/stores/` 新增 Pinia store
6. **如果需要通用 UI 组件** → 在 `src/components/` 下新增（当前为空目录，按需创建）

---

## 🔑 文件命名约定

| 位置 | 命名 | 含义 |
|------|------|------|
| `src/views/` | `PascalCase.vue` | 页面视图组件 |
| `src/components/` | `PascalCase.vue` | 可复用 UI 组件（按需创建） |
| `src/layouts/` | `*Layout.vue` | 布局组件 |
| `src/api/` | `camelCase.ts` | 以服务领域命名（auth/chat/file） |
| `src/types/` | `camelCase.ts` | 与同名 API 文件对应 |
| `src/composables/` | `useCamelCase.ts` | Vue 组合式函数惯例（useXxx） |
| `src/stores/` | `camelCase.ts` | Pinia Store |

---

## 🚫 已清理的脚手架遗留

以下 Vue CLI 默认模板文件已在整理中删除，避免与业务文件混淆：

- `src/components/HelloWorld.vue`
- `src/views/Home.vue`
- `src/stores/counter.ts`
- 根目录 `nginx.conf`（已移入 `deploy/nginx.conf`）
- 若干空目录（`src/views/{auth,chat,files}/`、`src/assets/{css,images}/`、`src/components/`）