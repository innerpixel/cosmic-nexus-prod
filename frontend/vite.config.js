import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    host: true, // Listen on all network interfaces
    port: 3000,
    strictPort: true,
    hmr: {
      host: 'local-dev.test'
    },
    proxy: {
      '/api': {
        target: 'https://local-dev.test',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://local-dev.test/api')
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
})
