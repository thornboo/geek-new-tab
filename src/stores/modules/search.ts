/**
 * Search Store - 搜索状态管理
 * 负责搜索查询、结果和历史记录
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Site, SearchResult } from '@/types'
import { useCategoryStore } from './category'

export const useSearchStore = defineStore('search', () => {
  // ========== 状态 ==========

  /**
   * 搜索关键词
   */
  const query = ref('')

  /**
   * 搜索结果
   */
  const results = ref<SearchResult[]>([])

  /**
   * 是否正在搜索
   */
  const isSearching = ref(false)

  /**
   * 搜索框是否聚焦
   */
  const isFocused = ref(false)

  /**
   * 当前激活的结果索引
   */
  const activeIndex = ref(0)

  /**
   * 搜索历史
   */
  const history = ref<string[]>([])

  // ========== 计算属性 ==========

  /**
   * 是否有搜索结果
   */
  const hasResults = computed(() => results.value.length > 0)

  /**
   * 当前激活的搜索结果
   */
  const activeResult = computed(() => results.value[activeIndex.value])

  /**
   * 搜索结果是否可见
   */
  const isVisible = computed(() => query.value.trim().length > 0)

  // ========== 操作 ==========

  /**
   * 执行搜索
   */
  function search(q: string) {
    query.value = q

    if (!q.trim()) {
      results.value = []
      activeIndex.value = 0
      return
    }

    isSearching.value = true

    try {
      const categoryStore = useCategoryStore()
      const keyword = q.toLowerCase().trim()
      const searchResults: SearchResult[] = []

      categoryStore.categories.forEach((category) => {
        const sites = category.sites || []
        sites.forEach((site, index) => {
          const nameMatch = site.name.toLowerCase().includes(keyword)
          const descMatch = site.desc?.toLowerCase().includes(keyword)
          const tagMatch = site.tags?.some((tag) => tag.toLowerCase().includes(keyword))

          if (nameMatch || descMatch || tagMatch) {
            searchResults.push({
              site,
              categoryKey: category.key,
              categoryLabel: category.label,
              siteIndex: index,
              score: calculateRelevance(site, keyword)
            })
          }
        })
      })

      // 按相关度排序
      results.value = searchResults.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10)

      activeIndex.value = 0
    } finally {
      isSearching.value = false
    }
  }

  /**
   * 清除搜索
   */
  function clear() {
    query.value = ''
    results.value = []
    activeIndex.value = 0
  }

  /**
   * 移动激活索引
   */
  function moveActiveIndex(delta: number) {
    const newIndex = activeIndex.value + delta
    if (newIndex >= 0 && newIndex < results.value.length) {
      activeIndex.value = newIndex
    }
  }

  /**
   * 设置激活索引
   */
  function setActiveIndex(index: number) {
    if (index >= 0 && index < results.value.length) {
      activeIndex.value = index
    }
  }

  /**
   * 添加到搜索历史
   */
  function addToHistory(q: string) {
    if (!q.trim()) return

    // 去重并添加到开头
    history.value = [q, ...history.value.filter((h) => h !== q)].slice(0, 10)
  }

  /**
   * 清除搜索历史
   */
  function clearHistory() {
    history.value = []
  }

  /**
   * 设置聚焦状态
   */
  function setFocused(focused: boolean) {
    isFocused.value = focused
  }

  return {
    // 状态
    query,
    results,
    isSearching,
    isFocused,
    activeIndex,
    history,

    // 计算属性
    hasResults,
    activeResult,
    isVisible,

    // 操作
    search,
    clear,
    moveActiveIndex,
    setActiveIndex,
    addToHistory,
    clearHistory,
    setFocused
  }
})

/**
 * 计算搜索相关度
 */
function calculateRelevance(site: Site, query: string): number {
  const lowerQuery = query.toLowerCase()
  let score = 0

  // 名称匹配
  if (site.name.toLowerCase().includes(lowerQuery)) {
    score += 100
    // 前缀匹配加分
    if (site.name.toLowerCase().startsWith(lowerQuery)) {
      score += 50
    }
  }

  // 描述匹配
  if (site.desc?.toLowerCase().includes(lowerQuery)) {
    score += 30
  }

  // 标签匹配
  const tagMatches = site.tags?.filter((tag) => tag.toLowerCase().includes(lowerQuery)).length || 0
  score += tagMatches * 20

  // 访问次数加分（最多 50 分）
  score += Math.min((site.visitCount || 0) * 2, 50)

  return score
}
