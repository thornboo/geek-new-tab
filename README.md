# Geek New Tab

极客导航 - 程序员的导航网站

## 技术栈

- Vue 3 + Composition API
- Vite 5
- UnoCSS (原子化 CSS)
- @iconify/vue (图标)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 页面说明（非 SPA / 多页面网站）

- 首页：`/`（默认展示“搜索”分类）
- 分类页：`/category/search/`（每个分类都有独立静态页面）
- 设置页：`/settings/`
- 数据页：`/data/`
- 关于页：`/about/`

兼容旧地址（会自动跳转）：
- 分类页：`/category.html?id=search`
- 设置页：`/settings.html`
- 数据页：`/data.html`
- 关于页：`/about.html`

## 功能规划

- [x] 基础布局（侧边栏 + 主内容区）
- [ ] 多引擎搜索
- [ ] 快捷链接管理
- [ ] 书签同步
- [ ] 本地账户切换
- [ ] 主题切换

## 目录结构

```
src/
├── assets/                # 静态资源
│   └── icons/             # 图标资源
├── components/            # 组件（layout/ui/modals）
├── composables/           # 组合式函数（状态/业务）
├── data/                  # 静态数据
├── entries/               # 多页面入口（每个 HTML 对应一个入口）
├── pages/                 # 页面装配（布局 + 视图）
├── styles/                # 全局样式
└── views/                 # 视图（页面主体）
```
