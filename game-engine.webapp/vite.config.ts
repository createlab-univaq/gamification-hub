import { defineConfig } from 'vite'
import { heyApiPlugin } from '@hey-api/vite-plugin';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      heyApiPlugin({
        config:{
          input: 'http://localhost:8080/v3/api-docs',
          output: 'src/api/types/',
          plugins:[
              '@hey-api/typescript'
          ]
        }
      })
  ],
  optimizeDeps: {
    // This forces Vite to pre-bundle these correctly on the first load
    include: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/icons-material',
      'blockly',
    ],
  },
  build: {
    commonjsOptions: {
      // This helps with libraries that mix CommonJS and ESM (like MUI)
      include: [/node_modules/],
    },
  },
})
