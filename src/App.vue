<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { DEFAULT_DB } from '@/data/defaults'
import { clearStorage, loadConfig, loadDb, saveConfig, saveDb } from '@/lib/storage'
import { isConfigured as isSupabaseConfigured } from '@/lib/supabase'
import {
  addCategoryToSupabase,
  addSiteToSupabase,
  clearAllDataInSupabase,
  deleteCategoryFromSupabase,
  deleteSiteFromSupabase,
  loadDbFromSupabase,
  renameCategoryInSupabase,
  seedSupabase,
  updateSiteInSupabase
} from '@/lib/supabaseSync'

type Site = (typeof DEFAULT_DB.categories)[number]['sites'][number] & {
  id?: number
  visitCount?: number
  lastVisit?: string
  sortOrder?: number
}

type Category = {
  key: string
  label: string
  order?: number
  sites: Site[]
}

type SearchResult = {
  site: Site
  categoryKey: string
  categoryLabel: string
  siteIndex: number
}

const db = ref<{ categories: Category[] }>(loadDb())
const config = ref(loadConfig())
const activeCategory = ref(db.value.categories[0]?.key || '')

const showSettings = ref(false)
const showAddModal = ref(false)
const settingsTab = ref<'appearance' | 'search' | 'general'>('appearance')
const addTab = ref<'site' | 'category'>('site')
const editingSiteIndex = ref<number | null>(null)
const editingCategoryKey = ref<string | null>(null)

const searchQuery = ref('')
const flippedIndex = ref<number | null>(null)
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const clockText = ref('00:00:00')
const dateText = ref('加载中...')

const searchInputRef = ref<HTMLInputElement | null>(null)
const siteTitleRef = ref<HTMLInputElement | null>(null)
const categoryLabelRef = ref<HTMLInputElement | null>(null)
const bgLayerRef = ref<HTMLElement | null>(null)
const ambientRef = ref<HTMLElement | null>(null)

const siteForm = reactive({
  title: '',
  url: '',
  icon: '',
  desc: '',
  tags: ''
})

const categoryForm = reactive({
  key: '',
  label: ''
})

const currentCategory = computed(() =>
  db.value.categories.find((category) => category.key === activeCategory.value)
)

const currentSites = computed(() => currentCategory.value?.sites || [])
const isEditingCategory = computed(() => editingCategoryKey.value !== null)

const opacityLabel = computed(() => `${config.value.overlayOpacity}%`)

const searchResults = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return []
  const results: SearchResult[] = []

  db.value.categories.forEach((category) => {
    category.sites.forEach((site, index) => {
      const nameMatch = site.name.toLowerCase().includes(keyword)
      const descMatch = site.desc?.toLowerCase().includes(keyword)
      const tagMatch = site.tags?.some((tag) => tag.toLowerCase().includes(keyword))
      if (nameMatch || descMatch || tagMatch) {
        results.push({
          site,
          categoryKey: category.key,
          categoryLabel: category.label,
          siteIndex: index
        })
      }
    })
  })

  return results.slice(0, 5)
})

const searchVisible = computed(() => searchQuery.value.trim().length > 0)

let clockTimer: number | undefined

const applyConfig = () => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--primary-color', config.value.primaryColor)
  root.style.setProperty('--text-main', config.value.textColor)
  root.style.setProperty('--overlay-opacity', String(config.value.overlayOpacity / 100))

  if (bgLayerRef.value && ambientRef.value) {
    if (config.value.bgType === 'default') {
      bgLayerRef.value.style.backgroundImage = 'none'
      ambientRef.value.style.opacity = '1'
    } else {
      ambientRef.value.style.opacity = '0'
      let url = config.value.bgValue
      if (config.value.bgType === 'unsplash') {
        url = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070'
      }
      bgLayerRef.value.style.backgroundImage = `url('${url}')`
    }
  }
}

const updateClock = () => {
  const now = new Date()
  clockText.value = now.toLocaleTimeString(config.value.locale, { hour12: false })
  dateText.value = now.toLocaleDateString(config.value.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const ensureActiveCategory = () => {
  if (!db.value.categories.length) return
  if (!db.value.categories.find((category) => category.key === activeCategory.value)) {
    activeCategory.value = db.value.categories[0].key
  }
}

const initialize = async () => {
  db.value = loadDb()
  config.value = loadConfig()
  ensureActiveCategory()
  applyConfig()
  updateClock()

  if (isSupabaseConfigured()) {
    try {
      const remote = await loadDbFromSupabase()
      if (remote?.categories?.length) {
        db.value = remote
        ensureActiveCategory()
      } else {
        await seedSupabase(db.value)
      }
    } catch (e) {
      console.error('云端同步失败:', e)
    }
  }
}

const openSettings = () => {
  showAddModal.value = false
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}

const openAddModal = async () => {
  showSettings.value = false
  addTab.value = 'site'
  editingSiteIndex.value = null
  editingCategoryKey.value = null
  resetSiteForm()
  showAddModal.value = true
  await nextTick()
  siteTitleRef.value?.focus()
}

const closeAddModal = () => {
  showAddModal.value = false
  editingCategoryKey.value = null
}

const switchSettingTab = (tab: 'appearance' | 'search' | 'general') => {
  settingsTab.value = tab
}

const switchAddTab = (tab: 'site' | 'category') => {
  addTab.value = tab
}

const resetSiteForm = () => {
  siteForm.title = ''
  siteForm.url = ''
  siteForm.icon = ''
  siteForm.desc = ''
  siteForm.tags = ''
}

const resetCategoryForm = () => {
  categoryForm.key = ''
  categoryForm.label = ''
}

const switchCategory = (key: string) => {
  activeCategory.value = key
  flippedIndex.value = null
}

const editCategory = async (key: string) => {
  const category = db.value.categories.find((item) => item.key === key)
  if (!category) return
  editingCategoryKey.value = key
  categoryForm.key = category.key
  categoryForm.label = category.label
  addTab.value = 'category'
  showSettings.value = false
  showAddModal.value = true
  await nextTick()
  categoryLabelRef.value?.focus()
}

const deleteCategory = async (key: string) => {
  const category = db.value.categories.find((item) => item.key === key)
  if (!category) return
  if (db.value.categories.length <= 1) {
    window.alert('至少需要保留一个分类')
    return
  }
  const siteCount = category.sites.length
  const confirmMsg =
    siteCount > 0
      ? `确定删除分类"${category.label}"吗？这将同时删除其中的${siteCount}个网站。`
      : `确定删除分类"${category.label}"吗？`
  if (!window.confirm(confirmMsg)) return

  db.value.categories = db.value.categories.filter((item) => item.key !== key)
  ensureActiveCategory()

  if (isSupabaseConfigured()) {
    try {
      await deleteCategoryFromSupabase(key)
    } catch (e) {
      console.error('同步删除分类失败:', e)
    }
  }
}

const commitNewCategory = async () => {
  const key = categoryForm.key.trim()
  const label = categoryForm.label.trim()
  if (!key || !label) {
    window.alert('键值和名称不能为空')
    return
  }
  if (editingCategoryKey.value) {
    const category = db.value.categories.find((item) => item.key === editingCategoryKey.value)
    if (!category) return
    category.label = label
    closeAddModal()
    resetCategoryForm()
    editingCategoryKey.value = null

    if (isSupabaseConfigured()) {
      try {
        await renameCategoryInSupabase(category.key, category.label)
      } catch (e) {
        console.error('同步分类名称失败:', e)
      }
    }
    return
  }
  if (db.value.categories.find((item) => item.key === key)) {
    window.alert('该键值已存在')
    return
  }
  const order = db.value.categories.length + 1
  const newCategory: Category = { key, label, order, sites: [] }
  db.value.categories.push(newCategory)
  activeCategory.value = key
  closeAddModal()
  resetCategoryForm()

  if (isSupabaseConfigured()) {
    try {
      await addCategoryToSupabase({
        key,
        label,
        order
      })
    } catch (e) {
      console.error('同步新增分类失败:', e)
    }
  }
}

const openEditSite = async (index: number) => {
  const site = currentSites.value[index]
  if (!site) return
  editingSiteIndex.value = index
  siteForm.title = site.name
  siteForm.url = site.url
  siteForm.icon = site.icon || ''
  siteForm.desc = site.desc || ''
  siteForm.tags = (site.tags || []).join(', ')
  showAddModal.value = true
  addTab.value = 'site'
  await nextTick()
  siteTitleRef.value?.focus()
}

const deleteSite = async (index: number) => {
  if (!window.confirm('确定删除这个网站吗？')) return
  const site = currentSites.value[index]
  if (!site) return
  currentSites.value.splice(index, 1)
  if (site.id && isSupabaseConfigured()) {
    try {
      await deleteSiteFromSupabase(site.id)
    } catch (e) {
      console.error('同步删除网站失败:', e)
    }
  }
}

const commitNewSite = async () => {
  const title = siteForm.title.trim()
  const url = siteForm.url.trim()
  if (!title || !url) {
    window.alert('标题和链接不能为空')
    return
  }

  const icon = siteForm.icon.trim() || 'mdi:web'
  const tags = siteForm.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (editingSiteIndex.value !== null) {
    const target = currentSites.value[editingSiteIndex.value]
    if (!target) return
    target.name = title
    target.url = url
    target.icon = icon
    target.desc = siteForm.desc.trim()
    target.tags = tags
    if (target.id && isSupabaseConfigured()) {
      try {
        await updateSiteInSupabase(target.id, {
          name: target.name,
          url: target.url,
          icon: target.icon,
          desc: target.desc,
          tags: target.tags
        })
      } catch (e) {
        console.error('同步更新网站失败:', e)
      }
    }
  } else {
    const sortOrder = currentSites.value.length + 1
    const site = {
      name: title,
      url,
      icon,
      desc: siteForm.desc.trim(),
      tags,
      sortOrder
    }
    currentSites.value.push(site)
    if (isSupabaseConfigured()) {
      try {
        const saved = await addSiteToSupabase(activeCategory.value, site)
        if (saved?.id) {
          site.id = saved.id
        }
      } catch (e) {
        console.error('同步新增网站失败:', e)
      }
    }
  }

  closeAddModal()
  resetSiteForm()
  editingSiteIndex.value = null
}

const trackSiteVisit = async (siteIndex: number) => {
  const site = currentSites.value[siteIndex]
  if (!site) return
  site.visitCount = (site.visitCount || 0) + 1
  site.lastVisit = new Date().toISOString()
  if (site.id && isSupabaseConfigured()) {
    try {
      await updateSiteInSupabase(site.id, {
        visitCount: site.visitCount,
        lastVisit: site.lastVisit
      })
    } catch (e) {
      console.error('同步访问统计失败:', e)
    }
  }
}

const syncSortOrder = async () => {
  const category = currentCategory.value
  if (!category) return
  category.sites.forEach((site, index) => {
    site.sortOrder = index + 1
  })
  if (!isSupabaseConfigured()) return
  const updates = category.sites
    .filter((site) => site.id)
    .map((site) => updateSiteInSupabase(site.id as number, { sortOrder: site.sortOrder }))
  try {
    await Promise.all(updates)
  } catch (e) {
    console.error('同步排序失败:', e)
  }
}

const handleCardClick = async (siteIndex: number) => {
  if (draggingIndex.value !== null) return
  const site = currentSites.value[siteIndex]
  if (!site) return
  await trackSiteVisit(siteIndex)
  window.open(site.url, '_blank')
}

const handleDragStart = (index: number, event: DragEvent) => {
  draggingIndex.value = index
  dragOverIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const handleDragOver = (index: number, event: DragEvent) => {
  if (draggingIndex.value === null) return
  event.preventDefault()
  dragOverIndex.value = index
}

const handleDrop = async (index: number) => {
  if (draggingIndex.value === null) return
  const from = draggingIndex.value
  const to = index
  if (from === to) {
    draggingIndex.value = null
    dragOverIndex.value = null
    return
  }
  const sites = currentSites.value
  const [moved] = sites.splice(from, 1)
  sites.splice(to, 0, moved)
  await syncSortOrder()
  draggingIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggingIndex.value = null
  dragOverIndex.value = null
}

const handleSearchEnter = () => {
  if (!searchResults.value.length) return
  const result = searchResults.value[0]
  window.open(result.site.url, '_blank')
  searchQuery.value = ''
}

const handleSearchClick = (result: SearchResult) => {
  window.open(result.site.url, '_blank')
  searchQuery.value = ''
}

const setBgType = (type: 'default' | 'unsplash' | 'url') => {
  config.value.bgType = type
  if (type === 'default') {
    config.value.bgValue = ''
  }
  if (type === 'unsplash') {
    config.value.bgValue = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070'
  }
}

const handleBgUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      config.value.bgType = 'url'
      config.value.bgValue = String(e.target?.result || '')
    } catch (err) {
      window.alert('图片文件过大！')
    }
  }
  reader.readAsDataURL(file)
}

const handleBgUrlInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.value) {
    config.value.bgType = 'url'
  } else if (config.value.bgType === 'url') {
    config.value.bgType = 'default'
  }
}

const setLocale = (locale: 'zh-CN' | 'en-US') => {
  config.value.locale = locale
  updateClock()
}

const downloadConfig = () => {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify({ db: db.value, config: config.value }))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', 'geek_tab_backup.json')
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

const resetAll = async () => {
  const message = isSupabaseConfigured()
    ? '确定重置所有数据？此操作将清除本地与云端数据，且不可撤销。'
    : '确定重置所有数据？此操作不可撤销。'
  if (!window.confirm(message)) return
  clearStorage()
  if (isSupabaseConfigured()) {
    try {
      await clearAllDataInSupabase()
    } catch (e) {
      console.error('清空云端数据失败:', e)
    }
  }
  window.location.reload()
}

const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement
  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return

  switch (event.key) {
    case '/':
      event.preventDefault()
      searchInputRef.value?.focus()
      break
    case 'Escape':
      showSettings.value = false
      showAddModal.value = false
      searchQuery.value = ''
      break
    case 's':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        openSettings()
      }
      break
    case 'n':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        openAddModal()
      }
      break
    case 'ArrowLeft':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const currentIndex = db.value.categories.findIndex(
          (item) => item.key === activeCategory.value
        )
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : db.value.categories.length - 1
        activeCategory.value = db.value.categories[nextIndex]?.key || activeCategory.value
      }
      break
    case 'ArrowRight':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const currentIndex = db.value.categories.findIndex(
          (item) => item.key === activeCategory.value
        )
        const nextIndex = currentIndex < db.value.categories.length - 1 ? currentIndex + 1 : 0
        activeCategory.value = db.value.categories[nextIndex]?.key || activeCategory.value
      }
      break
  }
}

watch(
  config,
  (nextConfig) => {
    applyConfig()
    saveConfig(nextConfig)
  },
  { deep: true }
)

watch(
  db,
  (nextDb) => {
    saveDb(nextDb)
  },
  { deep: true }
)

onMounted(async () => {
  await initialize()
  clockTimer = window.setInterval(updateClock, 1000)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (clockTimer) window.clearInterval(clockTimer)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div>
    <div id="bgLayer" ref="bgLayerRef"></div>
    <div id="bgOverlay"></div>
    <div class="ambient-light" ref="ambientRef"></div>
    <div class="noise-overlay"></div>

    <div class="container">
      <header class="header-section">
        <div class="clock">{{ clockText }}</div>
        <div class="date">{{ dateText }}</div>

        <div class="search-wrapper">
          <span class="prompt-char">&gt;</span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索网站..."
            autocomplete="off"
            @keydown.enter="handleSearchEnter"
          />
          <div class="shortcut-hint">
            <span class="key-badge">搜索</span>
          </div>

          <div class="command-helper" :class="{ visible: searchVisible }">
            <template v-if="searchResults.length">
              <div
                v-for="result in searchResults"
                :key="`${result.categoryKey}-${result.siteIndex}`"
                class="cmd-item"
                @click="handleSearchClick(result)"
              >
                <div>
                  <div style="font-weight: 500">{{ result.site.name }}</div>
                  <div style="font-size: 0.8rem; opacity: 0.7">
                    {{ result.categoryLabel }} • {{ result.site.desc || '无描述' }}
                  </div>
                </div>
                <Icon :icon="result.site.icon || 'mdi:web'" class="iconify" />
              </div>
            </template>
            <template v-else>
              <div class="cmd-item" style="opacity: 0.5">
                <span>未找到匹配的网站</span>
              </div>
            </template>
          </div>
        </div>
      </header>

      <div class="main-content">
        <aside class="sidebar">
          <nav class="nav-tabs">
            <button
              v-for="category in db.categories"
              :key="category.key"
              class="nav-btn"
              :class="{ active: category.key === activeCategory }"
              @click="switchCategory(category.key)"
            >
              <span class="nav-btn-text">./{{ category.label.toLowerCase() }}</span>
              <span class="nav-btn-actions">
                <button
                  class="nav-action-btn"
                  title="重命名"
                  @click.stop="editCategory(category.key)"
                >
                  <Icon icon="mdi:pencil" class="iconify" />
                </button>
                <button
                  class="nav-action-btn delete"
                  title="删除"
                  @click.stop="deleteCategory(category.key)"
                >
                  <Icon icon="mdi:delete" class="iconify" />
                </button>
              </span>
            </button>

            <button class="nav-btn action-btn" title="添加内容" @click="openAddModal">[ + ]</button>
          </nav>

          <button class="settings-btn" title="设置" @click="openSettings">
            <Icon icon="mdi:cog" class="iconify" />
            <span style="margin-left: 8px; font-size: 0.85rem">设置</span>
          </button>
        </aside>

        <main class="content-area">
          <div class="grid-container">
            <template v-if="currentSites.length">
              <div
                v-for="(site, index) in currentSites"
                :key="`${site.url}-${index}`"
                class="card"
                :class="{
                  'show-back': flippedIndex === index,
                  'is-dragging': draggingIndex === index,
                  'is-drag-over': dragOverIndex === index
                }"
                draggable="true"
                @mouseenter="flippedIndex = index"
                @mouseleave="flippedIndex = flippedIndex === index ? null : flippedIndex"
                @click="handleCardClick(index)"
                @dragstart="handleDragStart(index, $event)"
                @dragover="handleDragOver(index, $event)"
                @drop="handleDrop(index)"
                @dragend="handleDragEnd"
              >
                <div class="card-inner">
                  <div class="card-front">
                    <div class="card-icon">
                      <Icon :icon="site.icon || 'mdi:web'" class="iconify" />
                    </div>
                    <div class="card-title">{{ site.name }}</div>
                  </div>
                  <div class="card-back">
                    <div class="card-desc">{{ site.desc || '暂无描述' }}</div>
                    <div class="card-tags">
                      <span v-for="tag in site.tags || []" :key="tag" class="card-tag">
                        {{ tag }}
                      </span>
                    </div>
                    <div class="card-actions">
                      <button class="card-btn" title="编辑" @click.stop="openEditSite(index)">
                        <Icon icon="mdi:pencil" class="iconify" />
                      </button>
                      <button
                        class="card-btn delete-btn"
                        title="删除"
                        @click.stop="deleteSite(index)"
                      >
                        <Icon icon="mdi:delete" class="iconify" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="empty-state">
                <div class="empty-icon">
                  <Icon icon="mdi:folder-open-outline" class="iconify" />
                </div>
                <div class="empty-title">暂无网站</div>
                <div class="empty-desc">这个分类还没有添加任何网站</div>
                <button class="empty-action" @click="openAddModal">添加第一个网站</button>
              </div>
            </template>
          </div>
        </main>
      </div>
    </div>

    <div class="modal-overlay" :class="{ visible: showAddModal }" @click.self="closeAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>添加内容</h3>
          <button class="close-btn" @click="closeAddModal">×</button>
        </div>

        <div class="settings-tabs">
          <button
            class="settings-tab-btn"
            :class="{ active: addTab === 'site' }"
            @click="switchAddTab('site')"
          >
            添加网站
          </button>
          <button
            class="settings-tab-btn"
            :class="{ active: addTab === 'category' }"
            @click="switchAddTab('category')"
          >
            添加分类
          </button>
        </div>

        <div class="modal-body">
          <div class="settings-panel" :class="{ active: addTab === 'site' }">
            <div class="input-group">
              <span class="input-label">标题</span>
              <input
                ref="siteTitleRef"
                v-model="siteForm.title"
                type="text"
                placeholder="例如：GitHub"
              />
            </div>
            <div class="input-group">
              <span class="input-label">链接</span>
              <input v-model="siteForm.url" type="text" placeholder="https://..." />
            </div>
            <div class="input-group">
              <span class="input-label">图标</span>
              <input v-model="siteForm.icon" type="text" placeholder="图标代码 (例如 mdi:web)" />
            </div>
            <div class="input-group">
              <span class="input-label">描述</span>
              <input v-model="siteForm.desc" type="text" placeholder="网站描述" />
            </div>
            <div class="input-group">
              <span class="input-label">标签</span>
              <input
                v-model="siteForm.tags"
                type="text"
                placeholder="用逗号分隔，例如：工具, 设计"
              />
            </div>
            <button class="run-btn" @click="commitNewSite">> 确认添加</button>
          </div>

          <div class="settings-panel" :class="{ active: addTab === 'category' }">
            <div class="input-group">
              <span class="input-label">键值</span>
              <input
                v-model="categoryForm.key"
                type="text"
                :readonly="isEditingCategory"
                placeholder="例如：design"
              />
            </div>
            <div class="input-group">
              <span class="input-label">名称</span>
              <input
                ref="categoryLabelRef"
                v-model="categoryForm.label"
                type="text"
                placeholder="例如：设计"
              />
            </div>
            <button class="run-btn" @click="commitNewCategory">> 确认添加</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" :class="{ visible: showSettings }" @click.self="closeSettings">
      <div class="modal-content">
        <div class="modal-header">
          <h3>系统设置</h3>
          <button class="close-btn" @click="closeSettings">×</button>
        </div>

        <div class="settings-tabs">
          <button
            class="settings-tab-btn"
            :class="{ active: settingsTab === 'appearance' }"
            @click="switchSettingTab('appearance')"
          >
            外观
          </button>
          <button
            class="settings-tab-btn"
            :class="{ active: settingsTab === 'search' }"
            @click="switchSettingTab('search')"
          >
            搜索
          </button>
          <button
            class="settings-tab-btn"
            :class="{ active: settingsTab === 'general' }"
            @click="switchSettingTab('general')"
          >
            通用
          </button>
        </div>

        <div class="modal-body">
          <div class="settings-panel" :class="{ active: settingsTab === 'appearance' }">
            <div class="setting-group">
              <label class="setting-label">背景设置</label>
              <div class="color-presets" style="margin-bottom: 8px">
                <button
                  class="preset-btn"
                  :class="{ active: config.bgType === 'default' }"
                  style="flex: 1"
                  @click="setBgType('default')"
                >
                  极客默认
                </button>
                <button
                  class="preset-btn"
                  :class="{ active: config.bgType === 'unsplash' }"
                  style="flex: 1"
                  @click="setBgType('unsplash')"
                >
                  随机美图
                </button>
              </div>
              <div class="input-group">
                <span class="input-label">链接</span>
                <input
                  v-model="config.bgValue"
                  type="text"
                  placeholder="图片 URL..."
                  @input="handleBgUrlInput"
                />
              </div>
              <div class="input-group">
                <span class="input-label">本地</span>
                <input type="file" accept="image/*" @change="handleBgUpload" />
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label"
                >遮罩透明度: <span>{{ opacityLabel }}</span></label
              >
              <input
                v-model.number="config.overlayOpacity"
                type="range"
                min="0"
                max="95"
                style="width: 100%"
              />
            </div>

            <div class="setting-group">
              <label class="setting-label">主题色</label>
              <div class="color-presets">
                <div
                  class="color-dot"
                  style="background: #60a5fa"
                  @click="config.primaryColor = '#60a5fa'"
                ></div>
                <div
                  class="color-dot"
                  style="background: #a78bfa"
                  @click="config.primaryColor = '#a78bfa'"
                ></div>
                <div
                  class="color-dot"
                  style="background: #34d399"
                  @click="config.primaryColor = '#34d399'"
                ></div>
                <div
                  class="color-dot"
                  style="background: #fbbf24"
                  @click="config.primaryColor = '#fbbf24'"
                ></div>
                <div
                  class="color-dot"
                  style="background: #f87171"
                  @click="config.primaryColor = '#f87171'"
                ></div>
                <input
                  type="color"
                  style="width: 24px; height: 24px; padding: 0; border: none; background: none"
                  @input="config.primaryColor = ($event.target as HTMLInputElement).value"
                />
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">文本颜色</label>
              <div class="input-group">
                <span class="input-label">十六进制</span>
                <input v-model="config.textColor" type="text" placeholder="#e4e4e7" />
                <input
                  type="color"
                  style="width: 40px; height: 30px; border: none; background: none; padding: 0"
                  @input="config.textColor = ($event.target as HTMLInputElement).value"
                />
              </div>
            </div>
          </div>

          <div class="settings-panel" :class="{ active: settingsTab === 'search' }">
            <div class="setting-group">
              <label class="setting-label">站内搜索</label>
              <div class="input-group">
                <span class="input-label">说明</span>
                <input type="text" value="当前版本仅支持站内网站搜索" readonly />
              </div>
            </div>
          </div>

          <div class="settings-panel" :class="{ active: settingsTab === 'general' }">
            <div class="setting-group">
              <label class="setting-label">语言 / 区域</label>
              <div class="color-presets">
                <button
                  class="preset-btn"
                  :class="{ active: config.locale === 'zh-CN' }"
                  style="flex: 1"
                  @click="setLocale('zh-CN')"
                >
                  中文 (CN)
                </button>
                <button
                  class="preset-btn"
                  :class="{ active: config.locale === 'en-US' }"
                  style="flex: 1"
                  @click="setLocale('en-US')"
                >
                  英文 (US)
                </button>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">数据管理</label>
              <button
                class="run-btn"
                style="border-color: #34d399; color: #34d399; background: rgba(52, 211, 153, 0.1)"
                @click="downloadConfig"
              >
                备份配置 (JSON)
              </button>
              <button class="danger-btn" @click="resetAll">重置所有数据</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
