<template>
  <AuthLayout>
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <!-- Logo Section -->
      <div class="flex justify-center mb-6">
        <router-link :to="{ name: 'home' }" class="inline-block w-20 h-20">
          <CosmicLogo :isDark="false" />
        </router-link>
      </div>

      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">
        Welcome Back
      </h2>
      <Form @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <Field id="email" name="email" type="email" rules="required|email"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="your-email@cosmical.me" autocomplete="email" />
            <ErrorMessage name="email" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Password -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <router-link :to="{ name: 'forgot-password' }"
                class="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
              </router-link>
            </div>
            <Field id="password" name="password" type="password" rules="required|min:8"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password" autocomplete="current-password" />
            <ErrorMessage name="password" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Submit Button -->
          <button type="submit" 
            class="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors duration-300"
            :disabled="isSubmitting">
            {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
          </button>

          <!-- Error Message -->
          <p v-if="error" class="mt-2 text-sm text-red-500 text-center">{{ error }}</p>
        </div>
      </Form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account? 
          <router-link :to="{ name: 'register' }" class="text-blue-600 hover:text-blue-500 font-medium">
            Create Account
          </router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useRouter } from 'vue-router'
import AuthLayout from '../../layouts/AuthLayout.vue'
import CosmicLogo from '../../components/CosmicLogo.vue'

const router = useRouter()
const error = ref(null)

async function handleSubmit(values) {
  try {
    error.value = null
    // Here you would typically call your auth store or API
    console.log('Login attempt:', values)
    // Redirect on success
    await router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message || 'Failed to sign in'
  }
}
</script>