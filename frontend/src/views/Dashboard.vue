<template>
  <div class="min-h-screen bg-cosmic-dark text-cosmic-text">
    <header class="border-b border-cosmic-primary/10">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-cosmic-primary">
            Dashboard
          </h1>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm">
              Welcome, {{ user?.displayName }}
            </span>
            
            <button @click="logout"
              class="px-4 py-2 rounded text-sm font-medium bg-cosmic-primary hover:bg-cosmic-primary/80">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <!-- Email Verification Alert -->
      <div v-if="!user?.isEmailVerified"
        class="mb-8 p-4 rounded-lg border border-cosmic-primary/10 bg-cosmic-primary/5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-cosmic-primary">Verify Your Email</h3>
            <p class="mt-1 text-sm">Please verify your email address to access all features.</p>
          </div>
          <button @click="resendVerificationEmail"
            class="px-4 py-2 rounded text-sm font-medium bg-cosmic-primary hover:bg-cosmic-primary/80">
            Resend Email
          </button>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="bg-cosmic-primary/5 rounded-lg p-6 border border-cosmic-primary/10">
        <h2 class="text-xl font-semibold mb-4">Settings</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2">Theme</label>
            <select 
              class="w-full px-3 py-2 rounded border border-cosmic-primary/30 bg-transparent">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
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
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

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
