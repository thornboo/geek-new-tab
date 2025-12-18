import { createClient } from '@supabase/supabase-js'

const SETTINGS_KEY = 'geek-nav-settings'

// 从 localStorage 获取配置
const getConfig = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      const settings = JSON.parse(stored)
      if (settings.supabase?.enabled && settings.supabase?.url && settings.supabase?.key) {
        return {
          url: settings.supabase.url,
          key: settings.supabase.key
        }
      }
    }
  } catch (e) {
    console.error('Failed to load supabase config:', e)
  }
  return null
}

// 创建 Supabase 客户端
let supabaseClient = null

const config = getConfig()
if (config) {
  supabaseClient = createClient(config.url, config.key)
}

export const supabase = supabaseClient

// 检查是否已配置
export const isConfigured = () => !!supabaseClient

// 动态创建客户端（用于测试连接）
export const createSupabaseClient = (url, key) => {
  return createClient(url, key)
}
