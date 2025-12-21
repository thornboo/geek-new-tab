# Geek Tab - 极客新标签页

一个现代化的浏览器新标签页应用，专为极客和开发者设计。

## 🚀 功能特性

### 核心功能
- **分类管理** - 创建、编辑、删除网站分类
- **网站管理** - 添加、编辑、删除网站，支持图标、描述、标签
- **站内搜索** - 实时搜索所有网站
- **访问统计** - 记录网站访问次数和时间
- **快捷键支持** - 键盘快捷操作

### 界面特性
- **侧边栏导航** - 左侧分类导航，右侧内容区域
- **卡片翻转** - 鼠标悬停显示网站详情和操作按钮
- **响应式设计** - 适配桌面和移动设备
- **极客风格** - 深色主题，等宽字体，命令行风格

### 个性化
- **主题定制** - 自定义主题色、文本颜色
- **背景设置** - 支持默认、随机图片、自定义图片
- **数据管理** - 配置备份、导入导出、重置

## 📁 项目结构

```
geek-newtab/
├── index.html      # 主HTML文件
├── styles.css      # 样式文件
├── config.js       # 配置和默认数据
├── app.js          # 主应用逻辑
└── README.md       # 项目文档
```

## 🏗️ 架构设计

### 数据结构
```javascript
// 网站数据结构
{
  categories: [
    {
      key: 'dev',           // 分类唯一标识
      label: '开发',        // 分类显示名称
      sites: [
        {
          name: 'GitHub',           // 网站名称
          url: 'https://github.com', // 网站链接
          icon: 'mdi:github',       // 图标代码
          desc: '代码托管平台',      // 描述
          tags: ['代码', '开源'],    // 标签
          visitCount: 5,            // 访问次数
          lastVisit: '2023-...'     // 最后访问时间
        }
      ]
    }
  ],
  engines: {
    // 搜索引擎配置（已移除，改为纯站内搜索）
  }
}

// 配置数据结构
{
  bgType: 'default',        // 背景类型
  bgValue: '',              // 背景值
  overlayOpacity: 50,       // 遮罩透明度
  primaryColor: '#60a5fa',  // 主题色
  textColor: '#e4e4e7',     // 文本颜色
  locale: 'zh-CN'           // 语言区域
}
```

### 核心模块

#### 1. 数据管理 (app.js)
- `loadData()` - 从localStorage加载数据
- `saveDb()` / `saveConfig()` - 保存数据到localStorage
- `applyAllSettings()` - 应用配置到界面

#### 2. 界面渲染 (app.js)
- `renderTabs()` - 渲染分类导航
- `renderGrid()` - 渲染网站卡片网格
- `setupClock()` - 设置时钟显示

#### 3. 交互功能 (app.js)
- `setupCardInteraction()` - 卡片翻转和点击
- `setupSearch()` - 搜索功能
- `setupKeyboardShortcuts()` - 快捷键

#### 4. 分类管理 (app.js)
- `commitNewCategory()` - 添加新分类
- `editCategory()` - 编辑分类名称
- `deleteCategory()` - 删除分类

#### 5. 网站管理 (app.js)
- `commitNewSite()` - 添加/编辑网站
- `editSite()` - 编辑网站信息
- `deleteSite()` - 删除网站
- `trackSiteVisit()` - 记录访问统计

## 🎨 样式系统 (styles.css)

### CSS变量系统
```css
:root {
  --bg-color: #09090b;           /* 背景色 */
  --card-bg: rgba(24, 24, 27, 0.6); /* 卡片背景 */
  --primary-color: #60a5fa;      /* 主题色 */
  --text-main: #e4e4e7;         /* 主文本色 */
  --text-muted: #a1a1aa;        /* 次文本色 */
}
```

### 主要组件样式
- `.container` - 主容器布局
- `.sidebar` - 左侧边栏
- `.nav-btn` - 分类按钮
- `.card` - 网站卡片
- `.modal-overlay` - 弹窗遮罩

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `/` | 聚焦搜索框 |
| `Esc` | 关闭弹窗/清空搜索 |
| `Ctrl+S` | 打开设置 |
| `Ctrl+N` | 添加内容 |
| `Ctrl+←/→` | 切换分类 |

## 🔧 技术栈

- **前端**: 纯HTML/CSS/JavaScript
- **动画**: Anime.js
- **图标**: Iconify
- **存储**: localStorage
- **字体**: 等宽字体 (JetBrains Mono等)

## 📱 响应式设计

- **桌面端**: 侧边栏 + 内容区域布局
- **移动端**: 顶部导航 + 内容区域布局
- **断点**: 768px

## 🎯 设计理念

1. **极简主义** - 专注核心功能，避免冗余
2. **极客风格** - 命令行美学，等宽字体
3. **高效操作** - 快捷键支持，快速访问
4. **个性化** - 丰富的自定义选项
5. **响应式** - 适配各种设备尺寸

## 🔄 数据流

```
用户操作 → 事件处理 → 数据更新 → localStorage → 界面重渲染
```

## 🚧 扩展性

代码采用模块化设计，易于扩展：
- 新增功能模块
- 自定义主题
- 插件系统
- 云端同步

这个架构为后续开发提供了良好的基础。
