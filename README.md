# Geek New Tab

极客导航 - 程序员的新标签页 Chrome 插件

## 技术栈

- Vue 3 + Composition API
- Vite 5
- UnoCSS (原子化 CSS)
- @iconify/vue (图标)
- @crxjs/vite-plugin (Chrome 插件构建)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 加载插件到 Chrome

1. 运行 `npm run build` 构建项目
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择项目的 `dist` 目录

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
├── manifest.json          # Chrome 插件配置
├── assets/                # 静态资源
│   └── icons/             # 插件图标
└── newtab/                # 新标签页
    ├── index.html
    ├── main.js
    ├── App.vue
    ├── components/        # 组件
    ├── composables/       # 组合式函数
    └── styles/            # 样式
```
