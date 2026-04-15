import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Mobile-first viewport (matching the app's target)
    viewport: { width: 390, height: 844 },
  },
  projects: [
    // Primary: mobile Chrome (closest to Capacitor WebView)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    // Secondary: iPhone Safari for iOS parity
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    // Desktop: for responsive layout checks
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // In CI: serve the pre-built dist/. Locally: use dev server for HMR.
    command: process.env.CI ? 'npx vite preview --port 3000' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
