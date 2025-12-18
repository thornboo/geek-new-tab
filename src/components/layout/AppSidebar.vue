<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getMenuItems } from '@/data/sites'

const route = useRoute()
const router = useRouter()

// 菜单项
const menuItems = computed(() => getMenuItems())

// 当前激活的分类
const activeCategory = computed(() => route.params.id || '')

// 导航到分类
const navigateToCategory = (key) => {
  router.push({ name: 'Category', params: { id: key } })
}

// 检查是否为特定页面
const isSettingsPage = computed(() => route.name === 'Settings')
const isDataPage = computed(() => route.name === 'Data')
const isAboutPage = computed(() => route.name === 'About')
</script>

<template>
  <aside class="sidebar w-64 h-full bg-black layout-border flex flex-col pt-6 pb-4">
    <!-- Logo -->
    <router-link to="/" class="px-6 mb-8 flex items-center gap-3 no-underline group">
      <div class="w-8 h-8 rounded border border-gray-700 bg-black flex-center group-hover:border-matrix group-hover:shadow-matrix transition-all">
        <Icon icon="mdi:matrix" class="w-5 h-5 text-matrix" />
      </div>
      <span class="font-bold text-lg tracking-tight text-white">GeekTab</span>
    </router-link>

    <!-- 菜单列表 -->
    <nav class="menu flex-1 flex flex-col gap-1 px-3">
      <div class="px-3 mb-2 text-xs text-gray-600 uppercase tracking-wider">Navigation</div>

      <div
        v-for="item in menuItems"
        :key="item.key"
        class="menu-item flex items-center px-3 py-2 rounded cursor-pointer transition-all duration-200"
        :class="activeCategory === item.key
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'"
        @click="navigateToCategory(item.key)"
      >
        <Icon
          :icon="item.icon"
          class="w-4 h-4 mr-3"
          :class="activeCategory === item.key ? 'text-matrix' : 'text-gray-600'"
        />
        <span class="text-sm">{{ item.label }}</span>
      </div>
    </nav>

    <!-- 底部导航 -->
    <div class="footer px-3 mt-auto border-t border-gray-800 pt-3 space-y-1">
      <!-- 数据管理 -->
      <router-link
        to="/data"
        class="w-full flex items-center px-3 py-2 rounded transition-all group no-underline"
        :class="isDataPage
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'bg-transparent hover:bg-white/5 border-l-2 border-transparent'"
      >
        <Icon
          icon="mdi:database"
          class="w-4 h-4 mr-3 transition-colors"
          :class="isDataPage ? 'text-matrix' : 'text-gray-600 group-hover:text-white'"
        />
        <span
          class="text-sm"
          :class="isDataPage ? 'text-matrix' : 'text-gray-400 group-hover:text-white'"
        >
          Data
        </span>
      </router-link>

      <!-- 设置 -->
      <router-link
        to="/settings"
        class="w-full flex items-center px-3 py-2 rounded transition-all group no-underline"
        :class="isSettingsPage
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'bg-transparent hover:bg-white/5 border-l-2 border-transparent'"
      >
        <Icon
          icon="mdi:cog"
          class="w-4 h-4 mr-3 transition-colors"
          :class="isSettingsPage ? 'text-matrix' : 'text-gray-600 group-hover:text-white'"
        />
        <span
          class="text-sm"
          :class="isSettingsPage ? 'text-matrix' : 'text-gray-400 group-hover:text-white'"
        >
          Settings
        </span>
      </router-link>

      <!-- 关于 -->
      <router-link
        to="/about"
        class="w-full flex items-center px-3 py-2 rounded transition-all group no-underline"
        :class="isAboutPage
          ? 'bg-matrix/10 text-matrix border-l-2 border-matrix'
          : 'bg-transparent hover:bg-white/5 border-l-2 border-transparent'"
      >
        <Icon
          icon="mdi:information"
          class="w-4 h-4 mr-3 transition-colors"
          :class="isAboutPage ? 'text-matrix' : 'text-gray-600 group-hover:text-white'"
        />
        <span
          class="text-sm"
          :class="isAboutPage ? 'text-matrix' : 'text-gray-400 group-hover:text-white'"
        >
          About
        </span>
      </router-link>
    </div>
  </aside>
</template>
