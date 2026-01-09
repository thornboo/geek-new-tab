/**
 * Site Store - 网站数据管理
 * 负责网站的 CRUD 操作和云端同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Site, GroupedSites } from '@/types'
import { isConfigured } from '@/lib/supabase'
import {
  addSiteToSupabase,
  updateSiteInSupabase,
  deleteSiteFromSupabase,
  loadDbFromSupabase,
  seedSupabase,
  clearAllDataInSupabase
} from '@/lib/supabaseSync'
import { useCategoryStore } from './category'

export const useSiteStore = defineStore('site', () => {
  // ========== 状态 ==========

  /**
   * 加载状态
   */
  const loading = ref(false)

  /**
   * 错误信息
   */
  const error = ref<string | null>(null)

  /**
   * 是否已初始化
   */
  const initialized = ref(false)

  // ========== 计算属性 ==========

  /**
   * 获取 Category Store
   */
  const categoryStore = computed(() => useCategoryStore())

  /**
   * 所有网站（按分类分组）
   */
  const allSites = computed<GroupedSites>(() => {
    const grouped: GroupedSites = {}
    categoryStore.value.categories.forEach((category) => {
      grouped[category.key] = category.sites || []
    })
    return grouped
  })

  /**
   * 热门网站（按访问次数排序）
   */
  const topSites = computed<Site[]>(() => {
    const all: Site[] = []
    Object.values(allSites.value).forEach((sites) => all.push(...sites))

    return all
      .filter((s) => (s.visitCount || 0) > 0)
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
      .slice(0, 10)
  })

  /**
   * 最近访问的网站
   */
  const recentSites = computed<Site[]>(() => {
    const all: Site[] = []
    Object.values(allSites.value).forEach((sites) => all.push(...sites))

    return all
      .filter((s) => s.lastVisit)
      .sort((a, b) => {
        const aTime = new Date(a.lastVisit!).getTime()
        const bTime = new Date(b.lastVisit!).getTime()
        return bTime - aTime
      })
      .slice(0, 10)
  })

  // ========== 操作 ==========

  /**
   * 初始化数据（从云端同步）
   */
  async function initialize() {
    if (initialized.value) return

    loading.value = true
    error.value = null

    try {
      // 先初始化 Category Store
      categoryStore.value.initialize()

      // 如果配置了 Supabase，从云端同步
      if (isConfigured()) {
        const remote = await loadDbFromSupabase()
        if (remote?.categories?.length) {
          // 确保每个分类都有 sites 数组
          const categoriesWithSites = remote.categories.map((cat) => ({
            ...cat,
            sites: cat.sites || []
          }))
          categoryStore.value.setCategories(categoriesWithSites)
        } else {
          // 云端为空，上传本地数据
          await seedSupabase({
            categories: categoryStore.value.categories.map((cat) => ({
              ...cat,
              sites: cat.sites || []
            }))
          })
        }
      }

      initialized.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '初始化失败'
      console.error('Failed to initialize:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取指定分类的网站
   */
  function getSitesByCategory(categoryKey: string): Site[] {
    return allSites.value[categoryKey] || []
  }

  /**
   * 添加网站
   */
  async function addSite(categoryKey: string, site: Omit<Site, 'id'>): Promise<Site | null> {
    try {
      const sortOrder = (categoryStore.value.currentSites?.length || 0) + 1
      const newSite: Site = {
        ...site,
        sortOrder
      }

      // 先添加到本地
      categoryStore.value.addSiteToCategory(categoryKey, newSite)

      // 同步到云端
      if (isConfigured()) {
        const saved = await addSiteToSupabase(categoryKey, newSite)
        if (saved?.id) {
          // 更新本地 ID
          const category = categoryStore.value.getCategory(categoryKey)
          if (category?.sites) {
            const index = category.sites.findIndex(
              (s) => s.name === newSite.name && s.url === newSite.url
            )
            if (index !== -1) {
              category.sites[index].id = saved.id
            }
          }
          return saved
        }
      }

      return newSite
    } catch (e) {
      error.value = e instanceof Error ? e.message : '添加网站失败'
      console.error('Failed to add site:', e)
      return null
    }
  }

  /**
   * 更新网站
   */
  async function updateSite(
    categoryKey: string,
    siteIndex: number,
    updates: Partial<Site>
  ): Promise<boolean> {
    try {
      const category = categoryStore.value.getCategory(categoryKey)
      const site = category?.sites?.[siteIndex]
      if (!site) return false

      // 更新本地
      categoryStore.value.updateSiteInCategory(categoryKey, siteIndex, updates)

      // 同步到云端
      if (site.id && isConfigured()) {
        await updateSiteInSupabase(site.id, updates)
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新网站失败'
      console.error('Failed to update site:', e)
      return false
    }
  }

  /**
   * 删除网站
   */
  async function deleteSite(categoryKey: string, siteIndex: number): Promise<boolean> {
    try {
      const category = categoryStore.value.getCategory(categoryKey)
      const site = category?.sites?.[siteIndex]
      if (!site) return false

      // 删除本地
      categoryStore.value.deleteSiteFromCategory(categoryKey, siteIndex)

      // 同步到云端
      if (site.id && isConfigured()) {
        await deleteSiteFromSupabase(site.id)
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除网站失败'
      console.error('Failed to delete site:', e)
      return false
    }
  }

  /**
   * 记录网站访问
   */
  async function trackVisit(categoryKey: string, siteIndex: number): Promise<void> {
    const category = categoryStore.value.getCategory(categoryKey)
    const site = category?.sites?.[siteIndex]
    if (!site) return

    const updates = {
      visitCount: (site.visitCount || 0) + 1,
      lastVisit: new Date().toISOString()
    }

    // 更新本地
    categoryStore.value.updateSiteInCategory(categoryKey, siteIndex, updates)

    // 同步到云端
    if (site.id && isConfigured()) {
      try {
        await updateSiteInSupabase(site.id, updates)
      } catch (e) {
        console.error('Failed to sync visit:', e)
      }
    }
  }

  /**
   * 重新排序网站
   */
  async function reorderSites(
    categoryKey: string,
    fromIndex: number,
    toIndex: number
  ): Promise<void> {
    // 更新本地
    categoryStore.value.reorderSitesInCategory(categoryKey, fromIndex, toIndex)

    // 同步到云端
    if (isConfigured()) {
      const category = categoryStore.value.getCategory(categoryKey)
      if (!category?.sites) return

      const updates = category.sites
        .filter((site) => site.id)
        .map((site) => updateSiteInSupabase(site.id!, { sortOrder: site.sortOrder }))

      try {
        await Promise.all(updates)
      } catch (e) {
        console.error('Failed to sync sort order:', e)
      }
    }
  }

  /**
   * 搜索网站
   */
  function searchSites(query: string): Site[] {
    const lowerQuery = query.toLowerCase().trim()
    if (!lowerQuery) return []

    const results: Site[] = []

    Object.values(allSites.value).forEach((sites) => {
      sites.forEach((site) => {
        const matchName = site.name.toLowerCase().includes(lowerQuery)
        const matchDesc = site.desc?.toLowerCase().includes(lowerQuery)
        const matchTags = site.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))

        if (matchName || matchDesc || matchTags) {
          results.push(site)
        }
      })
    })

    return results
  }

  /**
   * 导出数据
   */
  function exportData() {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      categories: categoryStore.value.categories
    }
  }

  /**
   * 清除所有数据
   */
  async function clearAllData(): Promise<void> {
    // 清除云端
    if (isConfigured()) {
      try {
        await clearAllDataInSupabase()
      } catch (e) {
        console.error('Failed to clear cloud data:', e)
      }
    }

    // 重置本地
    categoryStore.value.setCategories([])
    initialized.value = false
  }

  /**
   * 刷新数据
   */
  async function refresh(): Promise<void> {
    initialized.value = false
    await initialize()
  }

  /**
   * 检查是否配置了云同步
   */
  function hasCloudSync(): boolean {
    return isConfigured()
  }

  return {
    // 状态
    loading,
    error,
    initialized,

    // 计算属性
    allSites,
    topSites,
    recentSites,

    // 操作
    initialize,
    getSitesByCategory,
    addSite,
    updateSite,
    deleteSite,
    trackVisit,
    reorderSites,
    searchSites,
    exportData,
    clearAllData,
    refresh,
    hasCloudSync
  }
})
