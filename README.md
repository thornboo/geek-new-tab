# Geek New Tab

极客导航 - 程序员的导航网站

## 完整架构文档

**重要:** 项目已完成完整的架构设计文档,请在开发前务必阅读:

- **[架构总览 (ARCHITECTURE.md)](./docs/ARCHITECTURE.md)** - 项目整体架构设计
- **[状态管理设计](./docs/state-management.md)** - Pinia Store 模块设计
- **[组件化设计](./docs/components.md)** - Vue 组件架构与最佳实践
- **[数据持久化方案](./docs/data-persistence.md)** - 本地存储 + 云端同步策略
- **[Supabase 配置指南](./docs/supabase-setup.md)** - 云数据库完整配置方案
- **[性能优化策略](./docs/performance.md)** - 全面的性能优化方案

---

## 技术栈

### 核心框架

- **Vue 3** - 渐进式 JavaScript 框架 (Composition API)
- **Vite 5** - 下一代前端构建工具
- **Pinia** - Vue 3 官方推荐状态管理库 (计划集成)
- **TypeScript** - JavaScript 的超集,提供类型系统

### UI & 样式

- **UnoCSS** - 原子化 CSS 引擎
- **@iconify/vue** - 统一的图标框架

### 后端 & 存储

- **Supabase** - 开源 Firebase 替代方案
  - PostgreSQL 数据库
  - 实时订阅
  - 认证系统
- **LocalStorage** - 浏览器本地存储

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

### 云同步配置（Supabase）

在项目根目录创建 `.env.local`：

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 构建生产版本

```bash
npm run build
```

---

## 项目结构

```
geek-new-tab/
├── docs/                      # 架构设计文档
│   ├── ARCHITECTURE.md        # 架构总览
│   ├── state-management.md    # 状态管理设计
│   ├── components.md          # 组件化设计
│   ├── data-persistence.md    # 数据持久化方案
│   ├── performance.md         # 性能优化策略
│   └── tauri-integration.md   # 历史文档（已弃用）
│
├── prototypeDesign/           # 原型设计 (纯 HTML/CSS/JS)
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── index.html
│   ├── app.js
│   ├── config.js
│   └── styles.css
│
├── src/                       # 源代码
│   ├── assets/                # 静态资源
│   │   └── icons/             # 图标资源
│   │
│   ├── components/            # Vue 组件
│   │   ├── layout/            # 布局组件
│   │   ├── ui/                # UI 组件
│   │   ├── modals/            # 弹窗组件
│   │   └── widgets/           # 复合组件
│   │
│   ├── composables/           # 组合式函数
│   │   ├── useNavigation.js
│   │   ├── useSettings.js
│   │   ├── useSiteData.ts
│   │   └── useSiteManager.ts
│   │
│   ├── data/                  # 静态数据
│   │   └── sites.js           # 默认网站数据
│   │
│   ├── entries/               # 多页面入口
│   │   ├── bootstrap.js
│   │   ├── category.js
│   │   ├── settings.js
│   │   ├── data.js
│   │   └── about.js
│   │
│   ├── lib/                   # 工具库
│   │   ├── storage.ts         # LocalStorage 管理
│   │   ├── supabase.ts        # Supabase 客户端
│   │   └── supabaseSync.ts    # Supabase 同步逻辑
│   │
│   ├── pages/                 # 页面组件
│   │   ├── HomePage.vue
│   │   ├── CategoryPage.vue
│   │   ├── SettingsPage.vue
│   │   ├── DataPage.vue
│   │   └── AboutPage.vue
│   │
│   └── styles/                # 全局样式
│       └── main.css
│
├── index.html                 # 主 HTML 入口
├── vite.config.ts             # Vite 配置
├── uno.config.ts              # UnoCSS 配置
├── package.json
└── README.md
```

---

## 页面说明

本项目采用**单页应用 (SPA)** 形态，所有功能集中在首页完成：
- **首页**: `/` - 搜索、分类、网站管理、设置与数据管理

---

## 核心功能

### 已实现

- [x] 基础布局 (侧边栏 + 主内容区)
- [x] 分类管理 (创建/编辑/删除分类)
- [x] 网站管理 (添加/编辑/删除网站)
- [x] 本地存储 (LocalStorage)
- [x] Supabase 云同步 (可选)
- [x] 响应式设计

### 开发中

- [ ] 访问统计与热门网站
- [ ] 高级搜索 (支持标签、描述)
- [ ] 拖拽排序
- [ ] 主题切换 (暗色/亮色)
- [ ] 快捷键增强

### 计划中

- [ ] 虚拟滚动 (大列表优化)
- [ ] Web Worker 搜索

---

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建 Vue 组件
2. 在 `src/entries/` 创建入口文件
3. 在根目录创建对应的 HTML 文件
4. 在 `vite.config.ts` 中配置多页面入口

### 状态管理

当前使用 **Composables** 模式,计划迁移到 **Pinia**。

详见: [状态管理设计文档](./docs/state-management.md)

### 组件开发

遵循 **单一职责原则**,组件分为三类:

- **纯展示组件** (UI) - 只负责渲染
- **容器组件** (Container) - 负责数据和逻辑
- **复合组件** (Composite) - 组合多个子组件

详见: [组件化设计文档](./docs/components.md)

---

## 原型设计

项目包含纯 HTML/CSS/JS 的原型设计,位于 `prototypeDesign/` 目录:

- **查看原型**: 直接打开 `prototypeDesign/index.html`
- **原型文档**: [prototypeDesign/README.md](./prototypeDesign/README.md)

原型设计用于快速验证功能和交互,正式项目基于原型重构为 Vue 3 架构。

---

## 配置 Supabase (可选)

### 1. 创建 Supabase 项目

访问 [Supabase](https://supabase.com),创建新项目。

### 2. 创建数据表

执行以下 SQL:

```sql
CREATE TABLE sites (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- 允许所有操作 (开发环境)
CREATE POLICY "Enable all for public" ON sites
  FOR ALL USING (true);
```

### 3. 配置环境变量

在应用设置页面填入:

- **Supabase URL**: `https://your-project.supabase.co`
- **Supabase Key**: `your-anon-key`

---

## 贡献指南

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- **TypeScript** - 优先使用 TypeScript
- **组件命名** - PascalCase (如 `SiteCard.vue`)
- **函数命名** - camelCase (如 `getSitesByCategory`)
- **常量命名** - UPPER_SNAKE_CASE (如 `DEFAULT_SETTINGS`)
- **代码格式化** - 使用 Prettier (配置见 `.prettierrc`)

---

## 许可证

MIT License

---

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [UnoCSS](https://unocss.dev/) - 即时按需原子化 CSS 引擎
- [Iconify](https://iconify.design/) - 统一的图标框架

---

## 联系方式

- **Issues**: [GitHub Issues](https://github.com/your-username/geek-new-tab/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/geek-new-tab/discussions)

---

**Happy Coding!**
