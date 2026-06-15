// 文件管理服务 API（对应后端 ai-file-service：/api/files/*）
import axios from '@/utils/axios'
import type { FileInfo } from '@/types/file'

/** 上传单个文件 */
export function uploadFile(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post<FormData, FileInfo>('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent: any) => {
      if (onProgress && progressEvent.total) {
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
      }
    }
  })
}

/** 批量上传文件 */
export function uploadMultipleFiles(files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return axios.post<FormData, FileInfo[]>('/api/files/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** 获取文件列表 */
export function listFiles() {
  return axios.get<null, FileInfo[]>('/api/files')
}

/** 获取文件内容（文本预览） */
export function getFileContent(fileId: string) {
  return axios.get<null, string>(`/api/files/${fileId}/content`)
}

/** 删除文件 */
export function deleteFile(fileId: string) {
  return axios.delete(`/api/files/${fileId}`)
}