import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isEmailVerified = computed(() => user.value?.isEmailVerified ?? false)

  // Initialize axios instance
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Add token to requests if it exists
  api.interceptors.request.use(config => {
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`
    }
    return config
  })

  async function register(credentials) {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/auth/register', credentials)
      
      token.value = response.data.token
      user.value = response.data.data.user
      
      localStorage.setItem('token', token.value)
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function login(credentials) {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/auth/login', credentials)
      
      token.value = response.data.token
      user.value = response.data.data.user
      
      localStorage.setItem('token', token.value)
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function verifyEmail(verificationToken) {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get(`/auth/verify-email/${verificationToken}`)
      
      if (user.value) {
        user.value.isEmailVerified = true
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Email verification failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email) {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Password reset request failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(token, newPassword) {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: newPassword
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Password reset failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Load user data if token exists
  async function loadUser() {
    if (token.value && !user.value) {
      try {
        const response = await api.get('/auth/me')
        user.value = response.data.data.user
      } catch (err) {
        logout()
      }
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isEmailVerified,
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    loadUser
  }
})
