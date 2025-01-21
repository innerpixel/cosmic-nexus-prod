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
        Join CSMCL SPACE
      </h2>

      <Form :validation-schema="validationSchema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium mb-1 text-gray-700">
              Display Name
            </label>
            <Field id="displayName" name="displayName" type="text" 
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter 1-3 words (min 5 letters per word)" />
            <ErrorMessage name="displayName" class="mt-1 text-sm text-red-500" />
            <p class="mt-1 text-sm text-gray-500">
              Each word should be at least 5 letters. You can use 1 to 3 words.
            </p>
          </div>

          <!-- CSMCL Name -->
          <div>
            <label for="csmclName" class="block text-sm font-medium mb-1 text-gray-700">
              CSMCL Name
            </label>
            <div class="flex">
              <Field id="csmclName" name="csmclName" type="text" 
                class="flex-1 px-4 py-2 rounded-l border border-r-0 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="cosmicalyou" />
              <span class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r">
                @cosmical.me
              </span>
            </div>
            <ErrorMessage name="csmclName" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Regular Email -->
          <div>
            <label for="regularEmail" class="block text-sm font-medium mb-1 text-gray-700">
              Regular Email (for verification)
            </label>
            <Field id="regularEmail" name="regularEmail" type="email" 
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="your-email@example.com" />
            <ErrorMessage name="regularEmail" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- SIM Number -->
          <div>
            <label for="simNumber" class="block text-sm font-medium mb-1 text-gray-700">
              SIM Number (for verification)
            </label>
            <Field id="simNumber" name="simNumber" type="tel" 
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="+1234567890" />
            <ErrorMessage name="simNumber" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <div class="relative">
              <Field :type="showPassword ? 'text' : 'password'" id="password" name="password"
                class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Create a strong password" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <ErrorMessage name="password" class="mt-1 text-sm text-red-500" />
            <p class="mt-2 text-sm text-gray-500">
              Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters
            </p>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ error }}</span>
          </div>

          <button type="submit" 
            :disabled="isSubmitting"
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            <span v-if="isSubmitting">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
            <span v-else>Create Account</span>
          </button>
        </div>
      </Form>

      <div class="mt-6 text-center text-sm">
        <span class="text-gray-600">Already have an account?</span>
        <router-link :to="{ name: 'login' }" class="ml-1 font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </router-link>
      </div>
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
    displayName: z.string()
      .min(5, 'Display name must be at least 5 characters')
      .max(100, 'Display name is too long')
      .refine(
        (val) => {
          const words = val.trim().split(/\s+/);
          return words.length >= 1 && words.length <= 3 && words.every(word => word.length >= 5);
        },
        'Each word must be at least 5 letters long, and you can use 1 to 3 words'
      ),
    csmclName: z.string()
      .min(1, 'CSMCL name is required')
      .max(30, 'CSMCL name must be less than 30 characters')
      .regex(/^[a-z0-9]+$/, 'CSMCL name can only contain lowercase letters and numbers'),
    regularEmail: z.string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    simNumber: z.string()
      .min(1, 'SIM number is required')
      .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  })
)

const handleSubmit = async (values) => {
  try {
    error.value = ''
    const response = await authStore.register({
      ...values,
      email: `${values.csmclName}@cosmical.me`
    })
    
    if (response.status === 'success') {
      router.push({ 
        name: 'verify-email',
        query: { email: values.regularEmail }
      })
    } else {
      error.value = response.message || 'Registration failed'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
  }
}
</script>