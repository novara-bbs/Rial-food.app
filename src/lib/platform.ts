/**
 * Platform detection utilities.
 *
 * Use these throughout the app to conditionally use native APIs
 * (e.g., @capacitor/camera on native vs. html5-qrcode on web).
 *
 * On web builds Capacitor stubs are not loaded, so all flags are false/web.
 */
import { Capacitor } from '@capacitor/core';

/** True when running inside a native iOS or Android app */
export const isNative = Capacitor.isNativePlatform();

/** True when running inside the iOS native app */
export const isIOS = Capacitor.getPlatform() === 'ios';

/** True when running inside the Android native app */
export const isAndroid = Capacitor.getPlatform() === 'android';

/** True when running in a browser (web or PWA) */
export const isWeb = Capacitor.getPlatform() === 'web';

/** True when the native platform supports haptic feedback */
export const hasHaptics = isNative;

/**
 * Trigger a light haptic impact on native. No-op on web.
 * Import lazily to avoid loading the plugin on web.
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
  if (!hasHaptics) return;
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
  const styleMap = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };
  await Haptics.impact({ style: styleMap[style] });
}

/**
 * Hide splash screen. Call once the app UI is ready.
 * No-op on web.
 */
export async function hideSplashScreen(): Promise<void> {
  if (!isNative) return;
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide({ fadeOutDuration: 300 });
}

/**
 * Share content using the native share sheet on native,
 * or the Web Share API on web (fallback to clipboard copy).
 */
export async function shareContent(options: { title?: string; text?: string; url?: string }): Promise<void> {
  if (isNative) {
    const { Share } = await import('@capacitor/share');
    await Share.share(options);
  } else if (navigator.share) {
    await navigator.share(options);
  } else if (options.url && navigator.clipboard) {
    await navigator.clipboard.writeText(options.url);
  }
}

/**
 * Open an external video URL (TikTok, Instagram, Vimeo, arbitrary web).
 *
 * On native: uses `@capacitor/browser`, which lets iOS Universal Links and
 * Android App Links hand off to the installed app first; if no app is
 * registered for the URL the system falls back to the in-app browser. On
 * web: opens a new tab with `noopener,noreferrer` to avoid leaking the
 * `window.opener` reference.
 */
export async function openExternalVideo(url: string): Promise<void> {
  if (!url) return;
  if (isNative) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url, presentationStyle: 'popover' });
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
