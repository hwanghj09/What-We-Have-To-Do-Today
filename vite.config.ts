import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'What We Have To Do Today',
        short_name: 'Todo App',
        description: 'Todo app',
        theme_color: '#ffffff',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icons/logo.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ],
      },
      devOptions: {
        enabled: false, // 개발 환경에서도 PWA 사용 가능
      },
    }),
  ],
})
