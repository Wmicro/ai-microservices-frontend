---
alwaysApply: true
description: Git 提交规范 — 分支策略、Commit Message 格式、VS Code 操作指南
---

# Git 提交规范（VS Code 优化版）

> 💡 所有操作推荐在 VS Code **源代码管理面板**（左侧第三个图标 / `Ctrl+Shift+G`）中完成，配合 GitLens、Conventional Commits 扩展使用体验最佳。

---

## 一、推荐 VS Code 扩展 🔌

| 扩展 | 用途 | 安装命令（终端） |
|------|------|-----------------|
| **GitLens** | 行级作者信息、文件历史、分支对比、可视化 blame | `code --install-extension eamodio.gitlens` |
| **Conventional Commits** | 交互式生成符合本规范的 commit message | `code --install-extension vivaxy.vscode-conventional-commits` |
| **Git Graph** | 图形化分支/提交历史，支持拖拽合并 | `code --install-extension mhutchie.git-graph` |
| **GitHub Pull Requests** | 在 VS Code 内浏览、评审、合并 PR | `code --install-extension GitHub.vscode-pull-request-github` |

在 VS Code 源代码管理面板右上角，点击 "..." → 扩展推荐里也可一键安装。

---

## 二、Commit Message 格式 ⚠️

```
<type>(<scope>): <subject>
          │            │
          │            └─ 中文简述，不超过 50 字符（VS Code 输入框会有黄色警告）
          └─ 模块/页面/组件名，如 chat / auth / file / deploy

<body>
└─ 详细说明，每行 72 字符内；可省略（简单改动不需要 body）

<footer>
└─ Closes #123 / Fixes #456（关联 GitHub Issue/PR，会自动关闭）
    BREAKING CHANGE: xxx（破坏性变更，极少数情况使用）
```

**推荐示例**（直接复制到 VS Code 提交消息框即可）：

```
feat(chat): 流式对话支持多轮上下文

- 新增 event:session 事件监听，获取并保存 sessionId
- 下一次请求自动携带 sessionId，实现对话记忆
- 清空对话时同步重置 sessionId

Closes #12
```

**一行简短提交**（小改动，如修复拼写、更新文档）：

```
fix(auth): 修复登录按钮加载状态不消失
docs(readme): 补充部署命令说明
chore(deps): 升级 vue 至 3.5.x
```

> 💡 VS Code 小贴士：提交消息输入框支持 `Ctrl+Enter` 直接提交；第一行超 50 字符会有垂直参考线提醒。

---

## 三、Type 类型速查表 ⚠️

| Type | 图标 | 说明 | 示例 |
|------|------|------|------|
| `feat` | ✨ | 新功能 / 新页面 / 新接口 | `feat(chat): 新增模型切换下拉框` |
| `fix` | 🐛 | Bug 修复 | `fix(login): 登录成功后路由不跳转` |
| `docs` | 📝 | 文档 / README / 注释更新 | `docs: 补充流式对话 API 说明` |
| `style` | 💄 | 代码格式、CSS 样式（**不**影响逻辑） | `style: 统一使用 2 空格缩进` |
| `refactor` | ♻️ | 代码重构（不新增功能、不修 bug） | `refactor(api): 抽取 axios 拦截器` |
| `perf` | ⚡ | 性能优化 | `perf(chat): 消息列表虚拟滚动` |
| `test` | ✅ | 测试新增/修改 | `test: 补充登录表单单元测试` |
| `build` | 📦 | 构建系统或外部依赖变更 | `build: 升级 vite 到 6.x` |
| `ci` | 👷 | CI/CD 配置变更 | `ci: 添加 GitHub Actions 自动部署` |
| `chore` | 🔧 | 构建/工具/依赖/配置变更 | `chore(deps): 升级 vue 至 3.5.x` |
| `revert` | ⏪ | 回退之前的提交 | `revert: 回退 feat(chat) 多轮上下文` |

> 💡 在 VS Code Conventional Commits 扩展中，提交时会弹出类型选择列表，直接选择即可。

---

## 四、Scope 常用取值

| Scope | 对应模块 |
|-------|---------|
| `chat` | 对话相关（Chat.vue、useChatStream、chat.ts） |
| `auth` | 登录/注册/权限 |
| `file` | 文件上传/下载 |
| `router` | 路由 |
| `store` | Pinia 状态管理 |
| `api` | API 封装 |
| `deploy` | Nginx/Docker 部署配置 |
| `readme` | README 文档 |
| `*` 或省略 | 跨多个模块或通用改动 |

---

## 五、硬性规则 ⚠️

| 规则 | 说明 |
|------|------|
| **每次提交只做一件事** | 一个功能 / 一个 bug，不要在一个 commit 里改 10 个文件 |
| **提交前必须通过编译** | VS Code 底部状态栏无红色 ✕；`npm run build && npm test` 无报错 |
| **不提交构建产物** | `node_modules/`、`dist/`、`*.log`、`.DS_Store`、`.env` 必须在 `.gitignore` |
| **禁止提交敏感信息** | 密码、Token、API Key、私钥 —— 提交了请立即清理并重写历史 |
| **禁止 `git push -f` main** | 只允许在个人 feature 分支上强推 |
| **feat/fix 建议关联 Issue** | GitHub Issue 号放在 footer：`Closes #12`，合并 PR 时会自动关闭 |

---

## 六、VS Code 中的提交流程 👆

### 方式 A：源代码管理面板（推荐）

1. 打开左侧 **源代码管理**（`Ctrl+Shift+G` / `Cmd+Shift+G`）
2. 在 **更改** 列表中，**点击文件右侧的 `+`** → 暂存该文件（相当于 `git add`）
   - 或者右键目录 → "暂存所有更改"
3. 顶部输入框填写 commit message（**严格遵守 `<type>(<scope>): <subject>` 格式**）
4. 点击 **✓ 提交** 按钮（或 `Ctrl+Enter`）
5. 点击 **↓↑ 同步变更**（相当于 `git pull` + `git push`）

### 方式 B：Conventional Commits 扩展（更规范）

1. 安装 vivaxy.vscode-conventional-commits 扩展
2. 在源代码管理面板，点击输入框左侧的 **📋 Conventional Commits** 图标
3. 依次选择：**type → scope → subject → body → footer**
4. 自动生成规范消息后直接提交

### 方式 C：GitLens 增强

- 右键任意代码行 → **GitLens: Open File in Remote** → 直接在 GitHub 查看
- **GitLens: Compare Branches** → 分支对比
- 代码行右侧淡灰色文字即为 **该行的最近一次提交信息**（作者 + 时间 + message）

---

## 七、分支策略 🌿

| 分支 | 用途 | 操作方式 |
|------|------|---------|
| `main` | 生产发布，**只接受 PR 合并** | ❌ 禁止直接 push |
| `develop` | 开发集成分支 | 多人协作时使用 |
| `feature/xxx` | 功能开发（从 develop 或 main 拉） | `feature/chat-stream` |
| `hotfix/xxx` | 紧急修复（从 main 拉） | `hotfix/login-404` |
| `release/x.y.z` | 发布准备 | `release/1.0.0` |

**分支命名**：全小写 + 连字符（kebab-case），例如 `feature/multi-turn-chat`。

**在 VS Code 中切换/新建分支**：点击左下角分支名（如 `main`）→ 弹出框选择或输入新分支名。

---

## 八、.gitignore（前端项目）

```gitignore
# 依赖与构建
node_modules/
dist/
dist-ssr/
*.local
coverage/

# 日志
logs/
*.log
npm-debug.log*
yarn-debug.log*

# 编辑器
.vscode/*
!.vscode/extensions.json
.idea/
*.iml

# 系统
.DS_Store
Thumbs.db

# 敏感配置
.env
.env.*.local
*.key
```

---

## 九、提交消息不合格？快速修改

```bash
# 修改最后一次提交的消息（尚未 push）
git commit --amend -m "fix(auth): 登录后路由不跳转"

# 撤销最后一次提交（改动回到工作区，可重新提交）
git reset --soft HEAD~1
```

在 VS Code 源代码管理面板 → "..." → **提交** → **修改上一次提交** 也可以操作。

---

## 十、日常工作流速查

| 场景 | VS Code 操作 |
|------|-------------|
| 拉取最新代码 | 左下角 ↓↑ 同步按钮 / `git pull` |
| 新建分支 | 左下角点击分支名 → "创建新分支..." |
| 暂存文件 | 源代码管理面板文件右侧 `+` |
| 提交 | 输入消息 → `Ctrl+Enter` |
| 运行测试 | `npm test`（一次性）/ `npm run test:watch`（持续） |
| 推送 | 同步按钮 / 源代码管理面板右上角 ↑ |
| 查看历史 | GitLens 图标 / `git log` / Git Graph 扩展 |
| 对比差异 | 源代码管理面板点击文件名（左右分屏显示） |