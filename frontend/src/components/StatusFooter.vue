`<script setup>
import { ref, onMounted } from 'vue';

const version = ref('loading...');
const dbStatus = ref('checking...');
const mailStatus = ref('checking...');
const commitHash = ref('loading...');

const checkHealth = async () => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    dbStatus.value = data.database?.status || 'unknown';
    mailStatus.value = data.mail?.status || 'unknown';
  } catch (error) {
    console.error('Health check failed:', error);
    dbStatus.value = 'error';
    mailStatus.value = 'error';
  }
};

const getVersion = async () => {
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    version.value = data.version || 'unknown';
    commitHash.value = data.commit?.substring(0, 7) || 'unknown';
  } catch (error) {
    console.error('Version check failed:', error);
    version.value = 'error';
    commitHash.value = 'error';
  }
};

onMounted(() => {
  checkHealth();
  getVersion();
  // Refresh status every 5 minutes
  setInterval(checkHealth, 300000);
});
</script>

<template>
  <footer class="fixed bottom-0 left-0 w-full bg-gray-100 dark:bg-gray-800 py-2 px-4 text-sm">
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex space-x-4">
        <span class="text-gray-600 dark:text-gray-300">Version: {{ version }}</span>
        <span class="text-gray-400 dark:text-gray-500">({{ commitHash }})</span>
      </div>
      <div class="flex space-x-4">
        <span class="flex items-center">
          <span class="mr-2">DB:</span>
          <span 
            class="w-2 h-2 rounded-full mr-1"
            :class="{
              'bg-green-500': dbStatus === 'ok',
              'bg-red-500': dbStatus === 'error',
              'bg-yellow-500': dbStatus === 'checking...'
            }"
          ></span>
          {{ dbStatus }}
        </span>
        <span class="flex items-center">
          <span class="mr-2">Mail:</span>
          <span 
            class="w-2 h-2 rounded-full mr-1"
            :class="{
              'bg-green-500': mailStatus === 'ok',
              'bg-red-500': mailStatus === 'error',
              'bg-yellow-500': mailStatus === 'checking...'
            }"
          ></span>
          {{ mailStatus }}
        </span>
      </div>
    </div>
  </footer>
</template>
