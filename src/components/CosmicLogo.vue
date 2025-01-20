<!-- CosmicLogo.vue -->
<template>
  <div class="relative w-full h-full">
    <svg class="w-full h-full rounded-full" 
      :class="isDark ? 'bg-cyber-dark' : 'bg-cosmic-dark'"
      viewBox="0 0 200 200">
      <!-- Background star field -->
      <circle v-for="star in stars" 
              :key="star.id"
              :cx="star.x"
              :cy="star.y"
              :r="star.r"
              class="fill-white/50 animate-[twinkle_3s_ease-in-out_infinite]"
              :style="{ animationDelay: star.delay + 's' }" />
      
      <!-- Orbital Rings -->
      <g class="orbital-rings">
        <circle cx="100" cy="100" r="80" 
          :class="[
            'fill-none animate-[spin_8s_linear_infinite]',
            isDark ? 'stroke-cyber-primary' : 'stroke-cosmic-primary'
          ]" />
        <circle cx="100" cy="100" r="60" 
          :class="[
            'fill-none animate-[spin_6s_linear_infinite_reverse]',
            isDark ? 'stroke-cyber-secondary' : 'stroke-cosmic-secondary'
          ]" />
        <circle cx="100" cy="100" r="40" 
          :class="[
            'fill-none animate-[spin_4s_linear_infinite]',
            isDark ? 'stroke-cyber-primary' : 'stroke-cosmic-primary'
          ]" />
      </g>
      
      <!-- Radar Scanner -->
      <g class="origin-center">
        <line x1="100" y1="100" x2="100" y2="20" 
              :class="[
                'stroke-2 animate-[spin_4s_linear_infinite] origin-center',
                isDark ? 'stroke-cyber-accent' : 'stroke-cosmic-accent'
              ]" />
        <path d="M100,100 L180,100 A80,80 0 0,0 100,20" 
              :class="[
                'animate-[spin_4s_linear_infinite] origin-center',
                isDark ? 'fill-cyber-accent/20' : 'fill-cosmic-accent/20'
              ]" />
      </g>
      
      <!-- Orbiting Objects -->
      <g>
        <circle class="animate-[orbit_6s_linear_infinite]" r="4"
          :class="isDark ? 'fill-cyber-secondary' : 'fill-cosmic-secondary'" />
        <polygon class="animate-[orbit_8s_linear_infinite_reverse]" points="0,-6 5,4 -5,4"
          :class="isDark ? 'fill-cyber-primary' : 'fill-cosmic-primary'" />
        <rect class="animate-[orbit_10s_linear_infinite]" width="8" height="8"
          :class="isDark ? 'fill-cyber-accent' : 'fill-cosmic-accent'" />
      </g>
      
      <!-- Core -->
      <g>
        <circle cx="100" cy="100" r="15" 
          :class="[
            'animate-[pulse_2s_ease-in-out_infinite]',
            isDark ? 'fill-cyber-primary' : 'fill-cosmic-primary'
          ]" />
        <circle cx="100" cy="100" r="12" 
                class="fill-white/50 animate-[pulse_2s_ease-in-out_infinite_alternate]" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isDark: {
    type: Boolean,
    required: true
  }
})

const stars = ref(Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 200,
  y: Math.random() * 200,
  r: Math.random() * 1.5 + 0.5,
  delay: Math.random() * 3
})))
</script>

<style>
@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes orbit {
  from {
    transform: rotate(0deg) translate(60px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translate(60px) rotate(-360deg);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.95); opacity: 0.8; }
}
</style>