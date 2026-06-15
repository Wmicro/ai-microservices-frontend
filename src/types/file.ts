// 文件领域类型定义（与后端 ai-file-service 对应）

/** 文件信息（上传结果 / 文件列表项 */
export interface FileInfo {
  fileId?: string
  id?: string
  fileName?: string
  originalFileName?: string
  fileSize?: number
  fileType?: string
  uploadTime?: string
  createTime?: string
  success?: boolean
  message?: string
  size?: number
  type?: string
  [key: string]: any
}