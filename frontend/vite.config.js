import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages project site: https://ahmedtareqhelmy1-cloud.github.io/224SITE/
  base: '/224SITE/',
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    port: 5173,
    strictPort: false
  }
})