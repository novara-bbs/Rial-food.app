# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-04-25** — `[1.5.87]` Fase C lote 1 — RecipeDetail
typography migration. `RecipeDetail.tsx` (1058 líneas, mayor densidad de
drift en el allowlist) migrado a `<Heading>` + tokens semánticos: 22
sustituciones de className + 4 conversiones a `<Heading>` + 1 excepción
documentada (recipe hero con verified Fraunces + responsive `text-2xl
md:text-3xl`). Removido del `typographyMigrationAllowlist`. Allowlist
actual: 84 archivos (-1).

## Release snapshot
- **Branch**: `main`, awaiting push to `rial-food/main` (local ahead 1 vs `6132d08`).
- **Last shipped**: `[1.5.87]` Fase C lote 1 — RecipeDetail typography.
  **Pantalla**: `src/features/recipes/screens/RecipeDetail.tsx` (la más
  visitada de Cocina). **Cambios**: 4 `<hN>` raw → `<Heading level="h3|h4">`
  (recipe-not-found, community notes, nutrition info, micros, goal optimize)
  + `<Heading level="h4" variant="overline">` para "more from creator". 22
  spans/divs ad-hoc swap `text-{xs,sm,lg,2xl}` → tokens semánticos
  (`text-micro`, `text-body-sm`, `text-body-lg`, `text-title`). **Excepción
  documentada**: recipe hero `<h2>` con verified-mode Fraunces serif inline
  (`style={{ fontFamily: 'var(--font-serif)' }}`) + responsive sizing — no
  expresable vía `<Heading>`; `// eslint-disable-next-line` con comentario.
  **Allowlist**: removido `RecipeDetail.tsx` (84 entradas, -1). 0 errores de
  `no-restricted-syntax` sin downgrade. **Warnings totales**: 1118 (-31 vs
  baseline 1149).
- **Previous**: `[1.5.86]` Filter system normalization (ADR-013). `[1.5.85]`
  brand font normalization (Bricolage Grotesque + `--font-mono` alias).
  `[1.5.84]` Phase 1 Home rework. `[1.5.83]` ADR-012 `<Heading>` + `<Text>`.
  `[1.5.82]` Q6 Supabase sync. `[1.5.81]` Q17 CSP. Q15 ✓, Q17 ✓, Q6 ✓, R1–R8 ✓,
  ADR-012 ✓, Phase 1 Home ✓, ADR-013 ✓.
- **Active plan**: Fase C lote 1 sealed. Next: **Lote 2 — CreateRecipe.tsx**
  (~30 hits, formulario de autoría) → **Lote 3 — pantallas sociales** →
  **Lote 4 — wellness components**. Owner actions Supabase quedan deferred
  hasta que UX/UI esté pulido (mandato del owner).
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-[1.5.87], 2026-04-25)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **1147/1147** passing (69 files) — unchanged vs `[1.5.86]` (refactor
  estructural sin nuevos tests).
- i18n symmetry: **1871** keys aligned ES ↔ EN (unchanged — typography refactor
  no toca strings)
- Design-system lint: **0 errors**, **1118 warnings** (-31 vs `[1.5.86]`
  baseline 1149 — RecipeDetail removido del allowlist resuelve 24 warnings de
  tipografía + destapa 7 warnings vecinos que ya estaban en otros files)
- Build main: bundle delta ≤ +1 KB gzip (2 new primitives, 6 call-sites thinner)
- Security headers: HSTS + X-Frame-Options + nosniff + Permissions-Policy + Referrer-Policy + **CSP** ✓
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
  `'VEGANO'`) fails in EN filters. Requires `FoodTag` enum + 40+ site migration. Defer.
- **vendor-recharts chunk 102 KB gzip** — acceptable but monitor; ≤ 400 KB raw / 115 KB gzip.

## Next sprint candidates (ordered, only pending)
- ~~**R2**~~ ✓ · ~~**R3**~~ ✓ · ~~**R5**~~ ✓ · ~~**R7**~~ ✓ · ~~**R8**~~ ✓ · ~~**Q6**~~ ✓ · ~~**Q15**~~ ✓ · ~~**Q17**~~ ✓ · ~~**ADR-012**~~ ✓ · ~~**Phase 1 Home**~~ ✓ · ~~**ADR-013 Filter system**~~ ✓ · ~~**Fase C lote 1 RecipeDetail**~~ ✓
- **Fase C allowlist shrink** (UX/UI polish — prioridad antes de Supabase):
  - ~~Lote 1 RecipeDetail~~ ✓
  - **Lote 2 — CreateRecipe.tsx** (~30 hits, formulario de autoría)
  - Lote 3 — pantallas sociales (PostDetail, CreatorProfile, CreatePost — ~15 archivos, 4-8 hits cada uno)
  - Lote 4 — componentes de wellness (~15 archivos finales)
- **Owner actions** (non-code, **diferido** hasta que UX/UI esté pulido —
  mandato explícito del owner en `[1.5.87]`): unblock Supabase en producción:
  1. `supabase db push` (applies `001_initial_schema.sql`)
  2. Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to Vercel project env vars
- **Q6-B** — Recipe photo migration to Supabase Storage bucket `recipe-photos` + RLS.
  Unblocks sync for recipes with multi-media photos. Medium complexity, deferred.
- **Phase 2 Home** — chips → bottom sheets (Hydration slider in-place); ADR-009 V3 justification per chip. Deferred.
- **Tag taxonomy codemod (Q16)** — `Recipe.tag: string` ES-literal drift blocks EN filters
  (see Active risks).
- `calculateStreak` in `gamification.ts` still has `@deprecated` tag — remove when convenient.

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
**[1.5.87] Fase C lote 1 — RecipeDetail typography migration** (4 `<hN>` raw → `<Heading>`; 22 spans/divs swap a tokens semánticos; 1 excepción documentada para hero verified Fraunces; allowlist 85→84).

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
  facets → `ChipRow` (single/multi, pill/icon/emoji, default/danger), ordering
  → `SortControl`, search → `SearchInput`, curated collections → `CollectionsCarousel`.
  `FilterRow` is a `@deprecated` shim.
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
