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
  server: {
    proxy: {
      '/api': {target: 'http://localhost:8080', changeOrigin: true},
    },
  },
  optimizeDeps: {
    // This forces Vite to pre-bundle these correctly on the first load
    include: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/icons-material',
      'blockly',
      'drools-builder',
    ],
  },
  build: {
    commonjsOptions: {
      // This helps with libraries that mix CommonJS and ESM (like MUI)
      include: [/node_modules/],
    },
  },
})
