/**
 * Supabase 网站数据同步层
 * 纯数据操作，不包含 Vue 响应式状态
 */

import { getSupabaseClient } from '@/lib/supabase'

// 类型定义
export interface Site {
  id?: number
  name: string
  url: string
  desc?: string
  icon?: string | null
  isCustom?: boolean
}

export interface SupabaseSite {
  id: number
  category: string
  name: string
  url: string
  description: string
  icon: string | null
  created_at?: string
}

export interface GroupedSites {
  [categoryKey: string]: Site[]
}

/**
 * 从 Supabase 加载所有网站数据
 */
export async function loadSitesFromSupabase(): Promise<GroupedSites> {
  const client = await getSupabaseClient()
  if (!client) return {}

  const { data, error } = await client
    .from('sites')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load sites from Supabase:', error)
    throw error
  }

  // 按分类组织数据
  const grouped: GroupedSites = {}
  data?.forEach((site: SupabaseSite) => {
    if (!grouped[site.category]) {
      grouped[site.category] = []
    }
    grouped[site.category].push({
      id: site.id,
      name: site.name,
      url: site.url,
      desc: site.description,
      icon: site.icon,
      isCustom: true
    })
  })

  return grouped
}

/**
 * 添加网站到 Supabase
 */
export async function addSiteToSupabase(
  categoryKey: string,
  site: Site
): Promise<Site | null> {
  const client = await getSupabaseClient()
  if (!client) return null

  const { data, error } = await client
    .from('sites')
    .insert({
      category: categoryKey,
      name: site.name,
      url: site.url,
      description: site.desc || '',
      icon: site.icon || null
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to add site to Supabase:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    desc: data.description,
    icon: data.icon,
    isCustom: true
  }
}

/**
 * 更新 Supabase 中的网站
 */
export async function updateSiteInSupabase(
  siteId: number,
  updates: Partial<Site>
): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return

  const { error } = await client
    .from('sites')
    .update({
      name: updates.name,
      url: updates.url,
      description: updates.desc || ''
    })
    .eq('id', siteId)

  if (error) {
    console.error('Failed to update site in Supabase:', error)
    throw error
  }
}

/**
 * 从 Supabase 删除网站
 */
export async function deleteSiteFromSupabase(siteId: number): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return

  const { error } = await client.from('sites').delete().eq('id', siteId)

  if (error) {
    console.error('Failed to delete site from Supabase:', error)
    throw error
  }
}

/**
 * 批量导入网站到 Supabase
 */
export async function batchImportToSupabase(data: GroupedSites): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Supabase client not available')

  // 逐个添加导入的网站
  for (const [categoryKey, sites] of Object.entries(data)) {
    for (const site of sites) {
      await client.from('sites').insert({
        category: categoryKey,
        name: site.name,
        url: site.url,
        description: site.desc || '',
        icon: site.icon || null
      })
    }
  }
}

/**
 * 清除 Supabase 中的所有网站
 */
export async function clearAllSitesInSupabase(): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return

  // 删除所有记录（使用 neq 0 作为条件来删除所有行）
  const { error } = await client.from('sites').delete().neq('id', 0)

  if (error) {
    console.error('Failed to clear all sites in Supabase:', error)
    throw error
  }
}
