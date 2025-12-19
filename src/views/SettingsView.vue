<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettings } from '@/composables/useSettings'
import { createSupabaseClient } from '@/lib/supabase'

const { settings, updateSupabaseConfig, clearSupabaseConfig, setTheme, setLayout } = useSettings()

// 当前选中的 tab
const activeTab = ref('sync')

// Supabase 配置表单
const supabaseUrl = ref(settings.value.supabase.url)
const supabaseKey = ref(settings.value.supabase.key)
const testStatus = ref('')
const testMessage = ref('')

// 测试连接
const testConnection = async () => {
  if (!supabaseUrl.value || !supabaseKey.value) {
    testStatus.value = 'error'
    testMessage.value = '请填写完整配置'
    return
  }

  testStatus.value = 'testing'
  testMessage.value = '测试中...'

  try {
    const client = await createSupabaseClient(supabaseUrl.value, supabaseKey.value)
    const { error } = await client.from('sites').select('id').limit(1)

    if (error) {
      testStatus.value = 'error'
      testMessage.value = error.message
    } else {
      testStatus.value = 'success'
      testMessage.value = '连接成功'
    }
  } catch (e) {
    testStatus.value = 'error'
    testMessage.value = e.message || '连接失败'
  }
}

// 保存配置
const saveConfig = () => {
  updateSupabaseConfig(supabaseUrl.value, supabaseKey.value)
  window.location.reload()
}

// 清除配置
const clearConfig = () => {
  supabaseUrl.value = ''
  supabaseKey.value = ''
  clearSupabaseConfig()
  testStatus.value = ''
  testMessage.value = ''
}
</script>

<template>
  <div class="content-wrapper max-w-[800px] mx-auto">
    <div class="mb-8 border-b border-gray-800 pb-4">
      <h1 class="text-2xl font-semibold text-white tracking-tight mb-1">Settings</h1>
      <p class="text-sm text-gray-500">Manage your preferences and configurations.</p>
    </div>

    <!-- Tab 导航 -->
    <div class="tabs flex border-b border-gray-800 mb-6 gap-6">
      <button
        v-for="tab in ['sync', 'appearance']"
        :key="tab"
        class="tab py-3 text-sm transition-all border-b-2 bg-transparent"
        :class="activeTab === tab
          ? 'text-matrix border-matrix'
          : 'text-gray-400 border-transparent hover:text-white'"
        @click="activeTab = tab"
      >
        {{ tab === 'sync' ? 'Sync' : 'Appearance' }}
      </button>
    </div>

    <!-- 数据同步 -->
    <div v-if="activeTab === 'sync'" class="space-y-4">
      <p class="text-sm text-gray-500">Configure Supabase for cloud synchronization.</p>

      <div>
        <label class="block text-sm text-gray-400 mb-2">Supabase URL</label>
        <input
          v-model="supabaseUrl"
          type="text"
          placeholder="https://xxx.supabase.co"
          class="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:border-matrix transition-colors font-mono text-sm"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-2">Publishable Key</label>
        <input
          v-model="supabaseKey"
          type="text"
          placeholder="sb_publishable_xxx"
          class="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:border-matrix transition-colors font-mono text-sm"
        />
      </div>

      <!-- 测试状态 -->
      <div v-if="testMessage" class="flex items-center gap-2 text-sm">
        <Icon
          v-if="testStatus === 'testing'"
          icon="mdi:loading"
          class="w-4 h-4 text-gray-400 animate-spin"
        />
        <Icon
          v-else-if="testStatus === 'success'"
          icon="mdi:check-circle"
          class="w-4 h-4 text-matrix"
        />
        <Icon
          v-else-if="testStatus === 'error'"
          icon="mdi:alert-circle"
          class="w-4 h-4 text-red-400"
        />
        <span :class="testStatus === 'success' ? 'text-matrix' : testStatus === 'error' ? 'text-red-400' : 'text-gray-400'">
          {{ testMessage }}
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 pt-2">
        <button class="btn-secondary" @click="testConnection">Test Connection</button>
        <button
          class="px-4 py-2 text-sm text-gray-400 bg-transparent hover:text-red-400 border border-gray-700 hover:border-red-900 rounded transition-colors"
          @click="clearConfig"
        >
          Clear Config
        </button>
        <button class="btn-primary ml-auto" @click="saveConfig">Save Changes</button>
      </div>
    </div>

    <!-- 外观 -->
    <div v-if="activeTab === 'appearance'" class="space-y-6">
      <div>
        <label class="block text-sm text-gray-400 mb-3">Theme</label>
        <div class="flex gap-3">
          <button
            v-for="theme in ['dark', 'light', 'system']"
            :key="theme"
            class="flex-1 py-2 text-sm rounded border transition-all capitalize"
            :class="settings.appearance.theme === theme
              ? 'bg-matrix/10 border-matrix text-matrix'
              : 'border-gray-700 bg-black text-gray-400 hover:text-white hover:border-gray-500'"
            @click="setTheme(theme)"
          >
            {{ theme }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-3">Layout</label>
        <div class="flex gap-3">
          <button
            v-for="layout in ['grid', 'list']"
            :key="layout"
            class="flex-1 py-2 text-sm rounded border transition-all flex-center gap-2 capitalize"
            :class="settings.appearance.layout === layout
              ? 'bg-matrix/10 border-matrix text-matrix'
              : 'border-gray-700 bg-black text-gray-400 hover:text-white hover:border-gray-500'"
            @click="setLayout(layout)"
          >
            <Icon :icon="layout === 'grid' ? 'mdi:view-grid' : 'mdi:view-list'" class="w-4 h-4" />
            {{ layout }}
          </button>
        </div>
      </div>

      <p class="text-xs text-gray-600">* Light theme & List view are WIP.</p>
    </div>
  </div>
</template>
