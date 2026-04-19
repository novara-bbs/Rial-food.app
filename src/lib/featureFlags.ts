/**
 * Feature flags — single source of truth for gated UI/behavior.
 *
 * PR 8 (Bevel Home ring-grid): `homeRingGrid` gates the new semi-ring 270°
 * hero + 3-col macros row on Home. Default `false` so existing behavior is
 * preserved unchanged until we opt-in. Rollback path: set back to `false`.
 *
 * Per `docs/market/home-patterns-benchmark.md` §6.1 + §6.3. See also the
 * convention test `src/test/conventions/home-hero.test.ts` which locks
 * both shapes render (flag-off preserves current, flag-on renders the new
 * Option A hybrid).
 *
 * Escape hatch for local preview: `VITE_FEATURE_HOME_RING_GRID=1` in a
 * per-developer `.env.local` flips the flag without touching source. The
 * default export is resolved once at module load — hot-reload is enough to
 * pick up env changes.
 */

const readEnvFlag = (key: string): boolean => {
  try {
    // import.meta.env is set by Vite at build time. In SSR-less runtimes
    // (vitest node) it exists too, so this doesn't need a `typeof` guard.
    const raw = (import.meta as any)?.env?.[key];
    if (raw === true || raw === 'true' || raw === '1') return true;
  } catch {
    /* noop — env not available */
  }
  return false;
};

export interface FeatureFlags {
  /**
   * Bevel Home ring-grid (PR 8). When `true`, `<NutritionHero>` renders
   * the new semi-ring 270° + number hero + 3-col macros row (Option A),
   * and `<ProgressPreviewCard>` is hidden from Home (stays accessible
   * via the Progress tab). When `false`, Home renders exactly as before.
   */
  homeRingGrid: boolean;
}

export const featureFlags: FeatureFlags = Object.freeze({
  homeRingGrid: readEnvFlag('VITE_FEATURE_HOME_RING_GRID'),
});

export default featureFlags;
