/**
 * 统一的 LocalStorage 管理层
 * 合并了原 utils/storage.js 和 lib/settingsStorage.js 的功能
 */

// ============= 类型定义 =============

export interface SupabaseConfig {
  url: string
  key: string
  enabled: boolean
}

export interface AppearanceConfig {
  theme: 'dark' | 'light' | 'system'
  layout: 'grid' | 'list'
}

export interface AppSettings {
  supabase: SupabaseConfig
  appearance: AppearanceConfig
}

export interface CustomSitesData {
  customSites?: Record<string, any[]>
  preferences?: Record<string, any>
}

// ============= 常量 =============

export const STORAGE_KEYS = {
  DATA: 'geek-nav-data', // 自定义网站数据
  SETTINGS: 'geek-nav-settings' // 应用设置
} as const

// 默认设置
export const DEFAULT_SETTINGS: AppSettings = {
  supabase: {
    url: '',
    key: '',
    enabled: false
  },
  appearance: {
    theme: 'dark',
    layout: 'grid'
  }
}

// ============= 工具函数 =============

/**
 * 安全地解析 JSON
 */
function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch (e) {
    console.warn('Failed to parse JSON:', e)
    return null
  }
}

/**
 * 检查是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * 深拷贝默认设置
 */
function cloneDefaultSettings(): AppSettings {
  return {
    supabase: { ...DEFAULT_SETTINGS.supabase },
    appearance: { ...DEFAULT_SETTINGS.appearance }
  }
}

// ============= 通用存储操作 =============

/**
 * 通用的获取存储数据方法
 */
function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null
  try {
    const data = localStorage.getItem(key)
    return safeParseJson<T>(data)
  } catch (e) {
    console.error(`Failed to get item from storage (${key}):`, e)
    return null
  }
}

/**
 * 通用的保存数据方法
 */
function setItem<T>(key: string, value: T): boolean {
  if (!isBrowser()) return false
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`Failed to save item to storage (${key}):`, e)
    return false
  }
}

/**
 * 通用的删除数据方法
 */
function removeItem(key: string): boolean {
  if (!isBrowser()) return false
  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    console.error(`Failed to remove item from storage (${key}):`, e)
    return false
  }
}

// ============= 自定义网站数据管理 =============

/**
 * 获取所有自定义网站数据
 */
export function getCustomSitesData(): CustomSitesData {
  return getItem<CustomSitesData>(STORAGE_KEYS.DATA) || {}
}

/**
 * 保存自定义网站数据
 */
export function saveCustomSitesData(data: CustomSitesData): boolean {
  return setItem(STORAGE_KEYS.DATA, data)
}

/**
 * 获取自定义网站列表
 */
export function getCustomSites(): Record<string, any[]> {
  const data = getCustomSitesData()
  return data.customSites || {}
}

/**
 * 保存自定义网站列表
 */
export function saveCustomSites(customSites: Record<string, any[]>): boolean {
  const data = getCustomSitesData()
  data.customSites = customSites
  return saveCustomSitesData(data)
}

/**
 * 获取用户偏好设置
 */
export function getPreferences(): Record<string, any> {
  const data = getCustomSitesData()
  return data.preferences || {}
}

/**
 * 保存用户偏好设置
 */
export function savePreferences(preferences: Record<string, any>): boolean {
  const data = getCustomSitesData()
  data.preferences = { ...data.preferences, ...preferences }
  return saveCustomSitesData(data)
}

// ============= 应用设置管理 =============

/**
 * 加载应用设置
 */
export function loadSettings(): AppSettings {
  if (!isBrowser()) return cloneDefaultSettings()

  try {
    const stored = getItem<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS)
    if (!stored) return cloneDefaultSettings()

    // 深度合并，确保所有字段都有默认值
    return {
      supabase: { ...DEFAULT_SETTINGS.supabase, ...stored.supabase },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...stored.appearance }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
    return cloneDefaultSettings()
  }
}

/**
 * 保存应用设置
 */
export function saveSettings(settings: AppSettings): boolean {
  return setItem(STORAGE_KEYS.SETTINGS, settings)
}

/**
 * 更新部分设置
 */
export function updateSettings(partial: Partial<AppSettings>): boolean {
  const current = loadSettings()
  const updated: AppSettings = {
    supabase: { ...current.supabase, ...(partial.supabase || {}) },
    appearance: { ...current.appearance, ...(partial.appearance || {}) }
  }
  return saveSettings(updated)
}

/**
 * 清除应用设置
 */
export function clearSettings(): boolean {
  return removeItem(STORAGE_KEYS.SETTINGS)
}

// ============= 数据清理 =============

/**
 * 清除所有存储数据
 */
export function clearAllData(): boolean {
  const dataCleared = removeItem(STORAGE_KEYS.DATA)
  const settingsCleared = removeItem(STORAGE_KEYS.SETTINGS)
  return dataCleared && settingsCleared
}

/**
 * 清除自定义网站数据
 */
export function clearCustomSites(): boolean {
  return saveCustomSitesData({})
}

// ============= 导出兼容性别名（用于渐进式迁移）=============

// 兼容原 settingsStorage.js
export const loadSettingsFromStorage = loadSettings
export const saveSettingsToStorage = saveSettings
export const defaultSettings = DEFAULT_SETTINGS
export const SETTINGS_KEY = STORAGE_KEYS.SETTINGS

// 兼容原 storage.js
export const getStorageData = getCustomSitesData
export const setStorageData = saveCustomSitesData
