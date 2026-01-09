# Geek New Tab

<p align="center">
  <img src="public/logo.svg" alt="Geek New Tab Logo" width="120" height="120">
</p>

<p align="center">
  <strong>极客导航 - 程序员的新标签页</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#截图预览">截图预览</a> •
  <a href="./docs/Development.md">开发文档</a>
</p>

---

## 简介

**Geek New Tab** 是一款专为程序员设计的浏览器新标签页应用，采用极客风格的 Matrix 主题设计，提供高效的网站导航和书签管理功能。

- 🎨 **极客风格** - 黑绿配色，终端美学，Matrix 主题
- 🚀 **离线优先** - 本地存储，无需网络即可使用
- ☁️ **云端同步** - 可选 Supabase 云同步，跨设备数据同步
- 📁 **书签导入** - 支持 Chrome/Edge/Firefox 书签 HTML 导入
- ⌨️ **快捷键** - 全键盘操作，提升效率

---

## 功能特性

### 核心功能

| 功能 | 说明 |
|------|------|
| **分类管理** | 创建、编辑、删除分类，支持拖拽排序 |
| **网站管理** | 添加、编辑、删除网站，支持图标、描述、标签 |
| **全局搜索** | 快速搜索网站，支持名称、描述、标签匹配 |
| **书签导入** | 导入 Chrome/Edge/Firefox 书签 HTML，文件夹自动转换为分类 |
| **书签导出** | 导出为标准书签 HTML 格式，可导入浏览器 |
| **数据备份** | JSON 格式备份/恢复，支持云端同步 |

### 个性化设置

- 🎨 主题色自定义
- 🖼️ 背景图片（默认/Unsplash/自定义 URL）
- 🌐 语言切换（中文/英文）
- 📊 遮罩透明度调节

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `/` | 聚焦搜索框 |
| `Esc` | 关闭弹窗/清空搜索 |
| `Ctrl/⌘ + S` | 打开设置 |
| `Ctrl/⌘ + N` | 添加网站 |
| `Ctrl/⌘ + ←/→` | 切换分类 |

---

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/geek-new-tab.git
cd geek-new-tab

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:8081`

### 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 云同步配置（可选）

如需启用 Supabase 云同步，在项目根目录创建 `.env.local`：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

详细配置请参考 [Supabase 配置指南](./docs/supabase-setup.md)

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Vue 3 (Composition API) |
| **构建** | Vite 5 |
| **状态管理** | Pinia |
| **UI 组件** | shadcn-vue + Reka UI |
| **样式** | Tailwind CSS 4 + UnoCSS |
| **图标** | Lucide Icons + Iconify |
| **云服务** | Supabase (PostgreSQL + Realtime) |
| **类型** | TypeScript |

---

## 截图预览

> 截图待添加

---

## 文档

- 📖 [开发文档](./docs/Development.md) - 开发环境、项目结构、代码规范
- 🏗️ [架构设计](./docs/ARCHITECTURE.md) - 整体架构设计
- 🗃️ [状态管理](./docs/state-management.md) - Pinia Store 设计
- 🧩 [组件设计](./docs/components.md) - Vue 组件架构
- 💾 [数据持久化](./docs/data-persistence.md) - 存储与同步策略
- ☁️ [Supabase 配置](./docs/supabase-setup.md) - 云数据库配置

---

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 许可证

[MIT License](./LICENSE)

---

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [shadcn-vue](https://www.shadcn-vue.com/) - Vue 版 shadcn/ui 组件库
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [Iconify](https://iconify.design/) - 统一的图标框架

---

<p align="center">
  <strong>Happy Coding! 🚀</strong>
</p>
