/**
 * Chrome HTML 书签解析器
 * 支持导入/导出 Chrome 书签 HTML 格式
 */

import type { Category, Site } from '@/types'

/**
 * 书签节点类型
 */
export interface BookmarkNode {
  type: 'folder' | 'link'
  title: string
  url?: string
  icon?: string
  addDate?: string
  children?: BookmarkNode[]
}

/**
 * 导入结果
 */
export interface ImportResult {
  categories: Category[]
  totalFolders: number
  totalLinks: number
}

/**
 * 解析 Chrome HTML 书签文件
 * @param html 书签 HTML 内容
 * @returns 解析后的书签树
 */
export function parseBookmarkHtml(html: string): BookmarkNode[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Chrome 书签结构：<DL><DT><H3>文件夹</H3><DL>...</DL></DT><DT><A>链接</A></DT></DL>
  const rootDL = doc.querySelector('DL')
  if (!rootDL) {
    throw new Error('无效的书签文件格式')
  }

  return parseDL(rootDL)
}

/**
 * 递归解析 DL 元素
 */
function parseDL(dl: Element): BookmarkNode[] {
  const nodes: BookmarkNode[] = []
  const children = dl.children

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (child.tagName === 'DT') {
      const node = parseDT(child)
      if (node) {
        nodes.push(node)
      }
    }
  }

  return nodes
}

/**
 * 解析 DT 元素（可能是文件夹或链接）
 */
function parseDT(dt: Element): BookmarkNode | null {
  const firstChild = dt.children[0]
  if (!firstChild) return null

  // 文件夹：<DT><H3>标题</H3><DL>...</DL></DT>
  if (firstChild.tagName === 'H3') {
    const title = firstChild.textContent?.trim() || '未命名文件夹'
    const addDate = firstChild.getAttribute('ADD_DATE') || undefined

    // 查找子 DL
    const subDL = dt.querySelector(':scope > DL')
    const children = subDL ? parseDL(subDL) : []

    return {
      type: 'folder',
      title,
      addDate,
      children
    }
  }

  // 链接：<DT><A HREF="..." ICON="...">标题</A></DT>
  if (firstChild.tagName === 'A') {
    const title = firstChild.textContent?.trim() || '未命名链接'
    const url = firstChild.getAttribute('HREF') || ''
    const icon = firstChild.getAttribute('ICON') || undefined
    const addDate = firstChild.getAttribute('ADD_DATE') || undefined

    // 跳过无效链接
    if (!url || url.startsWith('javascript:')) {
      return null
    }

    return {
      type: 'link',
      title,
      url,
      icon,
      addDate
    }
  }

  return null
}

/**
 * 将书签树转换为分类和网站数据
 * @param nodes 书签节点
 * @param flattenDepth 展平深度（0=只取顶级文件夹，1=展平一级，-1=完全展平）
 * @returns 导入结果
 */
export function convertBookmarksToCategories(
  nodes: BookmarkNode[],
  flattenDepth: number = 1
): ImportResult {
  const categories: Category[] = []
  let totalFolders = 0
  let totalLinks = 0

  // 生成唯一的分类 key
  const usedKeys = new Set<string>()
  function generateKey(title: string): string {
    let key = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      || 'category'

    if (usedKeys.has(key)) {
      let i = 1
      while (usedKeys.has(`${key}-${i}`)) {
        i++
      }
      key = `${key}-${i}`
    }

    usedKeys.add(key)
    return key
  }

  // 递归处理节点
  function processNodes(
    nodes: BookmarkNode[],
    parentKey: string | null,
    depth: number
  ): Site[] {
    const sites: Site[] = []

    for (const node of nodes) {
      if (node.type === 'link') {
        totalLinks++
        sites.push({
          name: node.title,
          url: node.url!,
          icon: node.icon || undefined,
          desc: '',
          tags: [],
          isCustom: true
        })
      } else if (node.type === 'folder' && node.children?.length) {
        totalFolders++

        // 根据展平深度决定是创建新分类还是继续收集链接
        if (depth === 0 || (flattenDepth >= 0 && depth > flattenDepth)) {
          // 创建新分类
          const key = generateKey(node.title)
          const childSites = processNodes(node.children, key, depth + 1)

          if (childSites.length > 0) {
            categories.push({
              key,
              label: node.title,
              parentKey,
              order: categories.length + 1,
              sites: childSites
            })
          }
        } else {
          // 展平：将子节点的链接收集到当前层
          const childSites = processNodes(node.children, parentKey, depth + 1)
          sites.push(...childSites)
        }
      }
    }

    return sites
  }

  // 处理顶级节点
  for (const node of nodes) {
    if (node.type === 'folder' && node.children?.length) {
      totalFolders++
      const key = generateKey(node.title)
      const sites = processNodes(node.children, key, 1)

      if (sites.length > 0) {
        categories.push({
          key,
          label: node.title,
          parentKey: null,
          order: categories.length + 1,
          sites
        })
      }
    } else if (node.type === 'link') {
      // 顶级链接放入"未分类"
      totalLinks++
      let uncategorized = categories.find((c) => c.key === 'uncategorized')
      if (!uncategorized) {
        uncategorized = {
          key: 'uncategorized',
          label: '未分类',
          parentKey: null,
          order: 0,
          sites: []
        }
        categories.unshift(uncategorized)
        usedKeys.add('uncategorized')
      }
      uncategorized.sites!.push({
        name: node.title,
        url: node.url!,
        icon: node.icon || undefined,
        desc: '',
        tags: [],
        isCustom: true
      })
    }
  }

  return {
    categories,
    totalFolders,
    totalLinks
  }
}

/**
 * 将分类和网站数据导出为 Chrome HTML 书签格式
 * @param categories 分类列表
 * @returns HTML 字符串
 */
export function exportToBookmarkHtml(categories: Category[]): string {
  const now = Math.floor(Date.now() / 1000)

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`

  // 按 parentKey 组织分类树
  const rootCategories = categories.filter((c) => !c.parentKey)
  const childrenMap = new Map<string, Category[]>()

  categories.forEach((cat) => {
    if (cat.parentKey) {
      const children = childrenMap.get(cat.parentKey) || []
      children.push(cat)
      childrenMap.set(cat.parentKey, children)
    }
  })

  // 递归生成 HTML
  function generateCategoryHtml(category: Category, indent: string): string {
    let result = `${indent}<DT><H3 ADD_DATE="${now}">${escapeHtml(category.label)}</H3>\n`
    result += `${indent}<DL><p>\n`

    // 输出网站
    const sites = category.sites || []
    for (const site of sites) {
      result += `${indent}    <DT><A HREF="${escapeHtml(site.url)}" ADD_DATE="${now}">${escapeHtml(site.name)}</A>\n`
    }

    // 输出子分类
    const children = childrenMap.get(category.key) || []
    for (const child of children) {
      result += generateCategoryHtml(child, indent + '    ')
    }

    result += `${indent}</DL><p>\n`
    return result
  }

  // 生成所有顶级分类
  for (const category of rootCategories) {
    html += generateCategoryHtml(category, '    ')
  }

  html += `</DL><p>\n`

  return html
}

/**
 * HTML 转义
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 读取文件内容
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/html'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
