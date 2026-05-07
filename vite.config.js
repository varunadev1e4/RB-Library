import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-*.png', 'maskable-*.png'],
      manifest: {
        name: 'Community Library',
        short_name: 'Library',
        description: 'Your neighbourhood reading hub — search books, track reading, RSVP events.',
        theme_color: '#2C1810',
        background_color: '#FDFAF5',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['books', 'education', 'lifestyle'],
        icons: [
          { src: '/icon-72.png',      sizes: '72x72',     type: 'image/png' },
          { src: '/icon-96.png',      sizes: '96x96',     type: 'image/png' },
          { src: '/icon-128.png',     sizes: '128x128',   type: 'image/png' },
          { src: '/icon-144.png',     sizes: '144x144',   type: 'image/png' },
          { src: '/icon-152.png',     sizes: '152x152',   type: 'image/png' },
          { src: '/icon-192.png',     sizes: '192x192',   type: 'image/png' },
          { src: '/icon-384.png',     sizes: '384x384',   type: 'image/png' },
          { src: '/icon-512.png',     sizes: '512x512',   type: 'image/png' },
          {
            src: '/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Community Library Home',
          },
        ],
      },
      workbox: {
        // Cache shell assets forever (hashed filenames auto-bust)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching strategies
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase API — network first, fallback to cache
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10,
            },
          },
        ],
        // Navigate to index.html for SPA routing
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // Skip waiting and claim clients immediately on update
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        // Enable PWA in dev for testing
        enabled: false,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 3000,
  },
})
