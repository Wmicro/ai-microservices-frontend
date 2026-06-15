# AI 智能平台 - 前端

> 基于 **Vue 3 + TypeScript + Vite** 的 AI 智能平台前端项目，提供对话、文件管理、用户认证等完整功能。
> 后端为 Java Spring Boot 微服务架构（认证服务 / AI 对话服务 / 文件服务）。

---

## 🧰 项目维护命令

### ✅ 已在 package.json 中定义

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `npm run dev` | 启动 Vite 开发服务器（热更新） | 日常开发调试 |
| `npm run build` | 先执行 TypeScript 构建检查（`vue-tsc -b`），再打包到 `dist/` | 发布前编译 |
| `npm run preview` | 在本地预览 `dist/` 的生产构建结果 | 验证发布版本是否正常 |

### 🔧 常用附加命令（npm/工具自带，无需额外配置）

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `npm install` | 安装所有依赖（首次拉取项目必执行） | 初始化/同步依赖 |
| `npm install <pkg>` | 新增一个生产依赖到 `dependencies` | 加新库 |
| `npm install -D <pkg>` | 新增一个开发依赖到 `devDependencies` | 加构建/类型相关工具 |
| `rm -rf node_modules dist && npm install` | 彻底重装依赖（解决疑难杂症） | 环境异常时 |
| `npx vue-tsc --noEmit` | 仅做 TypeScript 类型检查，不生成产物 | 代码自检 |
| `npm outdated` | 列出有更新的依赖 | 版本巡检 |

### 💡 常用组合流程

```bash
# 1. 类型检查（不会写文件，速度快）
npx vue-tsc --noEmit

# 2. 本地开发验证
npm run dev

# 3. 准备发布前全量构建
npm run build

# 4. 预览生产包
npm run preview
```

---

## 🎯 项目功能

| 模块 | 路径 | 功能说明 |
|------|------|----------|
| 🔐 用户认证 | `/login` `/register` | 登录、注册、Token 自动刷新、登出 |
| 💬 AI 对话 | `/chat` | 流式输出对话、上下文记忆、历史记录 |
| 📁 文件管理 | `/files` | 文件上传（多文件）、列表、内容预览、删除 |
| ℹ️ 项目说明 | `/about` | 技术栈、目录结构、API 接口清单 |

---

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | 3.4+ |
| 语言 | TypeScript | 5.x |
| 构建工具 | Vite | 6.x |
| 路由 | Vue Router | 4.x |
| 状态管理 | Pinia | 2.x |
| UI 组件库 | Element Plus | 最新 |
| HTTP 客户端 | Axios | 1.x |

---

## 📂 项目结构

```
ai-microservices-frontend/
├── public/                       # 静态资源（原样复制）
├── src/
│   ├── api/                      # API 接口层（对接后端微服务）
│   │   ├── auth.ts               # 认证服务 API（/api/auth/*）
│   │   ├── chat.ts               # AI 对话 API（/api/*）
│   │   └── file.ts               # 文件服务 API（/api/files/*）
│   ├── components/               # 通用组件
│   ├── layouts/                  # 布局组件
│   │   └── DefaultLayout.vue     # 默认布局（侧边栏 + 顶栏）
│   ├── router/                   # 路由配置
│   │   └── index.ts              # 路由表 + 登录守卫
│   ├── stores/                   # Pinia 状态管理
│   │   └── auth.ts               # 用户认证状态（Token、用户信息）
│   ├── types/                    # TypeScript 类型定义
│   │   └── api.ts                # ApiResponse、请求/响应 DTO
│   ├── utils/                    # 工具函数
│   │   └── axios.ts              # Axios 封装（拦截器、错误处理）
│   ├── views/                    # 页面组件
│   │   ├── Login.vue             # 登录页
│   │   ├── Register.vue          # 注册页
│   │   ├── Chat.vue              # AI 对话页（流式输出）
│   │   ├── Files.vue             # 文件管理页
│   │   └── About.vue             # 项目说明页
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   └── style.css                 # 全局样式
├── .env                          # 环境变量（API 地址等）
├── nginx.conf                    # Nginx 生产部署配置
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 16
- **npm** >= 8

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
# 打开 http://localhost:5173
```

### 生产构建

```bash
npm run build
# 产物在 dist/ 目录
```

### 预览构建结果

```bash
npm run preview
```

---

## 🔧 配置说明

### 环境变量（.env）

```env
# 后端 API 基础地址
# 注意：此地址是 Nginx 反向代理的入口，不含 /api 路径
VITE_API_BASE_URL=http://localhost:8080
```

| 后端微服务 | 实际端口 | Nginx 转发路径 |
|------------|---------|----------------|
| 认证服务 | 8081 | `/api/auth/*` |
| AI 对话服务 | 8082 | `/api/chat/*`、`/api/stream` |
| 文件服务 | 8083 | `/api/files/*` |

### Axios 封装要点

`src/utils/axios.ts` 实现了：
- ✅ 自动注入 `Authorization: Bearer <token>`
- ✅ 统一解析后端 `ApiResponse<T>`（自动 `.data`）
- ✅ 401 自动清除 Token + 跳转登录页
- ✅ ElMessage 统一错误提示

---

## 🗂️ 核心功能实现

### 1. 路由守卫（登录拦截）

`src/router/index.ts` 中的 `beforeEach` 守卫：
- 未登录访问受保护页面 → 自动跳转 `/login`
- 已登录访问登录/注册页 → 自动跳转 `/chat`
- 通过 `meta.requiresAuth` 控制路由权限

### 2. 用户状态管理（Pinia）

`src/stores/auth.ts`：
- Token / 用户信息持久化到 localStorage
- 刷新页面自动恢复登录态
- `doLogin` / `doRegister` / `doLogout` 统一操作

### 3. AI 流式对话（SSE）

`src/views/Chat.vue`：
- 使用 `EventSource` 接收服务端推送
- 实时拼接文本，实现打字机效果
- 失败自动回退到普通 HTTP 请求

### 4. Nginx SPA 部署

`nginx.conf` 关键配置：
- `try_files $uri /index.html` → 解决 Vue Router history 模式刷新 404
- `location /api/*` → 反向代理到对应后端服务
- `/api/stream` 特殊配置 `proxy_buffering off` → 支持流式输出
- 静态资源 `expires 1y` → 长期缓存
- Gzip 压缩 → 减小传输体积

---

## 📦 Nginx 生产部署

### 1. 构建

```bash
npm run build
# 输出目录：dist/
```

### 2. 上传到服务器

```bash
scp -r dist/* user@server:/var/www/ai-frontend/
scp nginx.conf user@server:/etc/nginx/conf.d/ai-frontend.conf
```

### 3. 启动 Nginx

```bash
# 测试配置
nginx -t

# 重新加载
nginx -s reload
# 或
systemctl reload nginx
```

### 4. 访问验证

```
http://your-domain.com     # 页面
http://your-domain.com/api/auth/login   # API（由 Nginx 转发到后端）
```

---

## 📑 新增 / 修改文件清单

### ✅ 新增文件（12 个）

| 文件 | 作用 |
|------|------|
| `src/types/api.ts` | API 类型定义：ApiResponse、LoginRequest、ChatMessage、FileInfo 等 |
| `src/api/auth.ts` | 认证服务接口封装 |
| `src/api/chat.ts` | AI 对话服务接口封装（含 SSE 流式） |
| `src/api/file.ts` | 文件服务接口封装（上传、列表、删除等） |
| `src/stores/auth.ts` | Pinia 用户状态 Store |
| `src/layouts/DefaultLayout.vue` | 默认布局（侧边栏 + 顶栏） |
| `src/views/Login.vue` | 登录页 |
| `src/views/Register.vue` | 注册页 |
| `src/views/Chat.vue` | AI 对话页（流式输出） |
| `src/views/Files.vue` | 文件管理页 |
| `nginx.conf` | Nginx 生产部署配置 |

### 🔧 修改文件（6 个）

| 文件 | 修改内容 |
|------|----------|
| `src/utils/axios.ts` | 增强拦截器、Token 自动注入、ApiResponse 解包、401 处理 |
| `src/router/index.ts` | 路由表 + 登录守卫 + meta 元信息 |
| `src/views/About.vue` | 完整重写：技术栈、结构、API 清单 |
| `src/App.vue` | 简化为 RouterView 出口 + 全局样式 |
| `.env` | API 基础地址配置 |

---

## 🧭 前端开发需求清单（Roadmap）

> 按优先级排序，P0 必须优先开发；对应后端 Java 微服务已全部就绪。

### 🔥 P0 - 核心体验闭环（必须优先完成）

后端接口已就绪，前端页面待开发。

| 需求 | 对应后端接口 | 说明 |
|------|-------------|------|
| 个人中心页面（首页） | `GET /api/profile` | 展示用户名、邮箱、注册时间、最近活跃时间 |
| 修改邮箱 / 昵称 | `PUT /api/profile` | 表单编辑 + 保存按钮 |
| 修改密码 | `POST /api/profile/password` | 旧密码 + 新密码 + 确认新密码，表单校验 |
| 登录设备管理 | `GET /api/profile/devices` | 表格展示设备 ID、IP、登录时间、登录状态 |
| 远程登出设备 | `POST /api/profile/devices/{id}/logout` | 每行一个按钮，点击二次确认 |
| 注销账号 | `DELETE /api/profile/account` | 红色警告按钮 + 强二次确认 + 最终提示不可恢复 |
| 个人中心导航入口 | - | DefaultLayout 顶栏"个人中心"菜单项点击跳转到 `/profile` |
| 路由补充 | - | 路由表增加 `/profile`、`/profile/password`、`/profile/devices` 等路径 |

**涉及文件**：
- `src/router/index.ts` - 增加路由和 meta 信息
- `src/layouts/DefaultLayout.vue` - 增加个人中心菜单入口
- `src/views/Profile.vue` - 个人资料页面
- `src/views/ChangePassword.vue` - 修改密码页面
- `src/views/Devices.vue` - 设备管理页面

---

### 📈 P1 - 完善产品体验（P0 完成后再开发）

| 需求 | 对应后端接口 / 实现方式 | 说明 |
|------|-----------------------|------|
| 对话历史列表（侧栏） | `GET /api/chat/history` | Chat.vue 左侧增加历史对话列表，点击可快速查看或恢复会话上下文 |
| 流式输出打字机效果优化 | 前端纯实现 | 当前一整段文字直接拼出，可优化为按 token 流式逐字展示 + 光标动画 |
| Token 自动静默刷新 | `POST /api/auth/refresh` | axios 响应拦截器检测 token 即将过期 → 后台静默刷新，用户无感知 |
| 登录页记住用户名 | localStorage | 下次自动填充用户名输入框 |
| 模型权限友好提示 | 后端返回 `code=403` | 用户选择无权使用的模型（如 gpt-4o）时弹窗提示"升级套餐"，而非红色错误提示 |
| 全局错误边界 | 路由级错误处理 | 某些页面报错时展示"出错了"友好页面，而不是整个页面白屏 |

---

### 💼 P2 - 商业化 & 高级功能（面向未来扩展）

| 需求 | 说明 |
|------|------|
| 套餐/充值页面 | 展示套餐列表、当前套餐到期时间、调用次数余额 |
| API Key 管理页 | 开发者生成/吊销 API Key，类似 OpenAI 的做法 |
| 文件上传 + 知识库增强（RAG） | 用户上传 PDF/Word/TXT → 建立向量索引 → 对话时基于文件内容回答 |
| 移动端适配 | 当前布局是桌面端，需响应式优化（侧边栏收起、按钮适配等） |
| 主题切换 | 深色模式 / 浅色模式切换 |
| 操作日志查询（管理后台） | 管理员查看系统操作记录 |

---

### 🛡 P3 - 系统增强（运维 / 安全相关）

| 需求 | 说明 |
|------|------|
| 异地登录告警 | 前端弹窗提示"检测到新设备登录，是否为你本人操作" |
| 二次验证（2FA） | 高敏感操作（如注销账号、改密码）需要短信/邮箱验证码二次确认 |
| 前端性能监控埋点 | 接入前端监控（如 Sentry），追踪页面加载耗时、API 响应耗时 |

---

### 🐢 关于请求响应慢的可能原因 & 优化方向（性能排查指南）

| 层级 | 可能原因 | 排查方式 | 优化建议 |
|------|---------|---------|---------|
| **网关层** | 每个请求都查 Redis 黑名单 + 查数据库获取权限点 | 查看网关日志，看两个操作各耗时多久 | Redis 中缓存"用户ID→权限点列表"，有效期 10 分钟 |
| **模型调用** | 外部大模型 API 本身响应慢（尤其是流式输出） | 查看 chat-service 调用第三方 API 的耗时日志 | 这是正常现象，前端配合 loading 动画优化体验即可 |
| **服务间调用** | 网关路由到下游服务的网络开销 | 查看 Spring Cloud Gateway 路由耗时 | 本地开发可忽略，生产同 VPC 部署 |
| **数据库** | chat_history 写入操作每次对话都会执行 | 查看 MySQL 慢查询日志 | 改为异步写入（消息队列），或批量定时落库 |
| **SSE 连接** | EventSource 首次建立连接需要握手 | 浏览器 Network 面板查看 Time to First Byte | 可在用户进入页面时就预建一次连接 |

---

## 📜 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（Vite） |
| `npm run build` | 类型检查 + 生产构建 → dist/ |
| `npm run preview` | 本地预览生产构建结果 |

---

## 📌 部署架构图

```
          浏览器
             │ HTTPS (443/8080)
             ▼
        ┌──────────┐
        │  Nginx   │ ← nginx.conf
        │  (反向代理 + 静态服务)
        └─┬──┬──┬─┘
          │  │  │
     ┌────┘  │  └────┐
     ▼       ▼       ▼
┌────────┐ ┌────────┐ ┌────────┐
│ 认证服务│ │ 对话服务│ │ 文件服务│
│ (8081)  │ │ (8082)  │ │ (8083)  │
└────────┘ └────────┘ └────────┘
```

---

## ✨ 最佳实践

1. **配置外部化**：API 地址通过 `.env` 注入，区分开发/生产
2. **类型安全**：所有后端 DTO 在 `src/types/api.ts` 统一维护
3. **组件化**：页面放在 `views/`，通用组件放 `components/`
4. **路由守卫**：集中管理页面访问权限
5. **错误处理**：Axios 拦截器统一处理，避免页面内散落 try/catch
6. **静态资源缓存**：Nginx `expires 1y` 大幅提升加载速度

---

## 🧭 Nacos 服务注册与配置中心

本项目后端微服务（认证 / 对话 / 文件）统一使用 **Nacos** 进行服务注册与配置管理。

### 版本信息

| 项目 | 内容 |
|------|------|
| Nacos 版本 | **3.2.2** |
| 运行模式 | standalone（单机模式） |
| 安装路径 | `/Users/wangjun/nacos/` |
| 配置文件 | `/Users/wangjun/nacos/conf/application.properties` |
| 日志目录 | `/Users/wangjun/nacos/logs/` |

### 端口说明

| 端口 | 用途 | 访问路径 |
|------|------|----------|
| **8080** | 新版 Nacos Console 控制台（Web UI） | http://localhost:8080/ → `/next/` |
| 8848 | 传统 API / 旧版控制台（v2.x 兼容） | http://localhost:8848/nacos |
| 9848 | gRPC 客户端通信端口（客户端长连接） | — |
| 9849 | gRPC 服务端通信端口（集群同步） | — |
| 7848 | 集群内部通信（Raft 协议） | — |

> ⚠️ **Nacos 3.x 变化要点**：
> - 新版控制台默认端口从 **8848** 改为 **8080**，访问路径从 `/nacos` 改为根路径 `/`（自动跳转到 `/next/`）
> - Console UI 已使用 React 完全重构
> - 首次启动必须在 `application.properties` 中配置 `nacos.core.auth.plugin.nacos.token.secret.key`（32 位以上字符串做 Base64 编码）

### 控制台登录

- **地址**：http://localhost:8080/
- **默认账号**：`nacos`
- **默认密码**：`nacos`

### 常用命令

```bash
# 进入 Nacos 脚本目录
cd /Users/wangjun/nacos/bin

# ✅ 启动（单机模式，开发环境推荐）
sh startup.sh -m standalone

# ✅ 启动（集群模式，生产环境使用）
sh startup.sh

# ❌ 停止
sh shutdown.sh

# 🔄 重启
sh shutdown.sh && sleep 3 && sh startup.sh -m standalone

# 📄 实时查看启动日志
tail -f /Users/wangjun/nacos/logs/start.out

# 🔍 查看详细运行日志
tail -f /Users/wangjun/nacos/logs/nacos.log

# 📊 查看 GC 日志
tail -f /Users/wangjun/nacos/logs/nacos_gc.log

# 🔎 检查 Nacos 进程
ps aux | grep nacos | grep -v grep

# 🔌 检查端口监听
lsof -i :8080      # 新版控制台
lsof -i :8848      # API 端口
lsof -i :9848      # gRPC 端口
```

### 健康检查

```bash
# 检查 Nacos 运行状态
curl -s http://localhost:8848/nacos/v1/console/health/liveness
# 预期返回：{"status":"UP"}
```

### 首次启动配置（必填）

Nacos 3.x 强制要求配置 JWT 密钥，否则无法启动。编辑 `conf/application.properties`，添加：

```properties
# JWT Token 密钥（32 位以上字符串做 Base64 编码，示例）

密钥由 echo -n "wangjun-nacos-custom-secret-key-2026-06-11" | base64 生成

nacos.core.auth.plugin.nacos.token.secret.key=d2FuZ2p1bi1uYWNvcy1jdXN0b20tc2VjcmV0LWtleS0yMDI2LTA2LTEx

# 服务端身份识别（可选但推荐）
nacos.core.auth.server.identity.key=serverIdentity
nacos.core.auth.server.identity.value=security

# 启用鉴权（生产环境务必设为 true）
nacos.core.auth.enabled=true
```

> 🔑 **生成自定义密钥**：
> ```bash
> echo -n "你自定义的字符串（长度≥32）" | base64
> ```

---

## 📝 License

MIT License