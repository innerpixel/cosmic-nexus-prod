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
              Display Name (1-3 words)
            </label>
            <Field id="displayName" name="displayName" type="text" 
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Your display name" />
            <ErrorMessage name="displayName" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- CSMCL Name -->
          <div>
            <label for="csmclName" class="block text-sm font-medium mb-1 text-gray-700">
              CSMCL Name
            </label>
            <div class="flex">
              <Field id="csmclName" name="csmclName" type="text" 
                class="flex-1 px-4 py-2 rounded-l border border-r-0 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="yourname" />
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
            <Field id="password" name="password" type="password" 
              class="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Create a strong password" />
            <ErrorMessage name="password" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <Field name="termsAccepted" type="checkbox" 
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div class="ml-3">
              <label for="termsAccepted" class="text-sm text-gray-600">
                I agree to the 
                <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
                and
                <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </label>
              <ErrorMessage name="termsAccepted" class="mt-1 text-sm text-red-500" />
            </div>
          </div>

          <button type="submit" 
            :disabled="isSubmitting"
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
          </button>
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
import { toFormValidator } from '@vee-validate/zod'
import * as z from 'zod'
import AuthLayout from '../../layouts/AuthLayout.vue'
import CosmicLogo from '../../components/CosmicLogo.vue'

const router = useRouter()
const error = ref(null)

const validationSchema = toFormValidator(
  z.object({
    displayName: z.string()
      .min(1, 'Display name is required')
      .refine(val => {
        const words = val.trim().split(/\s+/);
        return words.length >= 1 && words.length <= 3;
      }, 'Display name must be between 1 and 3 words'),
    csmclName: z.string()
      .min(1, 'CSMCL name is required')
      .regex(/^[a-z0-9-_]+$/, 'CSMCL name can only contain lowercase letters, numbers, hyphens, and underscores'),
    regularEmail: z.string()
      .email('Please enter a valid email address'),
    simNumber: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must include uppercase, lowercase, number, and special character'),
    termsAccepted: z.boolean()
      .refine(val => val === true, 'You must accept the Terms of Service and Privacy Policy')
  })
)

async function handleSubmit(values) {
  try {
    error.value = null
    // Call registration API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Registration failed')
    }

    // Show success message and redirect to verification page
    router.push({ 
      name: 'verify-email',
      query: { email: values.regularEmail }
    })
  } catch (err) {
    error.value = err.message || 'Failed to create account'
  }
}
</script>