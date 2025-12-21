# 组件化架构设计

> 从原型单文件到模块化 Vue 组件的完整设计方案

## 目录

- [设计原则](#设计原则)
- [组件分层架构](#组件分层架构)
- [目录结构](#目录结构)
- [核心组件设计](#核心组件设计)
- [Composables 设计](#composables-设计)
- [组件通信规范](#组件通信规范)
- [最佳实践](#最佳实践)

---

## 设计原则

### SOLID 原则应用

| 原则 | 在组件中的体现 |
|------|---------------|
| **S - 单一职责** | 每个组件只负责一个功能 (SiteCard 只展示网站卡片) |
| **O - 开闭原则** | 通过 props/slots 扩展,不修改组件内部 |
| **L - 里氏替换** | 同类组件可互换 (不同风格的 Card 组件) |
| **I - 接口隔离** | Props 精简,避免"胖接口" |
| **D - 依赖倒置** | 依赖抽象 (Composables) 而非具体实现 |

### 组件设计原则

1. **纯展示组件 (Presentational)**
   - 只负责 UI 渲染
   - 通过 props 接收数据
   - 通过 emits 发送事件
   - 无状态管理逻辑

2. **容器组件 (Container)**
   - 负责数据获取和业务逻辑
   - 使用 Pinia Store
   - 组合纯展示组件
   - 处理用户交互

3. **复合组件 (Composite)**
   - 组合多个子组件
   - 协调子组件交互
   - 提供统一接口

---

## 组件分层架构

```
┌─────────────────────────────────────────┐
│           Pages (页面级)                 │
│  - CategoryPage.vue                     │
│  - SettingsPage.vue                     │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│   Layouts   │  │   Widgets   │  (布局 + 复合组件)
│  (容器组件)  │  │  (业务组件)  │
└──────┬──────┘  └──────┬──────┘
       │                │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  UI Components │  (纯展示组件)
       │  - SiteCard    │
       │  - SearchBar   │
       └────────────────┘
```

---

## 目录结构

### 完整结构

```
src/
├── components/
│   ├── layout/              # 布局组件 (容器)
│   │   ├── AppLayout.vue
│   │   ├── AppHeader.vue
│   │   ├── AppSidebar.vue
│   │   └── AppFooter.vue
│   │
│   ├── ui/                  # UI 组件 (纯展示)
│   │   ├── button/
│   │   │   ├── Button.vue
│   │   │   └── IconButton.vue
│   │   ├── card/
│   │   │   ├── SiteCard.vue
│   │   │   ├── SiteCardFlip.vue  # 翻转卡片变体
│   │   │   └── SiteCardCompact.vue
│   │   ├── input/
│   │   │   ├── SearchBar.vue
│   │   │   ├── TextInput.vue
│   │   │   └── ColorPicker.vue
│   │   ├── icon/
│   │   │   └── SiteIcon.vue
│   │   ├── tabs/
│   │   │   ├── CategoryTab.vue
│   │   │   └── SettingsTabs.vue
│   │   └── empty/
│   │       └── EmptyState.vue
│   │
│   ├── modals/              # 弹窗组件
│   │   ├── BaseModal.vue         # 基础弹窗
│   │   ├── SiteFormModal.vue     # 网站表单
│   │   ├── CategoryFormModal.vue # 分类表单
│   │   ├── SettingsModal.vue     # 设置弹窗
│   │   └── ConfirmModal.vue      # 确认对话框
│   │
│   └── widgets/             # 复合组件
│       ├── SiteGrid.vue          # 网站网格
│       ├── SiteList.vue          # 网站列表
│       ├── TopSites.vue          # 热门网站
│       ├── RecentVisits.vue      # 最近访问
│       ├── SearchResults.vue     # 搜索结果
│       └── CategoryNav.vue       # 分类导航
│
├── composables/             # 组合式函数
│   ├── useModal.ts               # 弹窗管理
│   ├── useKeyboard.ts            # 键盘快捷键
│   ├── useTheme.ts               # 主题管理
│   ├── useClipboard.ts           # 剪贴板
│   └── useDragDrop.ts            # 拖拽功能
│
└── pages/                   # 页面组装
    ├── CategoryPage.vue
    ├── SettingsPage.vue
    ├── DataPage.vue
    └── AboutPage.vue
```

---

## 核心组件设计

### 1. SiteCard (网站卡片)

**职责:** 展示单个网站的信息

**Props 设计:**

```typescript
// components/ui/card/SiteCard.vue
<script setup lang="ts">
import type { Site } from '@/types'

interface Props {
  site: Site               // 网站数据
  variant?: 'default' | 'compact' | 'flip'  // 卡片样式
  showStats?: boolean      // 是否显示统计
  clickable?: boolean      // 是否可点击
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showStats: true,
  clickable: true
})

interface Emits {
  (e: 'click', site: Site): void
  (e: 'edit', site: Site): void
  (e: 'delete', site: Site): void
}

const emit = defineEmits<Emits>()

// 点击处理
function handleClick() {
  if (!props.clickable) return
  emit('click', props.site)
}

// 编辑
function handleEdit(e: Event) {
  e.stopPropagation()
  emit('edit', props.site)
}

// 删除
function handleDelete(e: Event) {
  e.stopPropagation()
  emit('delete', props.site)
}
</script>

<template>
  <div
    class="site-card"
    :class="[`site-card--${variant}`, { 'site-card--clickable': clickable }]"
    @click="handleClick"
  >
    <!-- 图标 -->
    <SiteIcon :icon="site.icon" :name="site.name" />

    <!-- 标题 -->
    <h3 class="site-card__title">{{ site.name }}</h3>

    <!-- 描述 (可选) -->
    <p v-if="site.desc" class="site-card__desc">
      {{ site.desc }}
    </p>

    <!-- 标签 -->
    <div v-if="site.tags?.length" class="site-card__tags">
      <span
        v-for="tag in site.tags"
        :key="tag"
        class="site-card__tag"
      >
        {{ tag }}
      </span>
    </div>

    <!-- 统计信息 -->
    <div v-if="showStats && site.visitCount" class="site-card__stats">
      <span>访问 {{ site.visitCount }} 次</span>
    </div>

    <!-- 操作按钮 -->
    <div class="site-card__actions">
      <IconButton icon="mdi:pencil" @click="handleEdit" />
      <IconButton icon="mdi:delete" variant="danger" @click="handleDelete" />
    </div>
  </div>
</template>

<style scoped>
.site-card {
  position: relative;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.site-card--clickable {
  cursor: pointer;
}

.site-card--clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.site-card--compact {
  padding: 1rem;
}

.site-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.75rem;
}

.site-card__desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.site-card__tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.site-card__tag {
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
}

.site-card__actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.site-card:hover .site-card__actions {
  opacity: 1;
}
</style>
```

---

### 2. SearchBar (搜索栏)

**职责:** 提供搜索输入和结果展示

```typescript
// components/ui/input/SearchBar.vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSearchStore } from '@/stores'
import { useKeyboard } from '@/composables/useKeyboard'

interface Props {
  placeholder?: string
  autofocus?: boolean
  showShortcut?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索网站...',
  autofocus: false,
  showShortcut: true
})

interface Emits {
  (e: 'search', query: string): void
  (e: 'select', result: any): void
}

const emit = defineEmits<Emits>()

const searchStore = useSearchStore()
const inputRef = ref<HTMLInputElement>()

// 键盘快捷键
useKeyboard({
  '/': () => inputRef.value?.focus(),
  'Escape': () => searchStore.clear()
})

// 输入处理 (防抖)
import { useDebounceFn } from '@vueuse/core'

const handleInput = useDebounceFn((e: Event) => {
  const query = (e.target as HTMLInputElement).value
  searchStore.search(query)
  emit('search', query)
}, 300)

// 选择结果
function handleSelect(result: any) {
  emit('select', result)
  searchStore.addToHistory(searchStore.query)
  searchStore.clear()
}

// 键盘导航
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    searchStore.moveActiveIndex(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    searchStore.moveActiveIndex(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (searchStore.activeResult) {
      handleSelect(searchStore.activeResult)
    }
  }
}
</script>

<template>
  <div class="search-bar">
    <div class="search-bar__input-wrapper">
      <span class="search-bar__prompt">&gt;</span>

      <input
        ref="inputRef"
        type="text"
        class="search-bar__input"
        :placeholder="placeholder"
        :autofocus="autofocus"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <div v-if="showShortcut" class="search-bar__shortcut">
        <kbd>/</kbd>
      </div>
    </div>

    <!-- 搜索结果下拉 -->
    <Transition name="fade">
      <div v-if="searchStore.hasResults" class="search-bar__results">
        <div
          v-for="(result, index) in searchStore.results"
          :key="result.site.id"
          class="search-bar__result-item"
          :class="{ 'is-active': index === searchStore.activeIndex }"
          @click="handleSelect(result)"
        >
          <SiteIcon :icon="result.site.icon" :name="result.site.name" size="sm" />
          <div class="search-bar__result-info">
            <div class="search-bar__result-name">{{ result.site.name }}</div>
            <div class="search-bar__result-desc">{{ result.site.desc }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 样式省略 */
</style>
```

---

### 3. SiteGrid (网站网格 - 复合组件)

**职责:** 展示网站卡片网格,处理加载和空状态

```typescript
// components/widgets/SiteGrid.vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSiteStore, useCategoryStore } from '@/stores'
import { storeToRefs } from 'pinia'
import SiteCard from '@/components/ui/card/SiteCard.vue'
import EmptyState from '@/components/ui/empty/EmptyState.vue'

interface Props {
  categoryKey?: string  // 指定分类,为空则显示全部
  layout?: 'grid' | 'list'
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  columns: 4
})

const siteStore = useSiteStore()
const categoryStore = useCategoryStore()
const { loading } = storeToRefs(siteStore)

// 获取要展示的网站
const sites = computed(() => {
  const key = props.categoryKey || categoryStore.activeCategory
  return siteStore.getSitesByCategory(key)
})

// 点击网站卡片
function handleSiteClick(site: any) {
  // 记录访问
  siteStore.trackVisit(site.category, site.id)
  // 打开链接
  window.open(site.url, '_blank')
}

// 编辑网站
function handleEdit(site: any) {
  // TODO: 打开编辑弹窗
}

// 删除网站
function handleDelete(site: any) {
  // TODO: 确认删除
}
</script>

<template>
  <div class="site-grid">
    <!-- 加载状态 -->
    <div v-if="loading" class="site-grid__loading">
      <div class="spinner" />
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <EmptyState
      v-else-if="sites.length === 0"
      icon="mdi:folder-open-outline"
      title="暂无网站"
      description="这个分类还没有添加任何网站"
    >
      <template #action>
        <Button @click="$emit('add-site')">
          添加第一个网站
        </Button>
      </template>
    </EmptyState>

    <!-- 网站列表 -->
    <div
      v-else
      class="site-grid__list"
      :class="`site-grid__list--${layout}`"
      :style="{ '--columns': columns }"
    >
      <SiteCard
        v-for="site in sites"
        :key="site.id"
        :site="site"
        @click="handleSiteClick"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.site-grid__list--grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: 1rem;
}

.site-grid__list--list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 1024px) {
  .site-grid__list--grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .site-grid__list--grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
```

---

### 4. BaseModal (基础弹窗)

**职责:** 提供弹窗基础功能 (打开/关闭/遮罩)

```typescript
// components/modals/BaseModal.vue
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: string
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '500px',
  closeOnClickOutside: true,
  closeOnEscape: true
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// 关闭弹窗
function close() {
  emit('update:modelValue', false)
  emit('close')
}

// 点击遮罩
function handleOverlayClick() {
  if (props.closeOnClickOutside) {
    close()
  }
}

// ESC 键关闭
function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEscape) {
    close()
  }
}

// 监听键盘
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// 阻止 body 滚动
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="handleOverlayClick"
      >
        <div class="modal-content" :style="{ width }">
          <!-- 头部 -->
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="modal-close" @click="close">×</button>
          </div>

          <!-- 内容 -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 样式省略 */
</style>
```

---

## Composables 设计

### 1. useModal (弹窗管理)

```typescript
// composables/useModal.ts
import { ref } from 'vue'

export function useModal(initialState = false) {
  const isOpen = ref(initialState)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    open,
    close,
    toggle
  }
}
```

**使用示例:**

```vue
<script setup>
import { useModal } from '@/composables/useModal'

const siteFormModal = useModal()
const settingsModal = useModal()
</script>

<template>
  <Button @click="siteFormModal.open()">添加网站</Button>

  <SiteFormModal v-model="siteFormModal.isOpen" />
</template>
```

---

### 2. useKeyboard (键盘快捷键)

```typescript
// composables/useKeyboard.ts
import { onMounted, onUnmounted } from 'vue'

type KeyMap = Record<string, (e: KeyboardEvent) => void>

export function useKeyboard(keyMap: KeyMap) {
  function handleKeydown(e: KeyboardEvent) {
    // 忽略在输入框中的按键
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    const key = formatKey(e)
    const handler = keyMap[key]

    if (handler) {
      e.preventDefault()
      handler(e)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}

// 格式化按键
function formatKey(e: KeyboardEvent): string {
  const parts: string[] = []

  if (e.ctrlKey || e.metaKey) parts.push('ctrl')
  if (e.shiftKey) parts.push('shift')
  if (e.altKey) parts.push('alt')

  parts.push(e.key.toLowerCase())

  return parts.join('+')
}
```

**使用示例:**

```vue
<script setup>
import { useKeyboard } from '@/composables/useKeyboard'
import { useCategoryStore } from '@/stores'

const categoryStore = useCategoryStore()

useKeyboard({
  '/': () => focusSearch(),
  'ctrl+s': () => openSettings(),
  'ctrl+n': () => openAddSite(),
  'ctrl+arrowleft': () => categoryStore.prevCategory(),
  'ctrl+arrowright': () => categoryStore.nextCategory()
})
</script>
```

---

### 3. useTheme (主题管理)

```typescript
// composables/useTheme.ts
import { watch } from 'vue'
import { useSettingsStore } from '@/stores'
import { storeToRefs } from 'pinia'

export function useTheme() {
  const settingsStore = useSettingsStore()
  const { cssVariables, isDarkMode } = storeToRefs(settingsStore)

  // 应用主题
  function applyTheme() {
    const root = document.documentElement

    // 应用 CSS 变量
    Object.entries(cssVariables.value).forEach(([key, value]) => {
      root.style.setProperty(key, String(value))
    })

    // 应用暗色模式
    root.classList.toggle('dark', isDarkMode.value)
  }

  // 监听主题变化
  watch([cssVariables, isDarkMode], applyTheme, { immediate: true, deep: true })

  return {
    applyTheme
  }
}
```

---

## 组件通信规范

### 1. 父子组件通信

**Props Down, Events Up**

```vue
<!-- 父组件 -->
<SiteCard
  :site="site"
  :clickable="true"
  @click="handleClick"
  @edit="handleEdit"
  @delete="handleDelete"
/>

<!-- 子组件 -->
<script setup>
const props = defineProps<{ site: Site, clickable: boolean }>()
const emit = defineEmits<{
  (e: 'click', site: Site): void
  (e: 'edit', site: Site): void
  (e: 'delete', site: Site): void
}>()
</script>
```

---

### 2. 跨组件通信

**使用 Pinia Store**

```vue
<!-- 组件 A -->
<script setup>
import { useSiteStore } from '@/stores'

const siteStore = useSiteStore()
siteStore.addSite('dev', { name: 'GitHub', url: '...' })
</script>

<!-- 组件 B -->
<script setup>
import { useSiteStore } from '@/stores'
import { storeToRefs } from 'pinia'

const siteStore = useSiteStore()
const { customSites } = storeToRefs(siteStore)
// customSites 会自动响应变化
</script>
```

---

### 3. Provide/Inject (布局层)

```vue
<!-- AppLayout.vue -->
<script setup>
import { provide, ref } from 'vue'

const isSidebarCollapsed = ref(false)

provide('layout', {
  isSidebarCollapsed,
  toggleSidebar: () => isSidebarCollapsed.value = !isSidebarCollapsed.value
})
</script>

<!-- 子孙组件 -->
<script setup>
import { inject } from 'vue'

const layout = inject('layout')
</script>
```

---

## 最佳实践

### 1. 组件命名

```typescript
// ✅ 好的命名
SiteCard.vue          // 具体、描述性
SearchBar.vue
CategoryTab.vue

// ❌ 避免的命名
Card.vue              // 太泛化
Input.vue             // 不够具体
Item.vue              // 无意义
```

---

### 2. Props 设计

```typescript
// ✅ 好的 Props 设计
interface Props {
  site: Site               // 必需数据
  variant?: 'default' | 'compact'  // 可选变体
  showStats?: boolean      // 布尔开关
}

// ❌ 避免的 Props 设计
interface Props {
  data: any               // 类型不明确
  config: object          // 过于宽泛
  onClick: Function       // 应该用 emit
}
```

---

### 3. 插槽使用

```vue
<!-- 提供默认内容 + 自定义插槽 -->
<template>
  <div class="card">
    <slot name="header">
      <h3>{{ title }}</h3>
    </slot>

    <slot>
      <p>默认内容</p>
    </slot>

    <slot name="footer" />
  </div>
</template>
```

---

### 4. 样式作用域

```vue
<style scoped>
/* ✅ 使用 scoped 避免污染 */
.site-card {
  padding: 1rem;
}

/* ✅ 使用 CSS 变量实现主题 */
.site-card {
  background: var(--card-bg);
  color: var(--text-main);
}

/* ✅ 使用深度选择器修改子组件 */
:deep(.child-component) {
  color: red;
}
</style>
```

---

### 5. 性能优化

```vue
<script setup>
import { computed } from 'vue'

// ✅ 使用 computed 缓存计算结果
const sortedSites = computed(() => {
  return sites.value.sort((a, b) => b.visitCount - a.visitCount)
})

// ✅ v-once 优化静态内容
</script>

<template>
  <div v-once class="static-content">
    {{ staticText }}
  </div>

  <!-- ✅ v-memo 优化列表项 -->
  <SiteCard
    v-for="site in sites"
    :key="site.id"
    v-memo="[site.id, site.visitCount]"
    :site="site"
  />
</template>
```

---

## 总结

### 组件化收益

| 维度 | 收益 |
|------|------|
| **可维护性** | 组件职责清晰,易于定位问题 |
| **可复用性** | UI 组件跨页面复用 |
| **可测试性** | 纯展示组件易于单元测试 |
| **团队协作** | 组件边界明确,并行开发 |
| **性能优化** | 组件级别的懒加载和缓存 |

---

**相关文档:**

- [← 状态管理](./state-management.md)
- [数据持久化 →](./data-persistence.md)
