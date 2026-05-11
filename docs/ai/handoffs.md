# RIAL Handoffs

Use this file for compact, task-scoped handoffs between agents.
Do not dump the whole repository here.

## Handoff template
```md
## YYYY-MM-DD - Task title
- Goal:
- Files touched or relevant:
- Decisions already made:
- Checks already run:
- Risks or open questions:
- Recommended next step:
```

## 2026-05-11 — Sprint E in flight (Preferences architecture + Frente 4 hardening)

- **Goal**: Replace binary `UserProfile.mode: 'simple' | 'advanced'` with a
  tier-per-section model + per-widget overrides + provider pattern for health
  sources. Close all 4 sub-points of Frente 4 (hardening invariants) in the
  same sprint to blindar el suelo antes de construir encima.

- **Status**: Phases 0–2 complete and pushed. Phase 3–7 pending.
  - `[1.5.217]` (`6558461`) — Phase 0: Frente 4 hardening completo (4a-d).
  - `[1.5.218]` (`4422e21`) — Phase 1+2: types + visibility logic + state slice
    + migration. Wired into `AppStateContext` as `preferences` +
    `preferencesActions`. **No consumer rewiring yet**.

- **Decisions made** (locked, do not re-litigate):
  - 3 tiers, naming `'simple' | 'standard' | 'advanced'` (continuity with legacy).
  - Migration: `mode='simple'`→all sections `'simple'`; `mode='advanced'`→all
    `'advanced'`; `mode=undef + existing profile`→`'simple'` (legacy default);
    `mode=undef + fresh install`→empty (DEFAULT_TIER `'standard'` applies).
  - Orphans baseline: **empty allowlist** day 1. 7 pre-existing orphans
    eliminated in [1.5.217].
  - `UserProfile.mode` marked `@deprecated`. Kept for 1 release as migration
    source. New code MUST use `useAppState().preferences`.
  - `home.hydration` is the only section with alternate-variant widgets
    (chip vs card) — tier-inclusion invariant test exempts it explicitly.

- **What's done (don't redo)**:
  - `src/types/preferences.ts` — schema (DetailTier, Section, WidgetId,
    HealthSourceId, UserPreferences).
  - `src/lib/widget-visibility.ts` — WIDGET_MATRIX, WIDGET_REQUIREMENTS,
    `getVisibleWidgets()`, `createDefaultPreferences()`. **Pure functions, no
    React dep**.
  - `src/contexts/state/usePreferencesState.ts` — state slice + migration.
  - `STORAGE_KEYS.PREFERENCES`, `SyncKey += 'preferences'`.
  - `src/contexts/AppStateContext.tsx` — wired hook into context value.
  - Convention test `no-orphan-files.test.ts` NEW (empty allowlist).
  - `screen-size.test.ts` scope expanded to `features/`, `components/`,
    `contexts/` + `.ts` (was `.tsx` only).
  - `--strict` flag on `check-i18n-orphans.mjs` + CI gate.
  - `scripts/analyze.mjs` cross-platform wrapper; `release:preflight` produces
    `dist/stats.html`; CI uploads as `bundle-stats` artifact.

- **Checks already run**: tsc 0 errors, 1800/1800 tests, preflight green
  (tsc + lint + i18n symmetry + i18n orphans strict + tests + analyze + size).

- **Recommended next step (continue Sprint E from here)**:

  **Phase 3 — Health provider pattern** (~2h):
  1. `src/lib/health/types.ts` NEW — `HealthProvider` interface, `HealthMetrics`,
     re-export `HealthPermission` from preferences types.
  2. `src/lib/health/providers/manual.ts` NEW — always available, reads from
     localStorage/UserProfile.
  3. `src/lib/health/providers/apple-health.ts` NEW — stub w/ dynamic import of
     `@perfood/capacitor-healthkit` (NOT yet installed; lazy require pattern).
  4. `src/lib/health/providers/google-fit.ts` NEW — stub w/ dynamic import of
     `capacitor-health-connect` (NOT yet installed).
  5. `src/lib/health/registry.ts` NEW — `getActiveProviders(prefs)`,
     `getProviderById(id)`, `getAvailablePermissions(prefs)`.
  6. `src/features/onboarding/hooks/useHealthData.ts` — refactor to consume
     registry instead of hardcoding the apple-health path.
  7. Tests: 1 file per provider + registry test.

  **Phase 4 — Proof wiring (2 consumers only)** (~2h):
  - `src/features/home/screens/Home.tsx` line 104: replace `isSimpleMode` with
     `getVisibleWidgets('home.energy', preferences).includes(...)` pattern.
  - `src/features/home/components/HomeQuickStats.tsx`: replace
     `mode === 'simple'` early return with section tier check.
  - **Leave** NutritionHero, NutritionHeroRing, demo-seed.ts unchanged —
     they migrate in a later sprint via legacy compat layer (`userProfile.mode`
     still works during the deprecation window).
  - Tests: extend HomeQuickStats + Home tests to cover preference-driven render.

  **Phase 5 — Settings UI** (~2h):
  - `SettingsProfile.tsx` lines 145–148: replace 2-button toggle with 3-tier
    selector (simple/standard/advanced) + collapsible per-widget override panel.
  - New component `WidgetVisibilityPanel.tsx` (ADR-001 SectionCard, token-pure).
  - i18n: new `preferences.*` namespace (~15 keys ES+EN simétricos).
  - Tests: 3–5 component tests.

  **Phase 6 — Hardening (3 convention tests)** (~1.5h):
  - `preferences-deprecation.test.ts`: bans new reads of `userProfile?.mode`
    outside an explicit allowlist (current consumers that migrate later).
  - `health-provider-isolation.test.ts`: bans imports of `@perfood/capacitor-
    healthkit`, `capacitor-health-connect`, `@capacitor-community/health-kit`
    outside `src/lib/health/providers/`.
  - `widget-visibility-source.test.ts`: bans string literals `'simple'` /
    `'advanced'` in code NOT involving the migration code path.

  **Phase 7 — Docs + ADR** (~1h):
  - `docs/adr/ADR-017-user-preferences.md` — schema, migration, provider
    pattern, deprecation timeline.
  - Update `docs/ai/state.md` with Sprint E close.
  - `CHANGELOG.md` final `[1.5.220]` entry summarizing all Phases.

- **Risks or open questions**:
  - `apple-health` and `google-fit` plugin packages aren't installed yet.
    Provider stubs must use dynamic `import()` so the bundle doesn't break.
    Add to `.gitignore`? No — plugin install is a future owner action.
  - `useHealthData` is currently consumed only by onboarding `HealthSyncCard`.
    Refactor to registry should not change behavior; double-check
    `?onb-health-mock=on` QA flag still works after refactor.
  - The 7 legacy consumers of `userProfile.mode` keep working until each is
    migrated. Hardening test (Phase 6) needs an allowlist for these so it
    doesn't block CI prematurely. Decision: allowlist gets pruned by 1 entry
    per sprint as each consumer migrates.

- **DO NOT**:
  - Re-touch the Frente 4 convention tests — they're settled.
  - Migrate NutritionHero/NutritionHeroRing/demo-seed in Sprint E (out of scope).
  - Add `posthog-js` or any new dep — analytics infra is already wired stub.
  - Push to `rial-food/main` without owner approval ("continua" suffices when
    after green preflight).

## 2026-04-17 - Multi-media recipes Fase 1 + Fase 2
- Goal: Cerrar el gap display-only → publicable de recetas con galería + video + uploader, sin comprometer la decisión de storage (bucket Supabase diferido a Q6).
- Files touched or relevant (Fase 1 `58aa9c7`): `src/types/recipe.ts`, `src/components/patterns/RecipeCard.tsx`, `src/features/recipes/screens/RecipeDetail.tsx`, `src/features/recipes/components/{HeroGallery,MediaLightbox,VideoSection}.tsx`, `src/features/recipes/utils/videoEmbed.{ts,test.ts}`, `src/features/food/data/seed-recipes.ts`, `src/lib/{platform,seedVersion}.ts`, `src/i18n/locales/{es,en}.ts`, `CHANGELOG.md`.
- Files touched or relevant (Fase 2 `dd22be8`): `src/lib/imageCompress.{ts,test.ts}`, `src/lib/platform.ts` (+ `pickImage`), `src/features/recipes/components/PhotoUploader.tsx`, `src/features/recipes/screens/CreateRecipe.tsx`, `src/features/social/utils/image-utils.ts` (delegación), `src/i18n/locales/{es,en}.ts`, `CHANGELOG.md`.
- Decisions already made:
  - Hero carrusel swipeable + counter + dots (patrón Yummly/NYT), lightbox shadcn Dialog, sin pinch-zoom (V2).
  - Video híbrido: YouTube iframe inline (sandbox), TikTok/IG/Vimeo/otros → card + CTA `openExternalVideo` (Capacitor Browser en native, `window.open` en web). Sin SDK Meta, sin oEmbed TikTok.
  - `photos: string[]` sigue plano (data URLs). No introducimos `MediaAsset` hasta Q6.
  - Uploader multi-foto con compresión 1200px/0.82 JPEG (más conservador que el 800/0.6 del feed). Cap 10 MB pre-compresión.
  - Persistencia local vía `migrateLocalStorageToIDB`; sync push **excluye** `savedRecipes` con data URLs hasta Q6 migre a Storage bucket.
  - `compressImage` canónico en `src/lib/imageCompress.ts`; social/utils delega vía re-export (3 callers legacy siguen compilando).
- Checks already run: `npm run release:preflight` verde — tsc 0, lint 0 errors / 883 warnings, i18n 1499 simétrico, tests 549/549, build + size:check dentro de budget (main 769.8 KB raw / 240.9 KB gzip).
- Risks or open questions:
  - Data URL payload en `savedRecipes` excede row-limit Supabase `user_data` — Q6 debe añadir Storage bucket + SyncKey sanitize.
  - `ImportRecipeURL` no auto-popula `videoUrl` — requiere Edge function `og-fetch` en Q6.
  - Runtime verification en preview NO ejecutada (continuando desde sesión compactada — los cambios fueron hechos en sesión previa y Fase 1 ya verificada visualmente allí).
- Recommended next step: push Fase 2 (`dd22be8`) a `rial-food/main` tras docs commit. Después, retomar el handoff a Q6 Supabase según el plan file `revisa-el-recepi-card-crystalline-moore.md` (addendum Fase 3 + decisión SyncKey).

## Example
## 2026-04-14 - Multi-agent docs rollout
- Goal: Replace single-tool agent docs with a shared `docs/ai/` knowledge base and thin adapters.
- Files touched or relevant: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/ai/*`, `.cursor/rules/*`, `.windsurf/rules/*`, `.claude/skills/*`, `README.md`, `CHANGELOG.md`.
- Decisions already made: `AGENTS.md` is universal; `docs/ai/` is the canonical shared context folder; local IDE memory is not the source of truth.
- Checks already run: structure review pending final validation.
- Risks or open questions: older docs outside `docs/ai/` may still reference legacy structures until they are refreshed.
- Recommended next step: run repo validation and keep future workflow changes synchronized through `docs/ai/`.
