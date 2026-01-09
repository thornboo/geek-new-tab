<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore, useCategoryStore, useSiteStore, useSearchStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import SettingsDialog from '@/components/dialogs/SettingsDialog.vue'
import AddContentDialog from '@/components/dialogs/AddContentDialog.vue'
import SiteGrid from '@/components/SiteGrid.vue'

// ========== Stores ==========
const settingsStore = useSettingsStore()
const categoryStore = useCategoryStore()
const siteStore = useSiteStore()
const searchStore = useSearchStore()

// 解构响应式状态
const { appearance, locale } = storeToRefs(settingsStore)
const { categories, activeCategory, currentSites } = storeToRefs(categoryStore)
const { query: searchQuery, results: searchResults, isVisible: searchVisible } = storeToRefs(searchStore)

// ========== 本地状态 ==========
const showSettings = ref(false)
const showAddModal = ref(false)
const editingSiteIndex = ref<number | null>(null)
const editingCategoryKey = ref<string | null>(null)

const clockText = ref('00:00:00')
const dateText = ref('加载中...')

const searchInputRef = ref<HTMLInputElement | null>(null)
const bgLayerRef = ref<HTMLElement | null>(null)
const ambientRef = ref<HTMLElement | null>(null)

let clockTimer: number | undefined

// ========== 方法 ==========
const applyConfig = () => {
  settingsStore.applyTheme()
  settingsStore.applyBackground(bgLayerRef.value, ambientRef.value)
}

const updateClock = () => {
  const now = new Date()
  clockText.value = now.toLocaleTimeString(locale.value, { hour12: false })
  dateText.value = now.toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const initialize = async () => {
  settingsStore.initialize()
  await siteStore.initialize()
  applyConfig()
  updateClock()
}

const openSettings = () => {
  showAddModal.value = false
  showSettings.value = true
}

const openAddModal = () => {
  showSettings.value = false
  editingSiteIndex.value = null
  editingCategoryKey.value = null
  showAddModal.value = true
}

const switchCategory = (key: string) => {
  categoryStore.setActiveCategory(key)
}

const editCategory = (key: string) => {
  editingCategoryKey.value = key
  showSettings.value = false
  showAddModal.value = true
}

const deleteCategory = async (key: string) => {
  const category = categoryStore.getCategory(key)
  if (!category) return
  if (categories.value.length <= 1) {
    window.alert('至少需要保留一个分类')
    return
  }
  const siteCount = category.sites?.length || 0
  const confirmMsg =
    siteCount > 0
      ? `确定删除分类"${category.label}"吗？这将同时删除其中的${siteCount}个网站。`
      : `确定删除分类"${category.label}"吗？`
  if (!window.confirm(confirmMsg)) return
  await categoryStore.deleteCategory(key)
}

const handleSiteClick = async (index: number) => {
  const site = currentSites.value[index]
  if (!site) return
  await siteStore.trackVisit(activeCategory.value, index)
  window.open(site.url, '_blank')
}

const handleSiteEdit = (index: number) => {
  editingSiteIndex.value = index
  editingCategoryKey.value = null
  showAddModal.value = true
}

const handleSiteDelete = async (index: number) => {
  if (!window.confirm('确定删除这个网站吗？')) return
  await siteStore.deleteSite(activeCategory.value, index)
}

const handleSiteReorder = async (from: number, to: number) => {
  await siteStore.reorderSites(activeCategory.value, from, to)
}

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchStore.search(target.value)
}

const handleSearchEnter = () => {
  if (!searchResults.value.length) return
  const result = searchResults.value[0]
  window.open(result.site.url, '_blank')
  searchStore.clear()
}

const handleSearchClick = (result: typeof searchResults.value[0]) => {
  window.open(result.site.url, '_blank')
  searchStore.clear()
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
      searchStore.clear()
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
        categoryStore.prevCategory()
      }
      break
    case 'ArrowRight':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        categoryStore.nextCategory()
      }
      break
  }
}

// ========== 监听器 ==========
watch(
  () => appearance.value,
  () => {
    applyConfig()
  },
  { deep: true }
)

// ========== 生命周期 ==========
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
  <TooltipProvider>
    <div>
      <!-- Background layers -->
      <div id="bgLayer" ref="bgLayerRef"></div>
      <div id="bgOverlay"></div>
      <div class="ambient-light" ref="ambientRef"></div>
      <div class="noise-overlay"></div>

      <div class="container">
        <!-- Header Section -->
        <header class="header-section">
          <div class="clock">{{ clockText }}</div>
          <div class="date">{{ dateText }}</div>

          <!-- Search -->
          <div class="search-wrapper">
            <span class="prompt-char">&gt;</span>
            <input
              ref="searchInputRef"
              :value="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索网站..."
              autocomplete="off"
              @input="handleSearchInput"
              @keydown.enter="handleSearchEnter"
            />
            <div class="shortcut-hint">
              <span class="key-badge">搜索</span>
            </div>

            <!-- Search Results -->
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

        <!-- Main Content -->
        <div class="main-content">
          <!-- Sidebar -->
          <aside class="sidebar">
            <nav class="nav-tabs">
              <Tooltip v-for="category in categories" :key="category.key">
                <TooltipTrigger as-child>
                  <button
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
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{{ category.label }}</p>
                </TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                class="nav-btn action-btn"
                @click="openAddModal"
              >
                [ + ]
              </Button>
            </nav>

            <Button
              variant="ghost"
              class="settings-btn"
              @click="openSettings"
            >
              <Icon icon="mdi:cog" class="iconify" />
              <span style="margin-left: 8px; font-size: 0.85rem">设置</span>
            </Button>
          </aside>

          <!-- Content Area -->
          <main class="content-area">
            <SiteGrid
              :sites="currentSites"
              @click="handleSiteClick"
              @edit="handleSiteEdit"
              @delete="handleSiteDelete"
              @reorder="handleSiteReorder"
            >
              <template #empty-action>
                <Button @click="openAddModal">添加第一个网站</Button>
              </template>
            </SiteGrid>
          </main>
        </div>
      </div>

      <!-- Dialogs -->
      <SettingsDialog v-model:open="showSettings" />

      <AddContentDialog
        v-model:open="showAddModal"
        :editing-site-index="editingSiteIndex"
        :editing-category-key="editingCategoryKey"
        @site-saved="editingSiteIndex = null"
        @category-saved="editingCategoryKey = null"
      />
    </div>
  </TooltipProvider>
</template>
