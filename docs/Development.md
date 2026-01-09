# 开发文档

本文档包含项目的开发环境配置、项目结构、代码规范等开发相关信息。

---

## 目录

- [开发环境](#开发环境)
- [项目结构](#项目结构)
- [开发命令](#开发命令)
- [代码规范](#代码规范)
- [组件开发](#组件开发)
- [状态管理](#状态管理)
- [样式系统](#样式系统)
- [测试](#测试)

---

## 开发环境

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **编辑器**: VS Code (推荐)

### VS Code 推荐插件

```json
{
  "recommendations": [
    "Vue.volar",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "antfu.unocss"
  ]
}
```

### 环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置（可选）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 项目结构

```
geek-new-tab/
├── docs/                          # 文档目录
│   ├── Development.md             # 开发文档（本文件）
│   ├── ARCHITECTURE.md            # 架构设计
│   ├── state-management.md        # 状态管理设计
│   ├── components.md              # 组件设计
│   ├── data-persistence.md        # 数据持久化方案
│   └── supabase-setup.md          # Supabase 配置指南
│
├── public/                        # 静态资源
│   └── logo.svg                   # 项目 Logo
│
├── src/                           # 源代码
│   ├── components/                # Vue 组件
│   │   ├── ui/                    # shadcn-vue UI 组件
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── dialog/
│   │   │   ├── dropdown-menu/
│   │   │   ├── input/
│   │   │   ├── tabs/
│   │   │   └── ...
│   │   ├── layout/                # 布局组件
│   │   └── modals/                # 弹窗组件
│   │
│   ├── composables/               # 组合式函数
│   │   ├── useNavigation.js
│   │   ├── useSettings.js
│   │   ├── useSiteData.ts
│   │   └── useSiteManager.ts
│   │
│   ├── data/                      # 静态数据
│   │   ├── sites.js               # 默认网站数据
│   │   └── defaults.ts            # 默认配置
│   │
│   ├── lib/                       # 工具库
│   │   ├── utils.ts               # 通用工具函数
│   │   ├── storage.ts             # LocalStorage 管理
│   │   ├── supabase.ts            # Supabase 客户端
│   │   ├── supabaseSync.ts        # Supabase 同步逻辑
│   │   └── bookmarkParser.ts      # 书签解析器
│   │
│   ├── stores/                    # Pinia 状态管理
│   │   ├── index.ts               # Store 入口
│   │   ├── modules/
│   │   │   ├── settings.ts        # 设置 Store
│   │   │   ├── category.ts        # 分类 Store
│   │   │   ├── site.ts            # 网站 Store
│   │   │   └── search.ts          # 搜索 Store
│   │   └── plugins/
│   │       └── persistence.ts     # 持久化插件
│   │
│   ├── styles/                    # 样式文件
│   │   ├── main.css               # 主样式（极客主题）
│   │   └── tailwind.css           # Tailwind CSS 配置
│   │
│   ├── types/                     # TypeScript 类型
│   │   └── index.ts               # 类型定义
│   │
│   ├── App.vue                    # 根组件
│   └── main.js                    # 入口文件
│
├── index.html                     # HTML 入口
├── vite.config.js                 # Vite 配置
├── uno.config.js                  # UnoCSS 配置
├── components.json                # shadcn-vue 配置
├── tsconfig.json                  # TypeScript 配置
├── eslint.config.js               # ESLint 配置
└── package.json                   # 项目配置
```

---

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码检查并修复
npm run lint:fix

# 代码格式化
npm run format

# 运行测试
npm run test

# 运行测试（UI 模式）
npm run test:ui
```

### 添加 shadcn-vue 组件

```bash
# 添加单个组件
npx shadcn-vue@latest add button

# 添加多个组件
npx shadcn-vue@latest add button card input dialog

# 查看可用组件
npx shadcn-vue@latest add --help
```

---

## 代码规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| **组件文件** | PascalCase | `SiteCard.vue` |
| **组合式函数** | camelCase + use 前缀 | `useSiteManager.ts` |
| **Store 模块** | camelCase | `category.ts` |
| **工具函数** | camelCase | `parseBookmarkHtml` |
| **常量** | UPPER_SNAKE_CASE | `DEFAULT_SETTINGS` |
| **类型/接口** | PascalCase | `Site`, `Category` |

### 文件组织

```typescript
// 组件文件结构
<script setup lang="ts">
// 1. 导入
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'

// 2. Props & Emits
const props = defineProps<{...}>()
const emit = defineEmits<{...}>()

// 3. 状态
const loading = ref(false)

// 4. 计算属性
const isValid = computed(() => ...)

// 5. 方法
function handleClick() {...}

// 6. 生命周期
onMounted(() => {...})
</script>

<template>
  <!-- 模板 -->
</template>

<style scoped>
/* 样式（尽量使用 Tailwind） */
</style>
```

### Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具变更

**示例**:
```
feat(bookmark): add Chrome bookmark import feature
fix(search): fix search result not updating
docs(readme): update installation guide
```

---

## 组件开发

### 使用 shadcn-vue 组件

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>标题</CardTitle>
    </CardHeader>
    <CardContent>
      <Input placeholder="输入内容" />
      <Button>提交</Button>
    </CardContent>
  </Card>
</template>
```

### 组件分类

| 类型 | 目录 | 说明 |
|------|------|------|
| **UI 组件** | `components/ui/` | shadcn-vue 基础组件 |
| **布局组件** | `components/layout/` | 页面布局相关 |
| **业务组件** | `components/` | 业务逻辑组件 |
| **弹窗组件** | `components/modals/` | 对话框、模态框 |

---

## 状态管理

### Pinia Store 结构

```typescript
// stores/modules/example.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExampleStore = defineStore('example', () => {
  // 状态
  const items = ref<Item[]>([])
  const loading = ref(false)

  // 计算属性
  const itemCount = computed(() => items.value.length)

  // 操作
  function addItem(item: Item) {
    items.value.push(item)
  }

  async function fetchItems() {
    loading.value = true
    try {
      // ...
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    items,
    loading,
    // 计算属性
    itemCount,
    // 操作
    addItem,
    fetchItems
  }
})
```

### Store 模块

| Store | 职责 |
|-------|------|
| `settings` | 用户设置（外观、语言、快捷键） |
| `category` | 分类管理（CRUD、排序） |
| `site` | 网站管理（CRUD、云同步） |
| `search` | 搜索状态（查询、结果、历史） |

详见 [状态管理设计文档](./state-management.md)

---

## 样式系统

### Tailwind CSS + UnoCSS

项目同时使用 Tailwind CSS 4 和 UnoCSS：

- **Tailwind CSS**: shadcn-vue 组件样式
- **UnoCSS**: 原有极客主题样式

### CSS 变量

```css
/* src/styles/tailwind.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### 工具函数

```typescript
import { cn } from '@/lib/utils'

// 合并类名
<div :class="cn('base-class', props.class, { 'active': isActive })" />
```

---

## 测试

### 单元测试

使用 Vitest 进行单元测试：

```typescript
// example.test.ts
import { describe, it, expect } from 'vitest'
import { parseBookmarkHtml } from '@/lib/bookmarkParser'

describe('bookmarkParser', () => {
  it('should parse bookmark HTML', () => {
    const html = '<DL><DT><A HREF="https://example.com">Example</A></DT></DL>'
    const result = parseBookmarkHtml(html)
    expect(result).toHaveLength(1)
    expect(result[0].url).toBe('https://example.com')
  })
})
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test -- --watch

# UI 模式
npm run test:ui

# 覆盖率报告
npm run test -- --coverage
```

---

## 相关文档

- [架构设计](./ARCHITECTURE.md)
- [状态管理设计](./state-management.md)
- [组件设计](./components.md)
- [数据持久化方案](./data-persistence.md)
- [Supabase 配置指南](./supabase-setup.md)

---

## 常见问题

### Q: 如何添加新的 shadcn-vue 组件？

```bash
npx shadcn-vue@latest add <component-name>
```

### Q: 如何自定义主题颜色？

修改 `src/styles/tailwind.css` 中的 CSS 变量。

### Q: 如何启用云同步？

1. 创建 Supabase 项目
2. 配置 `.env.local` 环境变量
3. 执行数据库初始化 SQL

详见 [Supabase 配置指南](./supabase-setup.md)
