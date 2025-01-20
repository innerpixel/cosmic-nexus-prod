<script setup>
import DefaultLayout from './layouts/DefaultLayout.vue'
import LandingPage from './views/LandingPage.vue'
</script>

<template>
  <DefaultLayout v-slot="{ isDark }">
    <LandingPage :isDark="isDark" />
  </DefaultLayout>
</template>

<style>
:root {
  @apply antialiased;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
</style>
