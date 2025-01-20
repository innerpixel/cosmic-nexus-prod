import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  // Watch for system theme changes
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const updateTheme = (matches) => {
    isDark.value = matches
    document.documentElement.classList.toggle('dark', matches)
  }
  
  // Initialize theme
  if (typeof window !== 'undefined') {
    darkModeMediaQuery.addEventListener('change', (e) => updateTheme(e.matches))
    updateTheme(isDark.value)
  }

  // Clean up function
  const cleanup = () => {
    if (typeof window !== 'undefined') {
      darkModeMediaQuery.removeEventListener('change', (e) => updateTheme(e.matches))
    }
  }

  return {
    isDark,
    cleanup
  }
})
