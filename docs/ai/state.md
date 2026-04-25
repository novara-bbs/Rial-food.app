# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-04-25** — `[1.5.92]` **Fase C completada** — dominio
wellness completo. 16 archivos removidos del allowlist (~60 hits). El
dominio `src/features/wellness/` queda 100% migrado. -83 warnings vs
`[1.5.91]` baseline. Excepción documentada: `font-mono` en FastingTimer
para timer displays (WHOOP/Oura pattern — ritmo monoespaciado estable).

Previo: `[1.5.91]` Lote 3.5 sociales (14 archivos, -74 warnings) ·
`[1.5.90]` Lote 3 sociales (PostDetail + CreatePost + CreatorProfile) ·
`[1.5.89]` Polish DRY · `[1.5.88]` CreateRecipe + MacroTile + DashedAddButton.

## Release snapshot
- **Branch**: `main`, awaiting push to `rial-food/main` (local ahead 4 vs `6132d08`).
- **Last shipped**: `[1.5.92]` **Fase C completada** — dominio wellness.
  **16 archivos**, ~60 hits. `src/features/wellness/` 100% migrado.
  **Warnings totales**: 924 (-83 vs `[1.5.91]` ~1007).
- **Previous**: `[1.5.91]` Lote 3.5 sociales (14 archivos, -74 warnings).
  `[1.5.90]` Lote 3 sociales (-16 warnings). `[1.5.89]` Polish DRY.
  `[1.5.88]` Fase C lote 2 (MacroTile + DashedAddButton). `[1.5.87]` Fase C
  lote 1 RecipeDetail. `[1.5.86]` ADR-013. `[1.5.85]` brand fonts.
  `[1.5.84]` Phase 1 Home. `[1.5.83]` ADR-012. `[1.5.82]` Q6. `[1.5.81]` CSP.
- **Active plan**: **Fase C completada** (ADR-012 migration). Pausa para
  pensar (mandato del owner). Owner actions Supabase quedan deferred.
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-[1.5.92], 2026-04-25)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **1147/1147** passing (69 files) — unchanged.
- i18n symmetry: **1871** keys aligned ES ↔ EN (unchanged).
- Design-system lint: **0 errors**, **924 warnings** (-83 vs `[1.5.91]` ~1007
  — 16 wellness archivos removidos del allowlist; ~60 hits resueltos).
- Build main: neutral (token swaps, Heading imports, no nuevos primitives).
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
**[1.5.87] Fase C lote 1 — RecipeDetail typography migration** (4 `<hN>` raw → `<Heading>`; 22 spans/divs swap a tokens semánticos; 1 excepción documentada para hero verified Fraunces; allowlist 85→84),
**[1.5.88] Fase C lote 2 — CreateRecipe typography + 2 nuevos primitives reutilizables** (`<MacroTile>` + `<DashedAddButton>` extraídos a `src/components/patterns/`; 18 hits resueltos vía primitives + `<Heading>` overline + token swaps; allowlist -1),
**[1.5.89] Polish DRY pass** — adopción de `MacroTile` en `RecipeNutritionBar` + `PortionSelector` y `DashedAddButton` en `Planner`; CreateStory/PhotoUploader/BarcodeScanner descartados por patrones distintos; -3 warnings sin allowlist removals.
**[1.5.90] Fase C lote 3 — PostDetail/CreatePost/CreatorProfile** (15 hits, -16 warnings, 3 allowlist removals).
**[1.5.91] Fase C lote 3.5 — dominio social completo** (14 archivos, ~55 hits, -74 warnings, 0 archivos sociales restantes en allowlist).
**[1.5.92] Fase C lote 4 — dominio wellness completo + Fase C completada** (16 archivos, ~60 hits, -83 warnings; excepción font-mono documentada en FastingTimer).

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
