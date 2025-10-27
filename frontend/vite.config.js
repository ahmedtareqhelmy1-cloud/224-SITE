import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use GitHub Pages base only when explicitly enabled via env (GITHUB_PAGES=true), otherwise "/"
  base: process.env.GITHUB_PAGES === 'true' ? '/224-SITE/' : '/',
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    port: 5173,
    strictPort: false
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
})