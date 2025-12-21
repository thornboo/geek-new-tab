/**
 * 网站管理 - 主入口
 * 整合数据管理和 Supabase 同步功能
 */

import { isConfigured } from '@/lib/supabase'
import { useSiteData } from '@/composables/useSiteData'
import {
  addSiteToSupabase,
  updateSiteInSupabase,
  deleteSiteFromSupabase,
  batchImportToSupabase,
  clearAllSitesInSupabase,
  type Site,
  type GroupedSites
} from '@/lib/supabaseSync'

/**
 * 网站管理 composable
 * 提供完整的网站 CRUD 和数据管理功能
 */
export function useSiteManager() {
  const { customSites, loading, getSitesByCategory, refresh, hasCloudSync, ensureInitialized } =
    useSiteData()

  /**
   * 添加自定义网站
   */
  const addSite = async (categoryKey: string, site: Site): Promise<Site | null> => {
    if (!isConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const newSite = await addSiteToSupabase(categoryKey, site)
      if (!newSite) return null

      // 更新本地状态
      if (!customSites.value[categoryKey]) {
        customSites.value[categoryKey] = []
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
  const updateSite = async (
    categoryKey: string,
    siteId: number,
    updates: Partial<Site>
  ): Promise<boolean> => {
    if (!isConfigured()) {
      console.warn('Supabase not configured')
      return false
    }

    try {
      await updateSiteInSupabase(siteId, updates)

      // 更新本地状态
      const sites = customSites.value[categoryKey]
      if (sites) {
        const index = sites.findIndex((s) => s.id === siteId)
        if (index !== -1) {
          customSites.value[categoryKey][index] = {
            ...sites[index],
            name: updates.name ?? sites[index].name,
            url: updates.url ?? sites[index].url,
            desc: updates.desc ?? sites[index].desc
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
  const deleteSite = async (categoryKey: string, siteId: number): Promise<boolean> => {
    if (!isConfigured()) {
      console.warn('Supabase not configured')
      return false
    }

    try {
      await deleteSiteFromSupabase(siteId)

      // 更新本地状态
      const sites = customSites.value[categoryKey]
      if (sites) {
        const index = sites.findIndex((s) => s.id === siteId)
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
  const isCustomSite = (site: Site): boolean => {
    return site?.isCustom === true
  }

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
  const importData = async (data: { customSites: GroupedSites }): Promise<void> => {
    if (!data || !data.customSites) {
      throw new Error('无效的数据格式')
    }

    if (!isConfigured()) {
      throw new Error('请先配置 Supabase 以启用云同步')
    }

    await batchImportToSupabase(data.customSites)

    // 刷新本地数据
    await refresh()
  }

  /**
   * 清除所有自定义网站
   */
  const clearAllCustomSites = async (): Promise<void> => {
    if (!isConfigured()) {
      customSites.value = {}
      return
    }

    try {
      await clearAllSitesInSupabase()
      customSites.value = {}
    } catch (e) {
      console.error('Failed to clear all sites:', e)
    }
  }

  return {
    // 状态
    customSites,
    loading,

    // 查询
    getSitesByCategory,
    isCustomSite,
    hasCloudSync,

    // CRUD
    addSite,
    updateSite,
    deleteSite,

    // 批量操作
    exportData,
    importData,
    clearAllCustomSites,

    // 数据刷新
    refresh
  }
}
