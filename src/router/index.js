import { createRouter, createWebHistory } from 'vue-router'
import { categories } from '@/data/sites'

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        redirect: '/category/search'
      },
      {
        path: 'category/:id',
        name: 'Category',
        component: () => import('@/views/CategoryView.vue'),
        props: true
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue')
      },
      {
        path: 'data',
        name: 'Data',
        component: () => import('@/views/DataView.vue')
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/AboutView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：验证分类是否存在
router.beforeEach((to, from, next) => {
  if (to.name === 'Category') {
    const categoryExists = categories.some(c => c.key === to.params.id)
    if (!categoryExists) {
      return next({ name: 'Home' })
    }
  }
  next()
})

export default router
