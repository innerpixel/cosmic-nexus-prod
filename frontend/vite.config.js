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
    host: 'local-dev.test',
    port: 3000,
    strictPort: true,
    https: true,
    hmr: {
      overlay: true
    },
    allowedHosts: ['local-dev.test'],
    proxy: {
      '/api': {
        target: 'https://local-dev.test:5000',
        changeOrigin: true,
        secure: true,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('proxyReq', req.url);
          });
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
})
