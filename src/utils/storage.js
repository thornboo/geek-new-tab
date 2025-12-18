/**
 * LocalStorage 工具函数
 */

const STORAGE_KEY = 'geek-nav-data'

/**
 * 获取存储的数据
 */
export function getStorageData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to parse storage data:', e)
    return null
  }
}

/**
 * 保存数据到存储
 */
export function setStorageData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save storage data:', e)
    return false
  }
}

/**
 * 获取用户自定义的网站数据
 */
export function getCustomSites() {
  const data = getStorageData()
  return data?.customSites || {}
}

/**
 * 保存用户自定义的网站数据
 */
export function saveCustomSites(customSites) {
  const data = getStorageData() || {}
  data.customSites = customSites
  return setStorageData(data)
}

/**
 * 获取用户偏好设置
 */
export function getPreferences() {
  const data = getStorageData()
  return data?.preferences || {}
}

/**
 * 保存用户偏好设置
 */
export function savePreferences(preferences) {
  const data = getStorageData() || {}
  data.preferences = { ...data.preferences, ...preferences }
  return setStorageData(data)
}
