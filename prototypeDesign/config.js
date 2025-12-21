/**
 * Geek Tab - 配置文件
 * 
 * 包含默认数据和常量定义
 */

// === 默认数据库结构 ===
const DEFAULT_DB = {
  categories: [
    { 
      key: 'dev', 
      label: '开发', 
      sites: [
        { 
          name: 'GitHub', 
          url: 'https://github.com', 
          icon: 'mdi:github', 
          desc: '全球最大的代码托管平台', 
          tags: ['代码', '开源'] 
        },
        { 
          name: 'Stack Overflow', 
          url: 'https://stackoverflow.com', 
          icon: 'mdi:stack-overflow', 
          desc: '程序员问答社区', 
          tags: ['问答', '技术'] 
        },
        { 
          name: 'ChatGPT', 
          url: 'https://chat.openai.com', 
          icon: 'simple-icons:openai', 
          desc: 'AI助手和对话工具', 
          tags: ['AI', '助手'] 
        },
      ]
    },
    { 
      key: 'tools', 
      label: '工具', 
      sites: [
        { 
          name: 'Figma', 
          url: 'https://figma.com', 
          icon: 'simple-icons:figma', 
          desc: '在线设计协作工具', 
          tags: ['设计', '协作'] 
        },
        { 
          name: 'Excalidraw', 
          url: 'https://excalidraw.com', 
          icon: 'mdi:draw', 
          desc: '手绘风格的在线白板', 
          tags: ['绘图', '白板'] 
        },
      ]
    }
  ],
  engines: {
    // 搜索引擎配置（保留用于设置面板，但主搜索已改为站内搜索）
    g: { name: '谷歌', url: 'https://www.google.com/search?q=' },
    b: { name: '必应', url: 'https://www.bing.com/search?q=' },
    bd: { name: '百度', url: 'https://www.baidu.com/s?wd=' },
    gh: { name: 'GitHub', url: 'https://github.com/search?q=' }
  }
};

// === 默认配置 ===
const DEFAULT_CONFIG = {
  bgType: 'default',        // 背景类型: default | unsplash | url
  bgValue: '',              // 背景值（URL或base64）
  overlayOpacity: 50,       // 遮罩透明度 (0-95)
  primaryColor: '#60a5fa',  // 主题色
  textColor: '#e4e4e7',     // 文本颜色
  locale: 'zh-CN'           // 语言区域
};

// === 存储键名 ===
const DB_KEY = 'geek_db_v2';    // 数据库存储键
const CFG_KEY = 'geek_cfg_v2';  // 配置存储键
