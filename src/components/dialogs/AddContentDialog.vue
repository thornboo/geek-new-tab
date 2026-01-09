<script setup lang="ts">
import { reactive, ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore, useSiteStore } from '@/stores'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  open: boolean
  editingSiteIndex?: number | null
  editingCategoryKey?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'site-saved'): void
  (e: 'category-saved'): void
}>()

const categoryStore = useCategoryStore()
const siteStore = useSiteStore()

const { activeCategory, currentSites } = storeToRefs(categoryStore)

const activeTab = ref<string>('site')
const siteTitleRef = ref<HTMLInputElement | null>(null)
const categoryLabelRef = ref<HTMLInputElement | null>(null)

const siteForm = reactive({
  title: '',
  url: '',
  icon: '',
  desc: '',
  tags: ''
})

const categoryForm = reactive({
  key: '',
  label: ''
})

// Computed
const isEditingSite = computed(() => props.editingSiteIndex !== null && props.editingSiteIndex !== undefined)
const isEditingCategory = computed(() => props.editingCategoryKey !== null && props.editingCategoryKey !== undefined)
const dialogTitle = computed(() => {
  if (isEditingSite.value) return '编辑网站'
  if (isEditingCategory.value) return '编辑分类'
  return '添加内容'
})

// Methods
const resetSiteForm = () => {
  siteForm.title = ''
  siteForm.url = ''
  siteForm.icon = ''
  siteForm.desc = ''
  siteForm.tags = ''
}

const resetCategoryForm = () => {
  categoryForm.key = ''
  categoryForm.label = ''
}

const closeDialog = () => {
  emit('update:open', false)
  resetSiteForm()
  resetCategoryForm()
}

const commitNewSite = async () => {
  const title = siteForm.title.trim()
  const url = siteForm.url.trim()
  if (!title || !url) {
    window.alert('标题和链接不能为空')
    return
  }

  const icon = siteForm.icon.trim() || 'mdi:web'
  const tags = siteForm.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (isEditingSite.value && props.editingSiteIndex !== null) {
    await siteStore.updateSite(activeCategory.value, props.editingSiteIndex, {
      name: title,
      url,
      icon,
      desc: siteForm.desc.trim(),
      tags
    })
  } else {
    await siteStore.addSite(activeCategory.value, {
      name: title,
      url,
      icon,
      desc: siteForm.desc.trim(),
      tags
    })
  }

  emit('site-saved')
  closeDialog()
}

const commitNewCategory = async () => {
  const key = categoryForm.key.trim()
  const label = categoryForm.label.trim()
  if (!key || !label) {
    window.alert('键值和名称不能为空')
    return
  }
  if (isEditingCategory.value && props.editingCategoryKey) {
    await categoryStore.updateCategory(props.editingCategoryKey, { label })
    emit('category-saved')
    closeDialog()
    return
  }
  if (categoryStore.hasCategory(key)) {
    window.alert('该键值已存在')
    return
  }
  await categoryStore.addCategory({ key, label })
  emit('category-saved')
  closeDialog()
}

// Watch for editing mode changes
watch(() => props.editingSiteIndex, async (index) => {
  if (index !== null && index !== undefined) {
    const site = currentSites.value[index]
    if (site) {
      siteForm.title = site.name
      siteForm.url = site.url
      siteForm.icon = site.icon || ''
      siteForm.desc = site.desc || ''
      siteForm.tags = (site.tags || []).join(', ')
      activeTab.value = 'site'
      await nextTick()
      siteTitleRef.value?.focus()
    }
  }
}, { immediate: true })

watch(() => props.editingCategoryKey, async (key) => {
  if (key) {
    const category = categoryStore.getCategory(key)
    if (category) {
      categoryForm.key = category.key
      categoryForm.label = category.label
      activeTab.value = 'category'
      await nextTick()
      categoryLabelRef.value?.focus()
    }
  }
}, { immediate: true })

watch(() => props.open, async (isOpen) => {
  if (isOpen && !isEditingSite.value && !isEditingCategory.value) {
    activeTab.value = 'site'
    resetSiteForm()
    resetCategoryForm()
    await nextTick()
    siteTitleRef.value?.focus()
  }
})
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[450px]">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="site" :disabled="isEditingCategory">
            添加网站
          </TabsTrigger>
          <TabsTrigger value="category" :disabled="isEditingSite">
            添加分类
          </TabsTrigger>
        </TabsList>

        <!-- Site Tab -->
        <TabsContent value="site" class="space-y-4 mt-4">
          <div class="space-y-2">
            <Label>标题</Label>
            <Input
              ref="siteTitleRef"
              v-model="siteForm.title"
              placeholder="例如：GitHub"
            />
          </div>

          <div class="space-y-2">
            <Label>链接</Label>
            <Input
              v-model="siteForm.url"
              placeholder="https://..."
            />
          </div>

          <div class="space-y-2">
            <Label>图标</Label>
            <Input
              v-model="siteForm.icon"
              placeholder="图标代码 (例如 mdi:web)"
            />
          </div>

          <div class="space-y-2">
            <Label>描述</Label>
            <Input
              v-model="siteForm.desc"
              placeholder="网站描述"
            />
          </div>

          <div class="space-y-2">
            <Label>标签</Label>
            <Input
              v-model="siteForm.tags"
              placeholder="用逗号分隔，例如：工具, 设计"
            />
          </div>

          <Button class="w-full" @click="commitNewSite">
            {{ isEditingSite ? '保存修改' : '确认添加' }}
          </Button>
        </TabsContent>

        <!-- Category Tab -->
        <TabsContent value="category" class="space-y-4 mt-4">
          <div class="space-y-2">
            <Label>键值</Label>
            <Input
              v-model="categoryForm.key"
              :disabled="isEditingCategory"
              placeholder="例如：design"
            />
          </div>

          <div class="space-y-2">
            <Label>名称</Label>
            <Input
              ref="categoryLabelRef"
              v-model="categoryForm.label"
              placeholder="例如：设计"
            />
          </div>

          <Button class="w-full" @click="commitNewCategory">
            {{ isEditingCategory ? '保存修改' : '确认添加' }}
          </Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
