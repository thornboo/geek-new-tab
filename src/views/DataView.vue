<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useSiteManager } from '@/composables/useSiteManager'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const { exportData, importData, clearAllCustomSites } = useSiteManager()

const importStatus = ref('')
const importMessage = ref('')
const showClearModal = ref(false)

// 导出数据
const handleExport = async () => {
  const data = await exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `geektab-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导入数据
const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importData(data)
      importStatus.value = 'success'
      importMessage.value = '导入成功，页面将刷新'
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      importStatus.value = 'error'
      importMessage.value = err.message || '导入失败，请检查文件格式'
    }
  }
  input.click()
}

// 清除所有自定义数据
const handleClear = async () => {
  await clearAllCustomSites()
  showClearModal.value = false
  window.location.reload()
}
</script>

<template>
  <div class="content-wrapper max-w-[800px] mx-auto">
    <div class="mb-8 border-b border-gray-800 pb-4">
      <h1 class="text-2xl font-semibold text-white tracking-tight mb-1">Data Management</h1>
      <p class="text-sm text-gray-500">Export, import, or reset your data.</p>
    </div>

    <div class="space-y-6">
      <!-- 导出数据 -->
      <div class="card-base p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded border border-gray-700 bg-black flex-center shrink-0">
            <Icon icon="mdi:download" class="w-5 h-5 text-matrix" />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-medium text-white mb-1">Export Data</h3>
            <p class="text-sm text-gray-500 mb-4">
              Download all your custom sites as a JSON file.
            </p>
            <button class="btn-secondary" @click="handleExport">
              <Icon icon="mdi:download" class="w-4 h-4 mr-2" />
              Export to JSON
            </button>
          </div>
        </div>
      </div>

      <!-- 导入数据 -->
      <div class="card-base p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded border border-gray-700 bg-black flex-center shrink-0">
            <Icon icon="mdi:upload" class="w-5 h-5 text-matrix" />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-medium text-white mb-1">Import Data</h3>
            <p class="text-sm text-gray-500 mb-4">
              Restore your data from a previously exported JSON file.
            </p>
            <button class="btn-secondary" @click="handleImport">
              <Icon icon="mdi:upload" class="w-4 h-4 mr-2" />
              Import from JSON
            </button>
            <!-- 导入状态 -->
            <div v-if="importMessage" class="flex items-center gap-2 text-sm mt-3">
              <Icon
                v-if="importStatus === 'success'"
                icon="mdi:check-circle"
                class="w-4 h-4 text-matrix"
              />
              <Icon
                v-else-if="importStatus === 'error'"
                icon="mdi:alert-circle"
                class="w-4 h-4 text-red-400"
              />
              <span :class="importStatus === 'success' ? 'text-matrix' : 'text-red-400'">
                {{ importMessage }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 清除数据 -->
      <div class="card-base p-5 border-red-900/50">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded border border-red-900/50 bg-red-900/10 flex-center shrink-0">
            <Icon icon="mdi:delete-alert" class="w-5 h-5 text-red-400" />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-medium text-red-400 mb-1">Danger Zone</h3>
            <p class="text-sm text-gray-500 mb-4">
              Remove all custom sites you've added. Default sites will remain. This action cannot be undone.
            </p>
            <button
              class="px-4 py-2 text-sm text-red-400 bg-transparent hover:bg-red-900/20 border border-red-900/50 hover:border-red-500 rounded transition-colors flex items-center"
              @click="showClearModal = true"
            >
              <Icon icon="mdi:delete" class="w-4 h-4 mr-2" />
              Clear Custom Data
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认清除弹窗 -->
    <ConfirmModal
      :visible="showClearModal"
      type="danger"
      title="清除所有自定义数据"
      message="此操作将删除所有您添加的自定义网站，且无法恢复。确定要继续吗？"
      confirm-text="确定清除"
      @confirm="handleClear"
      @cancel="showClearModal = false"
    />
  </div>
</template>
