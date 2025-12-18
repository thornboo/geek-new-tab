<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoryByKey } from '@/data/sites'

const route = useRoute()

// 页面标题映射
const pageTitles = {
  Settings: 'Settings',
  Data: 'Data Management',
  About: 'About'
}

// 当前页面标题
const currentTitle = computed(() => {
  if (route.name === 'Category') {
    const category = getCategoryByKey(route.params.id)
    return category?.label || 'Overview'
  }
  return pageTitles[route.name] || 'Overview'
})
</script>

<template>
  <header class="header h-14 flex items-center px-8 bg-black/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
    <!-- 左侧面包屑 -->
    <div class="left flex items-center gap-2 text-sm font-mono">
      <span class="text-gray-600">root@geektab</span>
      <span class="text-gray-500">:</span>
      <span class="text-gray-600">~</span>
      <span class="text-gray-500">/</span>
      <span class="text-matrix">{{ currentTitle }}</span>
      <span class="text-matrix cursor-blink"></span>
    </div>
  </header>
</template>
