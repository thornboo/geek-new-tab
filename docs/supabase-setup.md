# Supabase 配置指南

> 零后端开发 - Supabase 云数据库完整配置方案

## 目录

- [为什么选择 Supabase](#为什么选择-supabase)
- [项目创建](#项目创建)
- [数据库设计](#数据库设计)
- [安全策略配置](#安全策略配置)
- [前端集成](#前端集成)
- [环境变量管理](#环境变量管理)
- [测试验证](#测试验证)
- [常见问题](#常见问题)

---

## 为什么选择 Supabase

### 核心优势

| 特性 | 说明 |
|------|------|
| **零后端开发** | 无需编写 API 代码，直接从前端调用 |
| **自动 API 生成** | 创建表后自动生成 RESTful API |
| **实时订阅** | 内置 WebSocket，支持多设备实时同步 |
| **PostgreSQL** | 强大的关系型数据库，支持 JSON/数组类型 |
| **内置认证** | 支持多种登录方式（可选功能） |
| **Row Level Security** | SQL 级别的权限控制 |
| **免费额度** | 500MB 数据库 + 2GB 文件存储 + 50GB 流量/月 |

### 与其他方案对比

| 方案 | 优势 | 劣势 |
|------|------|------|
| **Supabase** | 开源、功能全面、PostgreSQL | 需要网络连接 |
| **Firebase** | Google 支持、成熟生态 | 闭源、NoSQL 限制 |
| **自建后端** | 完全掌控 | 开发成本高、维护复杂 |
| **纯 LocalStorage** | 完全离线 | 无法跨设备同步 |

---

## 项目创建

### 1. 注册 Supabase 账号

访问 [https://supabase.com](https://supabase.com) 并注册账号。

### 2. 创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: `geek-new-tab`
   - **Database Password**: 设置强密码（请保存好）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)` （距离中国最近）
   - **Pricing Plan**: `Free` （免费版足够使用）

3. 等待项目初始化（约 2 分钟）

### 3. 获取项目配置

项目创建完成后，进入项目 Settings：

```
Settings → API
```

记录以下信息：

- **Project URL**: `https://your-project-id.supabase.co`
- **anon public key**: `eyJhbGc...` （公开密钥，可安全暴露在前端）
- **service_role key**: `eyJhbGc...` （服务端密钥，**不要暴露在前端**）

---

## 数据库设计

### 表结构设计

基于原型的数据结构，我们需要 3 张表：

#### 1. sites 表（网站数据）

```sql
-- 创建 sites 表
CREATE TABLE sites (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,              -- 分类 key (dev/tools/design/ai 等)
  name TEXT NOT NULL,                   -- 网站名称
  url TEXT NOT NULL,                    -- 网站链接
  description TEXT,                     -- 网站描述
  icon TEXT,                            -- 图标代码 (iconify 格式: mdi:github)
  tags TEXT[],                          -- 标签数组 ['代码', '开源']
  visit_count INTEGER DEFAULT 0,        -- 访问次数
  last_visit TIMESTAMPTZ,               -- 最后访问时间
  sort_order INTEGER DEFAULT 0,         -- 排序权重（手动拖拽）
  is_custom BOOLEAN DEFAULT true,       -- 是否为用户自定义
  created_at TIMESTAMPTZ DEFAULT NOW(), -- 创建时间
  updated_at TIMESTAMPTZ DEFAULT NOW(), -- 更新时间
  deleted_at TIMESTAMPTZ                -- 软删除标记
);

-- 创建索引（提升查询性能）
CREATE INDEX sites_category_idx ON sites(category);
CREATE INDEX sites_sort_order_idx ON sites(sort_order);
CREATE INDEX sites_deleted_at_idx ON sites(deleted_at);
CREATE INDEX sites_updated_at_idx ON sites(updated_at);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. categories 表（分类数据）

```sql
-- 创建 categories 表
CREATE TABLE categories (
  key TEXT PRIMARY KEY,                 -- 分类唯一标识 (dev/tools/design)
  label TEXT NOT NULL,                  -- 分类显示名称
  icon TEXT,                            -- 分类图标
  color TEXT,                           -- 分类颜色
  parent_key TEXT,                      -- 父级分类 key，顶级为 NULL
  "order" INTEGER DEFAULT 0,            -- 排序顺序
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 父级索引（用于构建树）
CREATE INDEX categories_parent_key_idx ON categories(parent_key);

-- 插入默认分类
INSERT INTO categories (key, label, icon, color, parent_key, "order") VALUES
  ('dev', '开发', 'mdi:code-tags', '#60a5fa', NULL, 1),
  ('tools', '工具', 'mdi:tools', '#34d399', NULL, 2),
  ('design', '设计', 'mdi:palette', '#f472b6', NULL, 3),
  ('ai', 'AI', 'mdi:robot', '#a78bfa', NULL, 4);
```

#### 3. user_settings 表（不需要）

本项目**不保存用户设置到云端**，设置仅存于 LocalStorage，因此无需创建 `user_settings` 表。

### 执行 SQL

1. 进入 Supabase 控制台
2. 点击左侧 **SQL Editor**
3. 点击 **New Query**
4. 复制粘贴上述 SQL 代码
5. 点击 **Run** 执行

如已创建表，可执行以下迁移：

```sql
ALTER TABLE sites ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS sites_sort_order_idx ON sites(sort_order);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_key TEXT;
CREATE INDEX IF NOT EXISTS categories_parent_key_idx ON categories(parent_key);
```

---

## 安全策略配置

### Row Level Security (RLS)

默认情况下，Supabase 表是完全开放的。我们需要启用 RLS 并配置策略。

#### 方案 A：完全公开（适合单用户/演示）

```sql
-- 启用 RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（开发/演示环境）
CREATE POLICY "Allow all access to sites" ON sites
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to categories" ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

#### 方案 B：基于设备 ID（推荐，单用户多设备）

如果需要一定的隔离性，可以基于设备 ID：

```sql
-- 添加 device_id 字段
ALTER TABLE sites ADD COLUMN device_id TEXT;

-- 启用 RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- 仅允许操作自己设备的数据
CREATE POLICY "Users can manage own device sites" ON sites
  FOR ALL
  USING (device_id = current_setting('app.device_id', true))
  WITH CHECK (device_id = current_setting('app.device_id', true));
```

前端调用时设置 device_id：

```typescript
// 生成或获取设备 ID
const deviceId = localStorage.getItem('device_id') || nanoid()
localStorage.setItem('device_id', deviceId)

// 设置 RLS 上下文
await supabase.rpc('set_config', {
  name: 'app.device_id',
  value: deviceId
})
```

#### 方案 C：基于用户认证（可选，多用户支持）

如果以后需要支持多用户登录：

```sql
-- 添加 user_id 字段
ALTER TABLE sites ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- RLS 策略：仅允许操作自己的数据
CREATE POLICY "Users can manage own sites" ON sites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**建议：** 目前使用方案 A（完全公开），简单直接，适合单用户场景。

---

## 前端集成

### 1. 安装 Supabase SDK

```bash
npm install @supabase/supabase-js
```

### 2. 创建 Supabase 客户端

```typescript
// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient: SupabaseClient | null = null

/**
 * 获取 Supabase 客户端（懒加载）
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  // 检查是否配置了 Supabase
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured')
    return null
  }

  // 单例模式
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false  // 不需要认证，关闭 session 持久化
      }
    })
  }

  return supabaseClient
}
```

### 3. 封装数据库操作

```typescript
// lib/supabaseSync.ts
import { getSupabaseClient } from './supabase'
import type { Site, Category, GroupedSites } from '@/types'

/**
 * Supabase 数据库中的 Site 类型
 */
interface SupabaseSite {
  id: number
  category: string
  name: string
  url: string
  description: string | null
  icon: string | null
  tags: string[] | null
  visit_count: number
  last_visit: string | null
  is_custom: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/**
 * 转换 Supabase Site 到应用 Site
 */
function transformSite(dbSite: SupabaseSite): Site {
  return {
    id: dbSite.id,
    name: dbSite.name,
    url: dbSite.url,
    desc: dbSite.description || undefined,
    icon: dbSite.icon || undefined,
    tags: dbSite.tags || undefined,
    visitCount: dbSite.visit_count,
    lastVisit: dbSite.last_visit || undefined,
    isCustom: dbSite.is_custom,
    category: dbSite.category
  }
}

/**
 * 转换应用 Site 到 Supabase Site
 */
function toSupabaseSite(site: Site, categoryKey: string): Partial<SupabaseSite> {
  return {
    category: categoryKey,
    name: site.name,
    url: site.url,
    description: site.desc || null,
    icon: site.icon || null,
    tags: site.tags || null,
    visit_count: site.visitCount || 0,
    last_visit: site.lastVisit || null,
    is_custom: site.isCustom !== false
  }
}

/**
 * 加载所有网站（排除已删除）
 */
export async function loadSitesFromSupabase(): Promise<GroupedSites> {
  const client = await getSupabaseClient()
  if (!client) return {}

  const { data, error } = await client
    .from('sites')
    .select('*')
    .is('deleted_at', null)  // 排除软删除
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load sites:', error)
    throw error
  }

  // 按分类分组
  const grouped: GroupedSites = {}
  data?.forEach((dbSite: SupabaseSite) => {
    const site = transformSite(dbSite)
    if (!grouped[dbSite.category]) {
      grouped[dbSite.category] = []
    }
    grouped[dbSite.category].push(site)
  })

  return grouped
}

/**
 * 增量同步（仅拉取上次同步后的变更）
 */
export async function incrementalSync(lastSyncTime: string): Promise<GroupedSites> {
  const client = await getSupabaseClient()
  if (!client) return {}

  const { data, error } = await client
    .from('sites')
    .select('*')
    .gt('updated_at', lastSyncTime)  // 仅拉取更新的数据
    .is('deleted_at', null)
    .order('updated_at', { ascending: true })

  if (error) throw error

  // 按分类组织
  const grouped: GroupedSites = {}
  data?.forEach((dbSite: SupabaseSite) => {
    const site = transformSite(dbSite)
    if (!grouped[dbSite.category]) {
      grouped[dbSite.category] = []
    }
    grouped[dbSite.category].push(site)
  })

  return grouped
}

/**
 * 添加网站
 */
export async function addSiteToSupabase(
  categoryKey: string,
  site: Omit<Site, 'id'>
): Promise<Site> {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Supabase not available')

  const { data, error } = await client
    .from('sites')
    .insert(toSupabaseSite(site as Site, categoryKey))
    .select()
    .single()

  if (error) throw error

  return transformSite(data)
}

/**
 * 更新网站
 */
export async function updateSiteInSupabase(
  siteId: number,
  updates: Partial<Site>
): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Supabase not available')

  const { error } = await client
    .from('sites')
    .update({
      name: updates.name,
      url: updates.url,
      description: updates.desc || null,
      icon: updates.icon || null,
      tags: updates.tags || null,
      visit_count: updates.visitCount,
      last_visit: updates.lastVisit || null
    })
    .eq('id', siteId)

  if (error) throw error
}

/**
 * 删除网站（软删除）
 */
export async function deleteSiteFromSupabase(siteId: number): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Supabase not available')

  const { error } = await client
    .from('sites')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', siteId)

  if (error) throw error
}

/**
 * 加载分类
 */
export async function loadCategoriesFromSupabase(): Promise<Category[]> {
  const client = await getSupabaseClient()
  if (!client) return []

  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('order', { ascending: true })

  if (error) throw error

  return data.map(cat => ({
    key: cat.key,
    label: cat.label,
    icon: cat.icon || undefined,
    color: cat.color || undefined,
    parentKey: cat.parent_key || undefined,
    order: cat.order
  }))
}
```

### 4. 集成到 Pinia Store

```typescript
// stores/modules/site.ts
import { loadSitesFromSupabase, addSiteToSupabase } from '@/lib/supabaseSync'

export const useSiteStore = defineStore('site', () => {
  const customSites = ref<GroupedSites>({})

  /**
   * 从 Supabase 同步
   */
  async function syncFromSupabase() {
    const settingsStore = useSettingsStore()
    if (!settingsStore.hasCloudSync) return

    try {
      const cloudData = await loadSitesFromSupabase()
      // 合并到本地
      customSites.value = { ...customSites.value, ...cloudData }
      // 保存到 LocalStorage
      saveToLocalStorage()
    } catch (e) {
      console.error('Sync from Supabase failed:', e)
    }
  }

  /**
   * 添加网站（同时同步到云端）
   */
  async function addSite(categoryKey: string, site: Omit<Site, 'id'>) {
    // 1. 立即更新本地
    const tempSite = { ...site, id: Date.now(), isCustom: true }
    if (!customSites.value[categoryKey]) {
      customSites.value[categoryKey] = []
    }
    customSites.value[categoryKey].push(tempSite)

    // 2. 同步到云端
    const settingsStore = useSettingsStore()
    if (settingsStore.hasCloudSync) {
      try {
        const savedSite = await addSiteToSupabase(categoryKey, site)
        // 更新为云端 ID
        const index = customSites.value[categoryKey].findIndex(s => s.id === tempSite.id)
        if (index !== -1) {
          customSites.value[categoryKey][index] = savedSite
        }
      } catch (e) {
        console.error('Failed to sync to Supabase:', e)
        // 失败不影响本地使用
      }
    }

    return tempSite
  }

  return {
    customSites,
    syncFromSupabase,
    addSite
  }
})
```

---

## 环境变量管理

### 1. 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```

### 2. 添加到 .gitignore

```bash
# 环境变量文件
.env
.env.local
.env.*.local
```

### 3. 创建 .env.example（示例文件）

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

```

### 4. 在应用中使用

应用仅通过环境变量读取 Supabase 配置：

```typescript
// lib/supabase.ts
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
```

---

## Edge Function（AI 代理）

**Edge Function 是什么：** Supabase 提供的 Serverless 函数运行环境，可在云端执行自定义逻辑并向前端暴露 API。

为 AI 批量生成能力保密 DeepSeek Key，建议通过 Edge Function 代理调用：

- **前端**：只调用 Edge Function，不直接暴露 Key
- **函数环境变量**：配置 `DEEPSEEK_API_KEY`（Key 不放在设置里）
- **可选**：在函数内抓取网页元信息（title/description）再生成内容

结论：**DeepSeek Key 不应出现在设置页或前端代码**，由 Edge Function 持有并代理调用。

说明：该功能仅为规划，后续实现时会补充具体函数代码与部署步骤。

---

## 测试验证

### 1. 测试数据库连接

在浏览器控制台测试：

```javascript
// 测试连接
const { createClient } = supabase
const client = createClient(
  'https://your-project-id.supabase.co',
  'your-anon-key'
)

// 测试查询
const { data, error } = await client.from('categories').select('*')
console.log('Categories:', data, error)
```

### 2. 测试插入数据

```javascript
// 插入测试网站
const { data, error } = await client.from('sites').insert({
  category: 'dev',
  name: 'GitHub',
  url: 'https://github.com',
  description: '代码托管平台',
  icon: 'mdi:github',
  tags: ['代码', '开源']
}).select()

console.log('Inserted:', data, error)
```

### 3. 测试实时订阅

```javascript
// 订阅 sites 表变更
client
  .channel('sites-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'sites' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

---

## 常见问题

### 1. 跨域问题

Supabase 默认配置支持所有域名，无需额外配置 CORS。

### 2. API 请求频率限制

免费版限制：
- 每分钟 60 次请求
- 每天 50,000 次请求

建议：
- 使用增量同步减少请求
- 本地缓存优先
- 批量操作合并请求

### 3. 数据库容量限制

免费版 500MB 存储空间。

预估：
- 每个网站约 500 字节
- 500MB ≈ 100 万个网站记录（足够使用）

### 4. 安全性考虑

**anon key 是否安全？**
- anon key 可以安全暴露在前端
- RLS 策略控制数据访问权限
- 敏感操作使用 service_role key（仅在后端）

**如何防止滥用？**
- 启用 RLS 策略
- 设置合理的 API 频率限制
- 监控数据库使用情况（Supabase Dashboard）

### 5. 离线使用

Supabase 需要网络连接，但应用采用**离线优先**策略：
- 所有操作先更新 LocalStorage
- 网络可用时自动同步到 Supabase
- 离线时使用本地缓存数据

---

## 总结

### 配置清单

- [ ] 注册 Supabase 账号
- [ ] 创建项目并记录 URL 和 anon key
- [ ] 执行 SQL 创建表结构
- [ ] 配置 RLS 策略（推荐方案 A）
- [ ] 在项目中配置环境变量
- [ ] 测试数据库连接和 CRUD 操作
- [ ] （可选）配置实时订阅

### 下一步

配置完成后，可以开始实施：

1. **Phase 1**: 实现基础 CRUD 操作
2. **Phase 2**: 集成离线队列和冲突解决
3. **Phase 3**: 添加实时订阅（多设备同步）
4. **Phase 4**: 性能优化（批量操作、缓存策略）

---

**相关文档:**

- [← 数据持久化方案](./data-persistence.md)
- [返回架构总览 →](./ARCHITECTURE.md)
