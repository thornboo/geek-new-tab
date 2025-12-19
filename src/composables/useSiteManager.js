import { ref } from 'vue'
import { categories } from '@/data/sites'
import { getSupabaseClient, isConfigured } from '@/lib/supabase'

// 用户自定义网站数据（按分类存储）
const customSites = ref({})
const loading = ref(false)
const initialized = ref(false)
let initPromise = null

/**
 * 从 Supabase 加载自定义网站
 */
const loadCustomSites = async () => {
  if (initialized.value) return
  if (!isConfigured()) {
    initialized.value = true
    return
  }

  loading.value = true
  try {
    const client = await getSupabaseClient()
    if (!client) {
      initialized.value = true
      return
    }

    const { data, error } = await client
      .from('sites')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to load sites:', error)
      return
    }

    // 按分类组织数据
    const grouped = {}
    data?.forEach(site => {
      if (!grouped[site.category]) {
        grouped[site.category] = []
      }
      grouped[site.category].push({
        id: site.id,
        name: site.name,
        url: site.url,
        desc: site.description,
        icon: site.icon,
        isCustom: true
      })
    })
    customSites.value = grouped
    initialized.value = true
  } catch (e) {
    console.error('Failed to load sites:', e)
  } finally {
    loading.value = false
  }
}

const ensureInitialized = () => {
  if (initialized.value) return Promise.resolve()
  if (!initPromise) {
    initPromise = loadCustomSites().finally(() => {
      initPromise = null
    })
  }
  return initPromise
}

/**
 * 网站管理 composable
 */
export function useSiteManager() {
  void ensureInitialized()

  /**
   * 获取指定分类的所有网站（默认 + 自定义）
   */
  const getSitesByCategory = (categoryKey) => {
    const category = categories.find(c => c.key === categoryKey)
    const defaultSites = category?.sites || []
    const custom = customSites.value[categoryKey] || []
    return [...defaultSites, ...custom]
  }

  /**
   * 添加自定义网站
   */
  const addSite = async (categoryKey, site) => {
    if (!isConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const client = await getSupabaseClient()
      if (!client) return null

      const { data, error } = await client
        .from('sites')
        .insert({
          category: categoryKey,
          name: site.name,
          url: site.url,
          description: site.desc || '',
          icon: site.icon || null
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to add site:', error)
        return null
      }

      // 更新本地状态
      if (!customSites.value[categoryKey]) {
        customSites.value[categoryKey] = []
      }
      const newSite = {
        id: data.id,
        name: data.name,
        url: data.url,
        desc: data.description,
        icon: data.icon,
        isCustom: true
      }
      customSites.value[categoryKey].push(newSite)
      return newSite
    } catch (e) {
      console.error('Failed to add site:', e)
      return null
    }
  }

  /**
   * 更新自定义网站
   */
  const updateSite = async (categoryKey, siteId, updates) => {
    if (!isConfigured()) {
      console.warn('Supabase not configured')
      return false
    }

    try {
      const client = await getSupabaseClient()
      if (!client) return false

      const { error } = await client
        .from('sites')
        .update({
          name: updates.name,
          url: updates.url,
          description: updates.desc || ''
        })
        .eq('id', siteId)

      if (error) {
        console.error('Failed to update site:', error)
        return false
      }

      // 更新本地状态
      const sites = customSites.value[categoryKey]
      if (sites) {
        const index = sites.findIndex(s => s.id === siteId)
        if (index !== -1) {
          customSites.value[categoryKey][index] = {
            ...sites[index],
            name: updates.name,
            url: updates.url,
            desc: updates.desc
          }
        }
      }
      return true
    } catch (e) {
      console.error('Failed to update site:', e)
      return false
    }
  }

  /**
   * 删除自定义网站
   */
  const deleteSite = async (categoryKey, siteId) => {
    if (!isConfigured()) {
      console.warn('Supabase not configured')
      return false
    }

    try {
      const client = await getSupabaseClient()
      if (!client) return false

      const { error } = await client
        .from('sites')
        .delete()
        .eq('id', siteId)

      if (error) {
        console.error('Failed to delete site:', error)
        return false
      }

      // 更新本地状态
      const sites = customSites.value[categoryKey]
      if (sites) {
        const index = sites.findIndex(s => s.id === siteId)
        if (index !== -1) {
          customSites.value[categoryKey].splice(index, 1)
        }
      }
      return true
    } catch (e) {
      console.error('Failed to delete site:', e)
      return false
    }
  }

  /**
   * 检查网站是否为自定义网站
   */
  const isCustomSite = (site) => {
    return site?.isCustom === true
  }

  /**
   * 刷新数据
   */
  const refresh = async () => {
    initialized.value = false
    await ensureInitialized()
  }

  /**
   * 检查是否已配置云同步
   */
  const hasCloudSync = () => isConfigured()

  /**
   * 导出所有自定义数据
   */
  const exportData = async () => {
    await ensureInitialized()
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      customSites: customSites.value
    }
  }

  /**
   * 导入数据
   */
  const importData = async (data) => {
    if (!data || !data.customSites) {
      throw new Error('无效的数据格式')
    }

    if (!isConfigured()) {
      throw new Error('请先配置 Supabase 以启用云同步')
    }

    const client = await getSupabaseClient()
    if (!client) {
      throw new Error('请先配置 Supabase 以启用云同步')
    }

    // 逐个添加导入的网站
    for (const [categoryKey, sites] of Object.entries(data.customSites)) {
      for (const site of sites) {
        await client
          .from('sites')
          .insert({
            category: categoryKey,
            name: site.name,
            url: site.url,
            description: site.desc || '',
            icon: site.icon || null
          })
      }
    }

    // 刷新本地数据
    await refresh()
  }

  /**
   * 清除所有自定义网站
   */
  const clearAllCustomSites = async () => {
    if (!isConfigured()) {
      customSites.value = {}
      return
    }

    try {
      const client = await getSupabaseClient()
      if (!client) {
        customSites.value = {}
        return
      }

      const { error } = await client
        .from('sites')
        .delete()
        .neq('id', 0) // 删除所有记录

      if (error) {
        console.error('Failed to clear sites:', error)
        return
      }

      customSites.value = {}
    } catch (e) {
      console.error('Failed to clear sites:', e)
    }
  }

  return {
    customSites,
    loading,
    getSitesByCategory,
    addSite,
    updateSite,
    deleteSite,
    isCustomSite,
    refresh,
    hasCloudSync,
    exportData,
    importData,
    clearAllCustomSites
  }
}
