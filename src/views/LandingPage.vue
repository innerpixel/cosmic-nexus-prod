<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Navigation -->
    <nav class="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
               CSMCL SPACE
              </h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <router-link :to="{ name: 'login' }"
              class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300">
              Sign In
            </router-link>
            <router-link :to="{ name: 'register' }"
              class="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
              Join Now
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section with Particles -->
    <div class="relative overflow-hidden">
      <!-- Star field background -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-gray-950">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      </div>

      <!-- Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div class="text-center">
          <!-- Logo Section -->
          <div class="flex justify-center mb-6">
            <router-link :to="{ name: 'home' }" 
              class="inline-block w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 hover:scale-105 transition-transform duration-300">
              <CosmicLogo :isDark="true" />
            </router-link>
          </div>

          <h2 class="text-4xl sm:text-5xl md:text-6xl font-extrabold">
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Welcome to the Future
            </span>
            <span class="block text-white mt-2">
              of Digital Space
            </span>
          </h2>
          
          <p class="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            CSMCL-SPACE is more than just a platform - it's a gateway to a new digital frontier.
            Join us in creating a universe where innovation meets community.
          </p>

          <div class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center sm:space-x-4">
            <router-link :to="{ name: 'register' }"
              class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 mb-4 sm:mb-0">
              Begin Your Journey
            </router-link>
            <router-link :to="{ name: 'login' }"
              class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-gray-700 text-base font-medium rounded-md text-gray-300 bg-gray-900 hover:bg-gray-800 transform hover:scale-105 transition-all duration-300">
              Access Portal
            </router-link>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Card 1 -->
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div class="relative p-6 bg-gray-900 ring-1 ring-gray-800 rounded-lg">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">Digital Innovation</h3>
              <p class="text-gray-400">Experience the next generation of digital interaction in a space designed for the future.</p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div class="relative p-6 bg-gray-900 ring-1 ring-gray-800 rounded-lg">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">Community Connection</h3>
              <p class="text-gray-400">Join a thriving community of innovators, creators, and visionaries.</p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div class="relative p-6 bg-gray-900 ring-1 ring-gray-800 rounded-lg">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-pink-600 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">Secure Future</h3>
              <p class="text-gray-400">Built with cutting-edge security and privacy features to protect your digital presence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <p class="text-gray-400">&copy; 2025 CSMCL-SPACE. Exploring the Digital Frontier.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
<script setup>
  import CosmicLogo from '../components/CosmicLogo.vue';
</script>


<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.float-animation {
  animation: float 6s ease-in-out infinite;
}
</style>
