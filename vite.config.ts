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
        // manifest is defined in public/manifest.json — single source of truth
        // VitePWA reads it from public/ and generates the SW referencing it
        includeAssets: ['icons/*.png', 'icons/*.svg', 'favicon-*.png', 'apple-touch-icon-180.png'],
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
      }),
    ],
    // Note: GEMINI_API_KEY is kept server-side via Supabase Edge Function proxy.
    // Never expose it client-side via `define`.
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
            // sonner only — loads eagerly (toasts used everywhere)
            'vendor-ui': ['sonner'],
            // Recharts: ~150 KB — used only in lazy screens (RealFeelDiary, Progress)
            'vendor-recharts': ['recharts'],
            // react-markdown: ~40 KB — used only in lazy AICoach screen
            'vendor-markdown': ['react-markdown'],
            'vendor-icons': ['lucide-react'],
            // Data seeded on first-run only — keep out of the app shell so that
            // returning users (who skip the dynamic import) never fetch them.
            'data-ingredients': ['./src/features/food/data/ingredients'],
            'data-seeds': [
              './src/features/food/data/seed-recipes',
              './src/features/planner/data/seed-meal-plan',
              './src/features/planner/data/seed-shopping',
              './src/features/social/data/seed-posts',
              './src/features/social/data/seed-stories',
              './src/features/wellness/data/seed-tolerance',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});
