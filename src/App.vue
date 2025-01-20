<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
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
