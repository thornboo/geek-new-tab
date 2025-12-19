<script setup>
import { Icon } from '@iconify/vue'
import SiteIcon from './SiteIcon.vue'

const props = defineProps({
  site: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const openSite = (e) => {
  if (e.target.closest('.action-btn')) return
  window.open(props.site.url, '_blank')
}

const handleEdit = (e) => {
  e.stopPropagation()
  emit('edit', props.site)
}

const handleDelete = (e) => {
  e.stopPropagation()
  emit('delete', props.site)
}
</script>

<template>
  <div
    class="site-card group"
    @click="openSite"
  >
    <!-- 右上角操作按钮 -->
    <div class="action-buttons absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
      <button
        class="w-7 h-7 rounded bg-black border border-gray-700 hover:border-matrix flex items-center justify-center transition-all text-gray-400 hover:text-matrix"
        title="编辑"
        @click.stop="handleEdit"
      >
        <Icon icon="mdi:pencil" class="w-3.5 h-3.5" />
      </button>
      <button
        v-if="site.isCustom"
        class="w-7 h-7 rounded bg-black border border-gray-700 hover:border-red-500 flex items-center justify-center transition-all text-gray-400 hover:text-red-400"
        title="删除"
        @click.stop="handleDelete"
      >
        <Icon icon="mdi:delete" class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- 图标 -->
    <div class="mb-4">
      <div class="w-10 h-10 rounded border border-gray-700 bg-black flex-center group-hover:border-matrix transition-all">
        <SiteIcon :icon="site.icon" :url="site.url" size="20" class="opacity-80 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>

    <!-- 信息 -->
    <div class="info flex-1 min-w-0">
      <h3 class="name text-sm font-medium text-gray-200 mb-1 group-hover:text-matrix transition-all flex items-center gap-2">
        {{ site.name }}
        <Icon v-if="site.isCustom" icon="mdi:circle-small" class="w-4 h-4 text-gray-600" />
      </h3>
      <p class="desc text-xs text-gray-500 line-clamp-2 h-8 leading-4 group-hover:text-gray-400 transition-colors">
        {{ site.desc || 'No description provided.' }}
      </p>
    </div>
  </div>
</template>
