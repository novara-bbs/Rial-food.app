/**
 * Typed environment accessors.
 * All env vars are read once and exported as constants.
 */

const env = (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};

export const GEMINI_API_KEY: string =
  (env.VITE_GEMINI_API_KEY as string) || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

export const SENTRY_DSN: string =
  (env.VITE_SENTRY_DSN as string) || '';

export const SUPABASE_URL: string =
  (env.VITE_SUPABASE_URL as string) || '';

export const SUPABASE_ANON_KEY: string =
  (env.VITE_SUPABASE_ANON_KEY as string) || '';

// RevenueCat — separate keys for App Store vs Google Play
export const RC_APPLE_API_KEY: string =
  (env.VITE_RC_APPLE_API_KEY as string) || '';

export const RC_GOOGLE_API_KEY: string =
  (env.VITE_RC_GOOGLE_API_KEY as string) || '';

export const IS_DEV: boolean = env.DEV === true;

export const IS_PROD: boolean = env.PROD === true;

/**
 * PostHog project API key — product analytics.
 * Set VITE_POSTHOG_KEY in your environment to activate.
 * Leave empty to run in no-op mode (default — zero data sent).
 * Get a key at: https://posthog.com (cloud, free up to 1M events/month)
 */
export const POSTHOG_KEY: string =
  (env.VITE_POSTHOG_KEY as string) || '';
