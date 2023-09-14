import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css'
import '@/styles/base.scss'
import '@/styles/theme-default.scss'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.mount('#app')
