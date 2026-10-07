import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      // Without these, a new deploy's service worker sits in "waiting" state
      // indefinitely on a single-tab PWA — the old cached JS keeps serving
      // until every tab closes and reopens. This makes updates take effect
      // on the very next reload instead.
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Kaya',
        short_name: 'Kaya',
        description: 'A gentle companion for ADHD brains — work, body, home, and friends.',
        theme_color: '#6C8EF5',
        background_color: '#FFFBF5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
