export const DEFAULT_DB = {
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
        }
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
        }
      ]
    }
  ]
}

export const DEFAULT_CONFIG = {
  bgType: 'default',
  bgValue: '',
  overlayOpacity: 50,
  primaryColor: '#60a5fa',
  textColor: '#e4e4e7',
  locale: 'zh-CN'
}
