import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://localhost:3000',
    }
  },
  plugins: [react(), tsconfigPaths()],
})
