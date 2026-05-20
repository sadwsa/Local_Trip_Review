import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Local_Trip_Review/', // <-- Bạn chỉ cần thêm duy nhất dòng này vào đây
})