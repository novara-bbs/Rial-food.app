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
  /**
   * R2 plan v2 — verified recipes editorial polish. When `true`, recipes
   * with `verified: 'rial' | 'creator'` render the editorial branch in
   * `RecipeDetail` (hero bleed, Fraunces serif title, `AuthorAttributionCard`,
   * `TimeTileComposite` arcs, `StickyCookCTA`). When `false`, every recipe
   * renders with the classic layout regardless of its `verified` field.
   *
   * Escape hatch: `VITE_FEATURE_VERIFIED_RECIPE_POLISH=1` in `.env.local`.
   * The `Recipe.cookedAt[]` + "Mark as Cooked" badge ship universally —
   * they do NOT depend on this flag (data is always collected so R3 filter
   * chips work even before the consumer branches land).
   */
  verifiedRecipePolish: boolean;
  /**
   * R5 — Voice read-aloud step text in CookMode. When `true` and the browser
   * supports `speechSynthesis`, a Volume2 button appears in the CookMode header.
   * Tap reads the current step text aloud; tap again cancels. Default `true`
   * (opt-out via `VITE_FEATURE_COOK_MODE_VOICE=0`). The flag check is combined
   * with a runtime `'speechSynthesis' in window` guard so it degrades silently
   * on platforms that lack the API.
   */
  cookModeVoiceReadAloud: boolean;
}

export const featureFlags: FeatureFlags = Object.freeze({
  homeRingGrid: readEnvFlag('VITE_FEATURE_HOME_RING_GRID'),
  verifiedRecipePolish: readEnvFlag('VITE_FEATURE_VERIFIED_RECIPE_POLISH'),
  // Default true — opt-out via VITE_FEATURE_COOK_MODE_VOICE=0
  cookModeVoiceReadAloud: !readEnvFlag('VITE_FEATURE_COOK_MODE_VOICE_OFF'),
});

export default featureFlags;
