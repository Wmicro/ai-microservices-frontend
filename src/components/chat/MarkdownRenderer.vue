<template>
  <div class="markdown-body" v-html="htmlContent"></div>
  <span v-if="streaming" class="streaming-cursor" aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{
  content: string
  streaming?: boolean
}>()

/**
 * 流式 Markdown 渲染优化：
 * 1. 逐行扫描，正确跟踪代码块 fence 状态（避免 ` ```python ` 等带语言标签的 fence 被错误计数）
 * 2. 发现未闭合的代码块，在末尾补 fence
 * 3. 确保 marked 正确解析 fenced code block + 语言标签
 */
function renderStreamingMarkdown(raw: string, isStreaming: boolean): string {
  if (!raw) return ''

  // —— 阶段 A：逐行跟踪 fence，检测是否在未闭合的代码块中 ——
  const lines = raw.split('\n')
  let inFence = false
  let fenceIndent = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fenceMatch = line.match(/^(\s*)```(.*)$/)
    if (fenceMatch) {
      const indent = fenceMatch[1].length
      if (!inFence) {
        inFence = true
        fenceIndent = indent
      } else if (indent >= fenceIndent || indent === 0) {
        const closeContent = fenceMatch[2].trim()
        if (closeContent === '') inFence = false
      }
    }
  }

  let text = raw

  if (inFence && isStreaming) {
    // 流式接收中，当前代码块还未闭合 → 在末尾补关闭 fence
    // 只在独立新行上补 fence，避免附加在已有内容后
    if (!text.endsWith('\n')) text += '\n'
    text += '```'
  }

  // —— 阶段 B：表格流式处理 ——
  if (isStreaming) {
    const lineList = text.split('\n')
    const inTable = lineList.some(l => /^\s*\|.*\|\s*$/.test(l)) && lineList.some(l => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(l))
    if (inTable) {
      const lastLine = lineList[lineList.length - 1]
      if (!/^\s*\|.*\|\s*$/.test(lastLine) && lastLine.trim() !== '') {
        text = lineList.slice(0, -1).join('\n')
      }
    }
  }

  // —— 阶段 C：解析 HTML ——
  const renderer = new marked.Renderer()
  renderer.code = ({ text, lang }) => {
    const language = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${language}>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>\n`
  }
  const parsed = marked.parse(text, {
    gfm: true,
    breaks: true,
    renderer
  }) as string

  // —— 阶段 D：清理 + 增强 ——
  let html = DOMPurify.sanitize(parsed, {
    ADD_ATTR: ['target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'style', 'iframe']
  })

  // 给所有外链加 target="_blank" + rel
  html = html.replace(/<a\s+href="(https?:\/\/[^"]+)"([^>]*)>/gi, (_m, url, rest) => {
    if (/target=/.test(rest)) return _m
    return `<a href="${url}"${rest} target="_blank" rel="noopener noreferrer nofollow">`
  })

  return html
}

const htmlContent = computed(() => renderStreamingMarkdown(props.content, props.streaming || false))
</script>

<style>
/* =======================================================
   Markdown Body — 仿豆包（Doubao）风格
   ======================================================= */
.markdown-body {
  color: #1f2937;
  font-size: 15px;
  line-height: 1.8;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-body p {
  margin: 0.6em 0;
}

/* ===== 标题 ===== */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 1.4em 0 0.6em;
  font-weight: 700;
  line-height: 1.35;
  color: #111827;
  letter-spacing: -0.01em;
}
.markdown-body h1 {
  font-size: 1.6em;
  padding-bottom: 0.4em;
  border-bottom: 2px solid #eef2ff;
}
.markdown-body h2 {
  font-size: 1.35em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #f1f5f9;
}
.markdown-body h3 {
  font-size: 1.15em;
}
.markdown-body h4 {
  font-size: 1.05em;
}

/* ===== 引用块 ===== */
.markdown-body blockquote {
  margin: 0.8em 0;
  padding: 0.7em 1.1em;
  color: #4b5563;
  background: #f9fafb;
  border-left: 4px solid #4f6ef7;
  border-radius: 0 8px 8px 0;
  font-size: 14.5px;
}
.markdown-body blockquote p {
  margin: 0.3em 0;
}

/* ===== 行内代码 — 注意：必须放在 .markdown-body pre code 之前，让 pre code 覆盖它 ===== */
.markdown-body :not(pre) > code {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.88em;
  background: #f3f4f6;
  color: #e11d48;
  padding: 2px 6px;
  border-radius: 4px;
  word-break: normal;
}

/* ===== 代码块 — 深色主题 + 圆角（关键：必须比行内 code 更具体） ===== */
.markdown-body pre {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  padding: 16px 18px;
  border-radius: 12px;
  margin: 0.9em 0;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
  font-family: 'SF Mono', 'Fira Code', ui-monospace, Menlo, Consolas, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.markdown-body pre code {
  display: block;
  background: transparent !important;
  color: #e2e8f0 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* ===== 列表 ===== */
.markdown-body ul,
.markdown-body ol {
  margin: 0.6em 0;
  padding-left: 1.6em;
}
.markdown-body li {
  margin: 0.3em 0;
  line-height: 1.7;
}
.markdown-body ul li::marker {
  color: #4f6ef7;
}
.markdown-body ol li::marker {
  color: #4f6ef7;
  font-weight: 600;
}
.markdown-body li > ul,
.markdown-body li > ol {
  margin: 0.3em 0;
}

/* 任务列表 */
.markdown-body input[type='checkbox'] {
  margin-right: 6px;
  transform: translateY(1px);
}

/* ===== 表格 ===== */
.markdown-body table {
  border-collapse: collapse;
  margin: 0.9em 0;
  width: 100%;
  font-size: 14.5px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #e5e7eb;
}
.markdown-body table thead {
  background: #f8fafc;
}
.markdown-body table th,
.markdown-body table td {
  padding: 10px 14px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  vertical-align: top;
}
.markdown-body table th {
  font-weight: 600;
  color: #334155;
}
.markdown-body table tbody tr:last-child td {
  border-bottom: none;
}
.markdown-body table tbody tr:hover {
  background: #fafbfd;
}

/* ===== 链接 ===== */
.markdown-body a {
  color: #4f6ef7;
  text-decoration: none;
  border-bottom: 1px solid rgba(79, 110, 247, 0.25);
  transition: border-color 0.15s;
}
.markdown-body a:hover {
  border-bottom-color: #4f6ef7;
}

/* ===== 分割线 ===== */
.markdown-body hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.4em 0;
}

/* ===== 强调 ===== */
.markdown-body strong {
  color: #111827;
  font-weight: 700;
}
.markdown-body em {
  color: #6b7280;
  font-style: italic;
}
.markdown-body del {
  color: #9ca3af;
  text-decoration: line-through;
}

/* ===== 图片 ===== */
.markdown-body img {
  max-width: 100%;
  border-radius: 10px;
  display: block;
  margin: 0.8em auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 首段 margin-top 调整 */
.markdown-body > *:first-child {
  margin-top: 0;
}

/* ===== 流式输出闪烁光标 ===== */
.markdown-body + .streaming-cursor,
.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 2px;
  background: #4f6ef7;
  vertical-align: -3px;
  border-radius: 1px;
  animation: streaming-blink 1s infinite;
}
@keyframes streaming-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>