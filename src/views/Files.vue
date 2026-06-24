<template>
  <div class="files-page">
    <div class="upload-section">
      <el-upload
        drag
        :auto-upload="false"
        :multiple="true"
        :show-file-list="true"
        :file-list="fileList"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        accept=".txt,.md,.pdf,.doc,.docx,.json,.csv,.xlsx,.xls"
      >
        <el-icon class="el-icon--upload" :size="48">
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持 txt, md, pdf, doc, docx, json, csv, xlsx, xls 等格式，单文件不超过 50MB
          </div>
        </template>
      </el-upload>

      <div v-if="pendingFiles.length > 0" class="upload-actions">
        <el-button type="primary" :loading="uploading" @click="handleUpload">
          <el-icon><Upload /></el-icon>
          <span>上传 {{ pendingFiles.length }} 个文件</span>
        </el-button>
        <el-button @click="clearPending">清空列表</el-button>
      </div>
    </div>

    <div class="files-list-section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Document /></el-icon>
          <span>我的文件</span>
          <span class="count-badge">{{ fileRecords.length }}</span>
        </h3>
        <el-button @click="loadFiles" :loading="loading" :icon="Refresh">刷新</el-button>
      </div>

      <el-empty v-if="!loading && fileRecords.length === 0" description="暂无文件，请先上传" />

      <el-table v-else :data="fileRecords" style="width: 100%" stripe v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="文件名" min-width="240">
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-icon :size="18"><Document /></el-icon>
              <span>{{ row.name || '未命名' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="120">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTag(row.type)">{{ row.type || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.success !== false" type="success" size="small">已解析</el-tag>
            <el-tag v-else type="danger" size="small">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewContent(row)">查看</el-button>
            <el-popconfirm title="确定删除这个文件吗？" @confirm="deleteFile(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="contentDialogVisible" title="文件内容预览" width="700px">
      <div class="content-preview">{{ currentContent || '(空)' }}</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Upload, Document, Refresh } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import * as fileApi from '@/api/file'
import type { FileInfo } from '@/types/file'
import { formatDate } from '@/utils/date'

const fileList = ref<UploadFile[]>([])
const pendingFiles = ref<File[]>([])
const fileRecords = ref<FileInfo[]>([])
const uploading = ref(false)
const loading = ref(false)
const contentDialogVisible = ref(false)
const currentContent = ref('')

function handleFileChange(uploadFile: UploadFile) {
  if (uploadFile.raw) {
    pendingFiles.value.push(uploadFile.raw)
  }
}

function handleFileRemove(uploadFile: UploadFile) {
  const idx = pendingFiles.value.findIndex((f) => f.name === uploadFile.name)
  if (idx >= 0) pendingFiles.value.splice(idx, 1)
}

function clearPending() {
  fileList.value = []
  pendingFiles.value = []
}

async function handleUpload() {
  if (pendingFiles.value.length === 0) return
  uploading.value = true
  try {
    if (pendingFiles.value.length === 1) {
      const result = await fileApi.uploadFile(pendingFiles.value[0])
      fileRecords.value.unshift(result)
    } else {
      const results = await fileApi.uploadMultipleFiles(pendingFiles.value)
      fileRecords.value = [...results, ...fileRecords.value]
    }
    ElMessage.success('文件上传成功')
    clearPending()
  } catch (err) {
    console.error(err)
  } finally {
    uploading.value = false
  }
}

async function loadFiles() {
  loading.value = true
  try {
    const files = await fileApi.listFiles()
    fileRecords.value = files
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function viewContent(row: FileInfo) {
  if (!row.id) {
    ElMessage.info('该文件暂无内容可预览')
    return
  }
  try {
    const content = await fileApi.getFileContent(row.id)
    currentContent.value = content as string
    contentDialogVisible.value = true
  } catch (err) {
    console.error(err)
  }
}

async function deleteFile(row: FileInfo) {
  if (!row.id) return
  try {
    await fileApi.deleteFile(row.id)
    const idx = fileRecords.value.findIndex((r) => r.id === row.id)
    if (idx >= 0) fileRecords.value.splice(idx, 1)
    ElMessage.success('删除成功')
  } catch (err) {
    console.error(err)
  }
}

function formatSize(size?: number) {
  if (!size) return '未知'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function getTypeTag(type?: string) {
  if (!type) return 'info'
  const t = type.toLowerCase()
  if (t.includes('pdf')) return 'danger'
  if (t.includes('doc')) return 'primary'
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) return 'warning'
  if (t.includes('text') || t.includes('json') || t.includes('csv')) return 'success'
  return 'info'
}

onMounted(() => {
  loadFiles()
})
</script>

<style scoped>
.files-page {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.upload-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.files-list-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}
.count-badge {
  background: #eff6ff;
  color: #409eff;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 12px;
}
.upload-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}
.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
}
.content-preview {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
  color: #374151;
}
:deep(.el-upload-dragger) {
  padding: 36px 0 !important;
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .files-page {
    gap: 12px;
    padding: 4px;
  }
  .upload-section,
  .files-list-section {
    padding: 14px;
    border-radius: 10px;
  }
  .section-header {
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .section-title {
    font-size: 15px;
  }
  :deep(.el-upload-dragger) {
    padding: 24px 12px !important;
  }
  :deep(.el-upload__text) {
    font-size: 14px;
  }
  :deep(.el-upload__tip) {
    font-size: 12px;
  }
  .upload-actions {
    gap: 8px;
    flex-wrap: wrap;
  }
  .upload-actions :deep(.el-button) {
    flex: 1;
    min-width: 0;
  }
  /* 表格横向滚动 */
  :deep(.el-table) {
    font-size: 13px;
  }
  :deep(.el-table .cell) {
    padding: 10px 8px;
  }
  .content-preview {
    padding: 12px;
    font-size: 12px;
    max-height: 60vh;
  }
}
</style>