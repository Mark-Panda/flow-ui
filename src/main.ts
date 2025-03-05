import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@logicflow/core/dist/index.css'
import '@logicflow/extension/lib/index.css'
import './style.css'
import registerSvgIcons from './assets/icons'
import { createRouter, createWebHistory } from 'vue-router'

// 注册SVG图标
registerSvgIcons()
console.log('SVG图标注册完成')

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'RuleEngine',
      component: () => import('./views/rule-engine/index.vue')
    }
  ]
})

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误组件:', instance)
  console.error('错误信息:', info)
}

app.use(ElementPlus)
app.use(router) // 使用路由
app.mount('#app')
