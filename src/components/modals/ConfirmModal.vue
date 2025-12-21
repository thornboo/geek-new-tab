<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '确认' },
  message: { type: String, default: '确定要执行此操作吗？' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  type: { type: String, default: 'warning' }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="modal-overlay fixed inset-0 bg-black/90 flex-center z-50 backdrop-blur-sm"
        @click.self="emit('cancel')"
      >
        <div
          class="modal-content bg-black border border-gray-700 shadow-matrix rounded-lg w-full max-w-sm mx-4 overflow-hidden"
        >
          <div class="p-6 text-center">
            <div class="w-12 h-12 rounded border border-gray-700 bg-black flex-center mx-auto mb-4">
              <Icon icon="mdi:alert-circle" class="w-6 h-6 text-matrix" />
            </div>
            <h3 class="text-base font-medium text-white mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-400">{{ message }}</p>
          </div>

          <div class="flex border-t border-gray-800 bg-black">
            <button
              class="flex-1 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              @click="emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              class="flex-1 py-3 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-l border-gray-800"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition:
    transform 0.2s,
    opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}
</style>
