import { ref, watch } from 'vue'
import { loadSettingsFromStorage, saveSettingsToStorage } from '@/lib/settingsStorage'

// 全局设置状态
const settings = ref(loadSettingsFromStorage())

// 监听变化自动保存
watch(settings, (newSettings) => {
  saveSettingsToStorage(newSettings)
}, { deep: true })

/**
 * 设置管理 composable
 */
export function useSettings() {
  // 更新 Supabase 配置
  const updateSupabaseConfig = (url, key) => {
    settings.value.supabase.url = url
    settings.value.supabase.key = key
    settings.value.supabase.enabled = !!(url && key)
  }

  // 清除 Supabase 配置
  const clearSupabaseConfig = () => {
    settings.value.supabase.url = ''
    settings.value.supabase.key = ''
    settings.value.supabase.enabled = false
  }

  // 更新主题
  const setTheme = (theme) => {
    settings.value.appearance.theme = theme
  }

  // 更新布局
  const setLayout = (layout) => {
    settings.value.appearance.layout = layout
  }

  // 检查是否配置了 Supabase
  const hasSupabaseConfig = () => {
    return settings.value.supabase.enabled &&
           settings.value.supabase.url &&
           settings.value.supabase.key
  }

  // 获取 Supabase 配置
  const getSupabaseConfig = () => {
    return {
      url: settings.value.supabase.url,
      key: settings.value.supabase.key
    }
  }

  return {
    settings,
    updateSupabaseConfig,
    clearSupabaseConfig,
    setTheme,
    setLayout,
    hasSupabaseConfig,
    getSupabaseConfig
  }
}
