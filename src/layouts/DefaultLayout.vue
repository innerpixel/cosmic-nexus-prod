<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'
import MainNav from '../components/navigation/MainNav.vue'
import MobileNav from '../components/navigation/MobileNav.vue'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

// Watch for theme changes
watch(() => themeStore.isDark, (newValue) => {
  isDark.value = newValue
})

// Watch for system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const handleThemeChange = (e) => {
  themeStore.setTheme(e.matches)
}

onMounted(() => {
  mediaQuery.addEventListener('change', handleThemeChange)
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', handleThemeChange)
  themeStore.cleanup()
})
</script>

<template>
  <div :class="{ 'dark': isDark }">
    <div class="min-h-screen transition-colors duration-300"
      :class="isDark ? 'bg-cyber-dark text-white' : 'bg-cosmic-dark text-cosmic-text'">
      <header class="relative">
        <MainNav :isDark="isDark" class="hidden md:block" />
        <MobileNav :isDark="isDark" class="md:hidden" />
      </header>
      <main>
        <slot :isDark="isDark"></slot>
      </main>
    </div>
  </div>
</template>
