<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="layout wh-full flex app-bg text-gray-200">
    <!-- 固定侧边栏 -->
    <AppSidebar />

    <!-- 右侧区域 -->
    <div class="flex-1 flex flex-col overflow-hidden relative z-10">
      <!-- 顶部栏 -->
      <AppHeader />

      <!-- 主内容区 - 路由出口 -->
      <main class="main-content flex-1 overflow-y-auto p-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
