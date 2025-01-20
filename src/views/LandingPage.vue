<template>
  <div class="w-full">
    <!-- Hero Section -->
    <header class="relative h-screen flex items-center justify-center pt-16">
      <div class="absolute inset-0 bg-grid-pattern" :class="{'dark-grid': isDark, 'light-grid': !isDark}"></div>
      <div class="relative z-10 text-center w-full md:px-8 md:max-w-4xl mx-auto">
        <div class="p-4 md:p-8 rounded-none md:rounded-xl border-0 md:border backdrop-blur-sm transition-colors duration-300"
          :class="isDark ? 'bg-cyber-light/30 md:border-cyber-primary/10' : 'bg-cosmic-light/30 md:border-cosmic-primary/10'">
          <CosmicLogo :isDark="isDark" class="w-32 h-32 mx-auto mb-8" />
          <h1 class="text-5xl md:text-6xl font-bold mb-4 transition-colors duration-300"
            :class="{'cyber-glitch': isDark, 'cosmic-glitch': !isDark}" data-text="Welcome to the Future">
            Welcome to the Future
          </h1>
          <p class="text-xl mb-8 transition-colors duration-300"
            :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
            Discover the next generation of digital innovation
          </p>
          <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button class="w-full md:w-auto btn-primary transition-colors duration-300"
              :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80' : 'bg-cosmic-primary hover:bg-cosmic-primary/80'">
              Get Started
            </button>
            <button class="w-full md:w-auto btn-secondary transition-colors duration-300"
              :class="isDark ? 'border-cyber-primary hover:bg-cyber-primary/20' : 'border-cosmic-primary hover:bg-cosmic-primary/20'">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <section id="features" class="py-24 px-4 md:px-8 transition-colors duration-300"
      :class="isDark ? 'bg-cyber-light' : 'bg-cosmic-light'">
      <h2 class="text-4xl font-bold text-center mb-16 transition-colors duration-300"
        :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">Core Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full md:max-w-7xl mx-auto">
        <div v-for="feature in features" :key="feature.title"
          class="group relative p-4 md:p-8 rounded-none md:rounded-xl border-0 md:border hover:-translate-y-2 transition-all duration-300"
          :class="isDark ? 'bg-cyber-light/50 md:border-cyber-primary/10' : 'bg-cosmic-light/50 md:border-cosmic-primary/10'">
          <div class="relative z-10">
            <div class="w-16 h-16 mb-6 flex items-center justify-center rounded-full transition-colors duration-300"
              :class="[
                isDark ? 'bg-cyber-primary/20' : 'bg-cosmic-primary/20',
                `feature-icon-${feature.iconClass}`
              ]">
              <span class="text-3xl">{{ feature.icon }}</span>
            </div>
            <h3 class="text-xl font-bold mb-4 transition-colors duration-300"
              :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">
              {{ feature.title }}
            </h3>
            <p class="transition-colors duration-300"
              :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-24 px-4 md:px-8 transition-colors duration-300"
      :class="isDark ? 'bg-cyber-dark' : 'bg-cosmic-dark'">
      <div class="max-w-full md:max-w-7xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-8 transition-colors duration-300"
          :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">About Us</h2>
        <p class="text-xl max-w-3xl mx-auto mb-16 leading-relaxed transition-colors duration-300"
          :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
          We are pioneers in digital innovation, crafting the future through cutting-edge technology and creative solutions.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <div v-for="stat in stats" :key="stat.label"
            class="p-4 md:p-8 rounded-none md:rounded-xl border-0 md:border transition-colors duration-300"
            :class="isDark ? 'bg-cyber-light/50 md:border-cyber-primary/10' : 'bg-cosmic-light/50 md:border-cosmic-primary/10'">
            <div class="text-4xl font-bold mb-2 transition-colors duration-300"
              :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">{{ stat.value }}</div>
            <div class="text-lg transition-colors duration-300"
              :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-24 px-4 md:px-8 transition-colors duration-300"
      :class="isDark ? 'bg-cyber-light' : 'bg-cosmic-light'">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-8 transition-colors duration-300"
          :class="isDark ? 'text-cyber-primary' : 'text-cosmic-primary'">Get in Touch</h2>
        <p class="text-xl mb-12 transition-colors duration-300"
          :class="isDark ? 'text-gray-300' : 'text-cosmic-text'">
          Ready to start your journey into the future? Contact us today.
        </p>
        <button class="btn-primary transition-colors duration-300"
          :class="isDark ? 'bg-cyber-primary hover:bg-cyber-primary/80' : 'bg-cosmic-primary hover:bg-cosmic-primary/80'">
          Contact Us
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CosmicLogo from '../components/CosmicLogo.vue'

const features = ref([
  {
    icon: '🚀',
    iconClass: 'innovation',
    title: 'Innovation',
    description: 'Push the boundaries of what is possible',
  },
  {
    icon: '💡',
    iconClass: 'technology',
    title: 'Technology',
    description: 'Cutting-edge solutions for tomorrow'
  },
  {
    icon: '🌍',
    iconClass: 'impact',
    title: 'Global Impact',
    description: 'Changing the world, one step at a time'
  },
  {
    icon: '🔮',
    iconClass: 'future',
    title: 'Future Ready',
    description: 'Prepared for tomorrow challenges'
  }
])

const stats = ref([
  { value: '2025', label: 'Founded' },
  { value: '100+', label: 'Projects' },
  { value: '50+', label: 'Team Members' },
  { value: '24/7', label: 'Support' }
])

defineProps({
  isDark: {
    type: Boolean,
    required: true
  }
})
</script>

<style>
.bg-grid-pattern {
  background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px;
}

.dark-grid {
  background: 
    linear-gradient(to bottom, transparent 0%, theme('colors.cyber.dark') 90%),
    radial-gradient(circle at center, transparent 0%, theme('colors.cyber.dark') 100%),
    linear-gradient(90deg, theme('colors.cyber.primary') / 10% 1px, transparent 1px),
    linear-gradient(0deg, theme('colors.cyber.primary') / 10% 1px, transparent 1px);
}

.light-grid {
  background: 
    linear-gradient(to bottom, transparent 0%, theme('colors.cosmic.dark') 90%),
    radial-gradient(circle at center, transparent 0%, theme('colors.cosmic.dark') 100%),
    linear-gradient(90deg, theme('colors.cosmic.primary') / 10% 1px, transparent 1px),
    linear-gradient(0deg, theme('colors.cosmic.primary') / 10% 1px, transparent 1px);
}

.cyber-glitch {
  position: relative;
  text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
                0.025em 0.04em 0 #fffc00;
  animation: glitch 725ms infinite;
}

.cosmic-glitch {
  position: relative;
  text-shadow: 0.05em 0 0 #7e3ff2, -0.03em -0.04em 0 #f23f99,
                0.025em 0.04em 0 #3ff2a5;
  animation: glitch 725ms infinite;
}

@keyframes glitch {
  0% {
    text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
                 0.025em 0.04em 0 #fffc00;
  }
  15% {
    text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
                 0.025em 0.04em 0 #fffc00;
  }
  16% {
    text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff,
                 -0.05em -0.05em 0 #fffc00;
  }
  49% {
    text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff,
                 -0.05em -0.05em 0 #fffc00;
  }
  50% {
    text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff,
                 0 -0.04em 0 #fffc00;
  }
  99% {
    text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff,
                 0 -0.04em 0 #fffc00;
  }
  100% {
    text-shadow: -0.05em 0 0 #00fffc, -0.025em -0.04em 0 #fc00ff,
                 -0.04em -0.025em 0 #fffc00;
  }
}
</style>
