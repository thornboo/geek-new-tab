import { createApp } from 'vue'
import App from '@/App.vue'
import { pinia } from '@/stores'
import 'virtual:uno.css'
import '@/styles/tailwind.css'
import '@/styles/main.css'

const app = createApp(App)

// 注册 Pinia
app.use(pinia)

app.mount('#app')
