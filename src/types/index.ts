/**
 * 类型定义
 * 统一管理应用中的所有 TypeScript 类型
 */

// ========== 网站相关类型 ==========

/**
 * 网站数据
 */
export interface Site {
  id?: number
  name: string
  url: string
  desc?: string
  icon?: string
  tags?: string[]
  visitCount?: number
  lastVisit?: string
  sortOrder?: number
  isCustom?: boolean
  category?: string
}

/**
 * 按分类分组的网站数据
 */
export interface GroupedSites {
  [categoryKey: string]: Site[]
}

// ========== 分类相关类型 ==========

/**
 * 分类数据
 */
export interface Category {
  key: string
  label: string
  icon?: string
  color?: string
  parentKey?: string | null
  order?: number
  sites?: Site[]
}

// ========== 设置相关类型 ==========

/**
 * 外观配置
 */
export interface AppearanceConfig {
  theme: 'dark' | 'light' | 'system'
  layout: 'grid' | 'list'
  primaryColor: string
  textColor: string
  bgType: 'default' | 'unsplash' | 'url'
  bgValue: string
  overlayOpacity: number
}

/**
 * 快捷键配置
 */
export interface ShortcutsConfig {
  search: string
  settings: string
  addSite: string
  prevCategory: string
  nextCategory: string
}

/**
 * 应用设置
 */
export interface AppSettings {
  appearance: AppearanceConfig
  shortcuts: ShortcutsConfig
  locale: 'zh-CN' | 'en-US'
}

/**
 * 旧版配置格式（兼容）
 */
export interface LegacyConfig {
  bgType: 'default' | 'unsplash' | 'url'
  bgValue: string
  overlayOpacity: number
  primaryColor: string
  textColor: string
  locale: 'zh-CN' | 'en-US'
}

// ========== 搜索相关类型 ==========

/**
 * 搜索结果
 */
export interface SearchResult {
  site: Site
  categoryKey: string
  categoryLabel: string
  siteIndex: number
  score?: number
}

// ========== 数据库相关类型 ==========

/**
 * 数据库结构
 */
export interface Database {
  categories: Category[]
}

/**
 * Supabase 数据库中的 Site 类型
 */
export interface SupabaseSite {
  id: number
  category: string
  name: string
  url: string
  description: string | null
  icon: string | null
  tags: string[] | null
  visit_count: number
  last_visit: string | null
  sort_order: number
  is_custom: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/**
 * Supabase 数据库中的 Category 类型
 */
export interface SupabaseCategory {
  key: string
  label: string
  icon: string | null
  color: string | null
  parent_key: string | null
  order: number
  created_at: string
}

// ========== UI 相关类型 ==========

/**
 * 弹窗状态
 */
export interface ModalState {
  isOpen: boolean
  type?: 'site' | 'category' | 'settings' | 'confirm'
  data?: unknown
}

/**
 * 表单数据 - 网站
 */
export interface SiteFormData {
  title: string
  url: string
  icon: string
  desc: string
  tags: string
}

/**
 * 表单数据 - 分类
 */
export interface CategoryFormData {
  key: string
  label: string
}
