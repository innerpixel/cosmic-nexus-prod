<!-- CosmicLogo.vue -->
<template>
  <div class="relative w-full h-full">
    <svg class="w-full h-full rounded-full bg-cyber-dark dark:bg-cosmic-dark" viewBox="0 0 200 200">
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
        <circle cx="100" cy="100" r="80" class="fill-none stroke-cyber-primary dark:stroke-cosmic-primary animate-[spin_8s_linear_infinite]" />
        <circle cx="100" cy="100" r="60" class="fill-none stroke-cyber-secondary dark:stroke-cosmic-secondary animate-[spin_6s_linear_infinite_reverse]" />
        <circle cx="100" cy="100" r="40" class="fill-none stroke-cyber-primary dark:stroke-cosmic-primary animate-[spin_4s_linear_infinite]" />
      </g>
      
      <!-- Radar Scanner -->
      <g class="origin-center">
        <line x1="100" y1="100" x2="100" y2="20" 
              class="stroke-[#39ff14] stroke-2 animate-[spin_4s_linear_infinite] origin-center" />
        <path d="M100,100 L180,100 A80,80 0 0,0 100,20" 
              class="fill-[#39ff14]/20 animate-[spin_4s_linear_infinite] origin-center" />
      </g>
      
      <!-- Orbiting Objects -->
      <g>
        <circle class="fill-cyber-secondary dark:fill-cosmic-secondary animate-[orbit_6s_linear_infinite]" r="4" />
        <polygon class="fill-cyber-primary dark:fill-cosmic-primary animate-[orbit_8s_linear_infinite_reverse]" points="0,-6 5,4 -5,4" />
        <rect class="fill-[#00f3ff] animate-[orbit_10s_linear_infinite]" width="8" height="8" />
      </g>
      
      <!-- Core -->
      <g>
        <circle cx="100" cy="100" r="15" 
                class="fill-cyber-primary dark:fill-cosmic-primary animate-[pulse_2s_ease-in-out_infinite]" />
        <circle cx="100" cy="100" r="12" 
                class="fill-white/50 animate-[pulse_2s_ease-in-out_infinite_alternate]" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stars = ref(Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 200,
  y: Math.random() * 200,
  r: Math.random() * 1.5,
  delay: Math.random() * 3
})))
</script>

<style>
@keyframes orbit {
  from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
}

@keyframes twinkle {
  0% { opacity: 0.2; }
  50% { opacity: 0.8; }
  100% { opacity: 0.2; }
}
</style>