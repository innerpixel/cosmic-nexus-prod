<script setup>
import { RouterLink } from 'vue-router'
import { useNavigationStore } from '../../stores/navigation'

const navStore = useNavigationStore()

defineProps({
  isDark: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div class="md:hidden">
    <button @click="navStore.toggleMobileMenu" class="text-2xl p-2" aria-label="Toggle Menu">
      {{ navStore.isMobileMenuOpen ? '✕' : '☰' }}
    </button>

    <!-- Mobile Menu Overlay -->
    <div v-if="navStore.isMobileMenuOpen" class="fixed inset-0 z-50 transition-colors duration-300"
      :class="isDark ? 'bg-cyber-dark' : 'bg-cosmic-dark'">
      <div class="flex flex-col items-center justify-center h-full space-y-8">
        <template v-for="item in navStore.navItems" :key="item.to">
          <RouterLink :to="item.to" 
             @click="navStore.closeMobileMenu"
             class="text-2xl px-4 py-2 relative group transition-colors duration-300"
             :class="isDark ? 'hover:text-cyber-primary' : 'hover:text-cosmic-primary'">
            {{ item.label }}
            <span class="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              :class="isDark ? 'bg-cyber-primary' : 'bg-cosmic-primary'"></span>
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>
