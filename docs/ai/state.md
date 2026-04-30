# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-04-30** — `[1.5.164]` Sprint 50: MealGapSuggestion ahora recomienda recetas + ingredientes.

## Release snapshot
- **Branch**: `main`, synced con `rial-food/main` (CI green S39; S40–S50 queued).
- **This session (2026-04-30, S49–S50 — home polish)**:
    - **Sprint 50** `[1.5.164]` — `MealGapSuggestion` extendido: ahora rankea **recetas del vault** (con `rankRecipesForGap` en `src/features/home/utils/suggest-recipes.ts`) priorizando planeadas hoy (`+25 %`), no comidas (`+15 %`) y penalizando repeticiones (`× 0.7`); allergen filter heurístico ES/EN sobre ingredientes + tags; slot filter respetando `recipe.suitableFor`. Render: carrusel `RecipeCard variant="compact"` (recetas) → lista de ingredientes (fallback). Tap en receta → `onNavigateToRecipe` (no auto-log). Migración deuda: raw `<button>` ingredientes → `<Button variant="ghost">`. 4 i18n keys nuevas (recipesTitle, foodsTitle, reason.planned-today, reason.not-eaten). Tests 1353 → 1368 (+15).
    - **Sprint 49** `[1.5.163]` — Fix bug navegación en `TodaysMeals` (sección «Planificado hoy»): la prop `onNavigateToRecipe` estaba tipada pero no destructurada. Bloque imagen+badge+título+kcal envuelto en `<button type="button">` transparente (respeta ADR-001/SectionCard) con `aria-label={t.postCard.viewRecipe + ': ' + meal.title}` y focus-visible ring. Botón «Log it» queda hermano fuera. Tests 1350 → 1353 (+3).
- **Previous session (2026-04-30, S46–S48 — recipes polish)**:
    - **Sprint 48** `[1.5.162]` — Macros del panel: `surface="card"` → nueva `surface="bare"` (sin fondo/borde individual). Grid `gap-2` → `divide-x divide-outline-variant/10`. Paleta 4 colores → 2: KCAL `text-primary`, PRO/CARBS/FATS unificados `text-tertiary`. Patrón editorial NYT/Whoop dentro del SectionCard.
    - **Sprint 47** `[1.5.161]` — `RecipeNutritionPanel`: macros + food-quality banner + servings stepper unificados en un único `<SectionCard padding="none" spacing="none">` con divisores hairline. Servings step `1` → `0.5` (1, 1.5, 2, 2.5, …) vía helpers puros en `src/features/recipes/utils/servings.ts` (`SERVINGS_STEP/MIN/MAX`, `clampServings`, `incrementServings`, `decrementServings`, `formatServings`). Eliminados `RecipeNutritionBar.tsx`, `RecipeServingsControls.tsx` y su test (reemplazados). Quality usa macros base (independiente de portion). Tests 1335 → 1350 (+15).
    - **Sprint 46** `[1.5.160]` — RecipeDetail hero NYT-style: gradient `bg-gradient-to-t` eliminado (imagen 100% limpia), `HeroGallery` generaliza `photos` → `items: HeroMediaItem[]` (foto | video), peek mode `basis-[88%]` con padding 16px + gap 12px cuando n ≥ 2, `IntersectionObserver` para active-index, video unificado en el carrusel (YouTube inline iframe, resto `openExternalVideo()`). Título y time row movidos debajo del media. `<VideoSection>` standalone removido de `RecipeDetail.tsx` (sigue usado en CreateRecipe steps). Tests 1332 → 1335.
- **Previous session (2026-04-30, S45)**:
    - **Sprint 45** `[1.5.159]` — RecipeCard sin contenedor: drop `bg-surface rounded-sm overflow-hidden` del wrapper, `rounded-sm` se mueve a `IMAGE_ZONE`, `INFO_BLOCK` `p-3/p-4` → `pt-2/pt-3` sin padding lateral. Title `uppercase` → mixed-case Bricolage. Author/forkedFrom labels mixed-case. Badges overlay y action buttons intactos. 1 primitivo → 5 surfaces (Cocina, Discovery hero+swimlanes, RecipeDetail related, CreatorProfile).
- **Previous session (2026-04-29, S40–S44)**:
    - **Sprint 44** `[1.5.158]` — DX quick wins: brand constants (`src/config/brand.ts`), palette preview dedup (`src/config/theme-previews.ts`), `.rial-input` utility class, `STORAGE_KEYS` registry (`src/lib/storage-keys.ts`).
    - **Sprint 43** `[1.5.157]` — radius base `0.25rem` → `0.375rem` (+1 step, todos los componentes).
    - **Sprint 42** `[1.5.156]` — light bg `#eae7e0` → `#eeecea` (L93%, menos beige); dark contrast expandido (cards `#1e2129` vs bg `#0e1014`, gap ampliado).
    - **Sprint 41** `[1.5.155]` — BG gradient sutil: `body { background-image: linear-gradient(--surface-container-low → --background) }`. Funciona en 8 temas sin código por-tema. DX: test slim a 3 locks (brand+a11y); DESIGN-SYSTEM.md §2 hex table → pointer a index.css.
    - **Sprint 40** `[1.5.154]` — paleta neutral repintada: light Bevel-style (`#eae7e0` bg + `#ffffff` surface), dark Whoop-style (`#0e1014` cool, ladder comprimida). AAA. meta theme-color split.
- **Sprint 39 (previo, 2026-04-29)**: `[1.5.153]` lint hygiene: 2 stale `eslint-disable-next-line` removidos + Discover hashtag `<button>` → `<Button variant="ghost">`. Allowlist 2 → 1.
- **Active plan**: "Base sólida fase II" complete. Next candidate: typography sweep recipes/+home/ (paused per owner mandate).
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-Sprint 50, 2026-04-30)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **1368/1368** passing (93 files) — +18 from S49 (3 TodaysMeals click) + S50 (10 suggest-recipes + 5 MealGapSuggestion)
- i18n symmetry: **1941** keys aligned ES ↔ EN (+4 from S50: mealGap.recipesTitle/foodsTitle/reason.planned-today/reason.not-eaten)
- Design-system lint: **0 errors**, 349 warnings (pre-existing, allowlisted)
- Raw branded `<button>` count: **39 → 28 → 2 → 1** (S36+S38+S39; only TodaysMeals permanent — Discover migrated)
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
**Sprint 39 [1.5.153]** — Lint hygiene: 2 stale eslint-disable removed; Discover hashtag `<button>` → `<Button variant="ghost">`; allowlist 2→1 (TodaysMeals only).
**Sprint 40 [1.5.154]** — Paleta neutral refresh: light invertido a Bevel-style (warm gray bg `#eae7e0` + white cards, sunken `#f7f4ed`); dark a Whoop-style cool desaturado (`#0e1014`, NOT full black; cards `#1a1c20` / `#16181c`; ladder comprimida). AAA preservado.
**Sprint 41 [1.5.155]** — BG gradient sutil (Bevel×Whoop half-intensity, 1 CSS rule, 8 temas automático). DX: test slim 8→3 locks; DESIGN-SYSTEM.md §2 hex table eliminada; tests: 1334→1332 (−2 net).
**Sprint 42 [1.5.156]** — Neutral light tone refinement: `#eae7e0` → `#eeecea` (L+2.7%, menos beige). Dark contrast expandido: cards `#16181c` → `#1e2129`, surface `#1a1c20` → `#22252d`.
**Sprint 43 [1.5.157]** — Radius base `0.25rem` → `0.375rem`: sm 4→6px, lg 8→12px, xl 12→18px, 2xl 16→24px. Todos los componentes más redondeados en 1 step.
**Sprint 44 [1.5.158]** — DX quick wins (rebrand safety): `src/config/brand.ts` (APP_NAME, emails), `src/config/theme-previews.ts` (palette swatch colors dedup), `.rial-input` `@layer components` class (10 inputs migrated), `src/lib/storage-keys.ts` (38 keys, STORAGE_KEYS const).
**Sprint 45 [1.5.159]** — RecipeCard composición NYT-style: drop wrapper bg/radius/overflow, `rounded-sm` se mueve a `IMAGE_ZONE`, `INFO_BLOCK` `p-3/p-4/p-2.5` → `pt-2/pt-3/pt-2` (sin padding lateral, texto alineado al borde imagen). Title `uppercase` → mixed-case (Bricolage Grotesque). Author/forkedFrom labels mixed-case. Badges overlay (Time/Tag/Match) y action buttons (Share/Save/Delete) intactos. Alturas fijas preservadas. 1 primitivo → 5 surfaces.
**Sprint 46 [1.5.160]** — RecipeDetail hero NYT-style: gradient `bg-gradient-to-t` eliminado en `RecipeHero.tsx` (imagen 100% limpia). `HeroGallery` props `photos: string[]` → `items: HeroMediaItem[]` (foto | video). Multi-item: peek mode `basis-[88%]` + `pl-4 pr-4 gap-3 hide-scrollbar`, `IntersectionObserver` para active-index (robusto en peek). Single-item: 100% sin chrome. Video unificado en el carrusel: YouTube reproduce iframe inline, TikTok/IG/Vimeo → `openExternalVideo()`. Título y time row movidos debajo del media (`px-6 pt-3`). `<VideoSection>` standalone removido de `RecipeDetail.tsx` (sigue usado en CreateRecipe). Tests 1332 → 1335.
**Sprint 47 [1.5.161]** — `RecipeNutritionPanel` unifica macros + food-quality banner + servings stepper en un `<SectionCard>`. Servings step 1 → 0.5 vía helpers puros `src/features/recipes/utils/servings.ts` (clampServings/increment/decrement/format). Eliminados `RecipeNutritionBar.tsx` y `RecipeServingsControls.tsx` + test (reemplazados). Source link movido fuera del bloque nutricional. ADR-001 OK. Tests 1335 → 1350.
**Sprint 48 [1.5.162]** — Panel macros: nueva `MacroTile surface="bare"` (sin fondo/borde individual). Grid `gap-2` → `divide-x divide-outline-variant/10`. Paleta reducida a 2 colores: KCAL `text-primary`, PRO/CARBS/FATS unificados `text-tertiary`. Editorial NYT/Whoop pattern.
**Sprint 49 [1.5.163]** — Fix click navegación en `TodaysMeals` (sección «Planificado hoy»). Prop `onNavigateToRecipe` estaba muerta — destructuring lo descartaba y card no tenía wrapper clickable. Bloque imagen+título envuelto en `<button>` transparente (sin fondo, hereda SectionCard). A11y `aria-label={t.postCard.viewRecipe + ': ' + meal.title}` + focus-visible. Botón «Log it» como hermano fuera. 3 tests nuevos en `TodaysMeals.test.tsx`.
**Sprint 50 [1.5.164]** — `MealGapSuggestion` recomienda **recetas + ingredientes**. Nuevo util `src/features/home/utils/suggest-recipes.ts` con `rankRecipesForGap`: filtros allergen heurísticos ES/EN sobre `ingredients[]`+`tags`, slot filter `suitableFor ∩ guessMealSlotForTime()`, score por macro/portion × bonus planned-today (+25%) × bonus not-eaten (+15%) × penalización ya-comida (×0.7) + tier bonus + anti-mono-macro para `cal`. Component render: carrusel `RecipeCard variant="compact"` (max 3) → lista ingredientes (max 3, fallback). Tap receta → `onNavigateToRecipe` (no auto-log). Raw `<button>` ingredientes → `<Button variant="ghost">` (cierre deuda allowlist). 4 i18n keys (recipesTitle, foodsTitle, planned-today, not-eaten) ES/EN simétricos. 15 tests nuevos (10 util + 5 component).

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
