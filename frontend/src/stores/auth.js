import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'  // Using Vite's proxy configuration

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const loading = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const isEmailVerified = computed(() => user.value?.isEmailVerified ?? false)
  const isSimVerified = computed(() => user.value?.isSimVerified ?? false)
  const hasMailAccount = computed(() => user.value?.mailAccountCreated ?? false)
  const hasHomeDir = computed(() => user.value?.homeDirCreated ?? false)
  const tokenBalance = computed(() => user.value?.tokenBalance || 0)
  const hasNFT = computed(() => user.value?.nftMinted || false)

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser)
      accessToken.value = storedToken
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
  }

  // Login
  const login = async ({ email, password, remember }) => {
    try {
      loading.value = true
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      
      if (response.data.status === 'success') {
        user.value = response.data.data.user
        accessToken.value = response.data.data.accessToken
        refreshToken.value = response.data.data.refreshToken
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken.value}`
        
        // Store in localStorage if remember is true
        if (remember) {
          localStorage.setItem('user', JSON.stringify(user.value))
          localStorage.setItem('accessToken', accessToken.value)
          localStorage.setItem('refreshToken', refreshToken.value)
        }
      }
      
      return response.data
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      loading.value = true
      await axios.post(`${API_URL}/auth/logout`)
    } finally {
      // Clear state regardless of API call success
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      loading.value = false
    }
  }

  // Refresh token
  const refreshTokens = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken: refreshToken.value })
      if (response.data.status === 'success') {
        accessToken.value = response.data.data.accessToken
        refreshToken.value = response.data.data.refreshToken
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken.value}`
        
        if (localStorage.getItem('accessToken')) {
          localStorage.setItem('accessToken', accessToken.value)
          localStorage.setItem('refreshToken', refreshToken.value)
        }
      }
      return true
    } catch (error) {
      // If refresh fails, log out
      await logout()
      return false
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      loading.value = true
      const response = await axios.patch(`${API_URL}/users/profile`, updates)
      if (response.data.status === 'success') {
        user.value = { ...user.value, ...response.data.data.user }
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      }
      return response.data
    } finally {
      loading.value = false
    }
  }

  // Register
  const register = async (userData) => {
    try {
      loading.value = true
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Verify Email
  const verifyEmail = async (token) => {
    try {
      loading.value = true
      const response = await axios.post(`${API_URL}/auth/verify-email/${token}`)
      if (this.user) {
        this.user.isEmailVerified = true
      }
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Verify Phone
  const verifyPhone = async (code) => {
    try {
      loading.value = true
      const response = await axios.post(`${API_URL}/auth/verify-phone`, {
        phone: this.user.phone,
        code
      })
      if (this.user) {
        this.user.isPhoneVerified = true
        if (response.data.data?.tokenBalance) {
          this.user.tokenBalance = response.data.data.tokenBalance
        }
      }
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      loading.value = true
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email })
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Reset Password
  const resetPassword = async ({ token, password }) => {
    try {
      loading.value = true
      const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password })
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Initialize on store creation
  initializeAuth()

  return {
    // State
    user,
    accessToken,
    refreshToken,
    loading,
    
    // Computed
    isAuthenticated,
    isEmailVerified,
    isSimVerified,
    hasMailAccount,
    hasHomeDir,
    tokenBalance,
    hasNFT,
    
    // Actions
    login,
    logout,
    refreshTokens,
    updateProfile,
    register,
    verifyEmail,
    verifyPhone,
    forgotPassword,
    resetPassword
  }
})
