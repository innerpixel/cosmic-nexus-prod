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
        Reset Your Password
      </h2>
      
      <p class="text-gray-600 text-center mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
        {{ successMessage }}
      </div>

      <Form v-else :validation-schema="validationSchema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium mb-1 text-gray-700">
              Email Address
            </label>
            <Field id="email" name="email" type="email" 
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email address" />
            <ErrorMessage name="email" class="mt-1 text-sm text-red-500" />
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
              Sending...
            </span>
            <span v-else>Send Reset Instructions</span>
          </button>

          <!-- Back to Login -->
          <p class="mt-4 text-center text-sm text-gray-600">
            Remember your password?
            <router-link :to="{ name: 'login' }" class="font-medium text-blue-600 hover:text-blue-500">
              Back to login
            </router-link>
          </p>
        </div>
      </Form>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CosmicLogo from '@/components/CosmicLogo.vue'
import * as z from 'zod'
import { toFormValidator } from '@vee-validate/zod'

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')
const successMessage = ref('')

const validationSchema = toFormValidator(
  z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
  })
)

const handleSubmit = async (values) => {
  try {
    error.value = ''
    const response = await authStore.forgotPassword(values.email)
    if (response.status === 'success') {
      successMessage.value = 'Reset instructions have been sent to your email address. Please check your inbox.'
    } else {
      error.value = response.message || 'Failed to send reset instructions'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to send reset instructions'
  }
}
</script>
