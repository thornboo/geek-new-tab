/**
 * 网站分类数据
 * 每个分类包含 key、名称、图标和网站列表
 *
 * 网站对象结构：
 * - name: 网站名称（必填）
 * - url: 网站地址（必填）
 * - desc: 网站描述（必填）
 * - icon: Iconify 图标名称（可选，不填则自动获取 favicon）
 */
export const categories = [
  {
    key: 'search',
    label: '搜索',
    icon: 'mdi:magnify',
    sites: [
      { name: 'Google', url: 'https://www.google.com', icon: 'logos:google-icon', desc: '全球最大的搜索引擎' },
      { name: '百度', url: 'https://www.baidu.com', desc: '中文搜索引擎' },
      { name: 'Bing', url: 'https://www.bing.com', icon: 'logos:bing', desc: '微软搜索引擎' },
      { name: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'simple-icons:duckduckgo', desc: '注重隐私的搜索引擎' }
    ]
  },
  {
    key: 'framework',
    label: '框架类库',
    icon: 'mdi:code-braces',
    sites: [
      { name: 'Vue.js', url: 'https://vuejs.org', icon: 'logos:vue', desc: '渐进式 JavaScript 框架' },
      { name: 'React', url: 'https://react.dev', icon: 'logos:react', desc: 'Facebook 开源的 UI 库' },
      { name: 'Angular', url: 'https://angular.io', icon: 'logos:angular-icon', desc: 'Google 开源的前端框架' },
      { name: 'Svelte', url: 'https://svelte.dev', icon: 'logos:svelte-icon', desc: '编译型前端框架' },
      { name: 'Next.js', url: 'https://nextjs.org', icon: 'logos:nextjs-icon', desc: 'React 全栈框架' },
      { name: 'Nuxt', url: 'https://nuxt.com', icon: 'logos:nuxt-icon', desc: 'Vue 全栈框架' },
      { name: 'Vite', url: 'https://vitejs.dev', icon: 'logos:vitejs', desc: '下一代前端构建工具' },
      { name: 'TailwindCSS', url: 'https://tailwindcss.com', icon: 'logos:tailwindcss-icon', desc: '原子化 CSS 框架' },
      { name: 'UnoCSS', url: 'https://unocss.dev', icon: 'logos:unocss', desc: '即时原子化 CSS 引擎' },
      { name: 'Pinia', url: 'https://pinia.vuejs.org', icon: 'logos:pinia', desc: 'Vue 状态管理库' }
    ]
  },
  {
    key: 'hosting',
    label: '项目托管',
    icon: 'mdi:source-repository',
    sites: [
      { name: 'GitHub', url: 'https://github.com', icon: 'mdi:github', desc: '全球最大的代码托管平台' },
      { name: 'GitLab', url: 'https://gitlab.com', icon: 'logos:gitlab', desc: '开源的 DevOps 平台' },
      { name: 'Gitee', url: 'https://gitee.com', desc: '国内代码托管平台' },
      { name: 'Bitbucket', url: 'https://bitbucket.org', icon: 'logos:bitbucket', desc: 'Atlassian 代码托管' },
      { name: 'Vercel', url: 'https://vercel.com', icon: 'logos:vercel-icon', desc: '前端部署平台' },
      { name: 'Netlify', url: 'https://netlify.com', icon: 'logos:netlify-icon', desc: '静态网站托管平台' },
      { name: 'Railway', url: 'https://railway.app', desc: '现代化部署平台' },
      { name: 'Render', url: 'https://render.com', desc: '云应用托管平台' }
    ]
  },
  {
    key: 'community',
    label: '开发社区',
    icon: 'mdi:account-group',
    sites: [
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'logos:stackoverflow-icon', desc: '程序员问答社区' },
      { name: '掘金', url: 'https://juejin.cn', desc: '中文技术社区' },
      { name: 'CSDN', url: 'https://www.csdn.net', desc: '中文 IT 社区' },
      { name: '思否', url: 'https://segmentfault.com', desc: '中文技术问答社区' },
      { name: 'V2EX', url: 'https://www.v2ex.com', desc: '创意工作者社区' },
      { name: 'Dev.to', url: 'https://dev.to', icon: 'logos:devto', desc: '国际开发者社区' },
      { name: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'simple-icons:ycombinator', desc: 'Y Combinator 技术新闻' },
      { name: 'Reddit', url: 'https://www.reddit.com/r/programming', icon: 'logos:reddit-icon', desc: '编程板块' }
    ]
  },
  {
    key: 'cloud',
    label: '云服务',
    icon: 'mdi:cloud',
    sites: [
      { name: '阿里云', url: 'https://www.aliyun.com', icon: 'simple-icons:alibabacloud', desc: '阿里巴巴云计算' },
      { name: '腾讯云', url: 'https://cloud.tencent.com', desc: '腾讯云计算' },
      { name: 'AWS', url: 'https://aws.amazon.com', icon: 'logos:aws', desc: '亚马逊云服务' },
      { name: 'Azure', url: 'https://azure.microsoft.com', icon: 'logos:microsoft-azure', desc: '微软云服务' },
      { name: 'Google Cloud', url: 'https://cloud.google.com', icon: 'logos:google-cloud', desc: '谷歌云平台' },
      { name: 'Cloudflare', url: 'https://www.cloudflare.com', icon: 'logos:cloudflare-icon', desc: 'CDN 和安全服务' },
      { name: 'DigitalOcean', url: 'https://www.digitalocean.com', icon: 'logos:digital-ocean-icon', desc: '开发者友好的云平台' },
      { name: 'Supabase', url: 'https://supabase.com', icon: 'logos:supabase-icon', desc: '开源 Firebase 替代' }
    ]
  },
  {
    key: 'text',
    label: '文本',
    icon: 'mdi:file-document',
    sites: [
      { name: 'Notion', url: 'https://www.notion.so', icon: 'simple-icons:notion', desc: '全能笔记和协作工具' },
      { name: '语雀', url: 'https://www.yuque.com', desc: '阿里巴巴知识库' },
      { name: 'Obsidian', url: 'https://obsidian.md', icon: 'simple-icons:obsidian', desc: '本地优先的笔记软件' },
      { name: 'Typora', url: 'https://typora.io', desc: 'Markdown 编辑器' },
      { name: 'HackMD', url: 'https://hackmd.io', desc: '协作 Markdown 编辑器' },
      { name: 'Overleaf', url: 'https://www.overleaf.com', icon: 'simple-icons:overleaf', desc: '在线 LaTeX 编辑器' }
    ]
  },
  {
    key: 'tools',
    label: '工具',
    icon: 'mdi:tools',
    sites: [
      { name: 'Can I Use', url: 'https://caniuse.com', desc: '浏览器兼容性查询' },
      { name: 'Regex101', url: 'https://regex101.com', icon: 'mdi:regex', desc: '正则表达式测试' },
      { name: 'JSON Editor', url: 'https://jsoneditoronline.org', icon: 'mdi:code-json', desc: 'JSON 在线编辑器' },
      { name: 'CodePen', url: 'https://codepen.io', icon: 'logos:codepen-icon', desc: '前端代码演示平台' },
      { name: 'JSFiddle', url: 'https://jsfiddle.net', icon: 'logos:jsfiddle', desc: '在线代码编辑器' },
      { name: 'Postman', url: 'https://www.postman.com', icon: 'logos:postman-icon', desc: 'API 测试工具' },
      { name: 'DevDocs', url: 'https://devdocs.io', desc: '聚合 API 文档' },
      { name: 'Carbon', url: 'https://carbon.now.sh', desc: '代码截图美化' }
    ]
  },
  {
    key: 'media',
    label: '媒体',
    icon: 'mdi:image',
    sites: [
      { name: 'Unsplash', url: 'https://unsplash.com', icon: 'simple-icons:unsplash', desc: '免费高清图片' },
      { name: 'Pexels', url: 'https://www.pexels.com', desc: '免费图片和视频' },
      { name: 'Dribbble', url: 'https://dribbble.com', icon: 'logos:dribbble-icon', desc: '设计师作品展示' },
      { name: 'Behance', url: 'https://www.behance.net', icon: 'logos:behance', desc: 'Adobe 设计社区' },
      { name: 'Figma', url: 'https://www.figma.com', icon: 'logos:figma', desc: '协作设计工具' },
      { name: 'Canva', url: 'https://www.canva.com', icon: 'simple-icons:canva', desc: '在线设计平台' },
      { name: 'iconfont', url: 'https://www.iconfont.cn', desc: '阿里巴巴图标库' },
      { name: 'Iconify', url: 'https://iconify.design', icon: 'simple-icons:iconify', desc: '统一图标框架' }
    ]
  }
]

/**
 * 根据分类 key 获取分类数据
 */
export function getCategoryByKey(key) {
  return categories.find(cat => cat.key === key)
}

/**
 * 获取所有分类的菜单项（用于侧边栏）
 */
export function getMenuItems() {
  return categories.map(({ key, label, icon }) => ({ key, label, icon }))
}
