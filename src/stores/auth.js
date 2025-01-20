import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isVerified: (state) => state.user?.isEmailVerified && state.user?.isPhoneVerified,
    tokenBalance: (state) => state.user?.tokenBalance || 0,
    hasNFT: (state) => state.user?.nftMinted || false
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${API_URL}/auth/register`, userData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password })
        const { user, tokens } = response.data.data
        
        this.user = user
        this.accessToken = tokens.accessToken
        this.refreshToken = tokens.refreshToken
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyEmail(token) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${API_URL}/auth/verify-email/${token}`)
        if (this.user) {
          this.user.isEmailVerified = true
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Email verification failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyPhone(code) {
      this.loading = true
      this.error = null
      try {
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
        this.error = error.response?.data?.message || 'Phone verification failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async refreshTokens() {
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken })
        const { tokens } = response.data.data

        this.accessToken = tokens.accessToken
        this.refreshToken = tokens.refreshToken

        // Update auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`
        
        // Update stored refresh token
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)

        return tokens
      } catch (error) {
        // If refresh fails, logout user
        await this.logout()
        throw error
      }
    },

    async forgotPassword(email) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to send reset instructions'
        throw error
      } finally {
        this.loading = false
      }
    },

    async resetPassword({ token, password }) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Password reset failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      // Clear state
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.error = null

      // Clear stored tokens
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      // Clear auth header
      delete axios.defaults.headers.common['Authorization']
    },

    // Initialize auth state from stored tokens
    async init() {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          await this.refreshTokens()
        } catch (error) {
          console.error('Failed to refresh tokens:', error)
        }
      }
    }
  }
})
