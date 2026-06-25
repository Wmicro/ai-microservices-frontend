// chat-store 关键逻辑的单元测试
// - ensureCurrent: 自动创建/选中默认会话
// - renameConversation: 移除 UUID 校验 + 会话不存在时自动重建
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '@/stores/chat'
import * as chatApi from '@/api/chat'

// mock 掉整个 chat-api 模块
vi.mock('@/api/chat', () => ({
  listSessions: vi.fn(),
  createSession: vi.fn(),
  getChatHistory: vi.fn(),
  updateSessionTitle: vi.fn(),
  deleteSession: vi.fn(),
  clearChatHistory: vi.fn()
}))

const now = '2026-06-19T10:00:00.000Z'
function fakeSession(id: string, title = '新对话', model = 'qwen-turbo') {
  return { id, userId: 1, title, model, createTime: now, updateTime: now }
}

describe('chat-store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('ensureCurrent', () => {
    it('空状态时应自动创建默认会话', async () => {
      const store = useChatStore()
      ;(chatApi.createSession as any).mockResolvedValue(fakeSession('auto-gen-id'))

      const conv = await store.ensureCurrent('stream', undefined, '新对话')

      expect(conv).toBeTruthy()
      expect(conv.id).toBe('auto-gen-id')
      expect(store.conversations.length).toBe(1)
      expect(store.currentId).toBe('auto-gen-id')
      expect(chatApi.createSession).toHaveBeenCalled()
    })

    it('有会话但未选中时，应选中第一个而非新建', async () => {
      const store = useChatStore()
      ;(chatApi.listSessions as any).mockResolvedValue([
        fakeSession('c1', '旧会话', 'qwen-turbo'),
        fakeSession('c2', '另一会话', 'gpt')
      ])
      ;(chatApi.getChatHistory as any).mockResolvedValue([])
      await store.fetchSessions()
      store.currentId = null

      const conv = await store.ensureCurrent('stream')

      expect(conv.id).toBe('c1')
      expect(store.currentId).toBe('c1')
      // 未调用创建新会话
      expect(chatApi.createSession).not.toHaveBeenCalled()
    })

    it('已有选中会话时直接返回该会话', async () => {
      const store = useChatStore()
      ;(chatApi.listSessions as any).mockResolvedValue([fakeSession('c1')])
      ;(chatApi.getChatHistory as any).mockResolvedValue([])
      await store.fetchSessions()
      store.selectConversation('c1')

      const before = store.currentId
      const conv = await store.ensureCurrent('stream')

      expect(conv.id).toBe('c1')
      expect(store.currentId).toBe(before)
      expect(chatApi.createSession).not.toHaveBeenCalled()
    })
  })

  describe('renameConversation', () => {
    it('支持非 UUID 格式的会话 ID（不再强制校验）', async () => {
      const store = useChatStore()
      // 先插入一个非 UUID 的会话
      store.conversations.push({
        id: 'session-123',
        sessionId: 'session-123',
        title: '旧标题',
        model: 'qwen-turbo',
        mode: 'stream',
        messages: [],
        createTime: now,
        updateTime: now
      })
      store.currentId = 'session-123'
      ;(chatApi.updateSessionTitle as any).mockResolvedValue(undefined)

      const ok = await store.renameConversation('session-123', '新标题')

      expect(ok).toBe(true)
      expect(store.conversations[0].title).toBe('新标题')
      expect(chatApi.updateSessionTitle).toHaveBeenCalledWith('session-123', '新标题')
    })

    it('当后端返回会话不存在时，自动创建新会话替换', async () => {
      const store = useChatStore()
      store.conversations.push({
        id: 'orphan-id',
        sessionId: 'orphan-id',
        title: '旧标题',
        model: 'qwen-turbo',
        mode: 'stream',
        messages: [],
        createTime: now,
        updateTime: now
      })
      store.currentId = 'orphan-id'
      // 第一次失败：会话不存在
      ;(chatApi.updateSessionTitle as any).mockRejectedValue(
        new Error('会话不存在')
      )
      // 重建成功
      ;(chatApi.createSession as any).mockResolvedValue(
        fakeSession('recreated-id', '新标题', 'qwen-turbo')
      )

      const ok = await store.renameConversation('orphan-id', '新标题')

      expect(ok).toBe(true)
      expect(chatApi.createSession).toHaveBeenCalled()
      // 旧会话应该被替换
      expect(store.conversations.find((c) => c.id === 'orphan-id')).toBeUndefined()
      // 新会话应该存在
      expect(store.conversations.find((c) => c.id === 'recreated-id')).toBeTruthy()
      expect(store.currentId).toBe('recreated-id')
    })

    it('当更新失败但不是"会话不存在"时，不进行重建，返回 false', async () => {
      const store = useChatStore()
      store.conversations.push({
        id: 'valid-id',
        sessionId: 'valid-id',
        title: '旧标题',
        model: 'qwen-turbo',
        mode: 'stream',
        messages: [],
        createTime: now,
        updateTime: now
      })
      ;(chatApi.updateSessionTitle as any).mockRejectedValue(
        new Error('Network Error')
      )

      const ok = await store.renameConversation('valid-id', '新标题')

      expect(ok).toBe(false)
      expect(chatApi.createSession).not.toHaveBeenCalled()
      expect(store.conversations[0].title).toBe('旧标题') // 标题未被修改
    })
  })
})