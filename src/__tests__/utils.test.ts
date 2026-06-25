// 工具函数测试 — 覆盖 chatUtils.ts 和 utils/date.ts
import { describe, it, expect } from 'vitest'
import { generateMessageId, formatMessageTime, extractAnswer, extractSessionId, extractChunk } from '@/composables/chatUtils'
import { formatDate } from '@/utils/date'

describe('chatUtils', () => {
  describe('generateMessageId', () => {
    it('应该生成非空字符串', () => {
      const id = generateMessageId()
      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
    })

    it('两次生成的 ID 应该不同', () => {
      const id1 = generateMessageId()
      const id2 = generateMessageId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('formatMessageTime', () => {
    it('应该返回 HH:mm 格式', () => {
      const time = formatMessageTime()
      expect(time).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('extractAnswer', () => {
    it('应该从字符串中提取', () => {
      expect(extractAnswer('hello')).toBe('hello')
    })

    it('应该从 ChatResult 中提取 answer', () => {
      expect(extractAnswer({ answer: 'hi', sessionId: 'abc' })).toBe('hi')
    })

    it('空字符串返回默认值', () => {
      expect(extractAnswer('')).toBe('(未收到回答)')
    })
  })

  describe('extractSessionId', () => {
    it('字符串返回 undefined', () => {
      expect(extractSessionId('hello')).toBeUndefined()
    })

    it('ChatResult 返回 sessionId', () => {
      expect(extractSessionId({ answer: 'hi', sessionId: 'abc123' })).toBe('abc123')
    })
  })

  describe('extractChunk', () => {
    it('字符串原样返回', () => {
      expect(extractChunk('hello')).toBe('hello')
    })

    it('空字符串返回空字符串', () => {
      expect(extractChunk('')).toBe('')
    })
  })
})

describe('formatDate', () => {
  it('null 返回 -', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('undefined 返回 -', () => {
    expect(formatDate(undefined)).toBe('-')
  })

  it('ISO 日期格式化', () => {
    expect(formatDate('2024-01-15T10:30:00')).toBe('2024-01-15 10:30:00')
  })
})