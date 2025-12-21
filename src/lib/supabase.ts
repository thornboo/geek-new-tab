/**
 * Supabase 客户端管理 - 懒加载实现
 * 仅在配置启用时才加载 SDK 并创建实例
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { loadSettingsFromStorage } from '@/lib/storage'

// 类型定义
interface SupabaseConfig {
  url: string
  key: string
}

// 全局状态
let supabaseClient: SupabaseClient | null = null
let supabaseInitPromise: Promise<SupabaseClient> | null = null

/**
 * 读取 Supabase 配置
 */
const readSupabaseConfig = (): SupabaseConfig | null => {
  const settings = loadSettingsFromStorage()
  const supabaseSettings = settings?.supabase
  if (supabaseSettings?.enabled && supabaseSettings?.url && supabaseSettings?.key) {
    return { url: supabaseSettings.url, key: supabaseSettings.key }
  }
  return null
}

/**
 * 检查是否已配置 Supabase
 * @returns 是否存在有效配置
 */
export const isConfigured = (): boolean => !!readSupabaseConfig()

/**
 * 获取 Supabase 客户端（懒加载）
 * 仅在已配置时才会加载 SDK 并创建实例
 * @returns Supabase 客户端实例或 null
 */
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

/**
 * 动态创建 Supabase 客户端（用于测试连接）
 * @param url - Supabase 项目 URL
 * @param key - Supabase 匿名密钥
 * @returns Supabase 客户端实例
 */
export const createSupabaseClient = async (
  url: string,
  key: string
): Promise<SupabaseClient> => {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(url, key)
}
