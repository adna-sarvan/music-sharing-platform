import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
export default {
  server: {
    proxy: {
      '/songs': 'https://backend-service-1024177687549.europe-west3.run.app'
    }
  }
}