import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

// 导入element-plus
app.use(ElementPlus)
app.mount('#app')

// createApp(App).mount('#app')
