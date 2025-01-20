import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LandingPage from '../views/LandingPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LandingPage
  },
  {
    path: '/features',
    name: 'features',
    component: () => import('../views/Features.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/Contact.vue')
  },
  // Auth routes
  {
    path: '/auth',
    redirect: '/auth/login',
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../views/auth/Login.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../views/auth/Register.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () => import('../views/auth/VerifyEmail.vue'),
        meta: { requiresGuest: true }
      }
    ]
  },
  // Protected routes
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  // Load user data if authenticated but user data not loaded
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.loadUser()
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if trying to access protected route
    next({ 
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Redirect to dashboard if trying to access guest route while authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
