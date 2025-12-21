# 状态管理架构设计

> 说明：当前版本采用轻量响应式状态（Vue `ref/reactive` + 组合式函数），Pinia 方案保留作为后续演进方向。

> 基于 Pinia 的模块化状态管理方案

## 目录

- [设计目标](#设计目标)
- [技术选型](#技术选型)
- [原型数据结构分析](#原型数据结构分析)
- [Store 模块设计](#store-模块设计)
- [类型系统设计](#类型系统设计)
- [Pinia 插件](#pinia-插件)
- [最佳实践](#最佳实践)

---

## 设计目标

### 核心诉求

1. **响应式状态** - 利用 Vue 3 响应式系统自动更新视图
2. **类型安全** - 完整的 TypeScript 类型推导和检查
3. **模块化** - 按业务领域划分独立的 Store 模块
4. **持久化** - 自动同步到 LocalStorage
5. **开发工具** - Pinia DevTools 调试支持
6. **性能优化** - computed 缓存和按需订阅

### 原型的局限

原型使用全局变量管理状态：

```javascript
// 全局变量 - 无响应式
let db = { categories: [...], engines: {...} }
let config = { bgType: 'default', ... }
let activeCategory = 'dev'

// 手动更新 DOM
function renderGrid() {
  container.innerHTML = '...'  // 容易出错
}

// 手动持久化
function saveDb() {
  localStorage.setItem('geek_db_v2', JSON.stringify(db))
}
```

**问题：**
- 无响应式，需手动更新 DOM
- 状态分散，难以追踪变更
- 无类型检查
- 持久化逻辑耦合在业务代码中

---

## 技术选型

### Pinia vs Vuex vs Composables

| 特性 | Pinia | Vuex 4 | 裸 Composables |
|------|-------|--------|----------------|
| Vue 3 原生支持 | 完美 | 兼容层 | 原生 |
| TypeScript | 自动推导 | 需手动声明 | 手动维护 |
| DevTools | 专属面板 | 支持 | 无 |
| 代码分割 | 自动按需 | 需配置 | 手动管理 |
| 模块化 | defineStore | modules | 文件组织 |
| Bundle 大小 | ~1KB | ~3KB | 0KB |
| 学习曲线 | 低 | 中 | 低 |
| 生态插件 | 丰富 | 成熟 | 需自行实现 |

**选择 Pinia 的理由：**
- Vue 3 官方推荐
- TypeScript 支持最佳
- 轻量 + 功能完整
- 持久化插件成熟

---

## 原型数据结构分析

### 网站数据结构

```javascript
{
  categories: [
    {
      key: 'dev',           // 分类唯一标识
      label: '开发',        // 分类显示名称
      sites: [
        {
          name: 'GitHub',           // 网站名称
          url: 'https://github.com', // 网站链接
          icon: 'mdi:github',       // 图标代码
          desc: '代码托管平台',      // 描述
          tags: ['代码', '开源'],    // 标签
          visitCount: 5,            // 访问次数
          lastVisit: '2023-...'     // 最后访问时间
        }
      ]
    }
  ],
  engines: {
    g: { name: '谷歌', url: 'https://www.google.com/search?q=' },
    b: { name: '必应', url: 'https://www.bing.com/search?q=' }
  }
}
```

### 配置数据结构

```javascript
{
  bgType: 'default',        // 背景类型
  bgValue: '',              // 背景值
  overlayOpacity: 50,       // 遮罩透明度
  primaryColor: '#60a5fa',  // 主题色
  textColor: '#e4e4e7',     // 文本颜色
  locale: 'zh-CN'           // 语言区域
}
```

---

## Store 模块设计

### 模块划分

```
stores/
├── modules/
│   ├── site.ts          # 网站数据管理
│   ├── settings.ts      # 用户设置
│   ├── category.ts      # 分类管理
│   └── search.ts        # 搜索状态
├── plugins/
│   ├── persistence.ts   # 持久化插件
│   └── sync.ts          # 同步插件
└── index.ts             # Store 入口
```

### 划分原则

- **领域驱动** - 按业务领域划分（site/settings/category）
- **单一职责** - 每个 Store 只负责一个领域
- **依赖最小化** - Store 之间避免循环依赖
- **可测试性** - 纯函数逻辑易于测试

---

## 核心 Store 设计

### 1. Site Store（网站数据管理）

**职责：**
- 管理网站列表（默认 + 自定义）
- 提供网站 CRUD 操作
- 记录访问统计
- 与 Supabase 同步（可选）

**状态设计：**

```typescript
// stores/modules/site.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSiteStore = defineStore('site', () => {
  // ========== 状态 ==========

  // 默认网站（从静态数据加载）
  const defaultSites = ref<GroupedSites>({})

  // 自定义网站（用户添加）
  const customSites = ref<GroupedSites>({})

  // 加载状态
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)

  // ========== 计算属性 ==========

  /**
   * 合并默认和自定义网站
   */
  const allSites = computed<GroupedSites>(() => {
    const merged: GroupedSites = {}
    const allKeys = new Set([
      ...Object.keys(defaultSites.value),
      ...Object.keys(customSites.value)
    ])

    allKeys.forEach(key => {
      merged[key] = [
        ...(defaultSites.value[key] || []),
        ...(customSites.value[key] || [])
      ]
    })

    return merged
  })

  /**
   * 按分类获取网站
   */
  function getSitesByCategory(categoryKey: string): Site[] {
    return allSites.value[categoryKey] || []
  }

  /**
   * 热门网站（按访问次数排序）
   */
  const topSites = computed<Site[]>(() => {
    const all: Site[] = []
    Object.values(allSites.value).forEach(sites => all.push(...sites))

    return all
      .filter(s => (s.visitCount || 0) > 0)
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
      .slice(0, 10)
  })

  /**
   * 最近访问的网站
   */
  const recentSites = computed<Site[]>(() => {
    const all: Site[] = []
    Object.values(allSites.value).forEach(sites => all.push(...sites))

    return all
      .filter(s => s.lastVisit)
      .sort((a, b) => {
        const aTime = new Date(a.lastVisit!).getTime()
        const bTime = new Date(b.lastVisit!).getTime()
        return bTime - aTime
      })
      .slice(0, 10)
  })

  // ========== 操作 ==========

  /**
   * 初始化数据
   */
  async function initialize() {
    if (initialized.value) return

    loading.value = true
    error.value = null

    try {
      // 1. 加载默认网站（从静态配置）
      await loadDefaultSites()

      // 2. 从 LocalStorage 恢复自定义网站
      loadFromLocalStorage()

      // 3. 从 Supabase 同步（异步，不阻塞）
      syncFromSupabase().catch(console.error)

      initialized.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Failed to initialize:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载默认网站
   */
  async function loadDefaultSites() {
    // 从静态数据加载默认网站配置
    const defaultData = {
      dev: [
        { name: 'GitHub', url: 'https://github.com', icon: 'mdi:github', desc: '代码托管平台', tags: ['代码', '开源'] },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'mdi:stack-overflow', desc: '程序员问答社区', tags: ['问答', '技术'] }
      ],
      tools: [
        { name: 'Figma', url: 'https://figma.com', icon: 'simple-icons:figma', desc: '在线设计工具', tags: ['设计', '协作'] }
      ]
    }
    defaultSites.value = defaultData
  }

  /**
   * 从 LocalStorage 加载
   */
  function loadFromLocalStorage() {
    const saved = localStorage.getItem('geek-nav-customSites')
    if (saved) {
      try {
        customSites.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse localStorage:', e)
      }
    }
  }

  /**
   * 从 Supabase 同步
   */
  async function syncFromSupabase() {
    // TODO: 实现 Supabase 同步逻辑
  }

  /**
   * 添加网站
   */
  async function addSite(categoryKey: string, site: Omit<Site, 'id'>) {
    try {
      // 生成临时 ID
      const newSite: Site = {
        ...site,
        id: Date.now(),
        visitCount: 0,
        isCustom: true
      }

      // 更新本地状态
      if (!customSites.value[categoryKey]) {
        customSites.value[categoryKey] = []
      }
      customSites.value[categoryKey].push(newSite)

      // 保存到 LocalStorage（由持久化插件自动处理）

      // 同步到 Supabase（异步）
      // TODO: syncToSupabase(newSite)

      return newSite
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add site'
      throw e
    }
  }

  /**
   * 更新网站
   */
  async function updateSite(categoryKey: string, siteId: number, updates: Partial<Site>) {
    const sites = customSites.value[categoryKey]
    if (!sites) return

    const index = sites.findIndex(s => s.id === siteId)
    if (index !== -1) {
      sites[index] = { ...sites[index], ...updates }
      // 持久化插件会自动保存
    }
  }

  /**
   * 删除网站
   */
  async function deleteSite(categoryKey: string, siteId: number) {
    const sites = customSites.value[categoryKey]
    if (!sites) return

    customSites.value[categoryKey] = sites.filter(s => s.id !== siteId)
    // 持久化插件会自动保存
  }

  /**
   * 记录网站访问
   */
  function trackVisit(categoryKey: string, siteId: number) {
    const sites = customSites.value[categoryKey]
    if (!sites) return

    const site = sites.find(s => s.id === siteId)
    if (site) {
      site.visitCount = (site.visitCount || 0) + 1
      site.lastVisit = new Date().toISOString()
      // 持久化插件会自动保存
    }
  }

  /**
   * 搜索网站
   */
  function searchSites(query: string): Site[] {
    const lowerQuery = query.toLowerCase()
    const results: Site[] = []

    Object.values(allSites.value).forEach(sites => {
      sites.forEach(site => {
        const matchName = site.name.toLowerCase().includes(lowerQuery)
        const matchDesc = site.desc?.toLowerCase().includes(lowerQuery)
        const matchTags = site.tags?.some(tag =>
          tag.toLowerCase().includes(lowerQuery)
        )

        if (matchName || matchDesc || matchTags) {
          results.push(site)
        }
      })
    })

    return results
  }

  return {
    // 状态
    defaultSites,
    customSites,
    loading,
    initialized,
    error,

    // 计算属性
    allSites,
    topSites,
    recentSites,
    getSitesByCategory,

    // 操作
    initialize,
    addSite,
    updateSite,
    deleteSite,
    trackVisit,
    searchSites
  }
})
```

---

### 2. Settings Store（用户设置）

**职责：**
- 管理应用设置（主题/布局/Supabase 配置）
- 提供设置的读写接口
- 应用主题到 DOM

**状态设计：**

```typescript
// stores/modules/settings.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // ========== 状态 ==========
  const settings = ref<AppSettings>({
    supabase: {
      url: '',
      key: '',
      enabled: false
    },
    appearance: {
      theme: 'dark',
      layout: 'grid',
      primaryColor: '#60a5fa',
      textColor: '#e4e4e7',
      bgType: 'default',
      bgValue: '',
      overlayOpacity: 50
    },
    search: {
      engines: {
        g: { name: '谷歌', url: 'https://www.google.com/search?q=' },
        b: { name: '必应', url: 'https://www.bing.com/search?q=' },
        bd: { name: '百度', url: 'https://www.baidu.com/s?wd=' },
        gh: { name: 'GitHub', url: 'https://github.com/search?q=' }
      },
      defaultEngine: 'g'
    },
    shortcuts: {
      search: '/',
      settings: 'ctrl+s',
      addSite: 'ctrl+n',
      prevCategory: 'ctrl+arrowleft',
      nextCategory: 'ctrl+arrowright'
    }
  })

  // ========== 计算属性 ==========

  /**
   * 是否为暗色模式
   */
  const isDarkMode = computed(() => {
    const { theme } = settings.value.appearance
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme === 'dark'
  })

  /**
   * 是否启用云同步
   */
  const hasCloudSync = computed(() => {
    const { url, key, enabled } = settings.value.supabase
    return enabled && Boolean(url) && Boolean(key)
  })

  /**
   * CSS 变量对象
   */
  const cssVariables = computed(() => {
    const { primaryColor, textColor, overlayOpacity } = settings.value.appearance
    return {
      '--primary-color': primaryColor,
      '--text-main': textColor,
      '--overlay-opacity': (overlayOpacity || 50) / 100
    }
  })

  // ========== 操作 ==========

  /**
   * 更新设置（部分更新）
   */
  function updateSettings(partial: Partial<AppSettings>) {
    settings.value = deepMerge(settings.value, partial)
  }

  /**
   * 更新 Supabase 配置
   */
  function updateSupabaseConfig(config: Partial<SupabaseConfig>) {
    settings.value.supabase = {
      ...settings.value.supabase,
      ...config
    }
  }

  /**
   * 更新外观设置
   */
  function updateAppearance(config: Partial<AppearanceConfig>) {
    settings.value.appearance = {
      ...settings.value.appearance,
      ...config
    }
  }

  /**
   * 添加搜索引擎
   */
  function addSearchEngine(key: string, name: string, url: string) {
    settings.value.search.engines[key] = { name, url }
  }

  /**
   * 删除搜索引擎
   */
  function removeSearchEngine(key: string) {
    delete settings.value.search.engines[key]
  }

  /**
   * 重置为默认设置
   */
  function resetToDefault() {
    settings.value = getDefaultSettings()
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    const root = document.documentElement
    Object.entries(cssVariables.value).forEach(([key, value]) => {
      root.style.setProperty(key, String(value))
    })

    if (isDarkMode.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  return {
    settings,
    isDarkMode,
    hasCloudSync,
    cssVariables,
    updateSettings,
    updateSupabaseConfig,
    updateAppearance,
    addSearchEngine,
    removeSearchEngine,
    resetToDefault,
    applyTheme
  }
})

// 工具函数
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target }
  Object.keys(source).forEach(key => {
    const sourceValue = source[key as keyof T]
    const targetValue = result[key as keyof T]

    if (isObject(sourceValue) && isObject(targetValue)) {
      result[key as keyof T] = deepMerge(targetValue, sourceValue) as T[keyof T]
    } else {
      result[key as keyof T] = sourceValue as T[keyof T]
    }
  })
  return result
}

function isObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function getDefaultSettings(): AppSettings {
  // 返回默认设置
  return {
    supabase: { url: '', key: '', enabled: false },
    appearance: {
      theme: 'dark',
      layout: 'grid',
      primaryColor: '#60a5fa',
      textColor: '#e4e4e7',
      bgType: 'default',
      bgValue: '',
      overlayOpacity: 50
    },
    search: {
      engines: {
        g: { name: '谷歌', url: 'https://www.google.com/search?q=' }
      },
      defaultEngine: 'g'
    },
    shortcuts: {
      search: '/',
      settings: 'ctrl+s',
      addSite: 'ctrl+n'
    }
  }
}
```

---

### 3. Category Store（分类管理）

**职责：**
- 管理分类列表
- 跟踪当前激活分类
- 提供分类 CRUD 操作

```typescript
// stores/modules/category.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  // ========== 状态 ==========
  const categories = ref<Category[]>([
    { key: 'dev', label: '开发', icon: 'mdi:code-tags', order: 1 },
    { key: 'tools', label: '工具', icon: 'mdi:tools', order: 2 },
    { key: 'design', label: '设计', icon: 'mdi:palette', order: 3 },
    { key: 'ai', label: 'AI', icon: 'mdi:robot', order: 4 }
  ])

  const activeCategory = ref<string>('dev')

  // ========== 计算属性 ==========

  const currentCategory = computed(() =>
    categories.value.find(c => c.key === activeCategory.value)
  )

  const sortedCategories = computed(() =>
    [...categories.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  )

  const currentIndex = computed(() =>
    categories.value.findIndex(c => c.key === activeCategory.value)
  )

  // ========== 操作 ==========

  function setActiveCategory(key: string) {
    if (categories.value.some(c => c.key === key)) {
      activeCategory.value = key
    }
  }

  function addCategory(category: Omit<Category, 'order'>) {
    const maxOrder = Math.max(...categories.value.map(c => c.order || 0), 0)
    categories.value.push({
      ...category,
      order: maxOrder + 1
    })
  }

  function updateCategory(key: string, updates: Partial<Category>) {
    const index = categories.value.findIndex(c => c.key === key)
    if (index !== -1) {
      categories.value[index] = {
        ...categories.value[index],
        ...updates
      }
    }
  }

  function deleteCategory(key: string) {
    if (categories.value.length <= 1) {
      throw new Error('Cannot delete the last category')
    }

    categories.value = categories.value.filter(c => c.key !== key)

    if (activeCategory.value === key) {
      activeCategory.value = categories.value[0].key
    }
  }

  function prevCategory() {
    const current = currentIndex.value
    if (current > 0) {
      activeCategory.value = categories.value[current - 1].key
    } else {
      activeCategory.value = categories.value[categories.value.length - 1].key
    }
  }

  function nextCategory() {
    const current = currentIndex.value
    if (current < categories.value.length - 1) {
      activeCategory.value = categories.value[current + 1].key
    } else {
      activeCategory.value = categories.value[0].key
    }
  }

  return {
    categories,
    activeCategory,
    currentCategory,
    sortedCategories,
    currentIndex,
    setActiveCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    prevCategory,
    nextCategory
  }
})
```

---

### 4. Search Store（搜索状态）

```typescript
// stores/modules/search.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSiteStore } from './site'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const isSearching = ref(false)
  const isFocused = ref(false)
  const activeIndex = ref(0)
  const history = ref<string[]>([])

  const hasResults = computed(() => results.value.length > 0)
  const activeResult = computed(() => results.value[activeIndex.value])

  function search(q: string) {
    query.value = q

    if (!q.trim()) {
      results.value = []
      return
    }

    isSearching.value = true

    try {
      const siteStore = useSiteStore()
      const sites = siteStore.searchSites(q)

      results.value = sites.map(site => ({
        site,
        category: { key: site.category || '', label: '' },
        score: calculateRelevance(site, q)
      })).sort((a, b) => b.score - a.score)

      activeIndex.value = 0
    } finally {
      isSearching.value = false
    }
  }

  function clear() {
    query.value = ''
    results.value = []
    activeIndex.value = 0
  }

  function moveActiveIndex(delta: number) {
    const newIndex = activeIndex.value + delta
    if (newIndex >= 0 && newIndex < results.value.length) {
      activeIndex.value = newIndex
    }
  }

  function addToHistory(q: string) {
    if (!q.trim()) return
    history.value = [q, ...history.value.filter(h => h !== q)].slice(0, 10)
  }

  return {
    query,
    results,
    isSearching,
    isFocused,
    activeIndex,
    history,
    hasResults,
    activeResult,
    search,
    clear,
    moveActiveIndex,
    addToHistory
  }
})

function calculateRelevance(site: Site, query: string): number {
  const lowerQuery = query.toLowerCase()
  let score = 0

  if (site.name.toLowerCase().includes(lowerQuery)) {
    score += 100
    if (site.name.toLowerCase().startsWith(lowerQuery)) {
      score += 50
    }
  }

  if (site.desc?.toLowerCase().includes(lowerQuery)) {
    score += 30
  }

  const tagMatches = site.tags?.filter(tag =>
    tag.toLowerCase().includes(lowerQuery)
  ).length || 0
  score += tagMatches * 20

  score += Math.min((site.visitCount || 0) * 2, 50)

  return score
}
```

---

## 类型系统设计

```typescript
// src/types/index.ts

export interface Site {
  id?: number
  name: string
  url: string
  desc?: string
  icon?: string | null
  tags?: string[]
  visitCount?: number
  lastVisit?: string
  isCustom?: boolean
  category?: string
}

export interface GroupedSites {
  [categoryKey: string]: Site[]
}

export interface Category {
  key: string
  label: string
  icon?: string
  color?: string
  order?: number
}

export interface SupabaseConfig {
  url: string
  key: string
  enabled: boolean
}

export interface AppearanceConfig {
  theme: 'dark' | 'light' | 'system'
  layout: 'grid' | 'list'
  primaryColor?: string
  textColor?: string
  bgType?: 'default' | 'unsplash' | 'url'
  bgValue?: string
  overlayOpacity?: number
}

export interface SearchEngine {
  name: string
  url: string
  icon?: string
}

export interface SearchConfig {
  engines: Record<string, SearchEngine>
  defaultEngine: string
}

export interface ShortcutsConfig {
  search?: string
  settings?: string
  addSite?: string
  prevCategory?: string
  nextCategory?: string
}

export interface AppSettings {
  supabase: SupabaseConfig
  appearance: AppearanceConfig
  search: SearchConfig
  shortcuts: ShortcutsConfig
}

export interface SearchResult {
  site: Site
  category: Category
  score: number
}
```

---

## Pinia 插件

### 1. 持久化插件

```typescript
// stores/plugins/persistence.ts
import type { PiniaPluginContext } from 'pinia'
import { watch } from 'vue'

const PERSIST_STORES = ['settings', 'category', 'site']

export function persistencePlugin({ store }: PiniaPluginContext) {
  if (!PERSIST_STORES.includes(store.$id)) return

  const key = `geek-nav-store-${store.$id}`

  // 1. 从 localStorage 恢复数据
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      store.$patch(JSON.parse(saved))
    } catch (e) {
      console.error(`Failed to restore ${store.$id}:`, e)
    }
  }

  // 2. 监听状态变化并保存
  watch(
    () => store.$state,
    (state) => {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch (e) {
        console.error(`Failed to persist ${store.$id}:`, e)
      }
    },
    { deep: true }
  )
}
```

### 2. Store 入口

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
import { persistencePlugin } from './plugins/persistence'

export const pinia = createPinia()
pinia.use(persistencePlugin)

export * from './modules/site'
export * from './modules/settings'
export * from './modules/category'
export * from './modules/search'
```

---

## 最佳实践

### 1. Store 命名规范

```typescript
// 好的命名
const siteStore = useSiteStore()
const settingsStore = useSettingsStore()

// 避免的命名
const store = useSiteStore()  // 太泛化
const data = useSiteStore()   // 语义不清
```

### 2. 解构使用

```typescript
// 使用 storeToRefs 保持响应式
import { storeToRefs } from 'pinia'

const siteStore = useSiteStore()
const { customSites, loading } = storeToRefs(siteStore)
const { addSite, deleteSite } = siteStore

// 直接解构会丢失响应式
const { customSites } = useSiteStore()  // 错误！
```

### 3. 计算属性缓存

```typescript
// 使用 computed 缓存
const topSites = computed(() => {
  return Object.values(allSites.value)
    .flat()
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 10)
})

// 避免每次调用都重新计算
function getTopSites() {
  return Object.values(allSites.value)
    .flat()
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 10)
}
```

---

## 总结

### 关键收益

| 维度 | 收益 |
|------|------|
| 开发体验 | TypeScript 完整支持 + DevTools 调试 |
| 代码质量 | 模块化 + 类型安全 + 可测试性 |
| 性能 | computed 缓存 + 选择性订阅 |
| 维护性 | 统一状态管理 + 清晰的数据流 |
| 扩展性 | 插件化架构 + 易于添加新功能 |

### 下一步

- 完成 Store 模块实现
- 编写单元测试
- 集成到 Vue 应用
- 性能监控和优化
