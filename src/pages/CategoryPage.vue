<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SiteCard from '@/components/ui/SiteCard.vue'
import SiteFormModal from '@/components/modals/SiteFormModal.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { getCategoryByKey } from '@/data/sites'
import { useSiteManager } from '@/composables/useSiteManager'

const resolveCategoryKey = (inputKey) => {
  return getCategoryByKey(inputKey) ? inputKey : 'search'
}

const readInitialCategory = () => {
  if (typeof window === 'undefined') return 'search'
  const configured = window.__CATEGORY_KEY__
  const params = new URLSearchParams(window.location.search)
  const queryKey = params.get('id')
  return resolveCategoryKey(configured || queryKey || 'search')
}

const categoryKey = ref(readInitialCategory())
const title = computed(() => getCategoryByKey(categoryKey.value)?.label || 'Overview')

const updateHistory = (key) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('id', key)
  window.history.pushState({ category: key }, '', url)
}

const handleSidebarSelect = (key) => {
  const resolved = resolveCategoryKey(key)
  if (resolved === categoryKey.value) return
  categoryKey.value = resolved
  updateHistory(resolved)
}

const handlePopState = (event) => {
  const stateKey = event.state?.category
  const params = new URLSearchParams(window.location.search)
  const paramKey = params.get('id')
  const resolved = resolveCategoryKey(stateKey || paramKey || categoryKey.value)
  categoryKey.value = resolved
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', handlePopState)
  }
})

// CategoryView 业务逻辑
const { getSitesByCategory, addSite, updateSite, deleteSite } = useSiteManager()

const currentCategory = computed(() => getCategoryByKey(categoryKey.value))
const currentSites = computed(() => getSitesByCategory(categoryKey.value))

// 模态框状态
const showFormModal = ref(false)
const editingSite = ref(null)
const showDeleteModal = ref(false)
const deletingSite = ref(null)

// 添加网站
const openAddModal = () => {
  editingSite.value = null
  showFormModal.value = true
}

// 编辑网站
const openEditModal = (site) => {
  editingSite.value = site
  showFormModal.value = true
}

// 关闭表单模态框
const closeFormModal = () => {
  showFormModal.value = false
  editingSite.value = null
}

// 提交表单
const handleFormSubmit = async (formData) => {
  if (formData.id && editingSite.value?.isCustom) {
    await updateSite(categoryKey.value, formData.id, formData)
  } else {
    await addSite(categoryKey.value, {
      name: formData.name,
      url: formData.url,
      desc: formData.desc
    })
  }
}

// 删除网站
const openDeleteModal = (site) => {
  deletingSite.value = site
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (deletingSite.value) {
    await deleteSite(categoryKey.value, deletingSite.value.id)
  }
  showDeleteModal.value = false
  deletingSite.value = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deletingSite.value = null
}
</script>

<template>
  <AppLayout
    :title="title"
    active-page="category"
    :active-category="categoryKey"
    @select-category="handleSidebarSelect"
  >
    <div class="content-wrapper max-w-[1200px] mx-auto">
      <!-- 分类标题 -->
      <div
        class="category-header mb-8 flex items-end justify-between border-b border-gray-800 pb-4"
      >
        <div>
          <h1 class="text-2xl font-semibold text-white tracking-tight mb-1">
            {{ currentCategory?.label }}
          </h1>
          <p class="text-sm text-gray-500">
            Manage your {{ currentCategory?.label?.toLowerCase() }} links.
          </p>
        </div>

        <button class="btn-primary flex items-center gap-2" @click="openAddModal">
          <Icon icon="mdi:plus" class="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      <!-- 网站卡片网格 -->
      <div class="sites-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <SiteCard
          v-for="site in currentSites"
          :key="site.id || site.url"
          :site="site"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />

        <!-- 添加卡片 -->
        <div
          class="add-card border-2 border-dashed border-gray-600 hover:border-green-500 rounded-lg p-5 cursor-pointer transition-all flex-center flex-col gap-2 min-h-[140px] group bg-black"
          @click="openAddModal"
        >
          <Icon
            icon="mdi:plus"
            class="w-5 h-5 text-gray-600 group-hover:text-matrix transition-colors"
          />
          <span class="text-sm text-gray-600 group-hover:text-matrix transition-colors font-medium">
            Add Shortcut
          </span>
        </div>
      </div>

      <!-- 模态框 -->
      <SiteFormModal
        :visible="showFormModal"
        :site="editingSite"
        :category-label="currentCategory?.label"
        @close="closeFormModal"
        @submit="handleFormSubmit"
      />

      <ConfirmModal
        :visible="showDeleteModal"
        type="danger"
        title="删除网站"
        :message="`确定要删除「${deletingSite?.name}」吗？`"
        confirm-text="删除"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />
    </div>
  </AppLayout>
</template>
