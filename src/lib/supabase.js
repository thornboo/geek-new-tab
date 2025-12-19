import { loadSettingsFromStorage } from '@/lib/settingsStorage'

let supabaseClient = null
let supabaseInitPromise = null

const readSupabaseConfig = () => {
  const settings = loadSettingsFromStorage()
  const supabaseSettings = settings?.supabase
  if (supabaseSettings?.enabled && supabaseSettings?.url && supabaseSettings?.key) {
    return { url: supabaseSettings.url, key: supabaseSettings.key }
  }
  return null
}

// 检查是否已配置（仅判断配置是否存在，不强制加载 SDK）
export const isConfigured = () => !!readSupabaseConfig()

// 获取（懒加载）Supabase 客户端：仅在已配置时才会加载 SDK 并创建实例
export const getSupabaseClient = async () => {
  const config = readSupabaseConfig()
  if (!config) {
    supabaseClient = null
    supabaseInitPromise = null
    return null
  }

  if (supabaseClient) return supabaseClient

  if (!supabaseInitPromise) {
    supabaseInitPromise = (async () => {
      const { createClient } = await import('@supabase/supabase-js')
      return createClient(config.url, config.key)
    })()
      .then((client) => {
        supabaseClient = client
        return client
      })
      .catch((e) => {
        supabaseInitPromise = null
        throw e
      })
  }

  return supabaseInitPromise
}

// 动态创建客户端（用于测试连接）
export const createSupabaseClient = async (url, key) => {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(url, key)
}
