// 文件领域类型定义（与后端 ai-file-service 对应）

/** 文件信息（上传结果 / 文件列表项）— 统一字段命名，避免冗余 */
export interface FileInfo {
  id: string                // 文件唯一标识
  name: string              // 文件名
  size?: number           // 文件大小（字节）
  type?: string           // 文件类型（扩展名或 MIME）
  createTime?: string        // 上传/创建时间（ISO 格式）
  success?: boolean          // 操作是否成功（上传结果专用）
  message?: string        // 成功/失败消息（上传结果专用）
}