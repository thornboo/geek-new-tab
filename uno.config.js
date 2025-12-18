import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'wh-full': 'w-full h-full',

    // Matrix 终端风格组件
    'layout-border': 'border-r border-matrix-dark',
    'text-primary': 'text-white',
    'text-secondary': 'text-gray-400',
    'text-tertiary': 'text-gray-600',

    // 终端卡片：黑色背景 + 绿色边框（始终可见）
    'card-base': 'bg-black border border-gray-700 rounded-lg hover:border-matrix transition-all duration-200',

    // 按钮 - Matrix 风格
    'btn-primary': 'bg-matrix text-black px-4 py-2 rounded border border-matrix font-medium hover:bg-matrix-bright transition-all text-sm',
    'btn-secondary': 'bg-black text-matrix-dim border border-matrix-dark px-4 py-2 rounded hover:text-matrix hover:border-matrix transition-all text-sm',
  },
  theme: {
    colors: {
      // Matrix 色板
      background: '#000000',
      surface: '#0a0a0a',
      matrix: {
        DEFAULT: '#00ff41',      // 主绿色（经典 Matrix 绿）
        bright: '#39ff14',       // 亮绿色（高亮）
        dim: '#00cc33',          // 暗绿色（次要文字）
        dark: '#003b00',         // 深绿色（边框）
        darker: '#002200',       // 更深绿色
        glow: 'rgba(0, 255, 65, 0.3)', // 发光效果
      },
      accents: {
        1: '#0a0a0a',
        2: '#003b00',
        3: '#004400',
        4: '#006600',
        5: '#00cc33',
        6: '#00ff41',
        7: '#39ff14',
        8: '#7fff00',
      }
    },
    boxShadow: {
      'matrix': '0 0 10px rgba(0, 255, 65, 0.3)',
      'matrix-glow': '0 0 20px rgba(0, 255, 65, 0.5)',
    }
  }
})
