---
alwaysApply: true
---
# Git 提交规范

## 一、Commit Message 格式 ⚠️

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**：
```
feat(chat): 新增多轮对话上下文管理

支持自动加载最近 N 轮历史消息，token 超限时自动截断。

Closes #42
```

---

## 二、Type 类型 ⚠️

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响逻辑：空格、缩进等） |
| `refactor` | 重构（不新增功能、不修 bug） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖变更 |
| `revert` | 回退提交 |

---

## 三、规则

| 规则 | 等级 |
|------|------|
| 每次提交只做一件事（一个功能点/一个 bug） | ⚠️ |
| 提交前必须通过本地编译 + 单元测试 | ⚠️ |
| 不提交 `target/`、`.idea/`、`*.log` 等构建产物 | ⚠️ |
| `feat` / `fix` 必须与 TAPD/Jira 任务关联（`Closes #id`） | ✅ |
| 禁止 `git push -f` 到 main/master 分支 | ⚠️ |
| 禁止提交敏感信息（密码、Token、私钥） | ⚠️ |

---

## 四、分支策略

| 分支 | 用途 |
|------|------|
| `main` | 生产发布，只接受 PR 合并 |
| `develop` | 开发集成分支 |
| `feature/xxx` | 功能开发（从 develop 拉） |
| `hotfix/xxx` | 紧急修复（从 main 拉） |
| `release/x.y.z` | 发布准备 |

- ⚠️ 禁止直接在 `main` 上开发
- ✅ 分支命名全小写 + 连字符

---

## 五、.gitignore 必备项

```gitignore
target/
*.class
*.log
.idea/
*.iml
.DS_Store
application-local.yaml
*.env
*.key
```