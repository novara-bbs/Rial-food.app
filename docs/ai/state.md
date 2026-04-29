# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-04-28** — `[1.5.152]` Sprint 38: Button adoption sweep — allowlist 28 → 2.

## Release snapshot
- **Branch**: `main`, ahead of `rial-food/main` by 4 commits (S36-38 + CHANGELOG-S36-37). Previous batch S29-S35 already pushed (CI green).
- **This session (2026-04-28, local commits S29-S38)**:
    - **Sprints 29-33** `[1.5.143-147]` — safe-area foundation, Button adoption baseline, typography sweep, CreateRecipe split, Husky+lint-staged + demo-seed code-split.
    - **Sprint 34** `[1.5.148]` — BarcodeScanner split 823→378 lines (4 sub-components).
    - **Sprint 35** `[1.5.149]` — AddMeal split 714→422 lines (5 sub-components, zero new allowlist debt).
    - **Sprint 36** `[1.5.150]` — Button adoption sweep: 11 raw branded buttons across 9 files migrated (legal, planner, profile, social). Allowlist 39→28.
    - **Sprint 37** `[1.5.151]` — FoodTag enum codemod: replaces ad-hoc ES literals with typed union; **fixes EN filter regression**. 11 enum values + 22 i18n labels + 46 seed recipes + 6 handler sites + 5 filter sites.
    - **Sprint 38** `[1.5.152]` — Button adoption sweep: 26 raw branded buttons across 20 files migrated. **Allowlist 28 → 2** (TodaysMeals permanent + Discover deferred).
- **Active plan**: "Base sólida fase II" complete. Next candidate: typography sweep recipes/+home/ (paused per owner mandate).
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-Sprint 37, 2026-04-28)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **1334/1334** passing (89 files)
- i18n symmetry: **1937** keys aligned ES ↔ EN (+11 recipeTags from S37)
- Design-system lint: **0 errors**, 361 warnings (pre-existing, allowlisted)
- Raw branded `<button>` count: **39 → 28 → 2** (S36+S38; only TodaysMeals permanent + Discover deferred)
- `Recipe.tag` typed: **`string` → `FoodTag`** (S37, fixes EN filter regression)
- **`any` sweep** substantially complete: ~38 residual intentional any in production code — all documented. Categories: browser API workarounds (wakeLock, AudioContext, import.meta), i18n missing-key casts `(t as any)`, legacy archive format, `MealPlan = Record<number, any[]>`, pre-existing contract mismatches (eslint-disabled), migration code, untyped library (html5-qrcode).
- `AppStateContextType` interface: **0 `any` types** (Sprint 4 ✓); `recipeToEdit: Partial<Recipe>|null` (Sprint 26 ✓)
- **Handler + util files**: 78 `any` → 0 (Sprints 5-9); screens/components Sprints 19-28.
- `LoggableMeal`: canonical `src/types/food.ts`. `PostComment.createdAt`: added to type. `FastingEntry`, `ExtractedRecipeData`, `PickedRecipe`: new local interfaces. `DailyLogEntry`: typed in useDailyReset/top-meals. `UserProfile`: imported in weight-handlers (no more `[key:string]:any`). Test fixtures: `as unknown as UserProfile` casts for partial mocks.
- Build main: size:check PASS — main entry 875.4 KB raw / 274.6 KB gzip.
- **AppStateContext**: 1075 → 584 lines (-46%), composer of 8 domain hooks.
- **RecipeDetail**: 1066 → 678 lines (-36%), composer of 7 detail components.
- **CreateRecipe**: 1052 → 460 lines (-56%), 5 step components in `components/create/`.
- **BarcodeScanner**: 823 → 378 lines (-54%), 4 sub-components in `components/barcode/`.
- **AddMeal**: 714 → 422 lines (-41%), 5 sub-components in `components/add-meal/`.
- **i18n locales**: 4506 → 22 domain files via codemod. 1926 keys total.
- **Test coverage** (new artifacts): 8/8 hooks + 7/7 detail components + 3 new convention tests (safe-area, button-adoption, screen-size).
- **Pre-commit hook**: Husky + lint-staged (ESLint on staged TS/TSX, check:i18n on locale changes).
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
- ~~**Tag taxonomy regression**~~ ✓ — Sprint 37 [1.5.151]: `Recipe.tag` migrated
  from `string` to typed `FoodTag` union. EN filters fixed. Display badges now
  resolve via `t.recipeTags[tag]` for both locales. `tags[]` array remains free-form
  for suggestion heuristics (acceptable).
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

**Shipped sprints** (full detail in CHANGELOG.md): Q1-Q14, Q15.5, Q16-B1/B2, Q17, Q6,
ADR-012 typography, ADR-013 filter, ADR-014 filter panel, Phase 1 Home, Fase C (4 lotes),
Scroll UX [1.5.104-107], Satoshi font [1.5.108], Food Families P0-P16,
Sprints 5-28 (type-safety any→0 sweep across all features),
**Sprints 29-33 [1.5.143-147]** — safe-area, Button adoption, typography sweep, CreateRecipe split, Husky+lint-staged.
**Sprint 34 [1.5.148]** — BarcodeScanner split 823→378 lines (4 barcode sub-components).
**Sprint 35 [1.5.149]** — AddMeal split 714→422 lines (5 add-meal sub-components); Button+token clean from day one.
**Sprint 36 [1.5.150]** — Button adoption sweep: 11 raw branded buttons migrated; allowlist 39→28.
**Sprint 37 [1.5.151]** — FoodTag enum codemod: `Recipe.tag: string` → typed `FoodTag` union; fixes EN filter regression.
**Sprint 38 [1.5.152]** — Button adoption sweep: 26 raw branded buttons migrated; allowlist 28→2 (effectively complete).

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
