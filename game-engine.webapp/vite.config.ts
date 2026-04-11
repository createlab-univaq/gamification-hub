import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // This forces Vite to pre-bundle these correctly on the first load
    include: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/icons-material',
    ],
  },
  build: {
    commonjsOptions: {
      // This helps with libraries that mix CommonJS and ESM (like MUI)
      include: [/node_modules/],
    },
  },
})
