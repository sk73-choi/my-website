import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// GitHub Pages 배포용 base 경로. 리포지토리명에 맞춰 수정하세요.
export default defineConfig({
  base: '/my-website/',
  plugins: [react(), tailwindcss()],
})
