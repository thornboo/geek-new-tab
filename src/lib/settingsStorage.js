export const SETTINGS_KEY = 'geek-nav-settings'

// 默认设置
export const defaultSettings = {
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

const cloneDefaultSettings = () => ({
  ...defaultSettings,
  supabase: { ...defaultSettings.supabase },
  appearance: { ...defaultSettings.appearance }
})

const safeParseJson = (value) => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch (e) {
    console.error('Failed to parse settings:', e)
    return null
  }
}

// 从 localStorage 加载设置（按已知结构进行浅层+嵌套合并）
export const loadSettingsFromStorage = () => {
  if (typeof window === 'undefined') return cloneDefaultSettings()

  try {
    const stored = safeParseJson(localStorage.getItem(SETTINGS_KEY))
    if (!stored) return cloneDefaultSettings()

    return {
      ...defaultSettings,
      ...stored,
      supabase: { ...defaultSettings.supabase, ...stored.supabase },
      appearance: { ...defaultSettings.appearance, ...stored.appearance }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
    return cloneDefaultSettings()
  }
}

export const saveSettingsToStorage = (settings) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}
