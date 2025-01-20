<template>
  <div class="min-h-screen flex items-center justify-center"
    :class="isDark ? 'bg-cyber-dark' : 'bg-cosmic-dark'">
    <div class="absolute inset-0 bg-grid-pattern opacity-10" :class="{'dark-grid': isDark, 'light-grid': !isDark}"></div>
    <div class="w-full max-w-md mx-auto p-6 relative z-10">
      <router-link to="/" class="block text-center mb-8">
        <h1 class="text-3xl font-bold tracking-wider transition-colors duration-300"
          :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
          COSMIC NEXUS
        </h1>
      </router-link>
      <div class="backdrop-blur-sm rounded-xl shadow-xl border transition-colors duration-300"
        :class="isDark ? 'bg-cyber-light/30 border-cyber-primary/10' : 'bg-cosmic-light/30 border-cosmic-primary/10'">
        <slot :isDark="isDark"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
</script>
