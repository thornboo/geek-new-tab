/**
 * Pinia 持久化插件
 * 自动将指定 Store 的状态同步到 LocalStorage
 */

import type { PiniaPluginContext } from 'pinia'
import { watch } from 'vue'

// 需要持久化的 Store ID 列表
const PERSIST_STORES = ['settings', 'category', 'site']

// 存储键前缀
const STORAGE_PREFIX = 'geek-nav-store-'

/**
 * 持久化插件
 * 自动从 LocalStorage 恢复数据，并监听变化自动保存
 */
export function persistencePlugin({ store }: PiniaPluginContext) {
  // 只处理需要持久化的 Store
  if (!PERSIST_STORES.includes(store.$id)) return

  const key = `${STORAGE_PREFIX}${store.$id}`

  // 1. 从 localStorage 恢复数据
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      store.$patch(data)
    } catch (e) {
      console.error(`Failed to restore ${store.$id}:`, e)
    }
  }

  // 2. 监听状态变化并保存
  watch(
    () => store.$state,
    (state) => {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch (e) {
        console.error(`Failed to persist ${store.$id}:`, e)
      }
    },
    { deep: true }
  )
}

/**
 * 清除所有持久化数据
 */
export function clearPersistedData(): void {
  PERSIST_STORES.forEach((storeId) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${storeId}`)
  })
}

/**
 * 获取持久化数据
 */
export function getPersistedData<T>(storeId: string): T | null {
  const key = `${STORAGE_PREFIX}${storeId}`
  const saved = localStorage.getItem(key)
  if (!saved) return null

  try {
    return JSON.parse(saved) as T
  } catch {
    return null
  }
}
