<script setup>
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import CategoryView from '@/views/CategoryView.vue'
import { getCategoryByKey } from '@/data/sites'

const categoryKey = 'search'
const title = computed(() => getCategoryByKey(categoryKey)?.label || 'Overview')
</script>

<template>
  <AppLayout :title="title" active-page="category" :active-category="categoryKey">
    <CategoryView :category-key="categoryKey" />
  </AppLayout>
</template>
