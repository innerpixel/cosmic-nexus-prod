<template>
  <AuthLayout>
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <!-- Logo Section -->
      <div class="flex justify-center mb-6">
        <router-link :to="{ name: 'home' }" class="inline-block w-20 h-20">
          <CosmicLogo :isDark="false" />
        </router-link>
      </div>

      <h2 class="text-2xl font-bold mb-2 text-center text-gray-900">
        Verify Your Email
      </h2>

      <div v-if="loading" class="text-center py-8">
        <svg class="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600">Verifying your email...</p>
      </div>

      <div v-else-if="verified" class="text-center py-8">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Email Verified!</h3>
        <p class="mt-2 text-gray-600">
          Your email has been successfully verified.
          <span v-if="!simVerified">Now let's verify your SIM number.</span>
        </p>
        <div class="mt-6">
          <button v-if="!simVerified"
            @click="router.push({ name: 'verify-sim' })"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Continue to SIM Verification
          </button>
          <button v-else
            @click="router.push({ name: 'dashboard' })"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Go to Dashboard
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <p class="font-medium">Verification Failed</p>
          <p class="text-sm">{{ error }}</p>
        </div>

        <div class="text-center">
          <p class="text-gray-600 mb-4">
            Didn't receive the verification email?
          </p>
          <button @click="resendVerification" :disabled="resendLoading || resendCooldown > 0"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="resendLoading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
            <span v-else-if="resendCooldown > 0">
              Resend in {{ resendCooldown }}s
            </span>
            <span v-else>
              Resend Verification Email
            </span>
          </button>
        </div>

        <div class="text-center">
          <router-link :to="{ name: 'login' }" class="text-sm font-medium text-blue-600 hover:text-blue-500">
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CosmicLogo from '@/components/CosmicLogo.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const verified = ref(false)
const error = ref('')
const resendLoading = ref(false)
const resendCooldown = ref(0)
const cooldownInterval = ref(null)

const simVerified = computed(() => authStore.isSimVerified)

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    error.value = 'Verification token is missing'
    loading.value = false
    return
  }

  try {
    const response = await authStore.verifyEmail(token)
    if (response.status === 'success') {
      verified.value = true
    } else {
      error.value = response.message || 'Verification failed'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Verification failed'
  } finally {
    loading.value = false
  }
})

const startCooldown = () => {
  resendCooldown.value = 60 // 60 seconds cooldown
  cooldownInterval.value = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    } else {
      clearInterval(cooldownInterval.value)
    }
  }, 1000)
}

const resendVerification = async () => {
  if (resendLoading.value || resendCooldown.value > 0) return

  try {
    resendLoading.value = true
    const response = await authStore.resendVerificationEmail()
    if (response.status === 'success') {
      startCooldown()
    } else {
      error.value = response.message || 'Failed to resend verification email'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to resend verification email'
  } finally {
    resendLoading.value = false
  }
}

onUnmounted(() => {
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
})
</script>
