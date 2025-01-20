<template>
  <nav class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    :class="isDark ? 'bg-cyber-dark/90 backdrop-blur-md' : 'bg-cosmic-dark/90 backdrop-blur-md'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 md:h-16">
        <!-- Logo and Brand -->
        <div class="flex-shrink-0 flex items-center">
          <router-link :to="{ name: 'home' }" class="flex items-center space-x-2">
            <CosmicLogo 
              :isDark="isDark"
              class="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110"
            />
            <span class="text-sm md:text-base font-medium tracking-wide transition-colors duration-300"
              :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
              CSMCL-SPACE
            </span>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md transition-colors duration-300"
            :class="isDark ? 'text-cyber-primary hover:bg-cyber-dark' : 'text-cosmic-primary hover:bg-cosmic-dark'"
            aria-controls="mobile-menu"
            :aria-expanded="isMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Icon when menu is closed -->
            <svg
              v-if="!isMenuOpen"
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <!-- Icon when menu is open -->
            <svg
              v-else
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:space-x-6">
          <!-- Theme Toggle -->
          <button
            @click="$emit('toggle-theme')"
            class="p-2 rounded-full transition-colors duration-300"
            :class="isDark ? 'text-cyber-primary hover:bg-cyber-dark' : 'text-cosmic-primary hover:bg-cosmic-dark'"
          >
            <span class="sr-only">Toggle theme</span>
            <!-- Sun icon -->
            <svg
              v-if="isDark"
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <!-- Moon icon -->
            <svg
              v-else
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <router-link
              :to="{ name: 'login' }"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300"
              :class="isDark ? 'text-cyber-primary hover:bg-cyber-dark' : 'text-cosmic-primary hover:bg-cosmic-dark'"
            >
              Log In
            </router-link>
            <router-link
              :to="{ name: 'register' }"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300"
              :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80 text-white' : 'bg-cosmic-primary hover:bg-cosmic-primary/80 text-white'"
            >
              Join Now
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      v-show="isMenuOpen"
      class="md:hidden transition-all duration-300"
      :class="[
        isDark ? 'bg-cyber-dark/90 backdrop-blur-md' : 'bg-cosmic-dark/90 backdrop-blur-md',
        isMenuOpen ? 'max-h-64' : 'max-h-0'
      ]"
    >
      <div class="px-4 pt-2 pb-4 space-y-2">
        <!-- Theme Toggle -->
        <button
          @click="$emit('toggle-theme')"
          class="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300"
          :class="isDark ? 'text-cyber-primary hover:bg-cyber-dark' : 'text-cosmic-primary hover:bg-cosmic-dark'"
        >
          <span v-if="isDark">Light Mode</span>
          <span v-else>Dark Mode</span>
        </button>

        <!-- Auth Links -->
        <router-link
          :to="{ name: 'login' }"
          class="block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300"
          :class="isDark ? 'text-cyber-primary hover:bg-cyber-dark' : 'text-cosmic-primary hover:bg-cosmic-dark'"
        >
          Log In
        </router-link>
        <router-link
          :to="{ name: 'register' }"
          class="block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300"
          :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80 text-white' : 'bg-cosmic-primary hover:bg-cosmic-primary/80 text-white'"
        >
          Join Now
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import CosmicLogo from './CosmicLogo.vue'

defineProps({
  isDark: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-theme'])

const isMenuOpen = ref(false)
</script>
