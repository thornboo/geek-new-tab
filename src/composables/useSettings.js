import { ref, watch } from 'vue'

const SETTINGS_KEY = 'geek-nav-settings'

// 默认设置
const defaultSettings = {
  // 数据同步配置
  supabase: {
    url: '',
    key: '',
    enabled: false
  },
  // 外观配置
  appearance: {
    theme: 'dark', // dark, light, system
    layout: 'grid' // grid, list
  }
}

// 从 localStorage 加载设置
const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return { ...defaultSettings }
}

// 全局设置状态
const settings = ref(loadSettings())

// 监听变化自动保存
watch(settings, (newSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
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
