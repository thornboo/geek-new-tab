/**
 * Supabase 客户端管理 - 懒加载实现
 * 通过环境变量配置，避免运行时注入
 */

import type { SupabaseClient } from '@supabase/supabase-js'

interface SupabaseConfig {
  url: string
  key: string
}

let supabaseClient: SupabaseClient | null = null
let supabaseInitPromise: Promise<SupabaseClient> | null = null

const readSupabaseConfig = (): SupabaseConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (url && key) {
    return { url, key }
  }
  return null
}

export const isConfigured = (): boolean => !!readSupabaseConfig()

export const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
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
