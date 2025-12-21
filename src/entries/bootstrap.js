import { createApp } from 'vue'
import 'virtual:uno.css'
import '@/styles/main.css'

export const mountPage = (RootComponent) => {
  return createApp(RootComponent).mount('#app')
}
