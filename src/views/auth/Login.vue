<template>
  <AuthLayout>
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <!-- Logo Section -->
      <div class="flex justify-center mb-6">
        <router-link :to="{ name: 'home' }" class="inline-block w-20 h-20">
          <CosmicLogo :isDark="false" />
        </router-link>
      </div>

      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">
        Welcome Back to CSMCL SPACE
      </h2>

      <Form :validation-schema="validationSchema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <Field id="email" name="email" type="email" 
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="your@email.com or username@cosmical.me" />
            <ErrorMessage name="email" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <div class="relative">
              <Field :type="showPassword ? 'text' : 'password'" id="password" name="password"
                class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your password" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <ErrorMessage name="password" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Field type="checkbox" id="remember" name="remember"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label for="remember" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <router-link :to="{ name: 'forgot-password' }" class="text-sm text-blue-600 hover:text-blue-500">
              Forgot password?
            </router-link>
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
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>

          <!-- Register Link -->
          <p class="mt-4 text-center text-sm text-gray-600">
            Don't have an account?
            <router-link :to="{ name: 'register' }" class="font-medium text-blue-600 hover:text-blue-500">
              Register now
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
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CosmicLogo from '@/components/CosmicLogo.vue'
import * as z from 'zod'
import { toFormValidator } from '@vee-validate/zod'

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')
const showPassword = ref(false)

const validationSchema = toFormValidator(
  z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z.string()
      .min(1, 'Password is required'),
    remember: z.boolean().optional()
  })
)

const handleSubmit = async (values) => {
  try {
    error.value = ''
    const response = await authStore.login(values)
    
    if (response.status === 'success') {
      router.push({ name: 'dashboard' })
    } else {
      error.value = response.message || 'An error occurred during login'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred during login'
  }
}
</script>