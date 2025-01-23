<!-- 
  App.vue - Root Component
  Handles the main routing and layout structure for the Cosmic Nexus application.
  Uses Vue Router for dynamic component rendering.

  @description The root component of the Cosmic Nexus application, responsible for rendering the main layout and routing.
  @author [Your Name]
  @version 1.0.0
-->
<script setup>
import { RouterView } from 'vue-router';
import StatusFooter from './components/StatusFooter.vue';
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  
    <StatusFooter />
  </div>
</template>

<style>
:root {
  @apply antialiased;
}

body {
  @apply bg-gray-900 text-white;
  background-image: radial-gradient(circle at center, rgba(55, 65, 81, 0.1) 0%, rgba(17, 24, 39, 0.7) 100%);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-900;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-700 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-600;
}
</style>
