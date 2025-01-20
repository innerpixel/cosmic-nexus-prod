<template>
  <div class="min-h-screen"
    :class="isDark ? 'bg-cyber-dark text-white' : 'bg-cosmic-dark text-cosmic-text'">
    <header class="border-b transition-colors duration-300"
      :class="isDark ? 'border-cyber-primary/10' : 'border-cosmic-primary/10'">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold transition-colors duration-300"
            :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
            Dashboard
          </h1>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm">
              Welcome, {{ user?.displayName }}
            </span>
            
            <button @click="logout"
              class="px-4 py-2 rounded text-sm font-medium transition-colors duration-300"
              :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80' : 'bg-cosmic-primary hover:bg-cosmic-primary/80'">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <!-- Email Verification Alert -->
      <div v-if="!user?.isEmailVerified"
        class="mb-8 p-4 rounded-lg border transition-colors duration-300"
        :class="isDark ? 'bg-cyber-light/5 border-cyber-primary/10' : 'bg-cosmic-light/5 border-cosmic-primary/10'">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>Please verify your email address to access all features.</p>
          </div>
          <button @click="resendVerificationEmail"
            class="text-sm font-medium transition-colors duration-300"
            :class="isDark ? 'text-cyber-primary hover:text-cyber-primary/80' : 'text-cosmic-primary hover:text-cosmic-primary/80'">
            Resend verification email
          </button>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="p-6 rounded-lg border transition-colors duration-300"
          :class="isDark ? 'bg-cyber-light/5 border-cyber-primary/10' : 'bg-cosmic-light/5 border-cosmic-primary/10'">
          <h2 class="text-xl font-semibold mb-4">Profile</h2>
          <div class="space-y-2">
            <p>
              <span class="opacity-70">Display Name:</span>
              {{ user?.displayName }}
            </p>
            <p>
              <span class="opacity-70">Email:</span>
              {{ user?.email }}
            </p>
            <p>
              <span class="opacity-70">Status:</span>
              <span :class="user?.isEmailVerified ? 'text-green-500' : 'text-yellow-500'">
                {{ user?.isEmailVerified ? 'Verified' : 'Pending Verification' }}
              </span>
            </p>
          </div>
        </div>

        <!-- Settings Card -->
        <div class="p-6 rounded-lg border transition-colors duration-300"
          :class="isDark ? 'bg-cyber-light/5 border-cyber-primary/10' : 'bg-cosmic-light/5 border-cosmic-primary/10'">
          <h2 class="text-xl font-semibold mb-4">Settings</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm mb-2">Theme</label>
              <select v-model="theme"
                class="w-full px-3 py-2 rounded border bg-transparent transition-colors duration-300"
                :class="isDark ? 'border-cyber-primary/30' : 'border-cosmic-primary/30'">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const { user } = storeToRefs(authStore)
const { isDark, theme } = storeToRefs(themeStore)

const logout = async () => {
  await authStore.logout()
  router.push({ name: 'home' })
}

const resendVerificationEmail = async () => {
  try {
    await authStore.resendVerificationEmail(user.value.email)
    // Show success notification
  } catch (error) {
    // Show error notification
  }
}
</script>
