/**
 * Pinia Store 入口
 * 统一导出所有 Store 模块
 */

import { createPinia } from 'pinia'
import { persistencePlugin } from './plugins/persistence'

// 创建 Pinia 实例
export const pinia = createPinia()

// 注册持久化插件
pinia.use(persistencePlugin)

// 导出所有 Store
export * from './modules/settings'
export * from './modules/category'
export * from './modules/site'
export * from './modules/search'
