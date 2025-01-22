import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://local-dev.test',
        changeOrigin: true,
        secure: true
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
})
