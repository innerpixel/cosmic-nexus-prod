<template>
  <AuthLayout v-slot="{ isDark }">
    <div class="p-6 md:p-8">
      <h2 class="text-2xl font-bold mb-6 transition-colors duration-300"
        :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
        Create Account
      </h2>
      
      <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
        <div class="space-y-4">
          <!-- Display Name -->
          <div>
            <label class="block text-sm font-medium mb-1 transition-colors duration-300"
              :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
              Display Name
            </label>
            <Field name="displayName" type="text"
              class="w-full px-4 py-2 rounded border bg-transparent transition-colors duration-300 focus:outline-none focus:ring-2"
              :class="[
                errors.displayName ? 'border-red-500' : isDark ? 'border-cyber-primary/30' : 'border-cosmic-primary/30',
                isDark ? 'focus:ring-cyber-primary/50' : 'focus:ring-cosmic-primary/50',
                isDark ? 'text-white' : 'text-cosmic-text'
              ]"
              placeholder="Enter your display name" />
            <ErrorMessage name="displayName" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium mb-1 transition-colors duration-300"
              :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
              Email
            </label>
            <Field name="email" type="email"
              class="w-full px-4 py-2 rounded border bg-transparent transition-colors duration-300 focus:outline-none focus:ring-2"
              :class="[
                errors.email ? 'border-red-500' : isDark ? 'border-cyber-primary/30' : 'border-cosmic-primary/30',
                isDark ? 'focus:ring-cyber-primary/50' : 'focus:ring-cosmic-primary/50',
                isDark ? 'text-white' : 'text-cosmic-text'
              ]"
              placeholder="Enter your email" />
            <ErrorMessage name="email" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium mb-1 transition-colors duration-300"
              :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
              Password
            </label>
            <Field name="password" type="password"
              class="w-full px-4 py-2 rounded border bg-transparent transition-colors duration-300 focus:outline-none focus:ring-2"
              :class="[
                errors.password ? 'border-red-500' : isDark ? 'border-cyber-primary/30' : 'border-cosmic-primary/30',
                isDark ? 'focus:ring-cyber-primary/50' : 'focus:ring-cosmic-primary/50',
                isDark ? 'text-white' : 'text-cosmic-text'
              ]"
              placeholder="Create a password" />
            <ErrorMessage name="password" class="mt-1 text-sm text-red-500" />
          </div>

          <!-- Submit Button -->
          <button type="submit"
            class="w-full py-2 px-4 rounded font-medium transition-colors duration-300 disabled:opacity-50"
            :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80' : 'bg-cosmic-primary hover:bg-cosmic-primary/80'"
            :disabled="isSubmitting">
            <span v-if="isSubmitting">Creating account...</span>
            <span v-else>Create Account</span>
          </button>

          <!-- Error Message -->
          <p v-if="error" class="text-red-500 text-sm text-center mt-4">{{ error }}</p>
        </div>
      </Form>

      <div class="mt-6 text-center">
        <p class="text-sm transition-colors duration-300"
          :class="isDark ? 'text-gray-400' : 'text-cosmic-text/80'">
          Already have an account?
          <router-link :to="{ name: 'login' }"
            class="font-medium transition-colors duration-300"
            :class="isDark ? 'text-cyber-primary hover:text-cyber-primary/80' : 'text-cosmic-primary hover:text-cosmic-primary/80'">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { object, string } from 'yup'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const error = ref(null)

// Validation schema
const schema = object({
  displayName: string()
    .required('Display name is required')
    .max(50, 'Display name is too long')
    .matches(/^(\w+\s?\w+?)$/, 'Display name must be 1-2 words'),
  email: string()
    .required('Email is required')
    .email('Invalid email format'),
  password: string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
})

// Handle form submission
const handleSubmit = async (values) => {
  try {
    error.value = null
    await authStore.register(values)
    router.push({ 
      name: 'verify-email',
      query: { email: values.email }
    })
  } catch (err) {
    error.value = err
  }
}
</script>
