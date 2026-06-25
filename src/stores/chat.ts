// 多对话管理 Store —— 基于后端 ai-chat-service 的会话管理接口
// 数据从后端同步，不再完全依赖 localStorage
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as chatApi from '@/api/chat'
import type { Conversation, ChatMessage, ChatSession, ChatHistory } from '@/types/chat'

/** 生成前端消息唯一 ID（Date.now + 随机） */
function genMsgId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

/** 生成当前时间字符串（用于前端显示） */
function nowISO(): string {
  return new Date().toISOString()
}

/** 从后端 ChatSession 转换为前端 Conversation */
function sessionToConversation(sess: ChatSession, mode: 'normal' | 'stream' = 'stream'): Conversation {
  return {
    id: sess.id,
    title: sess.title || '新对话',
    model: sess.model || 'qwen-turbo',
    sessionId: sess.id,
    mode,
    messages: [],
    createTime: sess.createTime || nowISO(),
    updateTime: sess.updateTime || nowISO()
  }
}

/** 从后端 ChatHistory 转换为前端 ChatMessage（每一条历史拆成 user + assistant 两条消息） */
function historiesToMessages(histories: ChatHistory[]): ChatMessage[] {
  return (Array.isArray(histories) ? histories : []).flatMap(h => [
    {
      id: genMsgId(),
      role: 'user',
      content: h.question,
      time: h.createTime || nowISO(),
      model: h.model
    },
    {
      id: genMsgId(),
      role: 'assistant',
      content: h.answer,
      time: h.createTime || nowISO(),
      model: h.model
    }
  ])
}

export const useChatStore = defineStore('chat', () => {
  // ============ 状态 ============
  /** 会话列表（从后端同步） */
  const conversations = ref<Conversation[]>([])
  /** 当前选中的会话 ID */
  const currentId = ref<string | null>(null)
  /** 正在流式输出中的会话 ID（用于停止按钮判断） */
  const streamingId = ref<string | null>(null)
  /** 正在请求普通对话的会话 ID */
  const loadingId = ref<string | null>(null)
  /** 是否正在加载（列表加载 / 历史查询等） */
  const isFetching = ref(false)

  // ============ 派生属性 ============

  /** 当前活跃会话 */
  const current = computed<Conversation | null>(() => {
    if (!currentId.value) return null
    return conversations.value.find((c) => c.id === currentId.value) || null
  })

  /** 当前会话的消息列表 */
  const messages = computed<ChatMessage[]>(() => current.value?.messages || [])

  /** 按最后更新时间倒序的会话列表 */
  const sortedConversations = computed(() => {
    return [...conversations.value].sort(
      (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    )
  })

  /** 当前会话是否处理中（流式或普通请求） */
  const isProcessingCurrent = computed(() => {
    if (!currentId.value) return false
    return streamingId.value === currentId.value || loadingId.value === currentId.value
  })

  /** 当前会话的模式（用于 UI 绑定） */
  const currentMode = computed<'normal' | 'stream'>(() => {
    return current.value?.mode || 'stream'
  })

  // ============ 方法：会话 CRUD（调用后端接口） ============

  /** 从后端加载会话列表（带重试机制） */
  async function fetchSessions(retry = 2): Promise<Conversation[]> {
    isFetching.value = true
    try {
      const sessions = await chatApi.listSessions()
      const list = (Array.isArray(sessions) ? sessions : []).map((s) => sessionToConversation(s))
      conversations.value = list
      return list
    } catch (e) {
      if (retry > 0) {
        console.warn(`[chat-store] 加载会话失败，重试 ${2 - retry + 1}/2`, e)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 延迟1秒重试
        return fetchSessions(retry - 1)
      }
      console.error('[chat-store] 加载会话失败（已重试2次）:', e)
      return []
    } finally {
      isFetching.value = false
    }
  }

  /** 创建新会话 —— 调用后端 POST /api/chat/session，并切换为当前会话 */
  async function createConversation(
    mode: 'normal' | 'stream' = 'stream',
    model?: string,
    title?: string
  ): Promise<Conversation> {
    const created = await chatApi.createSession(title, model)
    const conv = sessionToConversation(created, mode)
    // 插入到列表最前面
    conversations.value.unshift(conv)
    currentId.value = conv.id
    return conv
  }

  /**
   * 确保当前有一个会话可用：
   * - 如果已经有选中会话，直接返回
   * - 如果有会话列表但未选中，选中第一个
   * - 如果完全为空，自动创建一个默认会话
   */
  async function ensureCurrent(
    mode: 'normal' | 'stream' = 'stream',
    model?: string,
    title?: string
  ): Promise<Conversation> {
    // 有选中的会话，直接返回
    if (currentId.value) {
      const existing = conversations.value.find((c) => c.id === currentId.value)
      if (existing) return existing
    }
    // 有会话但未选中，选中第一个
    if (conversations.value.length > 0) {
      const first = conversations.value[0]
      currentId.value = first.id
      if (first.messages.length === 0) {
        try {
          const histories = await chatApi.getChatHistory(first.id)
          first.messages = historiesToMessages(histories)
        } catch (e) {
          console.warn('[chat-store] 懒加载会话历史失败:', first.id, e)
        }
      }
      return first
    }
    // 完全没有会话，自动创建
    return createConversation(mode, model, title)
  }

  /** 切换到指定会话（若还未加载历史，则懒加载） */
  async function selectConversation(id: string): Promise<Conversation | null> {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) {
      console.warn('[chat-store] 切换会话失败：会话不存在', id)
      return null
    }
    
    currentId.value = id

    // 懒加载：如果该会话还没加载过消息，则从后端拉取对话历史
    if (conv.messages.length === 0) {
      try {
        const histories = await chatApi.getChatHistory(id)
        conv.messages = historiesToMessages(histories)
      } catch (e) {
        // 历史加载失败不影响切换
        console.warn('[chat-store] 加载会话历史失败:', id, e)
      }
    }
    return conv
  }

  /** 删除指定会话 —— 调用后端 DELETE /api/chat/session/{id} */
  async function deleteConversation(id: string): Promise<boolean> {
    try {
      await chatApi.deleteSession(id)
      const idx = conversations.value.findIndex((c) => c.id === id)
      if (idx >= 0) {
        conversations.value.splice(idx, 1)
      }
      // 如果删除的是当前会话，切换到最近的一个
      if (currentId.value === id) {
        currentId.value = sortedConversations.value[0]?.id || null
      }
      return true
    } catch (e) {
      console.error('[chat-store] 删除会话失败:', id, e)
      return false
    }
  }

  /**
   * 判断错误是否表示「会话不存在」
   * 同时兼容：错误消息中文匹配、HTTP 404、后端返回的状态码
   */
  function isSessionNotFound(e: any): boolean {
    if (!e) return false
    const msg = String(e.message || e.msg || e.data || '')
    if (/会话不存在|session.*not.*found|not.*found|404/i.test(msg)) return true
    const status = e.status || e.statusCode || e.response?.status
    return status === 404
  }

  /** 更新当前会话的标题（调用后端 PATCH /api/chat/session/{id}）
   *
   * 当后端返回"会话不存在"时，会尝试重新创建一个同标题的会话替换原会话
   */
  async function renameConversation(id: string, newTitle: string): Promise<boolean> {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) {
      console.warn('[chat-store] renameConversation: 本地会话不存在:', id)
      // 本地没有会话，创建一个新的
      try {
        await createConversation(undefined, undefined, newTitle)
        return true
      } catch (e2) {
        console.error('[chat-store] renameConversation: 创建新会话失败', e2)
        return false
      }
    }

    try {
      await chatApi.updateSessionTitle(id, newTitle)
      conv.title = newTitle
      conv.updateTime = nowISO()
      return true
    } catch (e: any) {
      console.error('[chat-store] 更新会话标题失败:', id, e?.message)

      // 如果会话在后端不存在，尝试重新创建
      if (isSessionNotFound(e)) {
        console.warn('[chat-store] 会话在后端不存在，尝试重新创建:', id)
        try {
          const created = await chatApi.createSession(newTitle, conv.model)
          const newConv = sessionToConversation(created, conv.mode || 'stream')
          // 替换原有的无效会话位置，保持列表顺序
          const index = conversations.value.findIndex((c) => c.id === id)
          if (index >= 0) {
            conversations.value.splice(index, 1, newConv)
          } else {
            conversations.value.unshift(newConv)
          }
          if (currentId.value === id) {
            currentId.value = newConv.id
          }
          return true
        } catch (createErr: any) {
          console.error('[chat-store] 重新创建会话失败:', createErr?.message)
          return false
        }
      }
      return false
    }
  }

  /** 切换当前会话的模式（普通/流式）—— 纯前端状态 */
  function switchMode(mode: 'normal' | 'stream') {
    if (!current.value) return
    current.value.mode = mode
  }

  /** 设置当前会话的默认模型 */
  function setModel(model?: string) {
    if (!current.value || !model) return
    current.value.model = model
  }

  // ============ 方法：消息管理（前端内存维护） ============

  /** 在指定会话追加一条消息 */
  function appendMessage(id: string, message: ChatMessage) {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) return
    conv.messages.push(message)
    conv.updateTime = nowISO()
  }

  /** 更新某条消息（如流式消息的 content 持续增长） */
  function updateMessage(convId: string, msgId: string, patch: Partial<ChatMessage>) {
    const conv = conversations.value.find((c) => c.id === convId)
    if (!conv) return
    
    const msg = conv.messages.find((m) => m.id === msgId)
    if (!msg) return
    
    Object.assign(msg, patch)
    conv.updateTime = nowISO()
  }

  /** 清空指定会话的消息（同时调用后端 /api/chat/clear） */
  async function clearMessagesInConversation(id: string): Promise<boolean> {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) return false
    try {
      await chatApi.clearChatHistory(id)
      conv.messages = []
      conv.updateTime = nowISO()
      return true
    } catch (e) {
      console.error('[chat-store] 清空会话消息失败:', id, e)
      return false
    }
  }

  // ============ 方法：状态标记（流式 / 普通请求状态） ============

  const setStreaming = (convId: string | null) => {
    streamingId.value = convId
  }
  const setLoading = (convId: string | null) => {
    loadingId.value = convId
  }
  const isStreaming = (convId: string): boolean => {
    return streamingId.value === convId
  }
  const isLoading = (convId: string): boolean => {
    return loadingId.value === convId
  }

  // ============ 工具方法 ============

  function genMessageId(): string {
    return genMsgId()
  }

  return {
    // 状态
    conversations,
    currentId,
    streamingId,
    loadingId,
    isFetching,
    // 派生
    current,
    messages,
    sortedConversations,
    isProcessingCurrent,
    currentMode,
    // 方法
    fetchSessions,
    createConversation,
    ensureCurrent,
    selectConversation,
    deleteConversation,
    renameConversation,
    switchMode,
    setModel,
    appendMessage,
    updateMessage,
    clearMessagesInConversation,
    setStreaming,
    setLoading,
    isStreaming,
    isLoading,
    genMessageId
  }
})