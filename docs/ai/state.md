# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-04-27** — `[1.5.137]` Sprint 3 PR C COMPLETE: CreateRecipe 1053→316 lines, 4 section components extracted.

## Release snapshot
- **Branch**: feature branches open (PRs #23-25). `main` synced with `rial-food/main` at `d871d95`.
- **Open PRs (2026-04-27)**:
    - **PR #22** — Sprint 2: BarcodeScanner → `food/barcode/` sub-feature `[1.5.134]`
    - **PR #23** — Sprint 3 PR A: `RecipeFormSchema` + `recipeToFormValues` `[1.5.135]`
    - **PR #24** — Sprint 3 PR B: `Recipe.difficulty` EN enum migration `[1.5.136]`
    - **PR #25** — Sprint 3 PR C: CreateRecipe wizard split, 1053→316 lines `[1.5.137]`
- **Last merged (5 PRs, 2026-04-26)**:
    - PR #10–14: Structural cleanup (i18n split, AppStateContext 1075→584,
      RecipeDetail 1066→678), Sprint 1 hook+component tests, TESTING-PATTERNS.md.
- **Previous**: `[1.5.109]` chip/badge · `[1.5.108]` Satoshi font.
- **Active plan**: Sprint 3 PRs D+E pending (React Hook Form wiring, validation cleanup).
  Next after merge: Phase 2 Home chips, Q6-B recipe photos, owner-actions Supabase.
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-Sprint 3 PR C, 2026-04-27)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **1349/1349** passing (87 files; +33 tests Sprint 3 PR A schema tests)
- i18n symmetry: **1917** keys aligned ES ↔ EN
- Design-system lint: **0 errors**, ~876 warnings (0 react-hooks errors)
- Build main: size:check PASS — all budgets within limits.
- **AppStateContext**: 1075 → 584 lines (-46%), composer of 8 domain hooks.
- **RecipeDetail**: 1066 → 678 lines (-36%), composer of 7 detail components.
- **CreateRecipe**: 1053 → 316 lines (-70%), composer of 4 wizard-step components.
- **i18n locales**: 4506 → 22 domain files via codemod.
- **Test coverage** (new artifacts): 8/8 hooks + 7/7 detail components + 33 schema tests.
- **CI status**: ✅ verde.
- `calculateStreak` @deprecated: ✓ eliminado ([1.5.101]). FilterRow shim: ✓ deleted ([1.5.101]).
- Security headers: HSTS + X-Frame-Options + nosniff + Permissions-Policy + Referrer-Policy + **CSP** ✓
- Font: `--font-body` = **Satoshi** self-hosted (`public/fonts/satoshi/`). Inter eliminado
  (era bloqueado por CSP `font-src 'self'` en producción). Bricolage + Fraunces + JetBrains Mono → GFonts.
- Scroll UX: forward reset to top ✓ · goBack restores position ✓ ([1.5.104–107]).
- `.badge-card` utility en `@layer components` — fuente de verdad para badges de imagen.
- Drift: `text-[Npx]` = **0**, SectionCard shape = **0**, ad-hoc `<hN>` typography
  outside allowlist = **0**, **inline chip reimplementation** = **0**, **inline
  branded `<select>`** = **0** (ADR-013 guardrails)

## Current runtime AI posture
- Local dev: `VITE_GEMINI_API_KEY` (personal) still works.
- Production: routes through `supabase/functions/gemini-proxy`.
- `vercel.json` does NOT inject Gemini secrets.

## Active risks
- **⚠️ Owner action required — Supabase DB migration not applied** — `supabase/migrations/
  001_initial_schema.sql` creates `profiles` + `user_data` + RLS. Apply via
  `supabase db push` or Supabase SQL Editor. Without this, sync push silently no-ops.
- **⚠️ Owner action required — Vercel env vars missing** — `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY` not set in Vercel project. Without these, `isSupabaseEnabled =
  false` and the Mi Cuenta section is hidden. App still works offline-first.
- **Data URL payload in `savedRecipes`** — Fase 2 multi-media stores photos as base64 data
  URLs. ~1.2 MB per recipe with 6 photos exceeds Supabase `user_data` row-limit (~1 MB).
  Mitigation ACTIVE: push skips `savedRecipes` when any photo is a data URL (Q6 guard).
  Q6-B: migrate to Supabase Storage bucket `recipe-photos` with RLS (separate sprint).
- **`ImportRecipeURL` doesn't auto-populate `videoUrl`** — TikTok/Instagram/YouTube links
  lose the source reference. Needs `og-fetch` Edge function parsing `og:video`/`twitter:player`.
- ~~**SyncKey wiring missing**~~ ✓ — Q6 wired 13 core SyncKeys in AppStateContext.
- ~~**`useSupabasePersistence` flag not wired**~~ ✓ — Q6 wired via `useAuth()` edge trigger.
- ~~**CSP header**~~ ✓ — shipped Q17 `[1.5.81]`. All 6 security headers active in `vercel.json`.
- **Tag taxonomy regression** — `Recipe.tag: string` ad-hoc ES-literal (`'MI RECETA'`,
  `'VEGANO'`) fails in EN filters. `cuisine`/`dietaryTags` are now typed (Q16 ✓);
  remaining drift is `tag`/`tags` free-form strings. Requires `FoodTag` enum + 40+ site
  migration for full resolution. Defer.
- **vendor-recharts chunk 102 KB gzip** — acceptable but monitor; ≤ 400 KB raw / 115 KB gzip.

## Next sprint candidates (ordered, only pending)
- ~~**R2**~~ ✓ · ~~**R3**~~ ✓ · ~~**R5**~~ ✓ · ~~**R7**~~ ✓ · ~~**R8**~~ ✓ · ~~**Q6**~~ ✓ · ~~**Q15**~~ ✓ · ~~**Q17**~~ ✓ · ~~**ADR-012**~~ ✓ · ~~**Phase 1 Home**~~ ✓ · ~~**ADR-013**~~ ✓ · ~~**Fase C lote 1**~~ ✓ · ~~**Fase C lote 2**~~ ✓ · ~~**Polish DRY**~~ ✓ · ~~**Fase C lote 3**~~ ✓ · ~~**Fase C lote 3.5 sociales**~~ ✓ · ~~**Fase C lote 4 wellness**~~ ✓
- ~~**Fase C allowlist shrink completa**~~ ✓ — todos los dominios migrados.
  Restante en allowlist: dominio recipes + home + other (~32 archivos, fuera de
  Fase C scope original). **Pausa antes de continuar** (owner mandate).
- **Owner actions** (non-code, **diferido** hasta que UX/UI esté pulido —
  mandato explícito del owner en `[1.5.87]`): unblock Supabase en producción:
  1. `supabase db push` (applies `001_initial_schema.sql`)
  2. Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to Vercel project env vars
- **Q6-B** — Recipe photo migration to Supabase Storage bucket `recipe-photos` + RLS.
  Unblocks sync for recipes with multi-media photos. Medium complexity, deferred.
- **Phase 2 Home** — chips → bottom sheets (Hydration slider in-place); ADR-009 V3 justification per chip. Deferred.
- ~~**Tag taxonomy codemod (Q16)**~~ ✓ — `cuisine?` + `dietaryTags?` añadidos a `Recipe`;
  46 seed recipes anotadas; heurística como fallback para recetas de usuario. Sprint [1.5.94].
  Remaining: `Recipe.tag: string` free-form ES literals (FoodTag enum — defer).
- ~~`calculateStreak` @deprecated~~ ✓ — `getLoggingStreak` removed [1.5.101].

**Shipped sprints** (full detail in CHANGELOG.md): Q1-Q14, Q15.5 (design-system),
Q16-B1, Q16-B2, Tab audit 2026-04-18, S3 tranche, Bevel PR 1-9, Q19 meal-taxonomy,
Fase 1+2 multi-media recipes, Food Families P0-P16, R1 docs, R2 recipes editorial,
**R3 Cocina collections**, **R5 CookMode deeper**, **R8 INDYA adoption**, **R7 CreateRecipe authoring**,
**Q15 ICP-adaptive NutritionHero + calcStreaks sweep**, **Q17 CSP header + contrast audit**,
**Q6 Supabase offline-first sync wiring** (pull-on-sign-in + push-on-change + Mi Cuenta),
**ADR-012 typography primitives (`<Heading>`, `<Text>`) closing call-site layer**,
**Phase 1 Home rework (chip-row + reorder + simple/advanced density)**,
**[1.5.85] brand font normalization** (Bricolage Grotesque headline + `--font-mono` alias → JetBrains Mono; CMS-style proof),
**[1.5.86] filter system normalization per ADR-013** (`ChipRow` + `SortControl` primitives; Cocina dedup; Community pill→TabNav; FoodDictionary inline chips → ChipRow; convention test invariants A + B),
**[1.5.87] Fase C lote 1 — RecipeDetail typography migration** (4 `<hN>` raw → `<Heading>`; 22 spans/divs swap a tokens semánticos; 1 excepción documentada para hero verified Fraunces; allowlist 85→84),
**[1.5.88] Fase C lote 2 — CreateRecipe typography + 2 nuevos primitives reutilizables** (`<MacroTile>` + `<DashedAddButton>` extraídos a `src/components/patterns/`; 18 hits resueltos vía primitives + `<Heading>` overline + token swaps; allowlist -1),
**[1.5.89] Polish DRY pass** — adopción de `MacroTile` en `RecipeNutritionBar` + `PortionSelector` y `DashedAddButton` en `Planner`; CreateStory/PhotoUploader/BarcodeScanner descartados por patrones distintos; -3 warnings sin allowlist removals.
**[1.5.90] Fase C lote 3 — PostDetail/CreatePost/CreatorProfile** (15 hits, -16 warnings, 3 allowlist removals).
**[1.5.91] Fase C lote 3.5 — dominio social completo** (14 archivos, ~55 hits, -74 warnings, 0 archivos sociales restantes en allowlist).
**[1.5.92] Fase C lote 4 — dominio wellness completo + Fase C completada** (16 archivos, ~60 hits, -83 warnings; excepción font-mono documentada en FastingTimer).
**[1.5.93] Filter UX rework (ADR-014)** — `FilterSheet` + `FilterButton` primitives + `facets.ts` heurística; Cocina mueve Source axis al sheet; Discovery esconde toda facetería + branch grid-vs-swimlanes; +40 i18n keys; ADR-014 + invariantes E + F.
**[1.5.104–107] Scroll UX** — Fase 1: reset to top on every nav. Fase 2: goBack restores saved scrollY (captured synchronously in `navigateTo` via `scrollCaptureRef`; `useLayoutEffect` in App.tsx applies before paint). `navigateToRecipe` passes `{ recipeId }` so same-screen recipe drill-down pushes history correctly.
**[1.5.108] Satoshi body font** — Inter (Google Fonts, CSP-blocked in prod) replaced by Satoshi variable self-hosted in `public/fonts/satoshi/`. `font-src 'self'` CSP satisfied. Whoop competitor screenshots added to `docs/market/`.
**[1.5.109] Chip/badge refinement** — `.badge-card` + `.label-caps` in `@layer components` (reusable). RecipeCard badges: `font-black` → `font-semibold`, `tracking-widest` → `tracking-wide`. ChipRow + ActiveFilterStrip: `px-4 py-2` → `px-3 py-1.5` (3:1 → 2:1 height/font ratio). `badge.tsx`: explicit `font-headline`.

## Repository compliance
- `LICENSE`: Proprietary © 2026 RIAL FOOD WORLD S.L. Contact legal@rialfoodworld.com.
- `SECURITY.md`: security@rialfoodworld.com, SLA 72h ack / 7d triage / 30d fix critical.
- `CODE_OF_CONDUCT.md`: Contributor Covenant 2.1, conduct@rialfoodworld.com.
- `.github/`: PR template, 3 issue templates, CODEOWNERS `@novara-bbs`, Dependabot weekly.

## Active repository conventions (quick reference)
- Feature-based: `src/features/<domain>/{screens,components,handlers,utils,data}/`
- No barrel files except `src/types/index.ts`
- State: `localStorage` via `useLocalStorageState` in `AppStateContext`
- New handlers: factory in `features/*/handlers/`, wired in `AppStateContext`
- User-visible strings: `t.section.key` via `useI18n()` — ES + EN symmetric
- Seed hydration: `src/lib/seedVersion.ts` (`SEED_VERSIONS`, `shouldReseed`,
  `setStoredSeedVersion`). Bump version only to push new seed content to existing users.
- Typography: `<Heading level="h1..h4" variant="default|editorial|overline">` + `<Text variant>`
  primitives (ADR-012). Raw `<h1..h4>` banned in features outside allowlist.
- Filter layer: one axis = one primitive (ADR-013). Source nav → `TabNav`,
  facets → `ChipRow` (single/multi, pill/emoji[/~~icon~~ deprecated since
  [1.5.97]], default/danger; default layout single-row carousel, `wrap` opt-in),
  ordering → `SortControl`, search → `SearchInput`, curated collections →
  `CollectionsCarousel` (`ChipRow emoji` single-row carousel since [1.5.98]).
  Chip font: Bricolage Grotesque `font-semibold normal-case` ([1.5.98]).
  `FilterRow` is a `@deprecated` shim.
- Advanced filter panel (ADR-014). 3+ facetas grouped → `FilterSheet` behind
  `FilterButton`. BottomSheet `size="focus"` + accordion sections + buffered draft +
  Apply/Reset. Applied-filter feedback → `ActiveFilterStrip` (canonical primitive
  since [1.5.97], invariante G CI-enforced — toda screen con `FilterSheet`
  importa también el strip). Heurística `src/features/recipes/utils/facets.ts`
  deriva cuisine/diet/time/difficulty (Q16 ✓ tipado, heurística como fallback).
  Asimetría Cocina (chips visibles + sheet + strip) vs Discovery (todo en
  sheet + strip + branch grid-vs-swimlanes).
- Market research docs: `docs/market/` (not auto-loaded — read on demand)

## When to update this file
- Release line or deployment target changes
- New active risk appears or is resolved
- Next sprint candidate list changes
- Quality baseline numbers change after a shipped sprint

**Not** for:
- Per-sprint narrative (goes to CHANGELOG)
- Per-file writeups (goes to CHANGELOG)
- Commit-by-commit history (git log handles that)
