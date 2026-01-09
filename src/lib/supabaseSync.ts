/**
 * Supabase 数据同步层
 * 仅处理数据读写，不包含 UI 逻辑
 */

import { getSupabaseClient } from '@/lib/supabase'

export interface Site {
  id?: number
  name: string
  url: string
  icon?: string
  desc?: string
  tags?: string[]
  visitCount?: number
  lastVisit?: string
  sortOrder?: number
  isCustom?: boolean
}

export interface Category {
  key: string
  label: string
  order?: number
}

export interface DbSnapshot {
  categories: Array<Category & { sites: Site[] }>
}

interface SupabaseSiteRow {
  id: number
  category: string
  name: string
  url: string
  description: string | null
  icon: string | null
  tags: string[] | null
  visit_count: number | null
  last_visit: string | null
  sort_order: number | null
  created_at?: string
}

export async function loadDbFromSupabase(): Promise<DbSnapshot | null> {
  const client = await getSupabaseClient()
  if (!client) return null

  const { data: categoryRows, error: categoryError } = await client
    .from('categories')
    .select('*')
    .order('order', { ascending: true })

  if (categoryError) {
    console.error('加载分类失败:', categoryError)
    throw categoryError
  }

  const { data: siteRows, error: siteError } = await client
    .from('sites')
    .select('*')
    .order('created_at', { ascending: true })

  if (siteError) {
    console.error('加载网站失败:', siteError)
    throw siteError
  }

  const categories: DbSnapshot['categories'] = (categoryRows || []).map((row) => ({
    key: row.key,
    label: row.label,
    order: row.order ?? 0,
    sites: []
  }))

  const categoryMap = new Map(categories.map((category) => [category.key, category]))

  ;(siteRows || []).forEach((row: SupabaseSiteRow) => {
    const site: Site = {
      id: row.id,
      name: row.name,
      url: row.url,
      icon: row.icon || undefined,
      desc: row.description || undefined,
      tags: row.tags || [],
      visitCount: row.visit_count ?? 0,
      lastVisit: row.last_visit || undefined,
      sortOrder: row.sort_order ?? undefined
    }
    if (!categoryMap.has(row.category)) {
      const fallback = { key: row.category, label: row.category, sites: [] }
      categoryMap.set(row.category, fallback)
      categories.push(fallback)
    }
    categoryMap.get(row.category)?.sites.push(site)
  })

  categories.forEach((category) => {
    const hasOrder = category.sites.some((site) => typeof site.sortOrder === 'number')
    if (!hasOrder) return
    category.sites.sort(
      (a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)
    )
  })

  return { categories }
}

export async function seedSupabase(db: DbSnapshot): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return

  const categoryPayload = db.categories.map((category, index) => ({
    key: category.key,
    label: category.label,
    order: category.order ?? index + 1
  }))

  const { error: categoryError } = await client
    .from('categories')
    .upsert(categoryPayload, { onConflict: 'key' })
  if (categoryError) {
    console.error('初始化分类失败:', categoryError)
    throw categoryError
  }

  for (const category of db.categories) {
    if (!category.sites.length) continue
    const sitePayload = category.sites.map((site, index) => ({
      category: category.key,
      name: site.name,
      url: site.url,
      description: site.desc || '',
      icon: site.icon || null,
      tags: site.tags || [],
      visit_count: site.visitCount ?? 0,
      last_visit: site.lastVisit || null,
      sort_order: site.sortOrder ?? index + 1
    }))
    const { error: siteError } = await client.from('sites').insert(sitePayload)
    if (siteError) {
      console.error('初始化网站失败:', siteError)
      throw siteError
    }
  }
}

export async function addCategoryToSupabase(category: Category): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return
  const { error } = await client.from('categories').insert({
    key: category.key,
    label: category.label,
    order: category.order ?? 0
  })
  if (error) {
    console.error('新增分类失败:', error)
    throw error
  }
}

export async function renameCategoryInSupabase(key: string, label: string): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return
  const { error } = await client.from('categories').update({ label }).eq('key', key)
  if (error) {
    console.error('更新分类失败:', error)
    throw error
  }
}

export async function deleteCategoryFromSupabase(key: string): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return
  const { error: siteError } = await client.from('sites').delete().eq('category', key)
  if (siteError) {
    console.error('删除分类网站失败:', siteError)
    throw siteError
  }
  const { error: categoryError } = await client.from('categories').delete().eq('key', key)
  if (categoryError) {
    console.error('删除分类失败:', categoryError)
    throw categoryError
  }
}

export async function addSiteToSupabase(categoryKey: string, site: Site): Promise<Site | null> {
  const client = await getSupabaseClient()
  if (!client) return null
  const { data, error } = await client
    .from('sites')
    .insert({
      category: categoryKey,
      name: site.name,
      url: site.url,
      description: site.desc || '',
      icon: site.icon || null,
      tags: site.tags || [],
      visit_count: site.visitCount ?? 0,
      last_visit: site.lastVisit || null,
      sort_order: site.sortOrder ?? 0
    })
    .select()
    .single()

  if (error) {
    console.error('新增网站失败:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    icon: data.icon || undefined,
    desc: data.description || undefined,
    tags: data.tags || [],
    visitCount: data.visit_count ?? 0,
    lastVisit: data.last_visit || undefined,
    sortOrder: data.sort_order ?? site.sortOrder
  }
}

export async function updateSiteInSupabase(siteId: number, updates: Partial<Site>): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.url !== undefined) payload.url = updates.url
  if (updates.desc !== undefined) payload.description = updates.desc
  if (updates.icon !== undefined) payload.icon = updates.icon
  if (updates.tags !== undefined) payload.tags = updates.tags
  if (updates.visitCount !== undefined) payload.visit_count = updates.visitCount
  if (updates.lastVisit !== undefined) payload.last_visit = updates.lastVisit
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder

  const { error } = await client.from('sites').update(payload).eq('id', siteId)

  if (error) {
    console.error('更新网站失败:', error)
    throw error
  }
}

export async function deleteSiteFromSupabase(siteId: number): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return
  const { error } = await client.from('sites').delete().eq('id', siteId)
  if (error) {
    console.error('删除网站失败:', error)
    throw error
  }
}

export async function clearAllDataInSupabase(): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return
  const { error: siteError } = await client.from('sites').delete().neq('id', 0)
  if (siteError) {
    console.error('清空网站失败:', siteError)
    throw siteError
  }
  const { error: categoryError } = await client.from('categories').delete().neq('key', '')
  if (categoryError) {
    console.error('清空分类失败:', categoryError)
    throw categoryError
  }
}

// 兼容旧 API 的别名
export const loadSitesFromSupabase = loadDbFromSupabase
export const clearAllSitesInSupabase = clearAllDataInSupabase

export interface GroupedSites {
  [categoryKey: string]: Site[]
}

export async function batchImportToSupabase(sites: GroupedSites): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return

  for (const [categoryKey, siteList] of Object.entries(sites)) {
    for (const site of siteList) {
      await addSiteToSupabase(categoryKey, site)
    }
  }
}
