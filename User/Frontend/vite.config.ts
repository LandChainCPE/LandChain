import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // ทำให้เข้าผ่าน LAN ได้
    port: 5173, // กำหนดพอร์ต (เปลี่ยนตามต้องการ)
    strictPort: false, // ถ้าพอร์ตนี้มีคนใช้ จะเปลี่ยนพอร์ตอัตโนมัติ
  },
})
