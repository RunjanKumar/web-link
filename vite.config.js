import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "26f6-2401-4900-1c71-6fc0-1d32-dc08-d19f-f778.ngrok-free.app",
    ],
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})