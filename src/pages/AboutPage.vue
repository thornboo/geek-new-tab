<script setup>
import { Icon } from '@iconify/vue'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout title="About" active-page="about">
    <div class="content-wrapper max-w-[800px] mx-auto">
      <div class="mb-8 border-b border-gray-800 pb-4">
        <h1 class="text-2xl font-semibold text-white tracking-tight mb-1">About</h1>
        <p class="text-sm text-gray-500">Information about GeekTab.</p>
      </div>

      <div class="space-y-6">
        <!-- 应用信息 -->
        <div class="card-base p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded border border-matrix bg-black flex-center shadow-matrix">
              <Icon icon="mdi:matrix" class="w-8 h-8 text-matrix" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">GeekTab</h2>
              <p class="text-sm text-gray-500 font-mono">v1.0.0</p>
            </div>
          </div>

          <p class="text-sm text-gray-400 leading-relaxed mb-6">
            A minimalist new tab page for developers. Organize your favorite sites, sync across
            devices with Supabase, and enjoy a clean Matrix-inspired design.
          </p>

          <div class="flex gap-3">
            <a
              href="https://github.com"
              target="_blank"
              class="btn-secondary inline-flex items-center gap-2"
            >
              <Icon icon="mdi:github" class="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>

        <!-- 功能特性 -->
        <div class="card-base p-6">
          <h3 class="text-base font-medium text-white mb-4">Features</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-3 text-sm">
              <Icon icon="mdi:check-circle" class="w-5 h-5 text-matrix shrink-0 mt-0.5" />
              <span class="text-gray-400">Custom site management with categories</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
              <Icon icon="mdi:check-circle" class="w-5 h-5 text-matrix shrink-0 mt-0.5" />
              <span class="text-gray-400">Cloud sync with Supabase (optional)</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
              <Icon icon="mdi:check-circle" class="w-5 h-5 text-matrix shrink-0 mt-0.5" />
              <span class="text-gray-400">Local storage fallback for offline use</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
              <Icon icon="mdi:check-circle" class="w-5 h-5 text-matrix shrink-0 mt-0.5" />
              <span class="text-gray-400">Data export and import</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
              <Icon icon="mdi:check-circle" class="w-5 h-5 text-matrix shrink-0 mt-0.5" />
              <span class="text-gray-400">Matrix-inspired dark theme design</span>
            </li>
          </ul>
        </div>

        <!-- 快捷键 -->
        <div class="card-base p-6">
          <h3 class="text-base font-medium text-white mb-4">Keyboard Shortcuts</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Open site in new tab</span>
              <kbd class="px-2 py-1 bg-black border border-gray-700 rounded text-xs text-gray-300"
                >Click</kbd
              >
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Edit site</span>
              <kbd class="px-2 py-1 bg-black border border-gray-700 rounded text-xs text-gray-300"
                >Hover + Edit</kbd
              >
            </div>
          </div>
        </div>

        <!-- 技术栈 -->
        <div class="card-base p-6">
          <h3 class="text-base font-medium text-white mb-4">Built With</h3>
          <div class="flex flex-wrap gap-2">
            <span
              class="px-3 py-1 bg-black border border-gray-700 rounded-full text-xs text-gray-400 hover:border-matrix hover:text-matrix transition-all"
              >Vue 3</span
            >
            <span
              class="px-3 py-1 bg-black border border-gray-700 rounded-full text-xs text-gray-400 hover:border-matrix hover:text-matrix transition-all"
              >Vite</span
            >
            <span
              class="px-3 py-1 bg-black border border-gray-700 rounded-full text-xs text-gray-400 hover:border-matrix hover:text-matrix transition-all"
              >UnoCSS</span
            >
            <span
              class="px-3 py-1 bg-black border border-gray-700 rounded-full text-xs text-gray-400 hover:border-matrix hover:text-matrix transition-all"
              >Supabase</span
            >
            <span
              class="px-3 py-1 bg-black border border-gray-700 rounded-full text-xs text-gray-400 hover:border-matrix hover:text-matrix transition-all"
              >Iconify</span
            >
          </div>
        </div>

        <!-- 版权信息 -->
        <div class="text-center text-xs text-gray-600 py-4">
          <p>
            Made with <Icon icon="mdi:heart" class="w-3 h-3 inline text-matrix" /> by developers,
            for developers.
          </p>
          <p class="mt-1">MIT License © {{ new Date().getFullYear() }}</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
