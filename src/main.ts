import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'katex/dist/katex.min.css'
if (import.meta.env.DEV) {
  import('./lib/data').then(({ devData }) => createApp(App, { boot: devData() }).mount('#app'))
} else {
  createApp(App, { boot: (window as any).__LAB_BOOT__ }).mount('#app')
}
