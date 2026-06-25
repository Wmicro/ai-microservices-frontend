// 通知事件总线测试
import { describe, it, expect, vi } from 'vitest'
import { notify, setNotifier, resetNotifier } from '@/utils/notify'

describe('notify', () => {
  it('should call default success', () => {
    const mock = vi.fn()
    setNotifier({ success: mock })
    notify.success('test')
    expect(mock).toHaveBeenCalledWith('test')
    resetNotifier()
  })

  it('should call default error', () => {
    const mock = vi.fn()
    setNotifier({ error: mock })
    notify.error('test err')
    expect(mock).toHaveBeenCalledWith('test err')
    resetNotifier()
  })
})