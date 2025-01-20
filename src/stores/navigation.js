import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const isMobileMenuOpen = ref(false)
  
  const navItems = ref([
    { to: '/features', label: 'Features' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ])

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
    document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }

  return {
    isMobileMenuOpen,
    navItems,
    toggleMobileMenu,
    closeMobileMenu
  }
})
