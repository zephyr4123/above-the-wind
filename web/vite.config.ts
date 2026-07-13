import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 部署在 GitHub Pages 子路径 https://zephyr4123.github.io/above-the-wind/
  base: '/above-the-wind/',
  plugins: [react()],
})
