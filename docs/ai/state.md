# RIAL Current State

Last updated: 2026-04-17 (post Q16 B2 wave — FastingTimer + ChallengeDetail + CreatorProfile + WeeklyCheckIn + BodyCalendar + BodySnapshotCard + InlineReflection + RitmoSection + BodyTimeline → `<SectionCard>` / `BUTTON_CARD_SURFACE_CLASSES` · pushed to `rial-food/main` HEAD `088a40a`, working tree clean)

## Release snapshot
- Root branch: `main`, **in sync with `rial-food/main`** at HEAD `088a40a`. Six commits landed this session: FastingTimer, ChallengeDetail+CreatorProfile, WeeklyCheckIn stat tiles, 4 wellness components batch (BodyCalendar + BodySnapshotCard + InlineReflection + RitmoSection) + `BUTTON_CARD_SURFACE_CLASSES` helper, allowlist trim, BodyTimeline empty-state. 14 SectionCard-shape drift occurrences eliminated (41 → 27); 8 files removed from ESLint Q16 allowlist (27 → 19).
- Release remote: `rial-food` (worktree remote: `origin`)
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`
- **Governance (2026-04-17):** work directly on `main`. No feature branches, no worktrees going forward. Reconcile in-flight divergence by merging directly into `main`.

## Recent commits on `main` (in sync with `rial-food/main`)
- `088a40a` `refactor(q16-b2): BodyTimeline empty state SectionCard shape -> primitive`
- `170cfa5` `chore(q16): drop 4 wellness components from allowlist`
- `f12415e` `refactor(q16-b2): wellness components SectionCard shapes -> primitive (4 migrations)`
- `6eb4052` `refactor(q16-b2): WeeklyCheckIn stat tiles SectionCard shapes -> primitive (3 migrations)`
- `0f894fe` `refactor(q16-b2): ChallengeDetail + CreatorProfile SectionCard shapes -> primitive (5 migrations)`
- `16d8764` `refactor(q16-b2): FastingTimer SectionCard shapes -> primitive (3 migrations)`
- `82b44d0` `docs(state): post-push snapshot — in sync with rial-food/main at 4d1c6f4`
- `4d1c6f4` `test(demo-seed): lock in clear + load handler fixes`
- `98c75b3` `fix(demo-seed): clear seed-version markers and drop stale rial_ prefix`
- `60a43cc` `chore(q16): drop migrated wellness components from allowlist`
- `5f5ad24` `refactor(q16-b2): wellness SectionCard shapes -> primitive (5 migrations)`
- `27c882b` `docs(state): snapshot post Q16 B2 batch — SectionCard none variant + BarcodeScanner/Onboarding inputs`
- `27dad43` `chore(q16): drop SettingsProfile + SettingsNutrition from allowlist`
- `4fc53fd` `refactor(q16-b2): BarcodeScanner + Onboarding inputs → INPUT_SURFACE_CLASSES`
- `05b558b` `feat(q16-b2): extend SectionCard with padding='none' + spacing='none'`
- `48def0d` `refactor(q16-b2): SettingsNutrition dislike search → INPUT_SURFACE_CLASSES`
- `7386c5c` `refactor(q16-b2): SettingsProfile inputs → INPUT_SURFACE_CLASSES`
- `8054c9d` `chore(q16): shrink allowlist further + extract INPUT_SURFACE_CLASSES`
- `e442916` `docs(market): competitive baseline + prioritization + hard metrics` (CHANGELOG `[1.5.27]` + `[1.5.28]`)
- `f00d8d6` `chore(q16): trim 24 clean files from ESLint allowlist post-B1 codemod`
- `78786fc` `feat(q16-codemod): text-[Npx] → design tokens (249 replacements, 47 files)`
- `1e18c97` `fix(social): CommunityPost.recipe.photos[] + drift baseline re-medido`
- `3932669` `docs(state): Fase 2 multi-media snapshot + SyncKey data-URL risk + Q6 handoff`
- `dd22be8` `feat(recipes): Fase 2 multi-media — PhotoUploader + imageCompress + Capacitor Camera`
- `3e76879` `docs(q19-meal-taxonomy): CHANGELOG 1.5.25 + state.md close-out`
- `58aa9c7` `feat(recipes): Fase 1 multi-media — hero gallery + lightbox + hybrid video section`
- `5dab667` `feat(sprint-q19): meal-taxonomy migration — mealType string → suitableFor[] MealSlot[]`
- `24b5925` `chore(lint): purga warnings triviales — ignores Capacitor + console.* via logger`
- `99305d2` `fix(ui): normaliza shells Cocina+Discovery + RecipeCard tokens + HIG tap-targets`
- `e46ec12` `docs(wave-4): AUDIT-TAB-2026-04-18 close-out + CHANGELOG 1.5.21 + state snapshot + NEW-SCREEN-CHECKLIST`
- `26ba1bd` `refactor(wave-3): Explora tab polish — factory handlers + drift purge + i18n + Discover relocation`
- `7db26c8` `refactor(wave-2): Cocina tab polish — drift purge, HIG taps, unsave confirm, iframe sandbox, mealSlot picker`
- `ecb73fa` `refactor(wave-1): Hoy tab polish — drift purge, empty states, HIG taps, memo, i18n, SyncKey`
- `4d83e94` `fix(wave-0): bug sweep + dead-code purge (Hoy/Cocina/Explora audit)`
- `2767b97` `merge(rial-food/main): reconcile Q14/Q15.5/walkthrough with sprint-q + sprint-q18`

## Recent merged commits (Rial-food.app main)
- `37dd18d` `feat(design-audit): tab-by-tab walkthrough — 🔴 blocker fixes (NutritionHero overflow, 4 sub-HIG tap targets, 3 text-[7px]) + Q16 pilot migrations (WeeklyCheckIn, WeeklyReview) — baseline 134→84`
- `ac492fd` `feat(sprint-q15.5): design-system remediation — tokens, primitives, ESLint guardrails, ADRs, NEW-SCREEN-CHECKLIST, i18n symmetry check`
- `a067241` `feat(sprint-q14): audit polish — Profile streak fix, multi-ICP seed, empty states, dedup, back-stack`
- `155f08b` `feat(sprint-q18): seed data overhaul + delete-all safety` (upstream, 2026-04-16)
- `8b8a5b5` `feat(sprint-q): Progress tab restructure — score ring, component extraction, 5 bug fixes` (upstream, 2026-04-16)
- `6f7bcc3` `feat(sprint-q11): Progress UX consolidation — 2 tabs, unified modal, timeline+calendar, seed data`
- `1824bae` `feat(sprint-q10): BodySnapshot type, Progress tabs, photo timeline, measurements`
- `94b16f7` `feat(sprint-q9): avatar upload, GlobalHeader fix, hydration/movement goal editors`
- `f933347` `feat(sprint-q8): ProgressPreviewCard — sparkline, 7d delta, goal bar, quick-log, deep-link`
- `a9d2ec3` `feat(sprint-q7): unified weight flow — single handler, onboarding seed, Settings sync`
- `ab34efa` `feat(sprint-q5): Lighthouse/PWA audit — A11y form labels, nav aria, manifest dedup`
- `9554b9c` `feat(sprint-q4): A11y nested-button fix, day i18n, weight entries list`
- `deef2ed` `feat(sprint-q3): batch cooking UI, weight note + target progress, i18n, type fix`
- `133e68e` `feat(sprint-q2): AddMeal unified search + OFFResult type fix`
- `1659206` `feat(sprint-q1): fuzzy ingredient matching v2 — aliases, prep-strip, measurements`

## Merge reconciliation (2026-04-17)
Two upstream commits (`8b8a5b5` sprint-q Progress restructure, `155f08b` sprint-q18 seed overhaul) landed on `rial-food/main` while three local commits (Q14, Q15.5, walkthrough) landed on `main`. Reconciled via merge on `main` (no feature branch). Conflict decisions:

- **`src/features/wellness/screens/WeeklyReview.tsx`** — accepted upstream deletion. Reflection form absorbed into Progress's new `InlineReflection` component.
- **`src/features/wellness/screens/Progress.tsx`** — accepted upstream rewrite (443 lines, score ring + extracted components `WeeklyScoreCard`/`ConsistencyCalendar`/`InlineReflection`/`WeightTrendCard`). My Q14 2-tab version superseded.
- **`src/features/wellness/screens/WeeklyCheckIn.tsx`** — accepted upstream simplification (history-only browser, 109 lines).
- **`BodyTimeline`, `BodyCalendar`, `LogSnapshotModal`, `RitmoSection`, `LatestReflectionCard`, `DataSourceCaption`** — remain in `src/features/wellness/components/` as reusable pieces (not wired into current Progress). `GlobalLogSnapshotModal` is still mounted at App root, so any component can still trigger the global log modal via `window.dispatchEvent(new Event('rial:open-log-snapshot'))`.
- **i18n, CHANGELOG, `docs/ai/state.md`** — additive merges (no semantic conflicts).

Collateral: my Q16 pilot migration on `WeeklyCheckIn.tsx` + `WeeklyReview.tsx` is wasted work (remote rewrote both). SectionCard baseline recalculated post-merge.

## Quality baseline (2026-04-17, post Q16 B2 wave — FastingTimer / Challenge / Creator / WeeklyCheckIn / 5 wellness components)
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Tests: **556/556** unit tests passing
- i18n symmetry: **1499** keys aligned ES ↔ EN (`npm run check:i18n`)
- Design-system lint: 0 errors, 589 warnings (pre-existing type-debt `no-explicit-any` + intentional allowlisted drift)
- Build (measured 2026-04-17 via `npm run release:preflight`):
  - main entry: **769.3 KB raw / 240.8 KB gzip**
  - vendor-recharts: 331.5 KB raw / 99.8 KB gzip
  - total dist/assets/*.js: **2716.6 KB raw / 773.6 KB gzip**
- Drift baselines (re-measured 2026-04-17 post wave):
  - `text-[Npx]` occurrences across `src/`: **0** (Q16 B1 codemod `78786fc` eliminated all 249)
  - SectionCard shape: **27** real drift (30 grep matches − 3 legit: `SectionCard.tsx` primitive + `surface.ts` `INPUT_SURFACE_CLASSES` + `surface.ts` `BUTTON_CARD_SURFACE_CLASSES`). Down from 41 pre-wave / 44 pre-wellness-batch / 72 pre-B2. Remaining hotspots: `RealFeelDiary` (6), `PostDetail` (3), `Discover` (2), `Onboarding` (2), `TodaysMeals` (2), `Profile` (2), `CreatorVerification` (2), `CreatorProfile` (1 — intentional post list-item, needs `<ListCard>`), `AICoach` (1), `Planner` (1), `Pantry` (1), `ShoppingList` (1), `RialPlus` (1), `BarcodeScanner` (1), `Challenges` (1).
  - ESLint Q16 migration allowlist: **19 files** (−8 from this wave: FastingTimer was never listed; ChallengeDetail + 5 wellness/components — BodyCalendar/BodySnapshotCard/BodyTimeline/InlineReflection/RitmoSection — + WeeklyCheckIn all dropped).
  - `INPUT_SURFACE_CLASSES` helper consumers: **4** (unchanged).
  - `BUTTON_CARD_SURFACE_CLASSES` helper consumers: **1** (`BodySnapshotCard` — new in `f12415e`). Mirrors input pattern for clickable card-shaped `<button>` elements.

## 2026-04-17 Q19 meal-taxonomy (shipped — `5dab667`)
Plan: `.claude/plans/analiza-si-tiene-sentido-floating-kurzweil.md`. CHANGELOG: `[1.5.25]`.

**Decisión de producto.** Sustituir `Recipe.mealType: string` (single-valued) por `Recipe.suitableFor: MealSlot[]` (multi-valued opcional). Empty/undefined = receta versátil (aparece en todos los filtros de franja). Precedente Paprika/PlateJoy — única separación limpia entre "apta para" (propiedad de la receta) y "slot de consumo" (decisión al planificar/loggear) entre 19 competidores analizados. Mantener las 4 franjas canónicas (Breakfast/Lunch/Dinner/Snack) como vocabulario familiar — no introducir slots renombrables/configurables (Q20+). "Rápido" sale del eje primario de franjas y se promueve a `collections` (eje ortogonal tiempo ≤ 20 min). Cierra de paso regresión silenciosa donde recetas creadas/importadas por el usuario quedaban invisibles en filtros de franja (pre-Q19 `CreateRecipe` no asignaba `mealType`).

**Write set.**
- `src/types/recipe.ts` + `src/types/index.ts` — `MealSlot` canónico + re-export; `Recipe.suitableFor?: MealSlot[]` + `@deprecated mealType?: string`.
- `src/lib/schemas.ts` — zod dual (`suitableFor` canónico + `mealType` legacy retenido para hydration).
- `src/features/recipes/utils/meal-slot.ts` (**nuevo**) + `meal-slot.test.ts` (**27 assertions**) — `getRecipeSlots / recipeFitsSlot / defaultSlotFor` con normalización ES+EN + case-insensitive.
- `src/features/food/components/MealSlotMultiSelect.tsx` (**nuevo**) — picker multi-check HIG-compliant (`role="group"`, `aria-pressed`, min-h-11).
- `src/features/food/data/seed-recipes.ts` — 46 recetas migradas a `suitableFor[]` (versátiles → `['lunch','dinner']`; específicos → un solo slot).
- `src/lib/seedVersion.ts` — `savedRecipes` 3 → 4 (re-hidrata usuarios existentes con estrategia `preserve-user`).
- `src/features/recipes/screens/Cocina.tsx` + `src/features/home/screens/Discovery.tsx` — filtros vía `recipeFitsSlot`; "Rápido" movido a `collections`.
- `src/features/recipes/components/RecipeDaySelectorSheet.tsx` + `src/features/recipes/handlers/recipe-handlers.ts` + `src/features/recipes/screens/RecipeDetail.tsx` — default slot vía `defaultSlotFor(recipe)`.
- `src/features/recipes/screens/CreateRecipe.tsx` — picker integrado; hidratación edit-mode vía `getRecipeSlots(initialRecipe)` (fix de pérdida de slot legacy al re-guardar).
- `src/features/recipes/screens/ImportRecipeURL.tsx` — `inferSuitableFor(title)` heurística ES/EN; chips editables pre-guardado.
- `src/contexts/AppStateContext.tsx` — migración eager idempotente: legacy `mealType` → `suitableFor[]` on mount, drop del campo deprecado. Early-return cuando no hay nada que migrar.
- `src/i18n/locales/es.ts` + `src/i18n/locales/en.ts` — namespace canónico `t.mealSlot.*`; duplicados corregidos (`Almuerzo` → `Comida`, `MERIENDA` → `SNACK`, `Snacks` → `Snack`). +13 claves, 1475 → 1488 simétricas.

**Quality baseline post-ejecución.**
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Tests: **542/542** (+27 nuevos en `meal-slot.test.ts` · 515 → 542)
- i18n symmetry: **1488** keys aligned ES ↔ EN
- Design-system lint: 0 errors, warnings pre-existentes (Q16 allowlist sin cambios)
- Consumers audit: cero accesos directos a `recipe.mealType` en `Home.tsx`, `TodaysMeals`, `AddMeal.tsx`, `Planner.tsx`; todo vía helpers
- Build + size:check: dentro de budget (pendiente de correr `release:preflight`)

**Nuevos risks.**
- `Recipe.tag: string` ad-hoc sigue vivo (GUARDADO/VEGANO/EXPRESS/BATCH/MI RECETA/IMPORTADA/POSTRE/SNACK/DESAYUNO/PLANEADO/SOBRAS). **Bug latente**: `Discovery.tsx:126` filtra `r.tag === 'VEGANO'` mientras `CreateRecipe` escribe a `tags[].includes('vegan')` → recetas veganas del usuario no aparecen en el filtro Vegano. Defer a Q16 codemod sprint (requiere `origin?: 'user' | 'imported' | 'seed'` + `FoodTag = 'batch-cooking'` + migración 40+ sitios).
- Literales `'merienda'` supervivientes en `meal-slot.ts:47` + `recipe-handlers.ts:50` son parsers de legacy strings (no UI), intencionales.

**Pendiente antes de commit/push.** Runtime verification de 7 escenarios en preview + `npm run release:preflight`.

## 2026-04-17 Cocina/Explora cohesion pass (committed in 1.5.23)
Plan: `.claude/plans/quiero-que-analices-concretamente-effervescent-deer.md`. CHANGELOG: `[1.5.23]`. Cohesion pass RecipeCard tokens + PageShell normalize. Baseline post-pase: 515/515 tests, 1475 i18n keys, bundle en budget.

## 2026-04-18 tab audit (Hoy / Cocina / Explora)
Plan file: `.claude/plans/replicated-orbiting-coral.md`. Close-out doc: `docs/AUDIT-TAB-2026-04-18.md`. 5 waves executed (Wave 4 docs in progress). 17 functional bugs fixed, 2 dead files deleted, drift cleaned across 30+ files, factory-handler pattern completed for social. No pushes — commits staged for single approval-gated push.
- Lint: 0 errors
- Bundle budget (enforced via `npm run size:check` in CI):
  - main entry ≤ 900 KB raw / 280 KB gzip (~15% headroom over baseline)
  - vendor-recharts ≤ 400 KB raw / 115 KB gzip
  - total ≤ 3200 KB raw / 900 KB gzip
- Coverage thresholds (enforced via `vitest --coverage`): lines/functions/branches/statements ≥ 30%

## Coverage roadmap
- Q15: raise thresholds to 40% (add tests for remaining utils + handlers)
- Q16: raise thresholds to 50% (expand handlers + feature helpers coverage)
- Excluded from coverage (platform/integration, not unit-testable): `src/lib/supabase.ts`, `purchases.ts`, `platform.ts`, `storage.ts`, `sync.ts`, `useProGate.ts`, `useDailyReset.ts`, `useLocalStorageState.ts`, `wellness/utils/correlations.ts`.

## Supabase status
- Edge functions deployed: `gemini-proxy`, `delete-account`, `validate-receipt`
- DB migration ready: `supabase/migrations/001_initial_schema.sql` (NOT yet applied to remote project)
  - Tables: `profiles`, `user_data` (key-value store mirroring localStorage)
  - RLS policies, updated_at triggers, auto-create profile on signup
  - Apply with: `supabase db push` or via Supabase Studio SQL Editor
- Sync layer: `src/lib/sync.ts` (push-on-change, pull-on-signin) — ready but `useSupabasePersistence` flag not yet wired in UI

## Current runtime AI posture
- Local dev: `VITE_GEMINI_API_KEY` still works.
- Production: routes through `supabase/functions/gemini-proxy`.
- `vercel.json` does NOT inject Gemini secrets.

## Repository compliance (2026-04-16)
- `LICENSE`: Proprietary — Copyright (c) 2026 RIAL FOOD WORLD S.L. All rights reserved. Contact: legal@rialfoodworld.com.
- `SECURITY.md`: private reports to security@rialfoodworld.com. SLA 72h ack / 7d triage / 30d fix critical.
- `CODE_OF_CONDUCT.md`: Contributor Covenant 2.1. Incidents to conduct@rialfoodworld.com.
- `.github/`: PR template, 3 issue templates (bug/feature/task), CODEOWNERS (`@novara-bbs`), Dependabot npm + github-actions weekly.
- Lint/format hygiene: `.prettierrc`, `.prettierignore`, `.editorconfig`. Enforced only in CI — no husky/pre-commit.

## Active repository conventions
- Shared dev-agent memory: `docs/ai/`
- Universal entrypoint: `AGENTS.md`
- `CLAUDE.md`, `GEMINI.md` are thin adapters
- Cursor rules: `.cursor/rules/` | Windsurf rules: `.windsurf/rules/`
- Feature-based structure: `src/features/<domain>/{screens,components,handlers,utils,data}/`
- No barrel files (except `src/types/index.ts`)
- State: localStorage via `useLocalStorageState` in `AppStateContext`
- New handlers: factory function in `features/*/handlers/`, wired in `AppStateContext`
- All user-visible strings: `t.section.key` via `useI18n()`
- **Seed hydration**: every lazy-loaded seed goes through `src/lib/seedVersion.ts`. Add the key to `SEED_VERSIONS`, call `shouldReseed(key, dataKey)` to guard the `useEffect`, stamp `setStoredSeedVersion(key)` after a successful import. When you change a seed's semantic content and want existing users to receive it, **bump the version** — never decrease. Pick a merge strategy in `AppStateContext`: `preserve-user` (savedRecipes), `preserve-if-nonempty` (transactional logs + plans), `replace` (demo-only content). Cross-device propagation is a separate problem the Q6 Supabase sync layer will tackle.
- Archived product/market docs: `docs/archive/` (not loaded by agents)
- Competitive intelligence viva: `docs/market/` (no auto-cargado — consultar por demanda cuando la tarea mencione competidor, UX benchmark, rankings o posicionamiento). Índice: `docs/market/competitors-index.md`. Matriz: `docs/market/feature-matrix.md`. Posicionamiento: `docs/market/rial-positioning.md`.

## Current risks to watch
- **Data URL payload en `savedRecipes` (Fase 2 multi-media)** — cada receta con 6 fotos comprimidas ocupa ~1.2 MB base64. Excede el row-limit típico de Supabase `user_data` (~1 MB JSON). **Mitigación hasta Q6**: persistencia local vía `migrateLocalStorageToIDB` (IDB ~GBs); sync push excluye `savedRecipes` cuando cualquier `photos[i]` es data URL. **Q6 debe**: crear bucket Supabase Storage `recipe-photos` + RLS por `user_id`, migrar `photos[]` data URL → URL firmada, sanitizar `SyncKey` con threshold (≥10 KB/entry = skip hasta bucket) como fallback.
- **`ImportRecipeURL` no auto-popula `videoUrl`** — importar desde TikTok/Instagram/YouTube pierde el vínculo al video fuente. Defer a Q6 (requiere Edge function `og-fetch` que parsee `og:video` + `twitter:player` + YouTube embed). Hoy el form manual de CreateRecipe cubre el caso.
- Supabase DB migration not yet applied to remote project (intentionally deferred — apply only after features stable)
- `useSupabasePersistence` flag not wired (intentionally deferred — full Supabase sprint after feature-complete)
- vendor-recharts chunk is 102 KB gzip — acceptable but worth monitoring
- Challenges/Creadores card divs still have onClick (complex to fix: nested buttons → needs restructure)
- **SyncKey covers ~10 of ~35 localStorage keys** — see audit below. Gap must be resolved in Supabase sprint (Q6).
- **CSP header pending (Q17)** — `vercel.json` now ships HSTS + X-Frame + nosniff + Permissions-Policy + Referrer-Policy, but Content-Security-Policy is deferred until all third-party sources are audited (Supabase, Sentry, Google GenAI, RevenueCat, recharts).
- **SectionCard shape drift: 27 occurrences pending B2 migration** — down from 41 (pre-wave) / 72 (pre-B2). 2026-04-17 wave shipped FastingTimer (3→0), ChallengeDetail (3→0), CreatorProfile (3→1 intentional post list-item), WeeklyCheckIn (3→0), BodyCalendar (1→0), BodySnapshotCard (1→0 via new `BUTTON_CARD_SURFACE_CLASSES`), InlineReflection (1→0), RitmoSection (1→0), BodyTimeline (1→0). Remaining hotspots: `RealFeelDiary` (6), `PostDetail` (3), `Discover` (2), `Onboarding` (2), `TodaysMeals` (2), `Profile` (2), `CreatorVerification` (2), `AICoach` (1), `Planner` (1), `Pantry` (1), `ShoppingList` (1), `RialPlus` (1), `BarcodeScanner` (1), `Challenges` (1), `CreatorProfile` (1 — post list-item, blocked on `<ListCard>` variant). Strategy: continue `INPUT_SURFACE_CLASSES`/`BUTTON_CARD_SURFACE_CLASSES` pattern for input shells + clickable-card buttons; migrate true card sections to `<SectionCard>`. ESLint guardrail keeps new drift at 0.

## localStorage audit (2026-04-15)
All keys below are prefixed with `rial_` by `useLocalStorageState`. Column "Sync?" = whether `src/lib/sync.ts` `SyncKey` type includes it.

| Key | Writer | Sync? | Recommendation at Q6 |
|-----|--------|-------|----------------------|
| `userProfile` | AppStateContext | ✓ | Keep — core identity |
| `dailyMacros` | AppStateContext | ✓ | Keep — daily target + consumed |
| `savedRecipes` | AppStateContext | ✓ | Keep — user's recipe book |
| `mealPlan` | AppStateContext | ✓ | Keep — weekly plan |
| `shoppingList` | AppStateContext | ✓ | Keep |
| `realFeelLogs` | AppStateContext | ✓ | Keep |
| `toleranceLogs` | AppStateContext | ✓ | Keep |
| `weightHistory` | AppStateContext | ✓ | Keep |
| `nutritionHistory` | AppStateContext | ✓ | Keep |
| `isPro` | AppStateContext | ✓ | Keep (but validated server-side via RevenueCat) |
| `likedPosts` | AppStateContext | ✗ | Add — social engagement cross-device |
| `savedPosts` | AppStateContext | ✗ | Add |
| `isFirstTime` | AppStateContext | ✗ | Add — prevents re-running onboarding |
| `checkInStatus` | AppStateContext | ✗ | Add |
| `hydration` | AppStateContext | ✗ | Add (daily, but useful across devices) |
| `movement` | AppStateContext | ✗ | Add |
| `dailyGoal` | AppStateContext | ✗ | Add |
| `userFoods` | AppStateContext | ✗ | Add — custom scanned foods |
| `communityPosts` | AppStateContext | ✗ | **Skip** — sourced from backend at Q6 |
| `communityStories` | AppStateContext | ✗ | **Skip** — sourced from backend at Q6 |
| `notifications` | AppStateContext | ✗ | **Skip** — backend-driven at Q6 |
| `dailyLog` | AppStateContext | ✗ | Add — user's actual food log |
| `foodHistory` | AppStateContext | ✗ | Add |
| `favoriteIds` | AppStateContext | ✗ | Add |
| `showAIBot` | AppStateContext | ✗ | **Skip** — UI pref, device-local |
| `followedCreators` | Discover/Creadores/Profile | ✗ | Add — social graph |
| `joinedChallenges` | Challenges | ✗ | Add |
| `challengeJoinDates` | Challenges | ✗ | Add |
| `challengeProgress` | ChallengeDetail | ✗ | Add |
| `weeklyCheckIns` | WeeklyCheckIn | ✗ | Add |
| `pantryItems` | Pantry | ✗ | Add |
| `fasting-protocol` | FastingTimer | ✗ | Add — user pref |
| `fasting-start` | FastingTimer | ✗ | **Skip** — active timer, device-local |
| `fasting-history` | FastingTimer | ✗ | Add |
| `aicoach-messages-*` | AICoach | ✗ | **Skip** — chat history, maybe keep local for privacy |
| `notificationsEnabled` | SettingsSystem | ✗ | **Skip** — device pref |
| `profilePublic` | SettingsSystem | ✗ | Add |

**Summary:** 10 synced / 27 unsynced. Of the 27 unsynced: ~18 should sync (user data), ~9 should stay local (UI prefs, active timers, chat, backend-sourced).

**Decision deferred to Q6 (Supabase sprint):** expand `SyncKey` + add sync-gate per key + dedup the `rial_*` prefix convention.

## Supabase integration strategy
Infrastructure is prepared (`migration SQL`, `sync.ts`, `AuthContext`, auth screens). Full wiring intentionally deferred until all features stable (see gate below). Rationale: wiring sync into AppStateContext while data model still evolves = technical debt, since every new `useLocalStorageState` key would need a SyncKey decision and test.

## Feature-freeze gate (triggers Q6)
Execute Supabase sprint ONLY when ALL of these hold:
- Q1-Q5 merged to main
- `npx tsc --noEmit` → 0 errors
- `npx vitest run` → 0 regressions
- No refactor PRs open
- Data model (types + SyncKey shape) stable for 1 full sprint
- E2E green on last 3 commits to main

## Next sprint candidates (ordered)
- ~~**Q1**~~ ✓ DONE — C3 fuzzy ingredient matching (`deef2ed` ← `1659206`)
- ~~**Q2**~~ ✓ DONE — AddMeal unified search + OFFResult type fix (`133e68e`)
- ~~**Q3**~~ ✓ DONE — Batch cooking UI, weight note + target progress, i18n (`deef2ed`)
- ~~**Q4**~~ ✓ DONE — A11y nested-button fix (Challenges, Creadores), icon aria-labels, day i18n, weight entries list
- ~~**Q5**~~ ✓ DONE — Lighthouse/PWA audit: nav `aria-current` + `aria-label`, WCAG 4.1.2 form labels across 8 components, manifest dedup
- ~~**Q7**~~ ✓ DONE — Weight flow unification: single `createHandleLogWeight` handler, onboarding seed, Settings sync, `getCurrentWeight` helper, 7 tests
- ~~**Q8**~~ ✓ DONE — ProgressPreviewCard on Home: sparkline, 7-day delta, goal bar, quick-log, "Ver detalles →" deep-link
- ~~**Q9**~~ ✓ DONE — Avatar upload + GlobalHeader fix + hydration/movement sliders in SettingsNutrition
- ~~**Q10**~~ ✓ DONE — BodySnapshot type, Progress tabs v1 (fragmented — superseded by Q11)
- ~~**Q11**~~ ✓ DONE — Progress UX consolidation: 4 tabs → 2 (Cuerpo/Nutrición); unified LogSnapshotModal; Timeline + Calendar views of same data; SnapshotDetailModal with edit/delete; seed data for dev
- ~~**Q12**~~ ✓ DONE — Validation + DataSourceCaption + Ritmo section + progress post type (uncommitted — pending Q14 batch commit)
- ~~**Q13**~~ ✓ DONE — IA consolidation: primitives extracted (StatTile, Sparkline, SectionCard, SegmentedTabs), shared utils (streaks, week-stats, weight-trend), orphan resolution, 64 new tests
- ~~**Q14**~~ ✓ DONE — Audit polish: Profile streak asymmetry fix, multi-ICP seed (Clara/Marcos/Ana), empty states with CTAs, LatestReflection dedup, back-stack fix, 40 new tests
- ~~**Q15.5**~~ ✓ DONE — Design-system remediation (scope from `docs/DESIGN-AUDIT-2026-04-16.md`): typography + shadow + radius token scales in `src/index.css`; Button HIG-compliant (44×44); Profile dedup to `<SectionCard>`; GlobalHeader demo-gate → shadcn Dialog; BottomNav `focus-visible`; 3 new docs (DESIGN-SYSTEM, PRIMITIVES, NEW-SCREEN-CHECKLIST); 7 ADRs (`docs/adr/ADR-001…ADR-007`); ESLint `no-restricted-syntax` for 3 design-system anti-patterns + Q16 migration allowlist; `scripts/check-i18n-symmetry.mjs` wired into `release:preflight`; 3 convention tests (`primitives-export`, `design-tokens`, `sectioncard-usage`). **Q16 migration deferred** — 445 `text-[Npx]` + 134 SectionCard dup occurrences now under CI guardrail (warn for pre-existing files, error for new).
- ~~**Walkthrough pass (2026-04-17)**~~ ✓ DONE — live audit against Q15.5 design system documented in `docs/DESIGN-AUDIT-WALKTHROUGH-2026-04-17.md`. Shipped 🔴 blocker fixes: NutritionHero overflow redesign, 4 sub-HIG tap targets (CookTimer, AddMeal ×2, WeeklyCheckIn chevrons, Home streak), 3 `text-[7px]` illegibility fixes (RecipeCard ×2, Profile badge). Q16 pilot migrated WeeklyCheckIn (7 dups) + WeeklyReview (2 dups). Baselines: SectionCard shape 134→**84**, `text-[Npx]` 445→**415**, ESLint warnings 1016→**972**, i18n 1403→**1406**. Validates the Q16 codemod playbook and proves the guardrail drops cleanly when drift is removed.
- ~~**Tab audit 2026-04-18 (Hoy/Cocina/Explora)**~~ ✓ DONE — 5-wave audit documented in `docs/AUDIT-TAB-2026-04-18.md`. 17 functional bugs fixed (scan-barcode, story index, notification badge, import-URL silent fallback, CookMode crash, CookTimer drift, Community staleness, Tú/Justo ahora literals, TodaysMeals hidden buttons, mealType on add-to-plan, PostCard counters, Notifications click-through, seed race, Cocina type, CreateRecipe free-form time, PostCard progress-type delegation). 2 dead files purged (Creadores, WeightQuickLog). Factory-handler pattern completed for social (4 inline call sites → 0). Discover relocated to social/. 17 files off ESLint allowlist. Baselines: SectionCard 93→**72**, `text-[Npx]` in `src/features/social/**` → **0**, Tests 481→**501**, i18n 1428→**1475**. Commits `4d83e94` + `ecb73fa` + `7db26c8` + `26ba1bd` (+ pending Wave 4 docs). **Not yet pushed** — per user governance hold.
- **Next audit tranche (candidate)** — Diccionario (FoodDictionary / AddMeal / BarcodeScanner / PortionSelector / MealSlotSelector) + Despensa (Pantry) + More menu + Settings + Profile + legal screens + Progress regression re-check. Same 4-wave shape.
- **Q15** — ICP-adaptive Progress widgets (Clara/Marcos/Ana persona switches show/hide widget types) + before/after photo compare (Timeline tab, use `BodySnapshot.photoUrl` pairs) + remove deprecated `calculateStreak()` (callers already migrated to `calcStreaks` via Q13 — sweep for stale imports) + custom body measurements (extend `BodySnapshot` with user-defined metric definitions).
- ~~**Q16 B1**~~ ✓ DONE — `text-[Npx]` codemod (`78786fc`): 249 replacements across 47 files using literal→token map (7-10px→`text-micro`, 11px→`text-caption`, 12px→`text-label`, 13px→`text-body-sm`, 14px→`text-body`, 16px→`text-body-lg`, 18px→`text-title-sm`, ≥24px→`text-title`/`text-headline`/`text-display`). Follow-up `f00d8d6` trimmed 24 clean files from the ESLint allowlist. Baseline: 249 → **0** occurrences.
- **Q16 B2** (in progress) — SectionCard shape drift **72 → 44** across commits (`8054c9d` helper + `7386c5c` SettingsProfile + `48def0d` SettingsNutrition + staged batch BarcodeScanner/Onboarding inputs + SectionCard `none` variant). Helper `INPUT_SURFACE_CLASSES` (`src/components/ui/surface.ts`) factors out the form-input shell that duplicates SectionCard elevation but needs `rounded-sm` / custom padding. Next passes: `ImportRecipeURL`, `RealFeelDiary`, `FastingTimer`, `ChallengeDetail`/`CreatorProfile`/`PostDetail` (social). Success = allowlist empty, SectionCard-shape baseline = 0, convention test deleted.
- **Q17** — Security + responsive hardening. (1) CSP header in `vercel.json` (deferred from Q15.5) — audit third-party origins: Supabase, Sentry, Google GenAI, RevenueCat, recharts CDN, Capacitor bridges. (2) WCAG AA contrast fix on `theme-orange-light` (`on-surface-variant` 4.4:1 → ≥4.5:1). (3) Responsive tablet/desktop breakpoints — audit `PageShell` variants and current `sm:/md:` usage; promote layouts that rely on mobile-only heuristics.
- **Q6** — Supabase integration (gated — see feature-freeze gate above): apply migration → expand SyncKey per audit (now includes `BodySnapshot.photoUrl` photos → Storage bucket) → wire `syncOnSignIn`/`pushToCloud` in AppStateContext → `useSupabasePersistence` toggle in SettingsSystem → E2E with real Supabase project.

## When to update this file
- A release line or deployment target changes
- A new agent workflow becomes part of normal practice
- A new active risk appears or is resolved
- A stable project decision affects how future agents should operate
