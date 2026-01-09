<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore, useSiteStore, useCategoryStore } from '@/stores'
import { isConfigured as isSupabaseConfigured } from '@/lib/supabase'
import { clearStorage } from '@/lib/storage'
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
import { Slider } from '@/components/ui/slider'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const settingsStore = useSettingsStore()
const siteStore = useSiteStore()
const categoryStore = useCategoryStore()

const { appearance, locale } = storeToRefs(settingsStore)

const bookmarkFileRef = ref<HTMLInputElement | null>(null)

// Computed
const opacityLabel = computed(() => `${appearance.value.overlayOpacity}%`)
const sliderValue = computed({
  get: () => [appearance.value.overlayOpacity],
  set: (val: number[]) => settingsStore.setOverlayOpacity(val[0])
})

// Methods
const setBgType = (type: 'default' | 'unsplash' | 'url') => {
  settingsStore.setBgType(type)
}

const handleBgUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      settingsStore.setBgValue(String(e.target?.result || ''))
    } catch (err) {
      window.alert('图片文件过大！')
    }
  }
  reader.readAsDataURL(file)
}

const handleBgUrlInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  settingsStore.setBgValue(target.value)
}

const setLocale = (loc: 'zh-CN' | 'en-US') => {
  settingsStore.setLocale(loc)
}

const downloadConfig = () => {
  const data = siteStore.exportData()
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(data, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', 'geek_tab_backup.json')
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

const resetAll = async () => {
  const message = isSupabaseConfigured()
    ? '确定重置所有数据？此操作将清除本地与云端数据，且不可撤销。'
    : '确定重置所有数据？此操作不可撤销。'
  if (!window.confirm(message)) return
  clearStorage()
  await siteStore.clearAllData()
  window.location.reload()
}

const handleBookmarkImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const result = await categoryStore.importFromBookmarkFile(file, 'merge')
    window.alert(
      `导入成功！\n` +
      `- 文件夹数量：${result.totalFolders}\n` +
      `- 书签数量：${result.totalLinks}\n` +
      `- 创建分类：${result.categories.length}`
    )
    if (bookmarkFileRef.value) {
      bookmarkFileRef.value.value = ''
    }
  } catch (e) {
    window.alert(`导入失败：${e instanceof Error ? e.message : '未知错误'}`)
  }
}

const handleBookmarkExport = () => {
  categoryStore.exportToBookmarkFile()
}

// Color presets
const colorPresets = [
  { color: '#60a5fa', name: 'Blue' },
  { color: '#a78bfa', name: 'Purple' },
  { color: '#34d399', name: 'Green' },
  { color: '#fbbf24', name: 'Yellow' },
  { color: '#f87171', name: 'Red' },
]
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>系统设置</DialogTitle>
      </DialogHeader>

      <Tabs default-value="appearance" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">外观</TabsTrigger>
          <TabsTrigger value="search">搜索</TabsTrigger>
          <TabsTrigger value="general">通用</TabsTrigger>
        </TabsList>

        <!-- Appearance Tab -->
        <TabsContent value="appearance" class="space-y-6 mt-4">
          <!-- Background Settings -->
          <div class="space-y-3">
            <Label>背景设置</Label>
            <div class="flex gap-2">
              <Button
                :variant="appearance.bgType === 'default' ? 'default' : 'outline'"
                size="sm"
                class="flex-1"
                @click="setBgType('default')"
              >
                极客默认
              </Button>
              <Button
                :variant="appearance.bgType === 'unsplash' ? 'default' : 'outline'"
                size="sm"
                class="flex-1"
                @click="setBgType('unsplash')"
              >
                随机美图
              </Button>
            </div>
            <div class="space-y-2">
              <Label class="text-muted-foreground text-xs">链接</Label>
              <Input
                :model-value="appearance.bgValue"
                placeholder="图片 URL..."
                @input="handleBgUrlInput"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-muted-foreground text-xs">本地</Label>
              <Input
                type="file"
                accept="image/*"
                @change="handleBgUpload"
              />
            </div>
          </div>

          <!-- Overlay Opacity -->
          <div class="space-y-3">
            <Label>
              遮罩透明度: <span class="text-primary">{{ opacityLabel }}</span>
            </Label>
            <Slider
              v-model="sliderValue"
              :min="0"
              :max="95"
              :step="1"
              class="w-full"
            />
          </div>

          <!-- Primary Color -->
          <div class="space-y-3">
            <Label>主题色</Label>
            <div class="flex items-center gap-2">
              <button
                v-for="preset in colorPresets"
                :key="preset.color"
                class="w-6 h-6 rounded-full border-2 border-transparent hover:border-foreground/50 transition-colors"
                :style="{ backgroundColor: preset.color }"
                :title="preset.name"
                @click="settingsStore.setPrimaryColor(preset.color)"
              />
              <input
                type="color"
                class="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
                @input="settingsStore.setPrimaryColor(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <!-- Text Color -->
          <div class="space-y-3">
            <Label>文本颜色</Label>
            <div class="flex items-center gap-2">
              <Input
                :model-value="appearance.textColor"
                placeholder="#e4e4e7"
                class="flex-1"
                @input="settingsStore.setTextColor(($event.target as HTMLInputElement).value)"
              />
              <input
                type="color"
                :value="appearance.textColor"
                class="w-10 h-9 p-0 border-none bg-transparent cursor-pointer"
                @input="settingsStore.setTextColor(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </TabsContent>

        <!-- Search Tab -->
        <TabsContent value="search" class="space-y-6 mt-4">
          <div class="space-y-3">
            <Label>站内搜索</Label>
            <div class="p-3 bg-muted rounded-md">
              <p class="text-muted-foreground text-sm">当前版本仅支持站内网站搜索</p>
            </div>
          </div>
        </TabsContent>

        <!-- General Tab -->
        <TabsContent value="general" class="space-y-6 mt-4">
          <!-- Language -->
          <div class="space-y-3">
            <Label>语言 / 区域</Label>
            <div class="flex gap-2">
              <Button
                :variant="locale === 'zh-CN' ? 'default' : 'outline'"
                size="sm"
                class="flex-1"
                @click="setLocale('zh-CN')"
              >
                中文 (CN)
              </Button>
              <Button
                :variant="locale === 'en-US' ? 'default' : 'outline'"
                size="sm"
                class="flex-1"
                @click="setLocale('en-US')"
              >
                英文 (US)
              </Button>
            </div>
          </div>

          <!-- Data Management -->
          <div class="space-y-3">
            <Label>数据管理</Label>
            <Button
              variant="outline"
              class="w-full"
              @click="downloadConfig"
            >
              备份配置 (JSON)
            </Button>
            <Button
              variant="destructive"
              class="w-full"
              @click="resetAll"
            >
              重置所有数据
            </Button>
          </div>

          <!-- Bookmark Import/Export -->
          <div class="space-y-3">
            <Label>书签导入/导出</Label>
            <div class="space-y-2">
              <Label class="text-muted-foreground text-xs">导入</Label>
              <Input
                ref="bookmarkFileRef"
                type="file"
                accept=".html,.htm"
                @change="handleBookmarkImport"
              />
            </div>
            <Button
              variant="outline"
              class="w-full"
              @click="handleBookmarkExport"
            >
              导出为书签 (HTML)
            </Button>
            <p class="text-xs text-muted-foreground">
              支持 Chrome/Edge/Firefox 书签 HTML 格式，文件夹将转换为分类
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
