<script setup>
import { ref, onMounted } from 'vue';

const version = ref('loading...');
const dbStatus = ref('checking...');
const mailStatus = ref('checking...');
const commitHash = ref('loading...');
const error = ref(null);

const checkHealth = async () => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    dbStatus.value = data.database?.status || 'unknown';
    mailStatus.value = data.mail?.status || 'unknown';
    error.value = null;
  } catch (err) {
    console.error('Health check failed:', err);
    error.value = err.message;
    dbStatus.value = 'error';
    mailStatus.value = 'error';
  }
};

const getVersion = async () => {
  try {
    const response = await fetch('/api/version');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    version.value = data.version || '0.0.0';
    commitHash.value = data.commit?.substring(0, 7) || 'unknown';
    error.value = null;
  } catch (err) {
    console.error('Version check failed:', err);
    error.value = err.message;
    version.value = 'error';
    commitHash.value = 'error';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ok':
      return 'bg-green-500';
    case 'error':
      return 'bg-red-500';
    case 'checking...':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

onMounted(() => {
  checkHealth();
  getVersion();
  // Refresh status every minute
  setInterval(() => {
    checkHealth();
    getVersion();
  }, 60000);
});
</script>

<template>
  <footer class="fixed bottom-0 left-0 w-full bg-gray-100 dark:bg-gray-800 py-2 px-4 text-sm">
    <div v-if="error" class="text-red-500 text-xs mb-1 text-center">
      {{ error }}
    </div>
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex space-x-4">
        <span class="text-gray-600 dark:text-gray-300">Version: {{ version }}</span>
        <span class="text-gray-400 dark:text-gray-500">({{ commitHash }})</span>
      </div>
      <div class="flex space-x-4">
        <span class="flex items-center">
          <span class="mr-2 text-gray-600 dark:text-gray-300">DB:</span>
          <span 
            class="w-2 h-2 rounded-full mr-1"
            :class="getStatusColor(dbStatus)"
          ></span>
          <span class="text-gray-600 dark:text-gray-300">{{ dbStatus }}</span>
        </span>
        <span class="flex items-center">
          <span class="mr-2 text-gray-600 dark:text-gray-300">Mail:</span>
          <span 
            class="w-2 h-2 rounded-full mr-1"
            :class="getStatusColor(mailStatus)"
          ></span>
          <span class="text-gray-600 dark:text-gray-300">{{ mailStatus }}</span>
        </span>
      </div>
    </div>
  </footer>
</template>
