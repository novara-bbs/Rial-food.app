/**
 * User preferences schema — Sprint E [1.5.218].
 *
 * Replaces the legacy binary `UserProfile.mode: 'simple' | 'advanced'`
 * with a tier-per-section model plus per-widget overrides and a registry
 * of connected health sources. Designed so that:
 *
 *   1. Adding a new tier is ONE entry in `DetailTier`.
 *   2. Adding a new section is ONE entry in `Section` + matrix entry.
 *   3. Adding a new widget is ONE entry in `WidgetId` + matrix entries.
 *   4. Adding a new health source is ONE entry in `HealthSourceId` + a
 *      provider file in `src/lib/health/providers/`.
 *
 * The matrix lives in `src/lib/widget-visibility.ts`. Migration from
 * legacy `mode` lives in `src/contexts/state/usePreferencesState.ts`.
 *
 * @see docs/adr/ADR-017-user-preferences.md
 */

// ─── Tier system ─────────────────────────────────────────────────────────────

/**
 * Detail tier per section. Three levels confirmed with owner:
 *  - 'simple'   — minimal info, fewer widgets. Default for migrated users
 *                 that had `mode: 'simple'` (or no mode set).
 *  - 'standard' — balanced view. NEW default for fresh users post-1.5.218.
 *                 Equivalent to the home dashboard from ~3 weeks ago.
 *  - 'advanced' — maximum detail. Default for migrated users that had
 *                 `mode: 'advanced'`.
 *
 * Values match the legacy `UserProfile.mode` literals so existing data
 * forward-compats directly without translation.
 */
export type DetailTier = 'simple' | 'standard' | 'advanced';

export const DETAIL_TIERS: readonly DetailTier[] = ['simple', 'standard', 'advanced'] as const;

// ─── Section identity ────────────────────────────────────────────────────────

/**
 * App sections that have an independent tier setting. Adding a section
 * here forces a corresponding entry in `WIDGET_MATRIX`.
 *
 * Naming: `<screen>.<area>` where applicable. Keep IDs stable — they
 * persist in localStorage and the Supabase preferences row.
 */
export type Section =
  | 'home.energy'        // EnergyArc, calorie ring, kcal breakdown
  | 'home.macros'        // Macro rings, food-quality card
  | 'home.activity'      // Steps, exercise, sleep, HRV
  | 'home.hydration'     // Hydration card + chip
  | 'home.wellness'      // RealFeel, mood, weekly check-in
  | 'home.meals'         // Today's meals + planned meals
  | 'nutrition.detail'   // 7-tab nutrition deep-dive
  | 'progress.charts';   // Weekly, monthly trends

export const SECTIONS: readonly Section[] = [
  'home.energy',
  'home.macros',
  'home.activity',
  'home.hydration',
  'home.wellness',
  'home.meals',
  'nutrition.detail',
  'progress.charts',
] as const;

// ─── Widget identity ─────────────────────────────────────────────────────────

/**
 * Stable widget IDs. Never rename — they persist in localStorage and
 * Supabase as keys of `UserPreferences.widgetOverrides`.
 *
 * Naming: hyphen-case. Group by visual presence (card, ring, row).
 * Add new widget → also add to `WIDGET_MATRIX` for at least one tier
 * (compile-time check via the matrix type).
 */
export type WidgetId =
  // Energy + macros
  | 'energy-arc'
  | 'energy-breakdown'
  | 'macro-rings'
  | 'food-quality'
  | 'kcal-breakdown'
  // Activity
  | 'steps-card'
  | 'exercise-card'
  | 'sleep-card'           // requires health source: sleep permission
  | 'hrv-card'             // requires health source: hrv permission
  | 'glucose-card'         // future — requires CGM
  // Hydration
  | 'hydration-card'
  | 'hydration-chip'
  | 'electrolytes-summary'
  // Wellness
  | 'realfeel-row'
  | 'weekly-checkin'
  | 'mood-chart'
  // Meals
  | 'todays-meals'
  | 'meal-gap-suggestion'
  // Nutrition detail tabs
  | 'tab-summary'
  | 'tab-macros'
  | 'tab-quality'
  | 'tab-vitamins'
  | 'tab-minerals'
  | 'tab-hydration'
  | 'tab-performance'
  // Progress charts
  | 'weight-chart'
  | 'mood-chart-detailed'
  | 'energy-chart'
  | 'sleep-chart';

// ─── Health sources ──────────────────────────────────────────────────────────

/**
 * Connected health data sources. `manual` is always available (the user
 * can enter values by hand). Others require platform + plugin support
 * (Capacitor on native, OAuth on web for cloud providers).
 *
 * Add a new source → also add a `HealthProvider` impl in
 * `src/lib/health/providers/<id>.ts` and register it in
 * `src/lib/health/registry.ts`.
 */
export type HealthSourceId =
  | 'manual'
  | 'apple-health'
  | 'google-fit'
  | 'whoop'
  | 'oura'
  | 'fitbit';

/**
 * Permissions granted by a health source. A widget that requires
 * `'sleep'` will only render if at least one connected source has it.
 */
export type HealthPermission =
  | 'steps'
  | 'distance'
  | 'workouts'
  | 'sleep'
  | 'hrv'
  | 'resting-hr'
  | 'weight'
  | 'height'
  | 'glucose';

export interface HealthSourceConnection {
  id: HealthSourceId;
  enabled: boolean;
  permissions: HealthPermission[];
  connectedAt: string;     // ISO 8601
}

// ─── Per-widget override ─────────────────────────────────────────────────────

/**
 * Override the tier-based default visibility for a single widget.
 * - `visible: false` → hide even if the tier would include it.
 * - `visible: true`  → show even if the tier would exclude it (subject
 *                       to health-source requirements).
 *
 * Absence in the record means "use tier default".
 */
export interface WidgetOverride {
  visible: boolean;
}

// ─── Top-level preferences ───────────────────────────────────────────────────

/**
 * The full user preferences schema. Persisted to `localStorage` under
 * `STORAGE_KEYS.PREFERENCES` and synced to Supabase via the `'preferences'`
 * SyncKey when cloud sync is active.
 *
 * Versioning: bump `version` whenever the schema shape changes. The
 * migration in `usePreferencesState.ts` reads the version field and
 * applies upgrades idempotently.
 */
export interface UserPreferences {
  /** Schema version. Bump when shape changes. */
  version: 1;

  /**
   * Per-section detail tier. Sections not listed fall back to
   * `DEFAULT_TIER` (see `widget-visibility.ts`).
   */
  sectionTiers: Partial<Record<Section, DetailTier>>;

  /**
   * Per-widget overrides. Absence = tier-based default.
   */
  widgetOverrides: Partial<Record<WidgetId, WidgetOverride>>;

  /**
   * Connected health sources + their granted permissions. `manual` is
   * always present and always enabled (the user can always type values).
   */
  healthSources: HealthSourceConnection[];

  /**
   * Stamped once after a successful migration from the legacy
   * `UserProfile.mode` field. Prevents re-running migrations.
   */
  migratedFromLegacyMode: boolean;
}
