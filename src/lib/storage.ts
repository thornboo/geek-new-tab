import { DEFAULT_CONFIG, DEFAULT_DB } from '@/data/defaults'

export const STORAGE_KEYS = {
  DB: 'geek_db_v3',
  CONFIG: 'geek_cfg_v3'
} as const

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const safeParseJson = <T>(value: string | null): T | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch (e) {
    console.warn('数据解析失败:', e)
    return null
  }
}

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export function loadDb(): typeof DEFAULT_DB {
  if (!isBrowser()) return deepClone(DEFAULT_DB)
  const stored = safeParseJson<typeof DEFAULT_DB>(localStorage.getItem(STORAGE_KEYS.DB))
  if (!stored || !Array.isArray(stored.categories)) {
    return deepClone(DEFAULT_DB)
  }
  return stored
}

export function saveDb(db: typeof DEFAULT_DB): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(db))
  } catch (e) {
    console.error('保存数据库失败:', e)
  }
}

export function loadConfig(): typeof DEFAULT_CONFIG {
  if (!isBrowser()) return { ...DEFAULT_CONFIG }
  const stored = safeParseJson<Partial<typeof DEFAULT_CONFIG>>(
    localStorage.getItem(STORAGE_KEYS.CONFIG)
  )
  if (!stored) {
    const next = { ...DEFAULT_CONFIG }
    if (typeof navigator !== 'undefined') {
      next.locale = navigator.language?.startsWith('zh') ? 'zh-CN' : 'en-US'
    }
    return next
  }
  return { ...DEFAULT_CONFIG, ...stored }
}

export function saveConfig(config: typeof DEFAULT_CONFIG): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  } catch (e) {
    console.error('保存配置失败:', e)
  }
}

export function clearStorage(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEYS.DB)
  localStorage.removeItem(STORAGE_KEYS.CONFIG)
}

export const loadSettingsFromStorage = loadConfig
export const saveSettingsToStorage = saveConfig
