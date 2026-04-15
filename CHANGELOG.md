# RIAL App - Changelog

## [1.5.9] - 2026-04-15

### Q10 — Progress v2: BodySnapshot + tabs + photos + measurements

#### Data model
- New `src/types/wellness.ts`: `BodySnapshot` type with optional `photoUrl` (base64) and `measurements` (`chestCm`, `waistCm`, `hipsCm`, `bodyFatPct`)
- `WeightEntry` kept as backward-compat alias (`type WeightEntry = BodySnapshot`)
- `AppStateContext`: `WeightEntry` inline definition replaced with re-export from `types/wellness`; internal state typed as `BodySnapshot[]`

#### Weight handlers
- `weight-handlers.ts`: extended `LogWeightArgs` with optional `photoUrl` and `measurements`
- Merges with existing snapshot on re-weigh (preserves photo/measurements when weight is updated)
- New `createHandleUpdateSnapshot`: updates photo/measurements on an existing snapshot without changing kg; creates stub entry if date has no snapshot
- `handleUpdateSnapshot` wired into `AppStateContext` and exposed via `useAppState()`

#### Progress.tsx — tabbed interface
- **4 tabs**: Peso | Fotos | Medidas | Nutrición
- **Weight tab**: existing chart, delta, target progress bar, recent entries (with camera icon indicator), log form — unchanged behavior
- **Photos tab**: today's photo add/preview (camera + gallery), vertical timeline of all snapshots with photos (newest first), empty state CTA, remove button per photo
- **Measurements tab**: inline form (chest/waist/hips/body fat %); saves to today's snapshot; delta table vs. earliest measurement entry; history list
- **Nutrition tab**: existing nutrition summary + consistency calendar moved here; calendar shows a small dot on dates with photos
- **Storage guard**: `estimateStorageUsage()` check before photo upload → toast warning at >4 MB

#### i18n
- 28 new keys added to both `es.ts` and `en.ts` under `progress.*` (tabs, photos, measurements, storage warning)

## [1.5.8] - 2026-04-15

### Q9 — Avatar + goals + settings consolidation

#### GlobalHeader avatar
- Replaced hardcoded Unsplash `<img>` with `userProfile.avatar` (base64); falls back to 2-char initials from `userName` if no avatar
- Added `userAvatar?: string | null` prop to `GlobalHeader`; wired from `App.tsx` via `userProfile.avatar`

#### Avatar upload in SettingsProfile
- Profile section header now shows real avatar (or initials circle) instead of hardcoded stock photo
- Clicking the avatar triggers a `<input type="file" accept="image/*">` hidden input; image compressed via `compressImage(400px, 0.7)` and stored to `userProfile.avatar` (base64)
- Camera hover overlay (icon) indicates the avatar is tappable

#### Hydration + movement goals in SettingsNutrition
- New "Objetivos de actividad" card in SettingsNutrition with: hydration target slider (1–20 cups), steps target slider (1k–20k, step 500), active minutes target slider (10–120 min, step 5)
- Card renders only when `setHydration` or `setMovement` are provided (backward-compat)
- Props `hydration`, `setHydration`, `movement`, `setMovement` wired through `Settings.tsx` → App.tsx `settings` case

#### i18n
- Added to both locales: `settings.activityGoals`, `settings.hydrationTarget`, `settings.stepsTarget`, `settings.activeMinTarget`, `settings.uploadAvatar`

#### Onboarding → dailyMacros (verified ✓)
- `App.tsx` onComplete already calls `setDailyMacros((prev) => ({ ...prev, target: result.targets }))` — no change needed

## [1.5.7] - 2026-04-15

### Q8 — Home Progress preview card

#### ProgressPreviewCard
- New `src/features/home/components/ProgressPreviewCard.tsx`: replaces `WeightQuickLog` on Home
- Shows current weight, 7-day delta (vs entry closest to 7 days ago, not just previous), goal progress bar with distance remaining, and mini 7-entry sparkline with a dot on the latest point
- Bottom action row: inline "+ Registrar peso" pill (collapses/expands quick-log form) + "Ver detalles →" deep-link to Progress tab via `onNavigateToProgress`
- Pressing Escape closes the inline form; Enter confirms
- `WeightQuickLog.tsx` preserved (not deleted) — still usable if needed; Home no longer imports it

#### i18n
- Added `home.viewDetails` (ES: "Ver detalles", EN: "View details") in both locale files

## [1.5.6] - 2026-04-15

### Q7 — Weight flow unification

#### Single write path
- New `src/features/wellness/handlers/weight-handlers.ts`: `createHandleLogWeight` factory — all weight writes go through one path; syncs both `weightHistory` (persistent record) and `userProfile.weight` (fast-read cache) atomically. Replaces same-date entries instead of appending.
- New `src/features/wellness/utils/body-data.ts`: `getCurrentWeight(userProfile, weightHistory)` helper — derives current weight from latest history entry, falls back to `userProfile.weight`, then null. Single read path for display code.

#### AppStateContext wire
- `handleLogWeight` added to `AppStateContextType` and wired via `useMemo` factory pattern (mirrors `meal-handlers`); exposed through `useAppState()`.

#### Migrated consumers (all now call `handleLogWeight`)
- `WeightQuickLog.tsx` (Home): removed direct `setWeightHistory` prop call; uses context `handleLogWeight`; `setWeightHistory` prop kept as `@deprecated` for one-sprint compat
- `Progress.tsx`: removed local handler + local `WeightEntry` interface; uses context `handleLogWeight`
- `SettingsProfile.tsx`: on weight biometric update, also calls `handleLogWeight` to seed history entry (previously only updated `userProfile.weight`)
- `App.tsx`: `onComplete` from `Onboarding` now calls `handleLogWeight` to seed initial history entry for new users (previously left `weightHistory` empty on first visit)

#### Onboarding unit labels
- Replaced hardcoded `(kg)` / `(cm)` labels with `getBodyWeightUnit('metric')` / `getHeightUnit('metric')` — unit-aware labels; `onComplete` now passes `initialWeightKg` to App for history seeding

#### Test suite
- New `src/features/wellness/handlers/weight-handlers.test.ts`: 7 tests covering dual-write, same-date replacement, new-date append, note inclusion/omission, custom date, edge values

#### Config
- `vitest.config.ts`: added `.claude/**` to exclude pattern (was picking up worktree node_modules test files)

## [1.5.5] - 2026-04-15

### Q5 — Lighthouse/PWA audit: A11y + manifest dedup

#### A11y — navigation
- `BottomNav.tsx`: added `aria-label` to `<nav>`, `aria-current="page"` to active item, `aria-hidden="true"` to all decorative icons; i18n-referenced `aria-label` for Create FAB (was hardcoded Spanish)
- `Sidebar.tsx`: same fixes — `aria-label` on `<nav>`, `aria-current="page"` on active item, `aria-hidden="true"` on icons
- `GlobalHeader.tsx`: added `aria-label` + changed `type="text"` → `type="search"` on search input

#### A11y — form inputs (WCAG 4.1.2)
- `Login.tsx`, `Signup.tsx`, `ForgotPassword.tsx`: `aria-label` on all email/password/name inputs; eye-toggle buttons now have `aria-label` (show/hide) + icon `aria-hidden`
- `TodaysMeals.tsx`: `aria-label` on inline portion-edit input (was unlabeled)
- `WeightQuickLog.tsx`: `aria-label` on weight number input
- `Pantry.tsx`: `aria-label` on ingredient name + quantity inputs
- `Home.tsx`: `aria-label` on hydration target range slider

#### i18n
- Added `nav.mainNav` (ES: "Navegación principal", EN: "Main navigation")
- Added `home.editPortionGrams` (ES: "Cantidad en gramos", EN: "Amount in grams")
- Added `auth.showPassword` / `auth.hidePassword` in both locales

#### PWA — manifest dedup
- `vite.config.ts`: removed inline `manifest:` block from VitePWA config — `public/manifest.json` is now the single source of truth; avoids duplicate `<link rel="manifest">` in production HTML

## [1.5.4] - 2026-04-15

### Q4 — A11y + i18n cleanup + UX gaps

#### A11y
- `Challenges.tsx`: removed nested `<div onClick>` + `<button>` pattern — cards now use sibling buttons (navigate / join-leave), no nested interactives; added `aria-pressed` to toggle button, `aria-hidden` to decorative icons
- `Creadores.tsx`: same fix — card content area is now a `<button>` for profile navigation; follow/unfollow is a sibling button with `aria-pressed` + `aria-label`
- `SettingsNutrition.tsx`: added `aria-label={t.settings.removeItem}` to icon-only dislike-remove button
- `RecipeDetail.tsx`: added `aria-label={t.recipes.removeIngredient}` to icon-only extra-ingredient remove button
- `Progress.tsx`: added `aria-label` to weight-confirm icon button

#### i18n
- `BatchCookingSuggestions.tsx`: replaced hardcoded `DAY_NAMES_ES` array with `t.cocina.dayAbbr` — day abbreviations now respect locale (ES: Lun-Dom, EN: Mon-Sun)
- Added keys: `cocina.dayAbbr`, `progress.recentEntries`, `settings.removeItem`, `recipes.removeIngredient`, `explore.creators.viewProfile` in both ES + EN

#### UX gaps (left behind from Q3)
- `Progress.tsx`: weight notes are now visible — added "Recent entries" list (last 5, newest first) showing date, weight, and optional note inline; was saved but never displayed

## [1.5.3] - 2026-04-15

### Q1 — Fuzzy ingredient matching (C3 ImportRecipeURL deeper parsing)
- Rewrote `fuzzy-match.ts` with a full preprocessing pipeline: alias map (60+ regional names — papa→patata, palta→aguacate, carne picada→carne de res molida, etc.), prep-word stripping (asado, fresco, cocido, crudo…), measurement prefix stripping ("200g de", "2 tazas de", "3 huevos"), Spanish plural normalization
- Added `matchIngredientTopNFromList(name, list, n, threshold)` — same fuzzy pipeline against any custom list, used by unified search
- Expanded test suite from 18 → 40 tests covering aliases, prep-word stripping, measurement prefixes, and cross-language matching

### Q2 — AddMeal unified search + multi-add
- New `src/features/food/utils/unified-search.ts`: cross-source search merging fuzzy dict results + recipe title search, single ranked array, deduplicates by id
- Added 16-test suite for unified search covering cross-source results, edge cases, empty sources
- `AddMeal.tsx`: replaced tab-scoped simple `.includes()` with `unifiedSearch` — typing now searches ALL sources (dictionary + recipes) regardless of active tab; OFF API search fires for any query ≥ 3 chars; fixed `apiResults` type from `any[]` → `OFFResult[]`

### Q3 — Batch cooking suggestions + weight refinements
- New `BatchCookingSuggestions.tsx`: wires `analyzeBatchCooking()` (previously unconnected) into a collapsible plan-tab card showing shared base ingredients, recipes per session, estimated time saved, and day abbreviations
- `Cocina.tsx` plan tab: renders `<BatchCookingSuggestions>` above the planner when opportunities exist
- `Progress.tsx`: weight log form now includes optional note field (saved to `WeightEntry.note`); added targetWeight progress bar showing % toward goal using `userProfile.targetWeight`
- i18n: batch cooking keys (`batchTitle`, `batchDesc`, `batchTimeSaved`, `batchTip`) + weight note placeholder + target progress label in ES + EN

## [1.5.2] - 2026-04-14

### Documentation and agent workflow
- Replaced the old agent-type-only `AGENTS.md` with a universal multi-agent entrypoint for Codex, Claude, Gemini, Cursor, Windsurf, ChatGPT-style workflows, and local model setups
- Added `docs/ai/` as the shared, versioned context layer for project map, workflow, current state, skills, handoffs, AI boundaries, and tool compatibility
- Reduced `CLAUDE.md` to a thin adapter and added `GEMINI.md`, `.gemini/settings.json`, `.cursor/rules/`, and `.windsurf/rules/` so tool-specific context stays aligned without duplicating the repo rules
- Reworked the local Claude skills so they write shared memory back into the repository instead of depending on private home-directory memory as the source of truth

## [1.5.1] - 2026-04-14

### Deployment hardening
- Unified Gemini calls behind the shared client/proxy layer so AI Coach, recipe import, and photo recognition can all use the Supabase `gemini-proxy` in production
- Extended `supabase/functions/gemini-proxy` to accept rich `contents` payloads, including image inputs for Gemini Vision flows
- Updated env and quickstart docs to reflect the production-safe Gemini setup

## [1.5.0] - 2026-04-08

### Infrastructure
- **i18n system**: ES/EN with auto system-language detection, instant runtime switching
- **Extracted `useLocalStorageState` hook** to `src/hooks/useLocalStorageState.ts`
- **Nutrition utilities** (`src/utils/nutrition.ts`): Mifflin-St Jeor TDEE, macro splits by goal, food quality rating
- **Gamification utilities** (`src/utils/gamification.ts`): streak calculation, 14 badges, 6 levels, points system
- **Correlation engine** (`src/utils/correlations.ts`): Pearson coefficient, tag-wellbeing correlations, time patterns, trend detection, smart insights

### Navigation Restructure (spec v6 aligned)
- Bottom nav: **Hoy | Cocina | + FAB | Explorar | Mas**
- **Cocina** with sub-tabs: [Recetas] [Plan] [Lista] + collections filter + recipe counter (X/30)
- **Explorar** with sub-tabs: [Recetas] [Creadores] [Social]
- **Mas** menu: Diario Real Feel, Ayuno, Challenges, AI Coach, Perfil, Ajustes, RIAL+

### New Screens (8)
- `Cocina.tsx` - Unified recipes/plan/list with collections
- `Creadores.tsx` - Creator profiles with verified badges, followers
- `RealFeelDiary.tsx` - Real Score 0-100, Recharts area chart, correlations, timeline
- `FastingTimer.tsx` - SVG circular timer, 4 protocols (16:8/18:6/20:4/OMAD), history
- `ImportRecipeURL.tsx` - URL input, AI extraction simulation, ingredient review (check/warning)

### New Components (4)
- `RealFeelInline.tsx` - Post-meal 5-emoji check-in with tags, auto-dismiss 60s
- `BarcodeScanner.tsx` - html5-qrcode camera + Open Food Facts API + manual fallback
- `EmptyState.tsx` - Reusable empty state component
- Language switcher in Settings (ES/EN with flags)

### Enhanced Screens
- **Home**: i18n, real streak from data, Planificado Hoy with 1-tap log, Training Day toggle, Real Feel inline trigger, Smart Insight cards (protein, hydration, variety, streak)
- **Profile**: Level system, 14 badges grid, streak counter, body data, points progress bar
- **Settings**: Language switcher (ES/EN), i18n labels
- **Onboarding**: 5-step wizard (Goal -> Body data -> TDEE calculation -> Restrictions -> Ready)
- **CreateModal (FAB)**: 6 actions (Registrar, Crear Receta, Importar URL, Tolerancia, Publicar, Barcode)
- **RecipeDetail**: Food quality badge (green/yellow/red with emoji)
- **AddMeal**: Real barcode scanner, food quality emoji, i18n

### Dependencies Added
- `html5-qrcode` - Barcode/QR scanning via device camera

### Files Summary
- **19 new files** created
- **15 existing files** modified
- **2 locale files** (ES + EN, ~300 keys each)
- **3 utility modules** (nutrition, gamification, correlations)
