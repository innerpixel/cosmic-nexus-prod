<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Verify Your Email
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleVerification">
          <div>
            <label for="token" class="block text-sm font-medium text-gray-700">
              Verification Token
            </label>
            <div class="mt-1">
              <input
                id="token"
                v-model="token"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your verification token"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isLoading ? 'Verifying...' : 'Verify Email' }}
            </button>
          </div>
        </form>

        <div v-if="message" :class="['mt-4 text-sm text-center', messageClass]">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'

export default {
  name: 'EmailVerification',
  setup() {
    const token = ref('')
    const isLoading = ref(false)
    const message = ref('')
    const messageClass = ref('')

    const handleVerification = async () => {
      if (!token.value) return

      isLoading.value = true
      message.value = ''

      try {
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/verify-email`, {
          token: token.value
        })

        message.value = 'Email verified successfully!'
        messageClass.value = 'text-green-600'
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_APP_BASE_URL}/login`
        }, 2000)
      } catch (error) {
        message.value = error.response?.data?.message || 'Verification failed. Please try again.'
        messageClass.value = 'text-red-600'
      } finally {
        isLoading.value = false
      }
    }

    return {
      token,
      isLoading,
      message,
      messageClass,
      handleVerification
    }
  }
}
</script>
