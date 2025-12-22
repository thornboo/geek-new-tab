# 数据持久化方案

> 离线优先 + 云端同步的完整数据管理策略

## 目录

- [设计目标](#设计目标)
- [三层存储架构](#三层存储架构)
- [数据流设计](#数据流设计)
- [同步策略](#同步策略)
- [冲突解决](#冲突解决)
- [离线支持](#离线支持)
- [数据迁移](#数据迁移)
- [最佳实践](#最佳实践)

---

## 设计目标

### 核心诉求

1. **离线优先** - 本地操作不依赖网络
2. **实时同步** - 云端数据自动同步到本地
3. **冲突解决** - 多设备编辑的冲突处理
4. **数据安全** - 防止数据丢失和损坏
5. **性能优化** - 增量同步,减少网络传输

### 非目标

- 不支持实时协作 (非多人同时编辑)
- 不支持版本回退 (非版本控制系统)
- 不加密本地数据 (浏览器环境限制)

---

## 三层存储架构

```
┌─────────────────────────────────────────────────────┐
│                   Pinia Store                        │
│              (内存中的响应式状态)                     │
│  - customSites: GroupedSites                        │
│  - settings: AppSettings (仅本地)                    │
│  - 业务逻辑和计算属性                                 │
└────────────┬────────────────────────┬────────────────┘
             │                        │
             │                        │
     ┌───────▼────────┐       ┌───────▼────────┐
     │  LocalStorage  │       │    Supabase    │
     │                │       │                │
     │  - 本地缓存     │       │  - 云端存储    │
     │  - 离线优先     │       │  - 跨设备同步  │
     │  - 设置仅本地   │       │  - 仅分类/站点 │
     │  - 即时读写     │       │  - 数据备份    │
     └────────────────┘       └────────────────┘
          (同步缓存)               (主数据源)
```

### 各层职责

| 层级 | 职责 | 优先级 |
|------|------|--------|
| **Pinia Store** | 响应式状态,业务逻辑 | 高 (运行时) |
| **LocalStorage** | 本地缓存,离线支持（含用户设置） | 中 (持久化) |
| **Supabase** | 云端存储,跨设备同步（仅分类/站点） | 低 (可选) |

---

## 数据流设计

### 1. 数据加载流程

```
应用启动
    ↓
┌───────────────────┐
│ Pinia Store 初始化 │
└─────────┬─────────┘
          │
          ├─→ [加载默认网站] (静态数据)
          │
          ├─→ [从 LocalStorage 恢复] (离线数据)
          │    ├─ customSites
          │    └─ settings
          │
          └─→ [从 Supabase 同步] (云端数据)
               ├─ 检查是否配置云同步
               ├─ 拉取云端最新数据（仅分类/站点）
               ├─ 合并到 customSites
               └─ 保存到 LocalStorage
```

**代码实现:**

```typescript
// stores/modules/site.ts
export const useSiteStore = defineStore('site', () => {
  const customSites = ref<GroupedSites>({})
  const initialized = ref(false)

  async function initialize() {
    if (initialized.value) return

    try {
      // 1. 加载默认网站
      await loadDefaultSites()

      // 2. 从 LocalStorage 恢复
      loadFromLocalStorage()

      // 3. 从 Supabase 同步 (异步,不阻塞)
      syncFromSupabase().catch(console.error)

      initialized.value = true
    } catch (e) {
      console.error('Failed to initialize:', e)
    }
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('geek-nav-customSites')
    if (saved) {
      try {
        customSites.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse localStorage:', e)
      }
    }
  }

  async function syncFromSupabase() {
    const settingsStore = useSettingsStore()
    if (!settingsStore.hasCloudSync) return

    const cloudData = await loadSitesFromSupabase()
    customSites.value = mergeData(customSites.value, cloudData)

    // 保存合并后的数据到 LocalStorage
    saveToLocalStorage()
  }

  return { customSites, initialize }
})
```

---

### 2. 数据写入流程

```
用户操作 (添加/编辑/删除网站)
    ↓
┌────────────────────┐
│ 更新 Pinia Store    │ (立即生效)
└─────────┬──────────┘
          │
          ├─→ [保存到 LocalStorage] (同步)
          │    └─ 持久化插件自动触发
          │
          └─→ [同步到 Supabase] (异步，仅分类/站点)
               ├─ 检查是否启用云同步
               ├─ 调用 Supabase API
               ├─ 成功: 更新 lastSyncTime
               └─ 失败: 加入重试队列
```

**代码实现:**

```typescript
// stores/modules/site.ts
async function addSite(categoryKey: string, site: Site) {
  try {
    // 1. 乐观更新 (立即更新 UI)
    if (!customSites.value[categoryKey]) {
      customSites.value[categoryKey] = []
    }
    const tempSite = { ...site, id: Date.now(), isCustom: true }
    customSites.value[categoryKey].push(tempSite)

    // 2. 持久化到 LocalStorage (Pinia 插件自动)

    // 3. 同步到 Supabase (异步)
    const settingsStore = useSettingsStore()
    if (settingsStore.hasCloudSync) {
      const saved = await addSiteToSupabase(categoryKey, tempSite)
      if (saved) {
        // 更新为云端 ID
        const index = customSites.value[categoryKey].findIndex(s => s.id === tempSite.id)
        if (index !== -1) {
          customSites.value[categoryKey][index] = saved
        }
      }
    }

    return tempSite
  } catch (e) {
    // 回滚本地更改
    customSites.value[categoryKey] = customSites.value[categoryKey].filter(
      s => s.id !== tempSite.id
    )
    throw e
  }
}
```

---

## 同步策略

### 1. 同步时机

| 触发场景 | 同步方式 | 优先级 |
|---------|---------|--------|
| **应用启动** | 拉取云端最新数据 | 高 |
| **用户操作** | 立即推送单条变更 | 高 |
| **定时同步** | 每 5 分钟全量对比 | 中 |
| **网络恢复** | 重试失败的操作 | 中 |
| **手动同步** | 用户点击"同步"按钮 | 低 |

---

### 2. 增量同步

**目标:** 仅同步变更的数据,减少网络传输。

**方案:** 使用 `updated_at` 时间戳追踪变更。

```typescript
// lib/supabaseSync.ts

/**
 * 增量同步 - 仅拉取上次同步后的变更
 */
export async function incrementalSync(lastSyncTime: string): Promise<GroupedSites> {
  const client = await getSupabaseClient()
  if (!client) return {}

  const { data, error } = await client
    .from('sites')
    .select('*')
    .gt('updated_at', lastSyncTime)  // 仅拉取更新的数据
    .order('updated_at', { ascending: true })

  if (error) throw error

  // 按分类组织
  const grouped: GroupedSites = {}
  data?.forEach((site: SupabaseSite) => {
    if (!grouped[site.category]) {
      grouped[site.category] = []
    }
    grouped[site.category].push(transformSite(site))
  })

  return grouped
}
```

**Store 集成:**

```typescript
// stores/modules/site.ts
const lastSyncTime = ref<string>(localStorage.getItem('lastSyncTime') || '')

async function syncFromSupabase() {
  const settingsStore = useSettingsStore()
  if (!settingsStore.hasCloudSync) return

  try {
    // 增量同步
    const changes = await incrementalSync(lastSyncTime.value)

    // 合并变更
    customSites.value = mergeData(customSites.value, changes)

    // 更新同步时间
    lastSyncTime.value = new Date().toISOString()
    localStorage.setItem('lastSyncTime', lastSyncTime.value)
  } catch (e) {
    console.error('Sync failed:', e)
  }
}
```

---

### 3. 实时订阅 (可选)

**使用 Supabase Realtime** 实现多设备实时同步。

```typescript
// stores/plugins/realtime.ts
import { RealtimeChannel } from '@supabase/supabase-js'

let realtimeChannel: RealtimeChannel | null = null

export function setupRealtime(store: any) {
  const settingsStore = useSettingsStore()
  if (!settingsStore.hasCloudSync) return

  // 订阅 sites 表变更
  realtimeChannel = client
    .channel('sites-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sites' },
      (payload) => {
        console.log('Realtime change:', payload)

        if (payload.eventType === 'INSERT') {
          // 新增网站
          const site = transformSite(payload.new)
          store.addSiteLocally(site.category, site)
        } else if (payload.eventType === 'UPDATE') {
          // 更新网站
          const site = transformSite(payload.new)
          store.updateSiteLocally(site.category, site.id, site)
        } else if (payload.eventType === 'DELETE') {
          // 删除网站
          store.deleteSiteLocally(payload.old.category, payload.old.id)
        }
      }
    )
    .subscribe()
}

export function teardownRealtime() {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe()
    realtimeChannel = null
  }
}
```

---

## 冲突解决

### 1. 冲突场景

| 场景 | 描述 | 示例 |
|------|------|------|
| **编辑冲突** | 两个设备同时编辑同一网站 | 设备A 改名为"GitHub", 设备B 改名为"Github" |
| **删除冲突** | 一个设备删除,另一个设备编辑 | 设备A 删除网站, 设备B 更新描述 |
| **创建冲突** | 同一分类添加同名网站 | 设备A 和 设备B 都添加"VSCode" |

---

### 2. 冲突解决策略

#### **Last Write Wins (LWW) - 最后写入优先**

**适用场景:** 简单的单用户跨设备同步。

**规则:** 以 `updated_at` 时间戳为准,最新的覆盖旧的。

```typescript
// 合并数据
function mergeData(local: GroupedSites, remote: GroupedSites): GroupedSites {
  const merged: GroupedSites = { ...local }

  Object.entries(remote).forEach(([category, remoteSites]) => {
    if (!merged[category]) {
      merged[category] = remoteSites
      return
    }

    // 合并同一分类下的网站
    remoteSites.forEach(remoteSite => {
      const localIndex = merged[category].findIndex(s => s.id === remoteSite.id)

      if (localIndex === -1) {
        // 新增的网站
        merged[category].push(remoteSite)
      } else {
        // 冲突检测: 比较时间戳
        const localSite = merged[category][localIndex]
        const localTime = new Date(localSite.lastVisit || 0).getTime()
        const remoteTime = new Date(remoteSite.lastVisit || 0).getTime()

        if (remoteTime > localTime) {
          // 远程更新,覆盖本地
          merged[category][localIndex] = remoteSite
        }
        // 否则保持本地数据
      }
    })
  })

  return merged
}
```

---

#### **三路合并 (Three-Way Merge) - 高级策略**

**适用场景:** 需要保留双方修改的情况。

**规则:** 基于共同祖先版本,智能合并双方变更。

```typescript
interface SiteVersion {
  site: Site
  version: number
  updatedAt: string
}

function threeWayMerge(
  base: Site,    // 共同祖先
  local: Site,   // 本地版本
  remote: Site   // 远程版本
): Site {
  const merged: Site = { ...base }

  // 检查每个字段的变更
  const fields: (keyof Site)[] = ['name', 'url', 'desc', 'icon', 'tags']

  fields.forEach(field => {
    const baseValue = base[field]
    const localValue = local[field]
    const remoteValue = remote[field]

    if (localValue === remoteValue) {
      // 无冲突
      merged[field] = localValue
    } else if (localValue === baseValue) {
      // 仅远程修改
      merged[field] = remoteValue
    } else if (remoteValue === baseValue) {
      // 仅本地修改
      merged[field] = localValue
    } else {
      // 双方都修改 - 冲突!
      // 策略: 优先远程 (或提示用户选择)
      merged[field] = remoteValue
      console.warn(`Conflict in field "${field}": local=${localValue}, remote=${remoteValue}`)
    }
  })

  return merged
}
```

---

### 3. 删除冲突处理

**场景:** 设备A 删除网站,设备B 编辑同一网站。

**策略:** 使用"软删除" (deleted_at 字段)。

```sql
-- Supabase 表结构
CREATE TABLE sites (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- 软删除标记
);
```

```typescript
// 删除网站 (软删除)
export async function deleteSiteFromSupabase(siteId: number): Promise<void> {
  const client = await getSupabaseClient()
  if (!client) return

  const { error } = await client
    .from('sites')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', siteId)

  if (error) throw error
}

// 查询时过滤已删除
export async function loadSitesFromSupabase(): Promise<GroupedSites> {
  const client = await getSupabaseClient()
  if (!client) return {}

  const { data, error } = await client
    .from('sites')
    .select('*')
    .is('deleted_at', null)  // 排除已删除
    .order('created_at', { ascending: true })

  // ...
}
```

---

## 离线支持

### 1. 离线队列

**目标:** 网络断开时,缓存操作到队列,网络恢复后自动重试。

```typescript
// lib/offlineQueue.ts

interface QueuedOperation {
  id: string
  type: 'add' | 'update' | 'delete'
  categoryKey: string
  payload: any
  timestamp: string
  retryCount: number
}

class OfflineQueue {
  private queue: QueuedOperation[] = []
  private processing = false

  constructor() {
    this.loadFromStorage()
    this.setupNetworkListener()
  }

  // 添加操作到队列
  enqueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>) {
    const item: QueuedOperation = {
      ...operation,
      id: nanoid(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    }

    this.queue.push(item)
    this.saveToStorage()
  }

  // 处理队列
  async processQueue() {
    if (this.processing || !navigator.onLine) return

    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue[0]

      try {
        await this.executeOperation(item)
        this.queue.shift()  // 成功,移除
        this.saveToStorage()
      } catch (e) {
        console.error('Operation failed:', e)
        item.retryCount++

        if (item.retryCount >= 3) {
          // 重试3次后放弃
          this.queue.shift()
          this.saveToStorage()
        } else {
          // 等待重试
          break
        }
      }
    }

    this.processing = false
  }

  // 执行单个操作
  private async executeOperation(item: QueuedOperation) {
    const { type, categoryKey, payload } = item

    switch (type) {
      case 'add':
        await addSiteToSupabase(categoryKey, payload)
        break
      case 'update':
        await updateSiteInSupabase(payload.id, payload)
        break
      case 'delete':
        await deleteSiteFromSupabase(payload.id)
        break
    }
  }

  // 监听网络状态
  private setupNetworkListener() {
    window.addEventListener('online', () => {
      console.log('Network restored, processing queue...')
      this.processQueue()
    })
  }

  // 持久化队列
  private saveToStorage() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue))
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('offlineQueue')
    if (saved) {
      this.queue = JSON.parse(saved)
    }
  }
}

export const offlineQueue = new OfflineQueue()
```

**集成到 Store:**

```typescript
// stores/modules/site.ts
async function addSite(categoryKey: string, site: Site) {
  // 1. 立即更新本地
  customSites.value[categoryKey].push(site)

  // 2. 尝试同步到云端
  const settingsStore = useSettingsStore()
  if (settingsStore.hasCloudSync) {
    try {
      if (navigator.onLine) {
        await addSiteToSupabase(categoryKey, site)
      } else {
        // 离线,加入队列
        offlineQueue.enqueue({
          type: 'add',
          categoryKey,
          payload: site
        })
      }
    } catch (e) {
      // 失败,加入队列
      offlineQueue.enqueue({
        type: 'add',
        categoryKey,
        payload: site
      })
    }
  }
}
```

---

### 2. 离线指示器

**UI 组件:**

```vue
<!-- components/ui/OfflineIndicator.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<template>
  <div v-if="!isOnline" class="offline-indicator">
    <Icon icon="mdi:wifi-off" />
    <span>离线模式 - 数据将在网络恢复后同步</span>
  </div>
</template>

<style scoped>
.offline-indicator {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 0.75rem 1rem;
  background: #f59e0b;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
</style>
```

---

## 数据迁移

### 1. 版本管理

**LocalStorage 版本控制:**

```typescript
// lib/migration.ts

const CURRENT_VERSION = 2

interface MigrationContext {
  from: number
  to: number
  data: any
}

// 迁移映射
const migrations: Record<number, (ctx: MigrationContext) => any> = {
  // V1 -> V2: 添加 visitCount 字段
  2: (ctx) => {
    const { data } = ctx
    Object.values(data.customSites || {}).forEach((sites: any[]) => {
      sites.forEach(site => {
        if (!site.visitCount) {
          site.visitCount = 0
        }
      })
    })
    return data
  },

  // V2 -> V3: 重命名字段
  3: (ctx) => {
    const { data } = ctx
    // 执行迁移逻辑
    return data
  }
}

/**
 * 执行数据迁移
 */
export function migrate(): void {
  const versionKey = 'geek-nav-data-version'
  const dataKey = 'geek-nav-data'

  let currentVersion = parseInt(localStorage.getItem(versionKey) || '1')
  let data = JSON.parse(localStorage.getItem(dataKey) || '{}')

  // 逐步执行迁移
  while (currentVersion < CURRENT_VERSION) {
    const nextVersion = currentVersion + 1
    const migrateFn = migrations[nextVersion]

    if (migrateFn) {
      console.log(`Migrating from v${currentVersion} to v${nextVersion}`)
      data = migrateFn({ from: currentVersion, to: nextVersion, data })
      currentVersion = nextVersion
    } else {
      console.error(`Migration not found for v${nextVersion}`)
      break
    }
  }

  // 保存迁移后的数据
  localStorage.setItem(dataKey, JSON.stringify(data))
  localStorage.setItem(versionKey, String(currentVersion))
}
```

**在应用启动时执行:**

```typescript
// main.ts
import { migrate } from '@/lib/migration'

// 执行数据迁移
migrate()

// 然后初始化应用
const app = createApp(App)
app.use(pinia)
app.mount('#app')
```

---

### 2. 数据导入/导出

```typescript
// lib/dataExport.ts

/**
 * 导出所有数据为 JSON
 */
export function exportData(): string {
  const siteStore = useSiteStore()
  const settingsStore = useSettingsStore()

  const exportData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    customSites: siteStore.customSites,
    settings: settingsStore.settings
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * 导入数据
 */
export function importData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString)

    // 验证数据格式
    if (!data.version || !data.customSites) {
      throw new Error('Invalid data format')
    }

    // 执行迁移 (如果版本不一致)
    const migrated = migrateImportedData(data)

    // 导入到 Store
    const siteStore = useSiteStore()
    const settingsStore = useSettingsStore()

    siteStore.customSites = migrated.customSites
    settingsStore.settings = migrated.settings

    // 同步到云端
    siteStore.syncToCloud()
  } catch (e) {
    console.error('Import failed:', e)
    throw e
  }
}
```

---

## 最佳实践

### 1. 错误处理

```typescript
// 优雅降级
async function syncToCloud() {
  try {
    await uploadToSupabase()
  } catch (e) {
    // 失败不影响本地使用
    console.error('Sync failed, will retry later:', e)
    offlineQueue.enqueue(operation)
  }
}

// 阻塞用户操作
async function syncToCloud() {
  await uploadToSupabase()  // 网络错误会卡住
}
```

---

### 2. 性能优化

```typescript
// 批量操作
async function batchSync(sites: Site[]) {
  await client.from('sites').upsert(sites)
}

// 逐条插入
async function badSync(sites: Site[]) {
  for (const site of sites) {
    await client.from('sites').insert(site)  // N 次网络请求
  }
}
```

---

### 3. 数据校验

```typescript
// 校验数据完整性
function validateSite(site: Site): boolean {
  if (!site.name || !site.url) return false
  try {
    new URL(site.url)  // 验证 URL 格式
    return true
  } catch {
    return false
  }
}

// 直接保存未验证的数据
function saveSite(site: any) {
  customSites.value.push(site)  // 可能包含无效数据
}
```

---

## 总结

### 数据持久化方案总览

| 维度 | 方案 |
|------|------|
| **本地存储** | LocalStorage + Pinia 持久化插件 |
| **云端存储** | Supabase PostgreSQL |
| **同步策略** | 离线优先 + 增量同步 |
| **冲突解决** | Last Write Wins (LWW) |
| **离线支持** | 离线队列 + 自动重试 |
| **数据迁移** | 版本化迁移系统 |

---

**相关文档:**

- [← 组件化设计](./components.md)
- [性能优化 →](./performance.md)
