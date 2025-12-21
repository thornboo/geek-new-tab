import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'
import { categories } from './src/data/sites.js'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        ['index', resolve(__dirname, 'index.html')],
        ['category', resolve(__dirname, 'category/index.html')],
        ['settings', resolve(__dirname, 'settings/index.html')],
        ['data', resolve(__dirname, 'data/index.html')],
        ['about', resolve(__dirname, 'about/index.html')],
        ...categories.map((cat) => [`category-${cat.key}`, resolve(__dirname, `category/${cat.key}/index.html`)])
      ])
    }
  },
  server: {
    port: 8081
  }
})
