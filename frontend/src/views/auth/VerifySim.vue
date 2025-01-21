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
        Verify Your SIM
      </h2>

      <p class="text-gray-600 text-center mb-6">
        Please enter the verification code sent to your SIM number.
      </p>

      <div v-if="verified" class="text-center py-8">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">SIM Verified!</h3>
        <p class="mt-2 text-gray-600">
          Your SIM number has been successfully verified.
        </p>
        <div class="mt-6">
          <button @click="router.push({ name: 'dashboard' })"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Go to Dashboard
          </button>
        </div>
      </div>

      <Form v-else :validation-schema="validationSchema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
        <div class="space-y-6">
          <!-- Verification Code Input -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div class="mt-1">
              <Field name="code" type="text" id="code"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter 6-digit code" />
              <ErrorMessage name="code" class="mt-2 text-sm text-red-600" />
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="isSubmitting"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isSubmitting">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
            <span v-else>Verify SIM</span>
          </button>

          <!-- Resend Code -->
          <div class="text-center">
            <p class="text-gray-600 mb-4">
              Didn't receive the code?
            </p>
            <button @click="resendCode" :disabled="resendLoading || resendCooldown > 0"
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
                Resend Code
              </span>
            </button>
          </div>
        </div>
      </Form>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CosmicLogo from '@/components/CosmicLogo.vue'
import * as z from 'zod'
import { toFormValidator } from '@vee-validate/zod'

const router = useRouter()
const authStore = useAuthStore()

const verified = ref(false)
const error = ref('')
const resendLoading = ref(false)
const resendCooldown = ref(0)
const cooldownInterval = ref(null)

const validationSchema = toFormValidator(
  z.object({
    code: z.string()
      .min(6, 'Verification code must be 6 digits')
      .max(6, 'Verification code must be 6 digits')
      .regex(/^\d+$/, 'Verification code must contain only numbers')
  })
)

const handleSubmit = async (values) => {
  try {
    error.value = ''
    const response = await authStore.verifySim(values.code)
    if (response.status === 'success') {
      verified.value = true
    } else {
      error.value = response.message || 'Verification failed'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Verification failed'
  }
}

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

const resendCode = async () => {
  if (resendLoading.value || resendCooldown.value > 0) return

  try {
    resendLoading.value = true
    const response = await authStore.resendSimVerification()
    if (response.status === 'success') {
      startCooldown()
    } else {
      error.value = response.message || 'Failed to resend verification code'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to resend verification code'
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
