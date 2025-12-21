/**
 * 网站数据状态管理
 * 负责响应式状态、初始化和数据加载
 */

import { ref } from 'vue'
import { isConfigured } from '@/lib/supabase'
import { loadSitesFromSupabase, type GroupedSites } from '@/lib/supabaseSync'
import { categories } from '@/data/sites'

// 全局状态
const customSites = ref<GroupedSites>({})
const loading = ref(false)
const initialized = ref(false)
let initPromise: Promise<void> | null = null

/**
 * 从 Supabase 加载自定义网站数据
 */
async function loadCustomSites(): Promise<void> {
  if (initialized.value) return
  if (!isConfigured()) {
    initialized.value = true
    return
  }

  loading.value = true
  try {
    const data = await loadSitesFromSupabase()
    customSites.value = data
    initialized.value = true
  } catch (e) {
    console.error('Failed to load custom sites:', e)
  } finally {
    loading.value = false
  }
}

/**
 * 确保数据已初始化
 */
function ensureInitialized(): Promise<void> {
  if (initialized.value) return Promise.resolve()
  if (!initPromise) {
    initPromise = loadCustomSites().finally(() => {
      initPromise = null
    })
  }
  return initPromise
}

/**
 * 网站数据管理 composable
 */
export function useSiteData() {
  // 自动初始化
  void ensureInitialized()

  /**
   * 获取指定分类的所有网站（默认 + 自定义）
   */
  const getSitesByCategory = (categoryKey: string) => {
    const category = categories.find((c) => c.key === categoryKey)
    const defaultSites = category?.sites || []
    const custom = customSites.value[categoryKey] || []
    return [...defaultSites, ...custom]
  }

  /**
   * 刷新数据
   */
  const refresh = async (): Promise<void> => {
    initialized.value = false
    await ensureInitialized()
  }

  /**
   * 检查是否配置了云同步
   */
  const hasCloudSync = (): boolean => isConfigured()

  return {
    // 状态
    customSites,
    loading,

    // 方法
    getSitesByCategory,
    refresh,
    hasCloudSync,
    ensureInitialized
  }
}
