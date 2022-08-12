import store from '@/store'
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('@/views/layout'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/home')
      },
      {
        path: 'user-info',
        component: () => import('@/views/user/userInfo')
      },
      {
        path: 'user-avatar',
        component: () => import('@/views/user/userAvatar.vue')
      },
      {
        path: 'user-pwd',
        component: () => import('@/views/user/userPwd.vue')
      },
      {
        path: 'art-cate',
        component: () => import('@/views/article/artCate.vue')
      },
      {
        path: '/art-list',
        component: () => import('@/views/article/artList.vue')
      }
    ]
  },
  {
    path: '/reg',
    component: () => import('@/views/register')
  },
  {
    path: '/login',
    component: () => import('@/views/login')
  }
]

const router = new VueRouter({
  routes
})

const whiteList = ['/login', '/reg'] // 白名单

router.beforeEach((to, from, next) => {
  const token = store.state.token
  if (token) {
    // 已登录
    if (!store.state.userInfo.username) {
      // 有token值但没有用户信息，请求用户信息
      store.dispatch('getUserInfoActions')
    }
    next()
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 目的地址在白名单里，直接放行
      next()
    } else {
      // 强制跳转
      next('/login')
    }
  }
})

export default router
