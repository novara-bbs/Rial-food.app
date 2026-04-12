import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: false },
        workbox: {
          // Precache app shell
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
          // Runtime caching strategies
          runtimeCaching: [
            {
              // Open Food Facts — stale-while-revalidate
              urlPattern: /^https:\/\/world\.openfoodfacts\.org\//i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'off-api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Gemini API — network-first, no offline fallback for AI
              urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\//i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'gemini-api-cache',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 }, // 5 min
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Images — cache-first, 50MB limit
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Google Fonts — cache-first
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        manifest: {
          name: 'RIAL — Nutrición Inteligente',
          short_name: 'RIAL',
          description: 'Tu compañero de nutrición con IA. Tracking, recetas, bienestar y más.',
          theme_color: '#09090b',
          background_color: '#09090b',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@features': path.resolve(__dirname, './src/features'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@i18n': path.resolve(__dirname, './src/i18n'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['recharts', 'sonner', 'react-markdown'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});
