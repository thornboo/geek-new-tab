<script setup>
import { Icon } from '@iconify/vue'
import { getMenuItems } from '@/data/sites'

const props = defineProps({
  activeCategory: { type: String, default: '' },
  activePage: { type: String, default: 'category' } // category | settings | data | about
})

const emit = defineEmits(['navigate-category'])

// 菜单项
const menuItems = getMenuItems()

const handleCategoryClick = (event, key) => {
  if (props.activePage !== 'category') return
  if (event.defaultPrevented) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
  event.preventDefault()
  if (key === props.activeCategory) return
  emit('navigate-category', key)
}
</script>

<template>
  <aside class="sidebar w-64 h-full bg-black layout-border flex flex-col pt-6 pb-4 overflow-y-auto">
    <!-- Logo -->
    <a href="/" class="px-6 mb-8 flex items-center gap-3 no-underline group">
      <div class="w-8 h-8 rounded border border-gray-700 bg-black flex-center group-hover:border-matrix group-hover:shadow-matrix transition-all">
        <Icon icon="mdi:matrix" class="w-5 h-5 text-matrix" />
      </div>
      <span class="font-bold text-lg tracking-tight text-white">GeekTab</span>
    </a>

    <!-- 菜单列表 -->
    <nav class="menu flex-1 flex flex-col gap-1 px-3">
      <div class="px-3 mb-2 text-xs text-gray-600 uppercase tracking-wider">Navigation</div>

      <a
        v-for="item in menuItems"
        :key="item.key"
        :href="`/category/${encodeURIComponent(item.key)}/`"
        class="menu-item flex items-center px-3 py-2 rounded cursor-pointer transition-all duration-200"
        :class="props.activeCategory === item.key
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'"
        @click="handleCategoryClick($event, item.key)"
      >
        <Icon
          :icon="item.icon"
          class="w-4 h-4 mr-3"
          :class="props.activeCategory === item.key ? 'text-matrix' : 'text-gray-600'"
        />
        <span class="text-sm">{{ item.label }}</span>
      </a>
    </nav>

    <!-- 底部导航 -->
    <div class="footer px-3 mt-auto border-t border-gray-800 pt-3 space-y-1">
      <!-- 数据管理 -->
      <a
        href="/data/"
        class="w-full flex items-center px-3 py-2 rounded transition-all group no-underline"
        :class="props.activePage === 'data'
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'bg-transparent hover:bg-white/5 border-l-2 border-transparent'"
      >
        <Icon
          icon="mdi:database"
          class="w-4 h-4 mr-3 transition-colors"
          :class="props.activePage === 'data' ? 'text-matrix' : 'text-gray-600 group-hover:text-white'"
        />
        <span
          class="text-sm"
          :class="props.activePage === 'data' ? 'text-matrix' : 'text-gray-400 group-hover:text-white'"
        >
          Data
        </span>
      </a>

      <!-- 设置 -->
      <a
        href="/settings/"
        class="w-full flex items-center px-3 py-2 rounded transition-all group no-underline"
        :class="props.activePage === 'settings'
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'bg-transparent hover:bg-white/5 border-l-2 border-transparent'"
      >
        <Icon
          icon="mdi:cog"
          class="w-4 h-4 mr-3 transition-colors"
          :class="props.activePage === 'settings' ? 'text-matrix' : 'text-gray-600 group-hover:text-white'"
        />
        <span
          class="text-sm"
          :class="props.activePage === 'settings' ? 'text-matrix' : 'text-gray-400 group-hover:text-white'"
        >
          Settings
        </span>
      </a>

      <!-- 关于 -->
      <a
        href="/about/"
        class="w-full flex items-center px-3 py-2 rounded transition-all group no-underline"
        :class="props.activePage === 'about'
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'bg-transparent hover:bg-white/5 border-l-2 border-transparent'"
      >
        <Icon
          icon="mdi:information"
          class="w-4 h-4 mr-3 transition-colors"
          :class="props.activePage === 'about' ? 'text-matrix' : 'text-gray-600 group-hover:text-white'"
        />
        <span
          class="text-sm"
          :class="props.activePage === 'about' ? 'text-matrix' : 'text-gray-400 group-hover:text-white'"
        >
          About
        </span>
      </a>
    </div>
  </aside>
</template>
