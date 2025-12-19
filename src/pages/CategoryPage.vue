<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import CategoryView from '@/views/CategoryView.vue'
import { getCategoryByKey } from '@/data/sites'

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
</script>

<template>
  <AppLayout
    :title="title"
    active-page="category"
    :active-category="categoryKey"
    @select-category="handleSidebarSelect"
  >
    <CategoryView :category-key="categoryKey" />
  </AppLayout>
</template>
