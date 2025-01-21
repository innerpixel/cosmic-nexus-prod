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
        Please enter your new password below.
      </p>

      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
        {{ successMessage }}
        <div class="mt-4 text-center">
          <router-link :to="{ name: 'login' }" class="font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </router-link>
        </div>
      </div>

      <Form v-else :validation-schema="validationSchema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- New Password -->
          <div>
            <label for="password" class="block text-sm font-medium mb-1 text-gray-700">
              New Password
            </label>
            <div class="relative">
              <Field :type="showPassword ? 'text' : 'password'" id="password" name="password"
                class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your new password" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <ErrorMessage name="password" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium mb-1 text-gray-700">
              Confirm Password
            </label>
            <div class="relative">
              <Field :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" name="confirmPassword"
                class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Confirm your new password" />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <ErrorMessage name="confirmPassword" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Password Requirements -->
          <div class="text-sm text-gray-600 space-y-1">
            <p class="font-medium">Password must contain:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
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
              Resetting...
            </span>
            <span v-else>Reset Password</span>
          </button>
        </div>
      </Form>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CosmicLogo from '@/components/CosmicLogo.vue'
import * as z from 'zod'
import { toFormValidator } from '@vee-validate/zod'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const error = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const validationSchema = toFormValidator(
  z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
      .min(1, 'Please confirm your password')
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
)

const handleSubmit = async (values) => {
  try {
    error.value = ''
    const token = route.query.token
    if (!token) {
      error.value = 'Reset token is missing'
      return
    }

    const response = await authStore.resetPassword({
      token,
      password: values.password
    })

    if (response.status === 'success') {
      successMessage.value = 'Your password has been reset successfully. You can now login with your new password.'
    } else {
      error.value = response.message || 'Failed to reset password'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reset password'
  }
}
</script>
