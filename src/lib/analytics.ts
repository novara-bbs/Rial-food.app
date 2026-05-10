/**
 * RIAL Analytics — thin wrapper around PostHog.
 *
 * Runs as a no-op when VITE_POSTHOG_KEY is not set (development default).
 * Set VITE_POSTHOG_KEY in .env.local (or Vercel env vars) to activate.
 *
 * ## Activation (5 minutes)
 * 1. Create a free project at https://posthog.com
 * 2. npm install posthog-js
 * 3. Add VITE_POSTHOG_KEY=phc_xxx to .env.local and Vercel env vars
 * 4. Uncomment the posthog import + init call in this file
 *
 * ## Privacy / GDPR
 * - PostHog is initialised with `person_profiles: 'identified_only'` so
 *   anonymous sessions produce zero PII.
 * - Call `analytics.identify(userId)` only after the user creates an account.
 * - Call `analytics.reset()` on sign-out to dissociate the session.
 * - Users who decline analytics consent should never have identify() called.
 *
 * ## Key events tracked
 * See `AnalyticsEvent` type below — all events are typed to prevent typos.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_complete'
  | 'meal_logged'
  | 'recipe_created'
  | 'recipe_forked'
  | 'recipe_imported'
  | 'ai_coach_used'
  | 'barcode_scanned'
  | 'plan_upgraded'        // RIAL+
  | 'streak_milestone'
  | 'weekly_checkin_done';

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

// ─── Stub implementation (active until posthog-js is installed) ──────────────

/*
 * UNCOMMENT the block below after running `npm install posthog-js`
 * and setting VITE_POSTHOG_KEY in your environment.
 *
 * import posthog from 'posthog-js';
 * import { POSTHOG_KEY, IS_PROD } from '@/config/env';
 *
 * export function initAnalytics(): void {
 *   if (!POSTHOG_KEY) return;
 *   posthog.init(POSTHOG_KEY, {
 *     api_host: 'https://eu.posthog.com',   // EU data residency
 *     person_profiles: 'identified_only',    // no anon PII
 *     autocapture: false,                    // manual events only
 *     capture_pageview: false,               // SPA — we handle this
 *     debug: !IS_PROD,
 *   });
 * }
 *
 * export const analytics = {
 *   track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
 *     if (!POSTHOG_KEY) return;
 *     posthog.capture(event, properties);
 *   },
 *   identify(userId: string, traits?: AnalyticsProperties): void {
 *     if (!POSTHOG_KEY) return;
 *     posthog.identify(userId, traits);
 *   },
 *   reset(): void {
 *     if (!POSTHOG_KEY) return;
 *     posthog.reset();
 *   },
 * };
 */

// ─── Active implementation (no-op stub) ──────────────────────────────────────

/** Call once at app startup (main.tsx). No-op if POSTHOG_KEY not set. */
export function initAnalytics(): void {
  // Activates when posthog-js is installed and key is set.
}

/**
 * Central analytics object. Import this anywhere in the app to track events.
 *
 * @example
 * import { analytics } from '@/lib/analytics';
 * analytics.track('meal_logged', { mealType: 'lunch', source: 'barcode' });
 */
export const analytics = {
  /**
   * Track a named event with optional properties.
   * All event names are typed — see `AnalyticsEvent`.
   */
  track(_event: AnalyticsEvent, _properties?: AnalyticsProperties): void {
    // No-op until posthog-js is installed and key is configured.
  },

  /**
   * Associate the current session with a logged-in user.
   * Call only after the user has given consent and created an account.
   */
  identify(_userId: string, _traits?: AnalyticsProperties): void {
    // No-op until posthog-js is installed and key is configured.
  },

  /**
   * Dissociate the session from the user. Call on sign-out.
   */
  reset(): void {
    // No-op until posthog-js is installed and key is configured.
  },
};
