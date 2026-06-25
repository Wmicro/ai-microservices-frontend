/** 格式化 ISO 日期字符串为 "YYYY-MM-DD HH:mm:ss" */
export function formatDate(date?: string | null): string {
  if (!date) return '-'
  return date.replace('T', ' ').split('.')[0]
}