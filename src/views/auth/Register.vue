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
        Create Account
      </h2>
      <Form @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium mb-1 text-gray-700">
              Display Name
            </label>
            <Field id="displayName" name="displayName" type="text" rules="required|min:3"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Your display name" autocomplete="name" />
            <ErrorMessage name="displayName" class="mt-1 text-sm text-red-500" />
          </div>

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
            <label for="password" class="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <Field id="password" name="password" type="password" rules="required|min:8"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Create a password" autocomplete="new-password" />
            <ErrorMessage name="password" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium mb-1 text-gray-700">
              Confirm Password
            </label>
            <Field id="confirmPassword" name="confirmPassword" type="password" rules="required|confirmed:@password"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Confirm your password" autocomplete="new-password" />
            <ErrorMessage name="confirmPassword" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <Field name="terms" type="checkbox" rules="required"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div class="ml-3">
              <label for="terms" class="text-sm text-gray-600">
                I agree to the 
                <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
                and
                <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </label>
              <ErrorMessage name="terms" class="mt-1 text-sm text-red-500" />
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit"
            class="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors duration-300"
            :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
          </button>

          <!-- Error Message -->
          <p v-if="error" class="mt-2 text-sm text-red-500 text-center">{{ error }}</p>
        </div>
      </Form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Already have an account?
          <router-link :to="{ name: 'login' }" class="text-blue-600 hover:text-blue-500 font-medium">
            Sign In
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
    console.log('Registration attempt:', values)
    // Redirect on success
    await router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message || 'Failed to create account'
  }
}
</script>