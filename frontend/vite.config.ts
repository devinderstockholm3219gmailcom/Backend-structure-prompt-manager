import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lib':        resolve(__dirname, 'src/lib'),
      '@hooks':      resolve(__dirname, 'src/hooks'),
      '@pages':      resolve(__dirname, 'src/pages'),
      '@components': resolve(__dirname, 'src/components'),
      '@types':      resolve(__dirname, 'src/types'),
      '@styles':     resolve(__dirname, 'src/styles'),

      // Force ONE copy of React — fixes duplicate React error
      'react':     resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})