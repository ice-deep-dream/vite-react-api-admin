import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  
  return {
    base: isProd ? '/api/api-docs-ui/' : '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:7001',
          changeOrigin: true,
        },
        '/api-docs': {
          target: 'http://localhost:7001',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: '../packages/ice-api-doc/client',
      emptyOutDir: true,
      assetsDir: 'assets',
    },
  }
})
