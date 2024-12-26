import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhTW from 'element-plus/dist/locale/zh-tw.mjs'
import App from './App.vue'
import router from './router'
import store from './store'

// 創建全局樣式
const style = document.createElement('style')
style.textContent = `
:root {
  --el-color-primary: #ff8c00 !important;
  --el-color-primary-light-3: #ffa500 !important;
  --el-color-primary-light-5: #ffc04d !important;
  --el-color-primary-light-7: #ffd780 !important;
  --el-color-primary-light-9: #fff2e6 !important;
}

.el-button--primary {
  --el-button-bg-color: var(--el-color-primary) !important;
  --el-button-border-color: var(--el-color-primary) !important;
  --el-button-hover-bg-color: var(--el-color-primary-light-3) !important;
  --el-button-hover-border-color: var(--el-color-primary-light-3) !important;
}

.el-button--text {
  --el-button-text-color: var(--el-color-primary) !important;
  --el-button-hover-text-color: var(--el-color-primary-light-3) !important;
}

.logo-text {
  color: var(--el-color-primary) !important;
}
`
document.head.appendChild(style)

const app = createApp(App)

// 註冊所有 Element Plus 圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus, {
    locale: zhTW,
})

app.use(store)
app.use(router)
app.mount('#app')