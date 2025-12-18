<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: '28'
  }
})

const faviconLoaded = ref(false)
const faviconError = ref(false)
const currentFaviconIndex = ref(0)

// 从 URL 提取域名
const domain = computed(() => {
  try {
    return new URL(props.url).hostname
  } catch {
    return ''
  }
})

// 多个 Favicon 源，按优先级排列
const faviconSources = computed(() => {
  if (!domain.value) return []
  return [
    // 直接从网站获取 favicon
    `https://${domain.value}/favicon.ico`,
    // DuckDuckGo（国内可访问）
    `https://icons.duckduckgo.com/ip3/${domain.value}.ico`,
    // Google（备用）
    `https://www.google.com/s2/favicons?domain=${domain.value}&sz=64`,
    // Favicon.im
    `https://favicon.im/${domain.value}`,
  ]
})

// 当前使用的 favicon URL
const currentFaviconUrl = computed(() => {
  return faviconSources.value[currentFaviconIndex.value] || ''
})

// 是否应该尝试使用 Iconify 图标
const shouldUseIconify = computed(() => {
  return props.icon && props.icon.includes(':')
})

// 是否应该使用 Favicon
const shouldUseFavicon = computed(() => {
  return !shouldUseIconify.value && currentFaviconUrl.value && !faviconError.value
})

// 处理 favicon 加载成功
const handleFaviconLoad = () => {
  faviconLoaded.value = true
}

// 处理 favicon 加载失败，尝试下一个源
const handleFaviconError = () => {
  if (currentFaviconIndex.value < faviconSources.value.length - 1) {
    currentFaviconIndex.value++
    faviconLoaded.value = false
  } else {
    faviconError.value = true
  }
}

// 获取首字母作为最终 fallback
const initial = computed(() => {
  try {
    const hostname = new URL(props.url).hostname
    return hostname.replace('www.', '').charAt(0).toUpperCase()
  } catch {
    return '?'
  }
})

// 重置状态当 props 变化时
watch(() => props.url, () => {
  faviconLoaded.value = false
  faviconError.value = false
  currentFaviconIndex.value = 0
})
</script>

<template>
  <div class="site-icon" :style="{ width: `${size}px`, height: `${size}px` }">
    <!-- 优先使用 Iconify 图标 -->
    <Icon
      v-if="shouldUseIconify"
      :icon="icon"
      class="w-full h-full"
    />

    <!-- 使用 Favicon -->
    <template v-else-if="shouldUseFavicon">
      <!-- 加载中显示骨架 -->
      <div
        v-if="!faviconLoaded"
        class="skeleton w-full h-full rounded bg-gray-200 animate-pulse"
      />
      <!-- Favicon 图片 -->
      <img
        :key="currentFaviconUrl"
        :src="currentFaviconUrl"
        :alt="domain"
        class="w-full h-full object-contain rounded"
        :class="{ 'opacity-0 absolute': !faviconLoaded }"
        @load="handleFaviconLoad"
        @error="handleFaviconError"
        referrerpolicy="no-referrer"
      />
    </template>

    <!-- 最终 fallback：显示首字母 -->
    <div
      v-else
      class="fallback w-full h-full rounded-lg bg-primary/10 flex-center text-primary font-medium"
      :style="{ fontSize: `${parseInt(size) * 0.5}px` }"
    >
      {{ initial }}
    </div>
  </div>
</template>

<style scoped>
.site-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
