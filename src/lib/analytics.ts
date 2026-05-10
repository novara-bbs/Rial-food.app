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
 * Prefer the typed `track.*` helpers below over `analytics.track('event', ...)`.
 * The typed helpers enforce the property contract per event so a typo in a
 * property name is a compile error, not a silent data quality bug.
 *
 * @example
 * import { track } from '@/lib/analytics';
 * track.mealLogged({ source: 'barcode', mealSlot: 'lunch' });
 */
export const analytics = {
  /**
   * Low-level: track a named event with optional properties.
   * Prefer `track.*` typed helpers — they enforce per-event property shapes.
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

// ─── Typed per-event helpers ─────────────────────────────────────────────────
// Each helper enforces the property contract for one event so consumers can't
// silently drift on property names. New events: add to AnalyticsEvent above
// AND add a typed helper here.

/** Source of a meal log entry — used to measure feature adoption. */
export type MealLogSource = 'manual' | 'planner' | 'recipe' | 'barcode' | 'history';
/** Origin of a saved recipe — manual creator vs imported vs forked from public. */
export type RecipeSource = 'manual' | 'imported' | 'forked';

/**
 * Typed dispatchers — `track.eventName(props)` enforces property shape per event.
 * All methods are no-ops when POSTHOG_KEY is not set (zero overhead).
 */
export const track = {
  onboardingStarted(): void {
    analytics.track('onboarding_started');
  },
  onboardingComplete(props: { goal?: string; sex?: string; trains?: boolean }): void {
    analytics.track('onboarding_complete', props);
  },
  mealLogged(props: { source: MealLogSource; mealSlot?: string; calories?: number }): void {
    analytics.track('meal_logged', props);
  },
  recipeCreated(props: { source: RecipeSource; servings: number; hasPhoto: boolean }): void {
    analytics.track('recipe_created', props);
  },
  recipeForked(props: { fromId?: string }): void {
    analytics.track('recipe_forked', props);
  },
  recipeImported(props: { sourceType?: string }): void {
    analytics.track('recipe_imported', props);
  },
  aiCoachUsed(props?: { promptLength?: number }): void {
    analytics.track('ai_coach_used', props);
  },
  barcodeScanned(props: { found: boolean }): void {
    analytics.track('barcode_scanned', props);
  },
  planUpgraded(props: { tier: 'plus' }): void {
    analytics.track('plan_upgraded', props);
  },
  streakMilestone(props: { days: number }): void {
    analytics.track('streak_milestone', props);
  },
  weeklyCheckinDone(): void {
    analytics.track('weekly_checkin_done');
  },
};
