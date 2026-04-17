/**
 * Seed hydration versioning.
 *
 * Problem this solves: before this util, `AppStateContext` seeded data only
 * when `localStorage[key]` was absent. That meant users who had visited the
 * app when a seed file was smaller (e.g. savedRecipes v1 had ~5 entries)
 * were stuck with that stale array forever, because the presence check
 * skipped the seed load entirely after subsequent deploys bumped the file.
 *
 * New contract: each seeded `localStorage` key has an associated version
 * stored at `rial_seedVersion_<key>`. On mount, AppStateContext compares
 * the stored version with `SEED_VERSIONS[key]`; if the stored one is
 * lower (including 0 for users upgrading from the pre-version era), the
 * seed is re-applied via the key-specific merge strategy (`replace`,
 * `preserve-user`, or `preserve-if-nonempty` — documented inline at each
 * call site in `AppStateContext`).
 *
 * When you change the semantic contents of a seed file and want existing
 * users to receive it, bump the version for that key below. Never decrease
 * a version — the comparison is strictly `stored < current`.
 */

/**
 * Version registry. Bump a key when its seed file changes meaningfully
 * and existing users must re-hydrate. See comment above for rationale.
 */
export const SEED_VERSIONS = {
  // v1 → ~5 recipes (pre-sprint-q18).
  // v2 → 46 recipes (sprint-q18 seed data overhaul, 2026-04-16).
  // v3 → meal-taxonomy migration: `mealType` → `suitableFor[]` (Q19).
  // v4 → Fase 1 multi-media: `photos[]` + `videoUrl` on demo recipes (2026-04-17).
  savedRecipes: 4,
  mealPlan: 1,
  shoppingList: 1,
  // v1 → 3 posts. v2 → 6 posts with progress types (sprint-q18).
  communityPosts: 2,
  communityStories: 1,
  toleranceLogs: 1,
  weightHistory: 1,
  nutritionHistory: 1,
  realFeelLogs: 1,
  weeklyCheckIns: 1,
} as const;

export type SeedKey = keyof typeof SEED_VERSIONS;

/**
 * All seed keys. Useful for the "Reset demo data" settings flow, where we
 * have to iterate every key to clear both the data and its version marker.
 */
export const ALL_SEED_KEYS: readonly SeedKey[] = Object.keys(SEED_VERSIONS) as SeedKey[];

const VERSION_STORAGE_KEY = (key: SeedKey): string => `rial_seedVersion_${key}`;

export function getStoredSeedVersion(key: SeedKey): number {
  try {
    const raw = window.localStorage.getItem(VERSION_STORAGE_KEY(key));
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function setStoredSeedVersion(key: SeedKey): void {
  try {
    window.localStorage.setItem(VERSION_STORAGE_KEY(key), String(SEED_VERSIONS[key]));
  } catch {
    // noop — quota errors or disabled storage shouldn't break the app
  }
}

/**
 * Returns true when the seed for `key` should be (re-)applied. Two cases:
 *  1. `localStorage[dataKey]` is missing entirely (cold start).
 *  2. The stored seed version is lower than the current one (upgrade).
 *
 * `dataKey` is the localStorage key the seed writes into (e.g.
 * `'savedRecipes'`). It's passed separately because our current naming
 * convention is that the data key is unprefixed and the version marker
 * is prefixed with `rial_seedVersion_`.
 */
export function shouldReseed(key: SeedKey, dataKey: string): boolean {
  try {
    const existing = window.localStorage.getItem(dataKey);
    if (existing === null) return true;
    return getStoredSeedVersion(key) < SEED_VERSIONS[key];
  } catch {
    // If storage is entirely unavailable, safest is to not re-seed —
    // the default React state will hold for the session.
    return false;
  }
}

/**
 * Clears both the data key and the version marker for `key`. Used by the
 * "Reset demo data" escape hatch in Settings and by tests.
 */
export function clearSeed(key: SeedKey, dataKey: string): void {
  try {
    window.localStorage.removeItem(dataKey);
    window.localStorage.removeItem(VERSION_STORAGE_KEY(key));
  } catch {
    // noop
  }
}

/**
 * Export for tests — do NOT use in app code (prefer the typed helpers
 * above). Kept internal-ish to discourage drift.
 */
export const __internal = { VERSION_STORAGE_KEY };
