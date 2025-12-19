<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  title: { type: String, default: 'Overview' },
  showSidebarToggle: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-sidebar'])

const handleToggle = () => {
  emit('toggle-sidebar')
}
</script>

<template>
  <header class="header h-14 flex items-center px-4 md:px-8 bg-black/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40 gap-4">
    <button
      v-if="props.showSidebarToggle"
      class="lg:hidden w-10 h-10 border border-gray-700 rounded flex items-center justify-center text-gray-400 hover:text-white hover:border-matrix transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-matrix"
      aria-label="Toggle navigation"
      @click="handleToggle"
    >
      <Icon icon="mdi:menu" class="w-5 h-5" />
    </button>

    <!-- 左侧面包屑 -->
    <div class="left flex items-center gap-2 text-sm font-mono">
      <span class="text-gray-600">root@geektab</span>
      <span class="text-gray-500">:</span>
      <span class="text-gray-600">~</span>
      <span class="text-gray-500">/</span>
      <span class="text-matrix">{{ props.title }}</span>
      <span class="text-matrix cursor-blink"></span>
    </div>
  </header>
</template>
