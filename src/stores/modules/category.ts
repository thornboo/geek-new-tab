/**
 * Category Store - 分类管理
 * 负责管理分类列表和当前激活分类
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, Site } from '@/types'
import { isConfigured } from '@/lib/supabase'
import {
  addCategoryToSupabase,
  deleteCategoryFromSupabase,
  renameCategoryInSupabase,
  addSiteToSupabase
} from '@/lib/supabaseSync'
import {
  parseBookmarkHtml,
  convertBookmarksToCategories,
  exportToBookmarkHtml,
  readFileAsText,
  downloadFile,
  type ImportResult
} from '@/lib/bookmarkParser'

// 旧版数据库存储键
const LEGACY_DB_KEY = 'geek_db_v2'

export const useCategoryStore = defineStore('category', () => {
  // ========== 状态 ==========

  /**
   * 分类列表（包含网站数据）
   */
  const categories = ref<Category[]>([])

  /**
   * 当前激活的分类 key
   */
  const activeCategory = ref<string>('')

  /**
   * 是否已初始化
   */
  const initialized = ref(false)

  // ========== 计算属性 ==========

  /**
   * 当前分类对象
   */
  const currentCategory = computed(() =>
    categories.value.find((c) => c.key === activeCategory.value)
  )

  /**
   * 当前分类的网站列表
   */
  const currentSites = computed(() => currentCategory.value?.sites || [])

  /**
   * 排序后的分类列表
   */
  const sortedCategories = computed(() =>
    [...categories.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  )

  /**
   * 当前分类索引
   */
  const currentIndex = computed(() =>
    categories.value.findIndex((c) => c.key === activeCategory.value)
  )

  /**
   * 分类菜单项（用于侧边栏）
   */
  const menuItems = computed(() =>
    categories.value.map(({ key, label, icon, order }) => ({ key, label, icon, order }))
  )

  // ========== 操作 ==========

  /**
   * 初始化分类数据（从旧版数据迁移）
   */
  function initialize() {
    if (initialized.value) return

    // 尝试从旧版��据库迁移
    const legacyDb = localStorage.getItem(LEGACY_DB_KEY)
    if (legacyDb) {
      try {
        const db = JSON.parse(legacyDb)
        if (db.categories && Array.isArray(db.categories)) {
          categories.value = db.categories.map((cat: Category, index: number) => ({
            ...cat,
            order: cat.order ?? index + 1
          }))
        }
      } catch (e) {
        console.error('Failed to migrate legacy db:', e)
      }
    }

    // 确保有激活的分类
    ensureActiveCategory()
    initialized.value = true
  }

  /**
   * 设置分类数据（用于云端同步后更新）
   */
  function setCategories(newCategories: Category[]) {
    categories.value = newCategories
    ensureActiveCategory()
  }

  /**
   * 确保有激活的分类
   */
  function ensureActiveCategory() {
    if (!categories.value.length) return
    if (!categories.value.find((c) => c.key === activeCategory.value)) {
      activeCategory.value = categories.value[0].key
    }
  }

  /**
   * 切换分类
   */
  function setActiveCategory(key: string) {
    if (categories.value.some((c) => c.key === key)) {
      activeCategory.value = key
    }
  }

  /**
   * 添加分类
   */
  async function addCategory(category: Omit<Category, 'order' | 'sites'>) {
    const maxOrder = Math.max(...categories.value.map((c) => c.order || 0), 0)
    const newCategory: Category = {
      ...category,
      order: maxOrder + 1,
      sites: []
    }
    categories.value.push(newCategory)
    activeCategory.value = category.key

    // 同步到云端
    if (isConfigured()) {
      try {
        await addCategoryToSupabase({
          key: newCategory.key,
          label: newCategory.label,
          order: newCategory.order
        })
      } catch (e) {
        console.error('Failed to sync new category:', e)
      }
    }

    return newCategory
  }

  /**
   * 更新分类
   */
  async function updateCategory(key: string, updates: Partial<Category>) {
    const index = categories.value.findIndex((c) => c.key === key)
    if (index === -1) return false

    categories.value[index] = {
      ...categories.value[index],
      ...updates
    }

    // 同步到云端
    if (isConfigured() && updates.label) {
      try {
        await renameCategoryInSupabase(key, updates.label)
      } catch (e) {
        console.error('Failed to sync category update:', e)
      }
    }

    return true
  }

  /**
   * 删除分类
   */
  async function deleteCategory(key: string) {
    if (categories.value.length <= 1) {
      throw new Error('至少需要保留一个分类')
    }

    const category = categories.value.find((c) => c.key === key)
    if (!category) return false

    categories.value = categories.value.filter((c) => c.key !== key)

    // 如果删除的是当前分类，切换到第一个
    if (activeCategory.value === key) {
      activeCategory.value = categories.value[0]?.key || ''
    }

    // 同步到云端
    if (isConfigured()) {
      try {
        await deleteCategoryFromSupabase(key)
      } catch (e) {
        console.error('Failed to sync category deletion:', e)
      }
    }

    return true
  }

  /**
   * 切换到上一个分类
   */
  function prevCategory() {
    const current = currentIndex.value
    if (current > 0) {
      activeCategory.value = categories.value[current - 1].key
    } else {
      activeCategory.value = categories.value[categories.value.length - 1].key
    }
  }

  /**
   * 切换到下一个分类
   */
  function nextCategory() {
    const current = currentIndex.value
    if (current < categories.value.length - 1) {
      activeCategory.value = categories.value[current + 1].key
    } else {
      activeCategory.value = categories.value[0].key
    }
  }

  /**
   * 检查分类 key 是否存在
   */
  function hasCategory(key: string): boolean {
    return categories.value.some((c) => c.key === key)
  }

  /**
   * 获取分类
   */
  function getCategory(key: string): Category | undefined {
    return categories.value.find((c) => c.key === key)
  }

  // ========== 网站操作（在分类内） ==========

  /**
   * 添加网站到分类
   */
  function addSiteToCategory(categoryKey: string, site: Site) {
    const category = categories.value.find((c) => c.key === categoryKey)
    if (!category) return false

    if (!category.sites) {
      category.sites = []
    }

    const sortOrder = category.sites.length + 1
    category.sites.push({
      ...site,
      sortOrder
    })

    return true
  }

  /**
   * 更新分类中的网站
   */
  function updateSiteInCategory(categoryKey: string, siteIndex: number, updates: Partial<Site>) {
    const category = categories.value.find((c) => c.key === categoryKey)
    if (!category || !category.sites || !category.sites[siteIndex]) return false

    category.sites[siteIndex] = {
      ...category.sites[siteIndex],
      ...updates
    }

    return true
  }

  /**
   * 从分类中删除网站
   */
  function deleteSiteFromCategory(categoryKey: string, siteIndex: number) {
    const category = categories.value.find((c) => c.key === categoryKey)
    if (!category || !category.sites) return false

    category.sites.splice(siteIndex, 1)
    return true
  }

  /**
   * 重新排序分类中的网站
   */
  function reorderSitesInCategory(categoryKey: string, fromIndex: number, toIndex: number) {
    const category = categories.value.find((c) => c.key === categoryKey)
    if (!category || !category.sites) return false

    const [moved] = category.sites.splice(fromIndex, 1)
    category.sites.splice(toIndex, 0, moved)

    // 更新排序
    category.sites.forEach((site, index) => {
      site.sortOrder = index + 1
    })

    return true
  }

  // ========== 书签导入/导出 ==========

  /**
   * 从 Chrome HTML 书签文件导入
   * @param file 书签文件
   * @param mergeMode 合并模式：'merge' 合并到现有数据，'replace' 替换现有数据
   * @returns 导入结果
   */
  async function importFromBookmarkFile(
    file: File,
    mergeMode: 'merge' | 'replace' = 'merge'
  ): Promise<ImportResult> {
    // 读取文件
    const html = await readFileAsText(file)

    // 解析书签
    const nodes = parseBookmarkHtml(html)

    // 转换为分类数据
    const result = convertBookmarksToCategories(nodes, 1)

    if (result.categories.length === 0) {
      throw new Error('书签文件中没有找到有效的书签')
    }

    // 根据合并模式处理
    if (mergeMode === 'replace') {
      // 替换模式：清空现有数据
      categories.value = []
    }

    // 合并分类
    for (const importedCat of result.categories) {
      const existingCat = categories.value.find((c) => c.key === importedCat.key)

      if (existingCat) {
        // 分类已存在，合并网站（不去重）
        if (!existingCat.sites) {
          existingCat.sites = []
        }
        const importedSites = importedCat.sites || []
        existingCat.sites.push(...importedSites)

        // 同步到云端
        if (isConfigured()) {
          for (const site of importedSites) {
            try {
              await addSiteToSupabase(existingCat.key, site)
            } catch (e) {
              console.error('Failed to sync imported site:', e)
            }
          }
        }
      } else {
        // 新分类，直接添加
        const order = categories.value.length + 1
        const newCat: Category = {
          ...importedCat,
          order
        }
        categories.value.push(newCat)

        // 同步到云端
        if (isConfigured()) {
          try {
            await addCategoryToSupabase({
              key: newCat.key,
              label: newCat.label,
              order: newCat.order
            })

            // 同步网站
            for (const site of newCat.sites || []) {
              try {
                await addSiteToSupabase(newCat.key, site)
              } catch (e) {
                console.error('Failed to sync imported site:', e)
              }
            }
          } catch (e) {
            console.error('Failed to sync imported category:', e)
          }
        }
      }
    }

    // 确保有激活的分类
    ensureActiveCategory()

    return result
  }

  /**
   * 导出为 Chrome HTML 书签文件
   */
  function exportToBookmarkFile(): void {
    const html = exportToBookmarkHtml(categories.value)
    const filename = `geek-nav-bookmarks-${new Date().toISOString().slice(0, 10)}.html`
    downloadFile(html, filename, 'text/html')
  }

  return {
    // 状态
    categories,
    activeCategory,
    initialized,

    // 计算属性
    currentCategory,
    currentSites,
    sortedCategories,
    currentIndex,
    menuItems,

    // 分类操作
    initialize,
    setCategories,
    ensureActiveCategory,
    setActiveCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    prevCategory,
    nextCategory,
    hasCategory,
    getCategory,

    // 网站操作
    addSiteToCategory,
    updateSiteInCategory,
    deleteSiteFromCategory,
    reorderSitesInCategory,

    // 书签导入/导出
    importFromBookmarkFile,
    exportToBookmarkFile
  }
})
