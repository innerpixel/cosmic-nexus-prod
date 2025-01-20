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
  <nav class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    :class="isDark ? 'bg-cyber-dark/80' : 'bg-cosmic-dark/80'">
    <div class="flex items-center justify-between p-4 md:p-6 w-full">
      <RouterLink to="/" class="text-2xl font-bold tracking-wider transition-colors duration-300"
        :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
        COSMIC NEXUS
      </RouterLink>
      <div class="flex items-center gap-8">
        <div class="hidden md:flex gap-8">
          <template v-for="item in navStore.navItems" :key="item.to">
            <RouterLink :to="item.to" class="px-4 py-2 relative group transition-colors duration-300"
              :class="isDark ? 'hover:text-cyber-primary' : 'hover:text-cosmic-primary'">
              {{ item.label }}
              <span class="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                :class="isDark ? 'bg-cyber-primary' : 'bg-cosmic-primary'"></span>
            </RouterLink>
          </template>
        </div>
        <button class="md:hidden text-2xl" aria-label="Toggle Menu">
          ☰
        </button>
      </div>
    </div>
  </nav>
</template>
