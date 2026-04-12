/**
 * Capacitor native app configuration.
 * Wraps the Vite dist/ output as iOS and Android native apps.
 *
 * Build & sync workflow:
 *   npm run build && npx cap sync
 *   npx cap open ios      # requires macOS + Xcode
 *   npx cap open android  # requires Android Studio
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novarabbs.rial',
  appName: 'RIAL',
  webDir: 'dist',
  server: {
    // Use https scheme on Android to avoid mixed-content issues
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,         // Manual hide after app is ready
      backgroundColor: '#09090b',    // Matches --color-background (dark)
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',                 // Light icons on dark background
      backgroundColor: '#09090b',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
      scrollAssist: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
