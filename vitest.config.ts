import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules', 'dist', 'e2e/**', '.claude/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/features/**/utils/**/*.ts',
        'src/features/**/api/**/*.ts',
        'src/hooks/**/*.ts',
        'src/lib/**/*.ts',
      ],
      exclude: [
        // Platform-native: require integration/E2E tests, not unit tests
        'src/lib/supabase.ts',
        'src/lib/purchases.ts',
        'src/lib/platform.ts',
        'src/lib/storage.ts',       // IndexedDB — needs browser integration test
        'src/lib/sync.ts',          // Supabase cloud sync — integration test
        // Complex hooks with many side-effects
        'src/hooks/useProGate.ts',
        'src/hooks/useDailyReset.ts',
        'src/hooks/useLocalStorageState.ts',
        // High-complexity wellness ML (400 lines, requires full state graph)
        'src/features/wellness/utils/correlations.ts',
        'src/**/*.d.ts',
        'src/test/**',
      ],
      thresholds: {
        lines: 30,
        functions: 30,
        branches: 30,
        statements: 30,
      },
    },
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
});
