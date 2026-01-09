/**
 * Settings Store - 用户设置管理
 * 负责管理应用外观、快捷键等设置（仅本地存储）
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { AppSettings, AppearanceConfig, LegacyConfig } from '@/types'

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  appearance: {
    theme: 'dark',
    layout: 'grid',
    primaryColor: '#60a5fa',
    textColor: '#e4e4e7',
    bgType: 'default',
    bgValue: '',
    overlayOpacity: 50
  },
  shortcuts: {
    search: '/',
    settings: 'ctrl+s',
    addSite: 'ctrl+n',
    prevCategory: 'ctrl+arrowleft',
    nextCategory: 'ctrl+arrowright'
  },
  locale: 'zh-CN'
}

// 旧版配置存储键
const LEGACY_CONFIG_KEY = 'geek_config'

export const useSettingsStore = defineStore('settings', () => {
  // ========== 状态 ==========
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const initialized = ref(false)

  // ========== 计算属性 ==========

  /**
   * 是否为暗色模式
   */
  const isDarkMode = computed(() => {
    const { theme } = settings.value.appearance
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme === 'dark'
  })

  /**
   * CSS 变量对象
   */
  const cssVariables = computed(() => {
    const { primaryColor, textColor, overlayOpacity } = settings.value.appearance
    return {
      '--primary-color': primaryColor,
      '--text-main': textColor,
      '--overlay-opacity': String((overlayOpacity || 50) / 100)
    }
  })

  /**
   * 外观配置快捷访问
   */
  const appearance = computed(() => settings.value.appearance)

  /**
   * 语言区域
   */
  const locale = computed(() => settings.value.locale)

  // ========== 操作 ==========

  /**
   * 初始化设置（从旧版配置迁移）
   */
  function initialize() {
    if (initialized.value) return

    // 尝试从旧版配置迁移
    const legacyConfig = localStorage.getItem(LEGACY_CONFIG_KEY)
    if (legacyConfig) {
      try {
        const config: LegacyConfig = JSON.parse(legacyConfig)
        settings.value = {
          ...DEFAULT_SETTINGS,
          appearance: {
            ...DEFAULT_SETTINGS.appearance,
            bgType: config.bgType || 'default',
            bgValue: config.bgValue || '',
            overlayOpacity: config.overlayOpacity ?? 50,
            primaryColor: config.primaryColor || '#60a5fa',
            textColor: config.textColor || '#e4e4e7'
          },
          locale: config.locale || 'zh-CN'
        }
        // 迁移后删除旧配置
        // localStorage.removeItem(LEGACY_CONFIG_KEY)
      } catch (e) {
        console.error('Failed to migrate legacy config:', e)
      }
    }

    initialized.value = true
    applyTheme()
  }

  /**
   * 更新外观设置
   */
  function updateAppearance(config: Partial<AppearanceConfig>) {
    settings.value.appearance = {
      ...settings.value.appearance,
      ...config
    }
  }

  /**
   * 设置背景类型
   */
  function setBgType(type: 'default' | 'unsplash' | 'url') {
    settings.value.appearance.bgType = type
    if (type === 'default') {
      settings.value.appearance.bgValue = ''
    }
    if (type === 'unsplash') {
      settings.value.appearance.bgValue =
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070'
    }
  }

  /**
   * 设置背景图片
   */
  function setBgValue(value: string) {
    settings.value.appearance.bgValue = value
    if (value && settings.value.appearance.bgType === 'default') {
      settings.value.appearance.bgType = 'url'
    }
  }

  /**
   * 设置主题色
   */
  function setPrimaryColor(color: string) {
    settings.value.appearance.primaryColor = color
  }

  /**
   * 设置文本颜色
   */
  function setTextColor(color: string) {
    settings.value.appearance.textColor = color
  }

  /**
   * 设置遮罩透明度
   */
  function setOverlayOpacity(opacity: number) {
    settings.value.appearance.overlayOpacity = Math.max(0, Math.min(95, opacity))
  }

  /**
   * 设置语言区域
   */
  function setLocale(locale: 'zh-CN' | 'en-US') {
    settings.value.locale = locale
  }

  /**
   * 重置为默认设置
   */
  function resetToDefault() {
    settings.value = { ...DEFAULT_SETTINGS }
    applyTheme()
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    // 应用 CSS 变量
    Object.entries(cssVariables.value).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 应用暗色模式
    if (isDarkMode.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  /**
   * 应用背景设置
   */
  function applyBackground(bgLayerEl: HTMLElement | null, ambientEl: HTMLElement | null) {
    if (!bgLayerEl || !ambientEl) return

    const { bgType, bgValue } = settings.value.appearance

    if (bgType === 'default') {
      bgLayerEl.style.backgroundImage = 'none'
      ambientEl.style.opacity = '1'
    } else {
      ambientEl.style.opacity = '0'
      let url = bgValue
      if (bgType === 'unsplash') {
        url = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070'
      }
      bgLayerEl.style.backgroundImage = `url('${url}')`
    }
  }

  // 监听设置变化，自动应用主题
  watch(
    () => settings.value.appearance,
    () => {
      applyTheme()
    },
    { deep: true }
  )

  return {
    // 状态
    settings,
    initialized,

    // 计算属性
    isDarkMode,
    cssVariables,
    appearance,
    locale,

    // 操作
    initialize,
    updateAppearance,
    setBgType,
    setBgValue,
    setPrimaryColor,
    setTextColor,
    setOverlayOpacity,
    setLocale,
    resetToDefault,
    applyTheme,
    applyBackground
  }
})
