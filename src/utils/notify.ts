// 通知事件总线 — 解耦 ElMessage 直接依赖，方便测试时 mock
import { ElMessage } from 'element-plus'

type NotifyFn = (message: string) => void

export interface Notifier {
  success: NotifyFn
  error: NotifyFn
  warning: NotifyFn
  info: NotifyFn
}

/** 默认通知器（基于 Element Plus ElMessage） */
export const defaultNotifier: Notifier = {
  success: (msg) => ElMessage.success(msg),
  error: (msg) => ElMessage.error(msg),
  warning: (msg) => ElMessage.warning(msg),
  info: (msg) => ElMessage.info(msg)
}

let currentNotifier: Notifier = defaultNotifier

/** 允许注入自定义通知器（如测试时的 mock） */
export function setNotifier(notifier: Partial<Notifier>) {
  currentNotifier = { ...currentNotifier, ...notifier }
}

/** 重置为默认通知器 */
export function resetNotifier() {
  currentNotifier = defaultNotifier
}

export const notify: Notifier = {
  success: (msg) => currentNotifier.success(msg),
  error: (msg) => currentNotifier.error(msg),
  warning: (msg) => currentNotifier.warning(msg),
  info: (msg) => currentNotifier.info(msg)
}