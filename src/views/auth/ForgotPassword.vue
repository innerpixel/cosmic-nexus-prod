<template>
  <AuthLayout v-slot="{ isDark }">
    <div class="p-6 md:p-8">
      <h2 class="text-2xl font-bold mb-6 transition-colors duration-300"
        :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
        Reset Your Password
      </h2>
      
      <div v-if="success" class="mb-6 p-4 rounded bg-green-100 text-green-700">
        {{ success }}
      </div>
      
      <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium mb-1 transition-colors duration-300"
              :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
              Your Cosmical Email
            </label>
            <Field name="email" type="email"
              class="w-full px-4 py-2 rounded border bg-transparent transition-colors duration-300 focus:outline-none focus:ring-2"
              :class="[
                errors.email ? 'border-red-500' : isDark ? 'border-cyber-primary/30' : 'border-cosmic-primary/30',
                isDark ? 'focus:ring-cyber-primary/50' : 'focus:ring-cosmic-primary/50',
                isDark ? 'text-white' : 'text-cosmic-text'
              ]"
              placeholder="your-name@cosmical.me" />
            <ErrorMessage name="email" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Submit Button -->
          <button type="submit"
            class="w-full py-2 px-4 rounded font-medium transition-colors duration-300 disabled:opacity-50"
            :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80' : 'bg-cosmic-primary hover:bg-cosmic-primary/80'"
            :disabled="isSubmitting">
            <span v-if="isSubmitting">Sending reset instructions...</span>
            <span v-else>Send Reset Instructions</span>
          </button>

          <!-- Error Message -->
          <p v-if="error" class="text-red-500 text-sm text-center mt-4">{{ error }}</p>
        </div>
      </Form>

      <div class="mt-6 text-center">
        <p class="text-sm transition-colors duration-300"
          :class="isDark ? 'text-gray-400' : 'text-cosmic-text/80'">
          Remember your password?
          <router-link :to="{ name: 'login' }"
            class="font-medium transition-colors duration-300"
            :class="isDark ? 'text-cyber-primary hover:text-cyber-primary/80' : 'text-cosmic-primary hover:text-cosmic-primary/80'">
            Back to Login
          </router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { z } from 'zod'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { toFormValidator } from '@vee-validate/zod'

const authStore = useAuthStore()
const error = ref(null)
const success = ref(null)

const schema = toFormValidator(
  z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .endsWith('@cosmical.me', 'Please use your @cosmical.me email')
  })
)

async function handleSubmit(values) {
  try {
    error.value = null
    success.value = null
    await authStore.forgotPassword(values.email)
    success.value = 'Password reset instructions have been sent to your email'
  } catch (err) {
    error.value = err.message || 'Failed to send reset instructions'
  }
}
</script>
