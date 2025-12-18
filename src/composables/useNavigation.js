import { ref, computed } from 'vue'
import { categories, getCategoryByKey } from '@/data/sites'

// 全局状态
const activeCategory = ref('search')

/**
 * 导航状态管理 composable
 */
export function useNavigation() {
  // 当前选中的分类数据
  const currentCategory = computed(() => {
    return getCategoryByKey(activeCategory.value)
  })

  // 当前分类的网站列表
  const currentSites = computed(() => {
    return currentCategory.value?.sites || []
  })

  // 菜单项列表
  const menuItems = computed(() => {
    return categories.map(({ key, label, icon }) => ({ key, label, icon }))
  })

  // 切换分类
  const setCategory = (key) => {
    activeCategory.value = key
  }

  return {
    activeCategory,
    currentCategory,
    currentSites,
    menuItems,
    setCategory
  }
}
