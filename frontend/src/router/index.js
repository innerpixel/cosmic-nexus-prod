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
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('../views/auth/VerifyEmail.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/auth/ForgotPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: () => import('../views/auth/ResetPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // Check if route requires guest
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
