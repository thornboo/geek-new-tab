<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const props = defineProps({
  title: { type: String, default: 'Overview' },
  activePage: { type: String, default: 'category' }, // category | settings | data | about
  activeCategory: { type: String, default: '' }
})

const emit = defineEmits(['select-category'])

const isMobile = ref(false)
const isSidebarOpen = ref(true)

const evaluateLayout = () => {
  if (typeof window === 'undefined') return
  const mobile = window.innerWidth < 1024
  if (mobile !== isMobile.value) {
    isMobile.value = mobile
    isSidebarOpen.value = mobile ? false : true
  } else if (!mobile) {
    isSidebarOpen.value = true
  }
}

const toggleSidebar = () => {
  if (!isMobile.value) return
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  if (!isMobile.value) return
  isSidebarOpen.value = false
}

const handleCategorySelect = (key) => {
  emit('select-category', key)
  closeSidebar()
}

onMounted(() => {
  evaluateLayout()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', evaluateLayout)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', evaluateLayout)
  }
})
</script>

<template>
  <div class="layout relative w-full min-h-screen flex app-bg text-gray-200">
    <!-- 侧边栏 -->
    <AppSidebar
      :active-page="props.activePage"
      :active-category="props.activeCategory"
      :class="[
        'transition-transform transform-gpu will-change-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none',
        isMobile ? 'fixed inset-y-0 left-0 z-50 bg-black shadow-matrix' : '',
        isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''
      ]"
      @navigate-category="handleCategorySelect"
    />

    <!-- 移动端遮罩 -->
    <Transition name="overlay-fade">
      <div
        v-if="isMobile && isSidebarOpen"
        class="fixed inset-0 bg-black/70 z-40 lg:hidden"
        @click="closeSidebar"
      />
    </Transition>

    <!-- 右侧区域 -->
    <div class="flex-1 flex flex-col overflow-hidden relative z-10">
      <!-- 顶部栏 -->
      <AppHeader
        :title="props.title"
        :show-sidebar-toggle="isMobile"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- 主内容区 -->
      <main class="main-content flex-1 overflow-y-auto p-6 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  position: relative;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
