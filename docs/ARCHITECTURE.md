# Geek New Tab - 架构设计文档

> 从原型设计到生产级 Vue 3 + Tauri 应用的完整架构方案

## 目录

- [概览](#概览)
- [原型分析](#原型分析)
- [技术栈选型](#技术栈选型)
- [架构设计](#架构设计)
- [核心模块](#核心模块)
- [实施路线图](#实施路线图)
- [相关文档](#相关文档)

---

## 概览

### 项目定位

Geek New Tab 是一个面向程序员和极客的浏览器新标签页/桌面应用，提供高效的网站导航管理、多引擎搜索、访问统计和云端同步功能。

### 设计目标

**核心原则**
- 简洁高效 - 专注核心功能，避免冗余
- 响应迅速 - 首屏加载 < 1s，交互延迟 < 100ms
- 数据安全 - 本地优先，可选云端同步
- 高度定制 - 主题、布局、快捷键自定义
- 跨平台 - Web 应用 + Tauri 桌面端

**非目标**
- 不做复杂的协作功能
- 不做社交分享
- 不做广告推荐

---

## 原型分析

### 原型架构回顾

原型使用纯 HTML/CSS/JavaScript 实现，包含以下核心功能：

**数据结构**
```javascript
{
  categories: [
    {
      key: 'dev',
      label: '开发',
      sites: [
        {
          name: 'GitHub',
          url: 'https://github.com',
          icon: 'mdi:github',
          desc: '代码托管平台',
          tags: ['代码', '开源'],
          visitCount: 5,
          lastVisit: '2023-...'
        }
      ]
    }
  ],
  engines: {
    g: { name: '谷歌', url: 'https://www.google.com/search?q=' }
  }
}

{
  bgType: 'default',
  bgValue: '',
  overlayOpacity: 50,
  primaryColor: '#60a5fa',
  textColor: '#e4e4e7',
  locale: 'zh-CN'
}
```

**核心功能模块**
- 分类管理（创建/编辑/删除/切换）
- 网站管理（添加/编辑/删除）
- 站内搜索（实时过滤）
- 访问统计（记录次数和时间）
- 主题定制（颜色/背景/透明度）
- 数据管理（备份/导入/导出/重置）
- 快捷键支持（/聚焦搜索、Ctrl+S设置、Ctrl+N添加等）

**原型的优点**
- 功能完整，交互流畅
- 极客风格明确（等宽字体、命令行美学）
- 卡片翻转动画效果出色

**原型的局限**
- 全局变量，无响应式系统
- 手动 DOM 操作，易出错
- 无模块化，单文件 728 行
- 无类型检查
- localStorage 手动管理

---

## 技术栈选型

### 前端框架

**Vue 3**
- 选择理由：渐进式框架，Composition API 适合模块化，响应式系统强大
- 替代方案：React（学习曲线陡）、Svelte（生态较小）

**Vite**
- 选择理由：开发体验极佳，HMR 速度快，ESM 原生支持
- 替代方案：Webpack（配置复杂）、Rollup（功能不足）

**TypeScript**
- 选择理由：类型安全，IDE 支持好，重构友好
- 替代方案：纯 JS（易出错，维护困难）

### 状态管理

**Pinia**
- 选择理由：Vue 3 官方推荐，TypeScript 支持完善，轻量级
- 对比 Vuex：更简洁的 API，自动 code splitting，更好的 TS 推导
- 对比 Composables：全局状态共享，DevTools 支持，插件生态

### UI 方案

**UnoCSS**
- 选择理由：原子化 CSS，按需生成，性能极佳
- 对比 TailwindCSS：更快的构建速度，更灵活的配置

**Iconify**
- 选择理由：统一图标接口，支持 100+ 图标集，按需加载

### 数据存储

**LocalStorage**
- 用途：本地缓存，离线支持
- 限制：5-10MB 容量限制

**Supabase**
- 用途：云端存储，跨设备同步
- 优势：开源，PostgreSQL，实时订阅，认证系统

### 桌面端

**Tauri**
- 选择理由：包体积小（3-5MB vs Electron 50-100MB），性能好，安全性高
- 对比 Electron：使用系统 WebView，Rust 后端，更低的资源占用

---

## 架构设计

### 整体架构

```
应用层 (Application Layer)
├── Vue 3 前端
│   ├── Pages (页面)
│   ├── Components (组件)
│   └── Composables (组合函数)
│
├── Pinia Stores (状态管理)
│   ├── Site Store (网站数据)
│   ├── Settings Store (用户设置)
│   ├── Category Store (分类管理)
│   └── Search Store (搜索状态)
│
├── Data Layer (数据层)
│   ├── LocalStorage (本地缓存)
│   └── Supabase (云端同步)
│
└── Tauri Backend (桌面端 - 可选)
    ├── Window API (窗口控制)
    ├── File System (文件操作)
    └── System Tray (系统托盘)
```

### 数据流

```
用户操作
   ↓
Vue 组件
   ↓
Pinia Store Action
   ↓
├─→ 更新 State (立即响应)
│
├─→ LocalStorage (同步持久化)
│
└─→ Supabase (异步云端同步)
```

### 目录结构规划

```
geek-new-tab/
├── docs/                      # 架构文档
├── src/
│   ├── stores/                # Pinia Store 模块
│   │   ├── modules/
│   │   │   ├── site.ts
│   │   │   ├── settings.ts
│   │   │   ├── category.ts
│   │   │   └── search.ts
│   │   ├── plugins/
│   │   │   ├── persistence.ts
│   │   │   └── sync.ts
│   │   └── index.ts
│   │
│   ├── components/            # Vue 组件
│   │   ├── layout/           # 布局组件
│   │   ├── ui/               # UI 组件
│   │   ├── modals/           # 弹窗组件
│   │   └── widgets/          # 复合组件
│   │
│   ├── composables/          # 组合式函数
│   │   ├── useModal.ts
│   │   ├── useKeyboard.ts
│   │   └── useTheme.ts
│   │
│   ├── lib/                  # 工具库
│   │   ├── storage.ts
│   │   ├── supabase.ts
│   │   └── tauri.ts
│   │
│   ├── types/                # TypeScript 类型
│   │   └── index.ts
│   │
│   ├── pages/                # 页面
│   │   └── Home.vue
│   │
│   └── App.vue
│
├── src-tauri/                # Tauri 后端 (可选)
│   ├── src/
│   │   └── main.rs
│   └── tauri.conf.json
│
├── index.html
├── vite.config.ts
└── package.json
```

---

## 核心模块

### 1. 状态管理（Pinia Stores）

详见：[state-management.md](./state-management.md)

**设计要点**
- 模块化划分：site/settings/category/search
- 类型安全：完整的 TypeScript 类型定义
- 插件化：持久化插件、同步插件
- 单向数据流：Actions → State → View

### 2. 组件化设计

详见：[components.md](./components.md)

**组件分层**
- Layout 组件：AppLayout、AppHeader、AppSidebar
- UI 组件：SiteCard、SearchBar、CategoryTab
- Modal 组件：SiteFormModal、SettingsModal
- Widget 组件：SiteGrid、TopSites、RecentVisits

**设计原则**
- 单一职责：每个组件只负责一个功能
- Props Down, Events Up：父子组件通信规范
- 可复用性：UI 组件纯展示，无业务逻辑

### 3. 数据持久化

详见：[data-persistence.md](./data-persistence.md)

**三层架构**
- Pinia Store：内存中的响应式状态
- LocalStorage：本地缓存，离线优先
- Supabase：云端存储，可选同步

**同步策略**
- 离线优先：本地操作立即生效
- 增量同步：仅同步变更数据
- 冲突解决：Last Write Wins (LWW)

### 4. 性能优化

详见：[performance.md](./performance.md)

**关键优化点**
- 代码分割：路由级别 + 组件级别
- 虚拟滚动：大列表渲染优化
- Tree Shaking：移除未使用代码
- 懒加载：图片、图标按需加载
- 防抖节流：搜索输入优化

### 5. Tauri 集成

详见：[tauri-integration.md](./tauri-integration.md)

**原生能力**
- 窗口控制：最小化/最大化/置顶
- 系统托盘：快速访问
- 全局快捷键：Ctrl+Shift+G 唤起
- 文件系统：配置导入/导出
- 剪贴板：复制网站链接

---

## 实施路线图

### Phase 1: 基础架构搭建 (Week 1-2)

**目标：** 搭建 Vue 3 + Pinia 项目骨架

**任务清单**
- [ ] 初始化 Vite + Vue 3 + TypeScript 项目
- [ ] 安装 Pinia、UnoCSS、Iconify
- [ ] 创建 types/index.ts 类型定义
- [ ] 创建 Pinia Store 基础结构
- [ ] 实现 LocalStorage 持久化插件
- [ ] 搭建基础布局组件

**验收标准**
- 项目可以正常启动
- Pinia DevTools 可用
- 类型检查无错误

---

### Phase 2: 核心功能实现 (Week 3-4)

**目标：** 实现原型的核心功能

**任务清单**
- [ ] 实现 Site Store（网站 CRUD）
- [ ] 实现 Category Store（分类管理）
- [ ] 实现 Settings Store（用户设置）
- [ ] 实现 SiteCard 组件
- [ ] 实现 SiteGrid 组件
- [ ] 实现 SearchBar 组件
- [ ] 实现分类导航
- [ ] 实现站内搜索

**验收标准**
- 所有原型功能都可用
- 数据持久化正常
- 搜索功能流畅

---

### Phase 3: Supabase 集成 (Week 5)

**目标：** 实现云端同步

**任务清单**
- [ ] 配置 Supabase 项目
- [ ] 创建 sites 表
- [ ] 实现 Supabase 客户端封装
- [ ] 实现数据同步逻辑
- [ ] 实现离线队列
- [ ] 实现冲突解决
- [ ] 添加同步状态 UI

**验收标准**
- 数据可以同步到云端
- 离线操作可以正常排队
- 多设备同步无冲突

---

### Phase 4: 性能优化 (Week 6)

**目标：** 优化加载和运行时性能

**任务清单**
- [ ] 实现虚拟滚动
- [ ] 代码分割优化
- [ ] 图片懒加载
- [ ] 搜索防抖
- [ ] Bundle 体积分析
- [ ] Lighthouse 性能测试

**验收标准**
- 首屏加载 < 1s
- 列表滚动 60fps
- Lighthouse 分数 > 90

---

### Phase 5: Tauri 桌面化 (Week 7-8)

**目标：** 打包为桌面应用

**任务清单**
- [ ] 初始化 Tauri 项目
- [ ] 实现窗口控制
- [ ] 实现系统托盘
- [ ] 实现全局快捷键
- [ ] 实现文件导入/导出
- [ ] 配置应用图标
- [ ] 打包测试

**验收标准**
- Windows/macOS/Linux 可正常运行
- 包体积 < 10MB
- 启动速度 < 1s

---

## 相关文档

### 详细设计文档

- [状态管理架构设计](./state-management.md)
- [组件化架构设计](./components.md)
- [数据持久化方案](./data-persistence.md)
- [Supabase 配置指南](./supabase-setup.md)
- [性能优化策略](./performance.md)
- [Tauri 集成方案](./tauri-integration.md)

### 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Tauri 官方文档](https://tauri.app/)
- [Supabase 文档](https://supabase.com/docs)
- [UnoCSS 文档](https://unocss.dev/)

---

## 版本历史

- v1.0.0 (2025-12-21): 初始架构设计
