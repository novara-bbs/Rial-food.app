import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { I18nProvider } from './i18n/index.ts';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { AppStateProvider } from './contexts/AppStateContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SENTRY_DSN, IS_PROD } from './config/env';
import { migrateLocalStorageToIDB } from './lib/storage';
import { hideSplashScreen } from './lib/platform';
import { initializePurchases } from './lib/purchases';

// Migrate large localStorage datasets → IndexedDB (runs once, idempotent)
migrateLocalStorageToIDB().catch(() => {/* non-fatal */});

// Initialize Sentry (only if DSN is configured)
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: IS_PROD ? 'production' : 'development',
    tracesSampleRate: IS_PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: IS_PROD ? 1.0 : 0,
  });
}

// Global unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
  console.error('[UnhandledRejection]', event.reason);
});

// Initialize native services
hideSplashScreen().catch(() => {/* non-fatal */});
initializePurchases().catch(() => {/* non-fatal */});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationProvider>
            <AppStateProvider>
              <TooltipProvider>
                <App />
              </TooltipProvider>
            </AppStateProvider>
          </NavigationProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
