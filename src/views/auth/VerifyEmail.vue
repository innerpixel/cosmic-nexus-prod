<template>
  <AuthLayout v-slot="{ isDark }">
    <div class="p-6 md:p-8">
      <div v-if="!verified">
        <div class="text-center">
          <div class="mb-4">
            <svg class="w-16 h-16 mx-auto transition-colors duration-300"
              :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold mb-2 transition-colors duration-300"
            :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
            Verify Your Email
          </h2>
          
          <p class="mb-6 transition-colors duration-300"
            :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
            We've sent a verification email to <strong>{{ email }}</strong>
          </p>

          <p class="text-sm transition-colors duration-300"
            :class="isDark ? 'text-gray-400' : 'text-cosmic-text/80'">
            Didn't receive the email?
            <button @click="resendEmail"
              class="font-medium transition-colors duration-300"
              :class="isDark ? 'text-cyber-primary hover:text-cyber-primary/80' : 'text-cosmic-primary hover:text-cosmic-primary/80'">
              Click here to resend
            </button>
          </p>

          <div v-if="error" class="mt-4 p-3 rounded bg-red-500/10 text-red-500 text-sm">
            {{ error }}
          </div>
        </div>
      </div>

      <div v-else class="text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 class="text-2xl font-bold mb-2 transition-colors duration-300"
          :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
          Email Verified!
        </h2>
        
        <p class="mb-6 transition-colors duration-300"
          :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
          Your email has been successfully verified.
        </p>

        <router-link :to="{ name: 'dashboard' }"
          class="inline-block py-2 px-4 rounded font-medium transition-colors duration-300"
          :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80' : 'bg-cosmic-primary hover:bg-cosmic-primary/80'">
          Go to Dashboard
        </router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../layouts/AuthLayout.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref(route.query.email)
const token = ref(route.query.token)
const error = ref(null)
const verified = ref(false)

onMounted(async () => {
  if (token.value) {
    try {
      await authStore.verifyEmail(token.value)
      verified.value = true
    } catch (err) {
      error.value = err
    }
  }
})

const resendEmail = async () => {
  try {
    error.value = null
    await authStore.resendVerificationEmail(email.value)
    // Show success message or notification
  } catch (err) {
    error.value = err
  }
}
</script>
