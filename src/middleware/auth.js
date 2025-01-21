import { useAuthStore } from '@/stores/auth'

export const requireAuth = async (to, from, next) => {
  const authStore = useAuthStore()
  
  // If user is not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  }

  // If route requires email verification
  if (to.meta.requiresEmailVerification && !authStore.isEmailVerified) {
    return next({ name: 'verify-email' })
  }

  // If route requires SIM verification
  if (to.meta.requiresSimVerification && !authStore.isSimVerified) {
    return next({ name: 'verify-sim' })
  }

  // If route requires mail account
  if (to.meta.requiresMailAccount && !authStore.hasMailAccount) {
    return next({ name: 'setup-mail' })
  }

  // If route requires home directory
  if (to.meta.requiresHomeDir && !authStore.hasHomeDir) {
    return next({ name: 'setup-home' })
  }

  next()
}

export const refreshTokenMiddleware = async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    try {
      // Try to refresh token
      const success = await authStore.refreshToken()
      if (!success) {
        // If refresh failed, redirect to login
        return next({ 
          name: 'login', 
          query: { redirect: to.fullPath } 
        })
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      return next({ 
        name: 'login', 
        query: { redirect: to.fullPath } 
      })
    }
  }
  
  next()
}

export const redirectIfAuthenticated = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  
  next()
}
