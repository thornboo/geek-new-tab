<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  site: { type: Object, default: null },
  categoryLabel: { type: String, default: '' }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({ name: '', url: '', desc: '' })
const errors = ref({})

const isEdit = computed(() => !!props.site?.id)
const title = computed(() => isEdit.value ? '编辑网站' : '添加网站')

const resetForm = () => {
  form.value = { name: '', url: '', desc: '' }
  errors.value = {}
}

watch(() => props.site, (newSite) => {
  if (newSite) {
    form.value = {
      name: newSite.name || '',
      url: newSite.url || '',
      desc: newSite.desc || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const validate = () => {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = '请输入网站名称'
  if (!form.value.url.trim()) {
    errors.value.url = '请输入网站地址'
  } else {
    try {
      let url = form.value.url.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
      new URL(url)
      form.value.url = url
    } catch {
      errors.value.url = '请输入有效的网站地址'
    }
  }
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', { ...form.value, id: props.site?.id })
  handleClose()
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="modal-overlay fixed inset-0 bg-black/90 flex-center z-50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div class="modal-content bg-black border border-gray-700 shadow-matrix rounded-lg w-full max-w-md mx-4 overflow-hidden">
          <!-- 头部 -->
          <div class="modal-header flex-between px-5 py-4 border-b border-gray-800">
            <h3 class="text-base font-medium text-white">{{ title }}</h3>
            <button class="w-8 h-8 rounded bg-transparent hover:bg-white/10 flex-center transition-colors" @click="handleClose">
              <Icon icon="mdi:close" class="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          <!-- 表单 -->
          <form class="p-5 space-y-4" @submit.prevent="handleSubmit">
            <div class="text-sm text-gray-400">
              Add to <span class="text-matrix">{{ categoryLabel }}</span>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-2">Name</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Site Name"
                class="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:border-matrix transition-colors text-sm"
                :class="{ 'border-red-500/50': errors.name }"
              />
              <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-2">URL</label>
              <input
                v-model="form.url"
                type="text"
                placeholder="https://example.com"
                class="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:border-matrix transition-colors font-mono text-sm"
                :class="{ 'border-red-500/50': errors.url }"
              />
              <p v-if="errors.url" class="text-red-400 text-xs mt-1">{{ errors.url }}</p>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-2">Description</label>
              <input
                v-model="form.desc"
                type="text"
                placeholder="Optional description"
                class="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:border-matrix transition-colors text-sm"
              />
            </div>
          </form>

          <!-- 底部 -->
          <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-800 bg-black">
            <button
              class="px-4 py-2 text-sm text-gray-400 bg-transparent hover:text-white transition-colors"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              class="btn-primary"
              @click="handleSubmit"
            >
              {{ isEdit ? 'Save Changes' : 'Add Site' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-active .modal-content, .modal-leave-active .modal-content {
  transition: transform 0.2s, opacity 0.2s;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content, .modal-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}
</style>
