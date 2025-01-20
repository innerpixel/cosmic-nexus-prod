<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold mb-8 transition-colors duration-300"
      :class="themeStore.isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
      Contact Us
    </h1>
    <!-- Add your contact content here -->
  </div>
</template>
