<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Verify Your Email
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Please enter the verification token sent to your email
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Token Form -->
        <form v-if="!showResendForm" class="space-y-6" @submit.prevent="handleVerification">
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

        <!-- Resend Form -->
        <form v-else class="space-y-6" @submit.prevent="handleResend">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email address"
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
              {{ isLoading ? 'Sending...' : 'Resend Verification Email' }}
            </button>
          </div>
        </form>

        <!-- Message Display -->
        <div v-if="message" :class="['mt-4 text-sm text-center', messageClass]">
          {{ message }}
          <div v-if="emailPreviewUrl" class="mt-2">
            <a :href="emailPreviewUrl" target="_blank" class="text-indigo-600 hover:text-indigo-500">
              View Email Preview
            </a>
          </div>
        </div>

        <!-- Form Toggle -->
        <div class="mt-6">
          <button
            type="button"
            class="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
            @click="toggleForm"
          >
            {{ showResendForm ? 'Back to Verification' : 'Need a new verification token?' }}
          </button>
        </div>

        <!-- Back to Login -->
        <div class="mt-4 text-center">
          <a
            href="/login"
            class="text-sm text-gray-600 hover:text-indigo-500"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'EmailVerification',
  setup() {
    const route = useRoute()
    const token = ref('')
    const email = ref('')
    const isLoading = ref(false)
    const message = ref('')
    const messageClass = ref('')
    const showResendForm = ref(false)
    const emailPreviewUrl = ref('')

    // Check for token in URL on mount
    onMounted(() => {
      const urlToken = route.params.token
      if (urlToken) {
        token.value = urlToken
        handleVerification()
      }
    })

    const handleVerification = async () => {
      if (!token.value) return

      isLoading.value = true
      message.value = ''
      emailPreviewUrl.value = ''

      try {
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/verify-email`, {
          token: token.value
        })

        message.value = 'Email verified successfully!'
        messageClass.value = 'text-green-600'
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } catch (error) {
        message.value = error.response?.data?.message || 'Verification failed. Please try again.'
        messageClass.value = 'text-red-600'

        // If token expired, show option to resend
        if (error.response?.data?.message?.includes('expired')) {
          showResendForm.value = true
        }
      } finally {
        isLoading.value = false
      }
    }

    const handleResend = async () => {
      if (!email.value) return

      isLoading.value = true
      message.value = ''
      emailPreviewUrl.value = ''

      try {
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/resend-verification`, {
          email: email.value
        })

        message.value = 'New verification email sent! Please check your inbox.'
        messageClass.value = 'text-green-600'
        
        // For development, show email preview link
        if (response.data.emailPreview) {
          emailPreviewUrl.value = response.data.emailPreview
        }

        // Switch back to verification form after 2 seconds
        setTimeout(() => {
          showResendForm.value = false
        }, 2000)
      } catch (error) {
        message.value = error.response?.data?.message || 'Failed to send verification email. Please try again.'
        messageClass.value = 'text-red-600'
      } finally {
        isLoading.value = false
      }
    }

    const toggleForm = () => {
      showResendForm.value = !showResendForm.value
      message.value = ''
      emailPreviewUrl.value = ''
    }

    return {
      token,
      email,
      isLoading,
      message,
      messageClass,
      showResendForm,
      emailPreviewUrl,
      handleVerification,
      handleResend,
      toggleForm
    }
  }
}
</script>
