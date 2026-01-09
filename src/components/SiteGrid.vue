<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Site } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const props = defineProps<{
  sites: Site[]
}>()

const emit = defineEmits<{
  (e: 'click', index: number): void
  (e: 'edit', index: number): void
  (e: 'delete', index: number): void
  (e: 'reorder', from: number, to: number): void
}>()

const flippedIndex = ref<number | null>(null)
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Drag and drop handlers
const handleDragStart = (index: number, event: DragEvent) => {
  draggingIndex.value = index
  dragOverIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const handleDragOver = (index: number, event: DragEvent) => {
  if (draggingIndex.value === null) return
  event.preventDefault()
  dragOverIndex.value = index
}

const handleDrop = (index: number) => {
  if (draggingIndex.value === null) return
  const from = draggingIndex.value
  const to = index
  if (from !== to) {
    emit('reorder', from, to)
  }
  draggingIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggingIndex.value = null
  dragOverIndex.value = null
}

const handleCardClick = (index: number) => {
  if (draggingIndex.value !== null) return
  emit('click', index)
}
</script>

<template>
  <TooltipProvider>
    <div class="site-grid">
      <template v-if="sites.length">
        <Card
          v-for="(site, index) in sites"
          :key="`${site.url}-${index}`"
          class="site-card"
          :class="{
            'is-flipped': flippedIndex === index,
            'is-dragging': draggingIndex === index,
            'is-drag-over': dragOverIndex === index && draggingIndex !== index
          }"
          draggable="true"
          @mouseenter="flippedIndex = index"
          @mouseleave="flippedIndex = flippedIndex === index ? null : flippedIndex"
          @click="handleCardClick(index)"
          @dragstart="handleDragStart(index, $event)"
          @dragover="handleDragOver(index, $event)"
          @drop="handleDrop(index)"
          @dragend="handleDragEnd"
        >
          <div class="card-inner">
            <!-- Front -->
            <div class="card-face card-front">
              <div class="card-icon">
                <Icon :icon="site.icon || 'mdi:web'" />
              </div>
              <span class="card-title">{{ site.name }}</span>
            </div>

            <!-- Back -->
            <div class="card-face card-back">
              <p class="card-desc">{{ site.desc || '暂无描述' }}</p>

              <div v-if="site.tags?.length" class="card-tags">
                <Badge
                  v-for="tag in site.tags.slice(0, 3)"
                  :key="tag"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ tag }}
                </Badge>
              </div>

              <div class="card-actions">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      @click.stop="emit('edit', index)"
                    >
                      <Icon icon="mdi:pencil" class="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>编辑</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      class="hover:text-destructive"
                      @click.stop="emit('delete', index)"
                    >
                      <Icon icon="mdi:delete" class="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>删除</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>
      </template>

      <!-- Empty State -->
      <template v-else>
        <div class="empty-state">
          <div class="empty-icon">
            <Icon icon="mdi:folder-open-outline" />
          </div>
          <h3 class="empty-title">暂无网站</h3>
          <p class="empty-desc">这个分类还没有添加任何网站</p>
          <slot name="empty-action" />
        </div>
      </template>
    </div>
  </TooltipProvider>
</template>

<style scoped>
.site-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  width: 100%;
}

.site-card {
  aspect-ratio: 1;
  cursor: pointer;
  perspective: 1000px;
  padding: 0;
  border: 1px solid hsl(var(--border));
  background: transparent;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.site-card:hover:not(.is-flipped) {
  transform: translateY(-8px);
}

.site-card.is-dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.site-card.is-drag-over {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary));
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: var(--radius);
}

.site-card.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: var(--radius);
}

.card-front {
  z-index: 2;
}

.card-back {
  transform: rotateY(180deg);
  z-index: 3;
  gap: 0.5rem;
}

.card-icon {
  font-size: 2.5rem;
  color: hsl(var(--primary));
  margin-bottom: 0.75rem;
  transition: transform 0.3s ease;
}

.site-card:hover .card-icon {
  transform: scale(1.1);
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.card-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
  margin-top: auto;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.empty-desc {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .site-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
