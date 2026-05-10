# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-05-10** — `[1.5.216]` Sprint D2 — typed analytics helpers + 5 funnel checkpoints + SEO noscript.

## Release snapshot
- **Branch**: `main`, synced con `rial-food/main` (CI green S39; S40–S60 queued).
- **This session (2026-05-10, Sprint D + D2 [1.5.215–216])** — distribución largo plazo:
    - **[1.5.216]** — Sprint D2: 11 typed `track.*` helpers en `analytics.ts` (per-event property contract enforced by TS). 5 funnel checkpoints instrumentados en single-source-of-truth points: `Onboarding.handleFinish` (onboardingComplete), `meal-handlers.logMealNow` (mealLogged source=planner), `CreateRecipe.handleSave` (recipeCreated), `AICoach.handleSend` (aiCoachUsed), `BarcodeScanner.lookupBarcode` (barcodeScanned con outcome). `<noscript>` SEO fallback en index.html con H1 keyword-rich + feature list. 14 tests nuevos `analytics.test.ts`. Todos los `track.*` siguen no-op hasta VITE_POSTHOG_KEY → activación inmediata cuando owner añada la env var. Tests 1739 → **1753**.
    - **[1.5.215]** — Sprint D: SEO meta (Twitter Card, JSON-LD WebApplication, canonical, og:url/site_name), `public/robots.txt` + `sitemap.xml`, `APP_URL` en brand.ts, `analytics.ts` stub (PostHog), `POSTHOG_KEY` en env.ts, `initAnalytics()` en main.tsx, `check:i18n` + `cap sync android` añadidos a CI. Tests 1739/1739.
- **This session (2026-05-08, Sprint A+B+C cleanup [1.5.212–214])** — refactor quirúrgico tras decisión de no reescribir desde cero:
    - **[1.5.214]** — Sprint C invariants hardening: `screen-size.test.ts` umbral 600→550 LoC. Allowlist vacío. 4 regression guards per-file para los splits de Sprint A (RecipeDetail ≤550, Home ≤450, NutritionDetail ≤250, Progress ≤400). Bundle weight ya bien optimizado (Capacitor plugins dynamic-importados, lucide chunked, recharts/markdown lazy en 21 rutas) — sin cambios. Tests 1735 → **1739** (+4 guards).
    - **[1.5.213]** — Sprint B dead-code sweep: 2 huérfanos eliminados (`FeedTabs`, `LatestReflectionCard`), `ChipRow icon` variant deprecada removida (~38 LoC), `SmartInsightCard.icon` prop deprecada removida. Nuevo `scripts/check-i18n-orphans.mjs` + `npm run check:i18n:orphans` advisory. **35 i18n keys huérfanos eliminados**: `home.kcalBreakdown.*` (8) + `wellness.weeklyReview.*` (27). 2199 → **2164 keys**. Tests 1735/1735.
    - **[1.5.212]** — 5 monstruos > 500 LoC descompuestos en hooks puros + componentes pequeños sin cambios funcionales:
        - `NutritionDetail.tsx` 512 → **186** (6 tabs a `components/nutrition-detail/` · `Translations` reemplaza `I18nT=any` · descubierta latencia `t.home.hydration.electrolytes` faltante, añadida key)
        - `Progress.tsx` 560 → **325** (`useProgressData` + `useReflectionForm` hooks · `BienestarCard` + `TopMealsCard`)
        - `Home.tsx` 640 → **416** (`useHomeData` hook con 14 useMemos · `GuidedSetupSection`)
        - `RecipeDetail.tsx` 708 → **502** (`useRecipeCalculations` hook · `RecipeCreatorAttribution` + `RecipeCommunityStats`)
        - `AppStateContext.tsx` 644 → **286** (`AppStateContextType` interface a `types/app-state.ts` · `useSupabaseSync` + `useDemoSeedHandlers` hooks)
    - Convention test `screen-size.test.ts` allowlist limpiado (RecipeDetail/Home estaban listadas a 692/670 LoC). Ahora vacío — cualquier nuevo archivo > 600 LoC falla CI inmediatamente.
    - Tests 1727 → **1735** passing (124 files). i18n 2186 → **2199** keys ES↔EN simétricos. 0 TS errors.
- **Previous session (2026-05-02/03, S62–S78 — Home redesign C–K-fix5 [1.5.193–1.5.209])**:
    - **[1.5.209]** — Sprint K-fix5: refactor profundo de la card de actividad. (1) **Fórmulas calóricas reales**: nuevo `activity-calories.ts` con `kcalFromSteps` (`pasos × 0.0005 × peso × sexFactor`) y `kcalFromExercise` (`MET × peso × min/60 × sexFactor`). MET estándar Compendium (3/6/9). Sex factor `male=1.0/female=0.95`. (2) **`workoutMinutes`** añadido a MovementState con migración defensiva. (3) **`StepsLogSheet`** nuevo: BottomSheet con slider 0–30k + presets + kcal preview. (4) **`ExerciseLogSheet`** rediseñado: tier picker + stepper minutos + presets 15/30/45/60/90 + preview con fórmula visible. Signature `onSelect(intensity, minutes)`. (5) **`HealthAndExerciseCard`**: 2 secciones (Pasos + Deporte) sin sub-headings, info icons `ⓘ` con fórmula explicada para el perfil del user. Eliminado: badge "420 min", chips nudge, branch connect-health. (6) **Home.tsx**: `exerciseCalories = kcalFromSteps + kcalFromExercise` (los pasos también suman ahora). i18n +18 keys (2168→2186). **+36 tests netos · 1712/1712 · 121 files**.
    - **[1.5.208]** — Sprint K-fix4 tras screenshot owner sobre TodaysMeals: (1) **"Log it" button outline pill** — el button del item planificado seguía con `variant="default"` (negro contra negro). Cambio a `variant="outline" size="pill"` matching HealthAndExerciseCard. (2) **Meta tipografía coherente** — items del plan + log: `text-micro uppercase tracking-widest` → `font-body text-label normal-case tracking-normal`. 12px mixed-case en lugar de 10px uppercase forzado. (3) **"Plan semanal" link** raw `<button>` → `<Button variant="ghost" size="pill">` para coherencia con otros CTAs. (4) **Línea vertical lateral** decorativa del item plan eliminada (ruido visual sin valor). **1676/1676 tests · 2168 keys**.
    - **[1.5.207]** — Sprint K-fix3 tras screenshot owner: (1) **Workout CTA legible** — texto "+ Registrar entrenamiento" → "Registrar" (ES) / "Log" (EN). Variant `default | ghost` → `outline` siempre. Resuelve el bug de "botón negro sin texto visible" causado por texto demasiado largo + conflictos cn() entre variant default y size pill. (2) **RealFeel BottomSheet popup** — nuevo `RealFeelSheet.tsx` (BottomSheet `size="focus"`) reemplaza la card in-flow. `RealFeelInline` recibe prop `bare` para omitir su chrome cuando se embebe en sheet. Trigger 3s post meal-log preservado, auto-dismiss 60s preservado. **1676/1676 tests · 2168 keys**.
    - **[1.5.206]** — Sprint K-fix2: (1) **Typography sweep** — 27 overlines en 10 archivos cambian de `text-micro` (10px, ilegible) a `text-label` (12px, sweet spot). Sweet spot: K4 lo había roto a 14px (demasiado grande), [1.5.205] lo revirtió a 10px (demasiado pequeño), ahora 12px. Patrón canónico: `font-label text-label font-bold uppercase tracking-widest`. (2) **HealthAndExerciseCard layout unificado** — eliminadas sub-secciones MOVIMIENTO/ENTRENAMIENTO con headings; ahora son 3 rows verticales (steps/connect, workout, nudges) sin headings internos. Workout row siempre visible (antes solo cuando connected). Nudges en single-row horizontal con 4 chips inline (en lugar de grid 2×2 con sub-headings). Avatares unificados `w-10`. Tooltip ⓘ movido junto al título del workout. **1676/1676 tests · 2168 keys**.
    - **[1.5.205]** — Sprint K-fix tras feedback owner: (1) **Revert sweep K4** — el sweep convirtió 26 ocurrencias `text-micro` (10px) → `<Heading level="h4" variant="overline">` que aplicaba `text-body` (14px). Resultado: labels overline (RESTANTES/HOY/META/etc.) 40% más grandes. Revert a spans explícitos en 9 archivos (EnergyArcCard, MacroRingsCard, MealGapSuggestion, NutritionHero, NutritionHeroRing, ProgressPreviewCard, TodaysMeals, HealthAndExerciseCard, HydrationCard). Import `Heading` removido de 3 archivos. (2) **HealthAndExerciseCard rediseñada** — header sin icon ruidoso, divisor único `/20` entre sub-secciones, avatares unificados `w-10`, nudges +500/+1000/+10m/+30m migrados de `<Button>` a `<StatusChip tone="neutral" onClick>`, CTA disconnected reformateada al patrón flex compact (avatar + text + Button pill) idéntico al Entrenamiento. Jerarquía tipográfica limpia (overline span + body bold value + body micro hint). i18n: +1 (`connectCta`) → 2168 keys. **1676/1676 tests · 119 files**.
    - **[1.5.204]** — Sprint K: (1) **HealthAndExerciseCard** — fusiona `ExerciseInteractiveCard` + `ActivityRow` en un solo card con sub-secciones "MOVIMIENTO" + "ENTRENAMIENTO". Util `movement-calories.ts` (single source of truth para passive kcal, evita doble conteo). (2) **HydrationCard** — extrae inline hydration SectionCard a componente standalone con glass SVG icons + `<Button size="icon-sm">` para +/−. Hidratación reposicionada justo después de Macros+Calidad. Banner "TU PROGRESO" (duplicado) eliminado. (3) **`<Button size="pill">`** — `TodaysMeals` "Log it" migrado a `Button size="pill"` (Button adoption allowlist 3→2). (4) **Overline sweep** — 7 archivos, ~20 reemplazos `font-label text-micro uppercase tracking-widest` → `<Heading level="h4" variant="overline">`. (5) **Orphans eliminados**: `DailyBalanceCard.tsx`, `TodayCategoryChips.tsx` + test, `useChipScrollSpy.ts`. **+11 tests netos · 1676/1676 · 119 files**.
    - **[1.5.203]** — Sprint J: (1) **Exercise intensity tiers** — nuevo `ExerciseLogSheet` BottomSheet con 3 niveles (Moderado/Medio/Intenso → 150/300/500 kcal). `ExerciseInteractiveCard` refactored: prop `intensity: ExerciseIntensity` (none/moderate/medium/intense), tap → abre sheet, info `i` con popover tap-to-reveal explicando extras. Util `exercise-intensity.ts` con type + constants + adapters legacy. (2) **Audit fixes**: RDA tables extraídas a `data/rda.ts`, sodium magic factor `× 400` → `SALT_TO_SODIUM_MG_FACTOR`, fiber default `?? 30` → `DEFAULT_FIBER_TARGET_G`. (3) **TodaysMeals "LOG IT"** normalizado a pill style. (4) **NutritionDetail Vitaminas/Minerales** — banner SmartInsight neutral. 22 i18n keys nuevas → 2157. **+14 tests netos · 1665/1665 · 118 files**.
    - **[1.5.202]** — Sprint I — visual fixes tras prueba en preview con screenshots anotados: (1) **MacroRingsCard** — `%` centrado verticalmente (wrapper exterior `items-center` + interior `flex items-baseline` mantiene superscript-alignment). (2) **EnergyArcCard whitespace** — SectionCard `padding="lg"` → `md`, `gap-3` → `gap-1`, `pt-8` → `pt-6`, **viewBox `200×200` → `200×130`** (recorta 35% bottom vacío), aspect `[10/7]` → `[20/13]`. (3) **FoodQualityCard body** — `grid grid-cols-2` → `space-y-2.5` (single column) — el 2-col causaba label truncate ("Fi…") + chip overflow en col derecha. (4) **NutritionDetail Calidad tab** — herencia automática del fix anterior. Sin cambios i18n. **1651/1651 · 2140 keys**.
    - **[1.5.201]** — Sprint H+ tras feedback owner sobre la imagen completa de Home: (1) **EnergyArcCard sin título** — eliminado `<Heading>ENERGÍA</Heading>` (auto-explicativo); "1155" agrandado con `clamp(3.5rem, 14vw, 5.5rem)` para llenar el espacio blanco interno; stats Hoy/Del día/Meta alineados con extremos del arco (5% padding lateral, items-start/center/end). (2) **ExerciseInteractiveCard NEW** — reemplaza DailyBalanceCard. 2 estados: idle (¿Has hecho deporte? / Registrar) y active (Has quemado X kcal / Editar). Tap toggles `isTrainingDay`. Disabled en past-day. (3) **Macros + Calidad mergeados** en un solo SectionCard. Nueva prop `bare?: boolean` en MacroRingsCard y FoodQualityCard que skip el SectionCard wrapper. Hairline divider entre las dos secciones. Macros pierde el título (implícito). Calidad mantiene expandible + CTA centered. (4) i18n: -1 (energyArc.title) +7 (exerciseCard.*) → 2140 keys. **+8 tests · 1651/1651**.
    - **[1.5.200]** — (revertido en [1.5.201]) Title "ENERGÍA" arriba del gauge + chips removidos.
    - **[1.5.199]** — Sprint G — PDF reference visual coherence (`Container - HOME HOY.pdf`). Scope confirmado: solo gauge/macros/calidad. Cambios: (1) **EnergyArcCard revert** — sin título, transparent (revert [1.5.198]); pct% `text-primary` → `text-on-surface`. (2) **SmartInsightCard revert** — icon-circle → dot leading (revert [1.5.197]). (3) **MacroRingsCard** typography: número + % superscript en spans separados. (4) **QualityMetricRow simplificado** — drop icon (Leaf/Candy/etc.) + drop mini progress bar; layout `<dot> <label> <value> <chip>`; props `icon/fillPct/direction` removidos. (5) **FoodQualityCard** — title `variant="overline"` → mixed-case (`normal-case tracking-normal` override); body single-col → `grid grid-cols-2`; CTA `justify-end` → `justify-center`. (6) i18n: eliminado `home.energyArc.title` → 2133 keys. (7) +5 tests Sprint G. **1636/1636 · 2133 keys · 907.7 KB raw**.
    - **[1.5.198]** — Visual coherence sweep tras feedback owner sobre HTML reference: EnergyArcCard recibe `<Heading variant="overline">` "ENERGÍA" arriba (igual que BALANCE/MACROS/CALIDAD); SectionCard pierde el `bg-transparent` para igualar surface con cards hermanas. MacroRingsCard pasa de 4 anillos a **3 anillos** (Carbos/Proteína/Grasas) — fibra se queda en FoodQualityCard donde ya estaba como métrica `encourage`. Grid `grid-cols-4` → `grid-cols-3`. +1 i18n key (energyArc.title), +1 test EnergyArcCard title, +1 test MacroRingsCard fiber-absent. **2134 keys · 1631 tests**. *(EnergyArcCard title revertido en [1.5.199] tras nueva referencia PDF.)*
    - **[1.5.197]** — Sprint F: design polish incremental sobre las 6 cards nuevas + NutritionDetail. EnergyArcCard: remaining/arc/needle cambian a `text-error` cuando `consumed > target`. FoodQualityCard: score ring + número usan color dinámico (primary ≥70 / tertiary 40-69 / error <40). TodayCategoryChips: active `bg-primary text-on-primary`. MacroRingsCard: porcentaje usa `var(--color-macro-{key})`. QualityMetricRow: icono semántico (primary=good, error=high, primary/60=in-progress). SmartInsightCard: icono en círculo limpio. SummaryTab: tiles rediseñados (valor+unidad en línea, icono neutro). +3 tests. 1630/1630.
    - **[1.5.196]** — Sprint E: `NutritionDetail.tsx` reescrito como 7-tab screen (Resumen/Macros/Calidad/Vitaminas/Minerales/Hidratación/Rendimiento). `NutritionRow.tsx` primitivo para vitaminas/minerales. `nutrition-detail-nav.ts` util aislado (fast-refresh safe). Tab Calidad abre directamente desde "Ver nutrición total →" via `setNutritionDetailInitialTab('quality')`.
    - **[1.5.195]** — Sprint D: `FoodQualityCard.tsx` + `QualityMetricRow.tsx` — card expandible con score ring SVG, 6 metrics con mini-bar + StatusChip. `computeDailyQuality` memoizado en Home.tsx. Reemplaza placeholder sr-only. 12 tests. `DailyLogLike.macros` widened con `& Record<string, unknown>`.
    - **[1.5.194]** — Sprint C4/5: SmartInsightCard, DailyBalanceCard, MacroRingsCard wired en Home. Convention tests actualizados (screen-size allowlist + SmartInsightCard action button reclasificado).
    - **[1.5.193]** — Sprint A/B (sesión anterior): tipos (B5/B7/chloride/chromium/molybdenum/processingLevel), `daily-quality.ts` (6 métricas + badge zones), `gauge-arc.ts`, `EnergyArcCard`, `TodayCategoryChips`, `useChipScrollSpy`, `homeGaugeV2` flag, 114 i18n keys (2019→2133).
- **Previous session (2026-05-01, S59–S61 — MealGap rework [1.5.183–1.5.185])**:
    - **[1.5.185]** — Sprint C — projected gap. New `projectedConsumed()` util.
    - **[1.5.184]** — Sprint B — personalization scorer pipeline + RAG-ready architecture.
    - **[1.5.183]** — Sprint A — MealGapSuggestion rework + dedupe lock. Tests 1484 → 1487.
- **Previous session (2026-05-01, S54–S58 — MVP cleanup [1.5.176–1.5.181])**:
    - **[1.5.181]** — ADR-012 typography sweep complete: 342 → **0 warnings**. Raw `text-xs/sm/base/lg/xl/2xl/3xl/4xl` and raw `<hN>` tags replaced with semantic tokens (`text-micro`, `text-body-sm`, `text-body-lg`, `text-title-sm`, `text-title`, `text-headline`, `text-display`) and `<Heading>` primitive across ~35 files.
    - **[1.5.180]** — FeatureErrorBoundary adoption complete: `profile` y `settings` cases wrapeados en App.tsx. 7 surfaces aisladas total (home/cocina/explore/more/recipe-detail/profile/settings).
    - **[1.5.180]** — FeatureErrorBoundary adoption complete: `profile` y `settings` cases wrapeados en App.tsx. 7 surfaces aisladas total (home/cocina/explore/more/recipe-detail/profile/settings).
    - **[1.5.179]** — img-onerror batch 3 (final): 19 social+wellness files. Baseline cleared to empty — nuevas violaciones fallan CI inmediatamente sin allowlist.
    - **[1.5.178]** — img-onerror batch 2: 10 recipe components (AuthorAttributionCard overlay ×2, CookMode, HeroGallery ×2 con reordering de atributos, MediaLightbox, PhotoUploader, VideoSection, CreateRecipeStep3/4, RecipeOverviewTab overlay, RecipeDetail ×2). Baseline: 28→18.
    - **[1.5.177]** — img-onerror batch 1: 5 food/home/planner/profile files (overlay pattern para avatars: letter/icon siempre renderiza, img se superpone absolutamente + oculta en onError). Baseline: 33→28.
    - **[1.5.176]** — Seed recipes (46 entries) migradas `img:` → `image:` canonical; workaround `?? recipe.img` eliminado. FeatureErrorBoundary wired en 4 tabs (home/cocina/explore/more); crash en un tab ya no mata la app. `handleErrorReset` callback nombrado compartido.
- **Previous session (2026-05-01, S52–S53 — home resilience [1.5.175])**:
    - **Refactor** `[1.5.175]` — Sprint largo de resiliencia tras dos bugs P0 reportados sobre `[1.5.174]`: imágenes de "What you need today" no se veían (seed recipes con `img:` legacy, MealGapSuggestion mapeaba `image: recipe.image`); LOG IT en planificado rompía la pantalla y "Reintentar" quedaba muerto (handler sin try/catch + mutación de localStorage previa al render + ErrorBoundary que solo limpiaba flag). **Phase A**: `MealGapSuggestion.tsx:150` → `image: recipe.image ?? recipe.img`. Nuevo `<RecipeImage>` (`src/components/ui/RecipeImage.tsx`) con onError + ChefHat/emoji fallback, adoptado en `RecipeCard` y `TodaysMeals` thumb. `createHandleLogMealNow` con try/catch global, valida meal shape, filtra `recipeIngredients` corruptas, valida macros finitas antes de mutar state, clampea servings inválidos a 1, surfacea `toast.error` y captura a Sentry. **Phase B**: `ErrorBoundary` rewrite — i18n vía wrapper funcional, 3 acciones (Reintentar soft con cap MAX=2 / Volver al inicio invocando onReset / Recargar app), disclosure colapsable error.message, contexto Sentry enriquecido. `<FeatureErrorBoundary>` primitivo wrapper para feature-scope. App.tsx wires `onReset = setIsCreateModalOpen(false) + navigateTo('home')`. Nuevo namespace `errors.*` (9 keys × 2 = 18) → 1998 → 2007 keys. **Phase C (defensive sweep)**: `safeSumMacros` util coerciona NaN/Infinity/undefined a 0, adoptado en `TodaysMeals` diary totals. `confirmEdit` con guards `?? 0` y factor-finite. `HomeQuickStats` non-null assertions reemplazadas por destructuring tras early-return. `NutritionHero` macroProgress con guard `target > 0`. **Phase D**: tests 1436 → 1464 (+28). Convention test `img-onerror` baseline-locked con 33 archivos pre-existing.
- **Previous session (2026-05-01, S51 — home polish [1.5.174])**:
    - **Refactor** `[1.5.174]` — StatusChip primitivo nuevo (6 tones token-pure) unifica 4 estilos ad-hoc de chips. HomeHeader Streak chip, RealScoreBadge, DayStatusChip, HomeQuickStats todos migrados. Hydration chip eliminado de QuickStats (dedup con SectionCard). MealGapSuggestion carousel peek-mode (`basis-[42%] -mx-6 px-6`), macros compactos, "LOG IT" → ChevronRight icon. TodaysMeals h2/h3 → Heading (ADR-012), 🍽️ fallback. ActivityRow oculta steps/progress cuando disconnected. QuickActions envuelto en SectionCard (ADR-001). Convention tests actualizados.
- **Previous session (2026-04-30, onboarding polish PRs 1-4 + refactor + GDPR fix + UI normalize)**:
    - **Refactor** `[1.5.173]` — Pasada de consistencia visual sobre los 9 steps tras feedback owner. **Tipografía**: 3 patrones de "label inline" (`font-label text-micro uppercase tracking-widest` raw, `Text variant="micro"`, `Heading variant="overline"`) unificados a un único patrón body-sm/caption + font-medium/semibold lowercase. Toca: NumberStepper (label + alineación `items-baseline` → `items-center`, input `text-title-sm font-bold` → `text-body-lg font-semibold tabular-nums`), IdentityStep (nameLabel + sexLabel), OnboardingProgressSummary (chip `Text micro` → `caption`, `h-5 px-2` → `h-6 px-2.5`), PlanRevealStep (dailyKcal), KcalBreakdownCard (breakdownTitle + Total + attribution rows). **ActivitySlider**: sin `min-h-[5rem]` (clipeaba examples largos), tick labels lowercase, `text-balance`. **Step 4+5 merge**: `TrainingStep.tsx` eliminado, su SegmentedTabs Yes/No vive ahora en ActivityStep bajo un divisor. STEP_ORDER 9 → 8, PROGRESS_TOTAL 8 → 7, FIELD_TO_STEP.trains → 'activity', validators quita case training. i18n keys intactas. **DoneStep declutter**: era muy parecido a PlanReveal (mostraba SectionCard kcal + protein redundante) → ahora hero + título + restrictions snapshot. Tests 1436 → 1435 (−1: validators it.each pierde 'training'). Size 894.4 → 893.9 KB raw / 281.7 → 281.6 gzip.
    - **Fix** `[1.5.172]` — GDPR consent reubicado: del modal bloqueante al primer launch al patrón inline-on-action (Instagram/TikTok). El `<GdprConsent>` BottomSheet aplicaba `inert`/`aria-hidden` a `#root` vía Radix Dialog portal, dejando el `<Onboarding>` (z-[100]) inerte y bloqueando el botón "Empezar sin registrarme". **Cambios**: `recordConsent` exportado; cableado a los 4 handlers de WelcomeStep (Apple/Google/Email/Guest) — la microcopy `t.onboarding.welcome.legal` ya estaba renderizada bajo los botones. Defensive call en `Onboarding.handleFinish`. App.tsx limpio (drop showConsent + render del modal); backfill silencioso para usuarios pre-existentes (`!isFirstTime && !hasGivenConsent()`). **Auditoría arreglada**: `isPersistedDraft()` ahora valida `stepId ∈ STEP_ORDER`; HealthSyncCard `useId` + `aria-describedby={hintId}` en el toggle role=switch. Tests 1436/1436 · size 894.4 KB raw / 281.7 KB gzip.
    - **Refactor** `[1.5.171]` — Cleanup quirúrgico tras los 4 PRs. **Nuevos módulos**: `state/taxonomies.ts` (ACTIVITY_LEVELS / GOAL_IDS / SEX_IDS / DIET_IDS + DietId, single source of truth) y `utils/copy.ts` (interpolateName / resolveDietLabel / pickPrimaryLabel / mapErrorKeyToCopy / buildSummary, helpers puros tipados con Translations). **Onboarding.tsx 313 → 291 LoC** (−7%): borra helpers inline, useMemo summary reducido a 1 línea, constantes timing nombradas (DRAFT_DEBOUNCE_MS, RESUME_BANNER_MS). **PlanRevealStep**: `KCAL_RANGE_PERCENT = 0.05` con JSDoc reemplaza magic 0.95/1.05. **DoneStep**: inline diet resolver → resolveDietLabel. **interpolateName** sustituye 3× duplicación del patrón name-fallback (Body/PlanReveal/Done). **JSDoc top-of-file** en 7 steps (Body/Identity/Goal/Activity/Training/Diet/Done). **useHealthData**: doble-negativo limpio. **Tests +9**: ActivitySlider, HealthSyncCard, OnboardingProgressSummary (3 casos cada uno). Cero cambios funcionales · cero cambios i18n. Tests 1427 → 1436 · size 895.8 KB raw / 282.0 KB gzip.
    - **PR 4** `[1.5.170]` — INDYA polish: ActivitySlider (drag, coloquial example, 4 ticks), OnboardingProgressSummary chips in header (completed steps, aria-hidden), PlanReveal kcal range ±5%, KcalBreakdownCard attribution microcopy. i18n +9 keys → 1998 total. Tests 1427 · size 895.6 KB raw.
    - **PR 3** `[1.5.169]` — Apple Health / Health Connect stub inline en BodyStep: `useHealthData()` hook (available:false en web; ?onb-health-mock=on para QA), `HealthSyncCard` toggle (role=switch, BottomSheet privacy, shadow-elev-1), BodyStep pre-fill useEffect + toast.error. i18n +9 → 1989 keys. Bundle budget ajustado 280→290 KB gzip. Tests 1427.
    - **PR 2** `[1.5.168]` — WelcomeStep auth landing: 3 CTAs OAuth (Apple/Google/Email) gateados por `isSupabaseEnabled`, "Continuar sin cuenta" ghost, legal microcopy, footer oculto en welcome. `STORAGE_KEYS.PENDING_ONBOARDING`. Fix `Sidebar.tsx` key eliminada. i18n −2 +9 → 1980.
    - **PR 1** `[1.5.167]` — 7 fixes: pt-safe header, pb-safe-nav footer (notch/DI), submitAttemptedFor per-step (errores silenciosos), STEP_INDEX_MAP O(1), NumberStepper defaultValue + useEffect, copy normalization, orphan keys −5 → 1975, PlanReveal text-headline, auto-focus, IdentityStep error fix. Tests +5 → 1427.
    - **Sprint 51 polish** `[1.5.166]` — 7 mejoras: `INITIAL_DRAFT.sex = 'male'`, `IdentityStep` cleanup, `WelcomeStep` sr-only, `KcalBreakdownCard` signed field, `NumberStepper` ref fix, resume banner, validator tests actualizados. Tests 1422/1422.
    - **Sprint 51** `[1.5.165]` — **Rediseño completo del onboarding** basado en INDYA + best-practices. Nuevo feature module `src/features/onboarding/`. Backend: `onboardingReducer` puro + 7 actions, `validateStep` puro per-step, `derive-targets.ts` wrapper único sobre `nutrition.ts`, `persist.ts` con schema-version-gated localStorage (resumable mid-flow + cleanup atómico). Frontend: 9 pasos one-question-per-screen (Welcome → Goal → Identity → Body → Activity → Training → PlanReveal → Diet → Done), `<NumberStepper>` y `<TogglePillGroup>` primitivas nuevas (≥44px tap, token-pure, aria-pressed/role=group), `useCountUp` hook (counter-up del kcal target con `prefers-reduced-motion`), `useFocusTrap` hook (sin dep externa). Shell con `aria-modal/labelledby`, sticky CTA con label dinámico, chunked progress bar 8 segmentos, mid-flow confirmation con `{name}`. Palette saca del onboarding (queda en Settings). i18n nuevo namespace `onboarding.*` ES+EN simétrico (1980 keys), `profile.onboarding.*` eliminado. Tests 1368 → 1422 (+54: 19 reducer + 21 validators + 16 derive). Eliminados 3 ficheros viejos en `profile/components/` (−616 LoC). Pipeline verde, build sin regresión (884.2 KB raw).
- **Previous session (2026-04-30, S49–S50 — home polish)**:
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
- **Active plan**: distribución largo plazo. Sprints A+B+C (limpieza) + D (SEO/analytics/CI) completos. Siguientes: Supabase activación (owner action) → PostHog activación (1 env var) → Astro landing page SEO.
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-Sprint-D2 [1.5.216], 2026-05-10)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **1753/1753** passing (125 files)
- i18n symmetry: **2164** keys aligned ES ↔ EN
- Bundle: **915.5 KB raw / 288.5 KB gzip** main entry (within budget 920/290)
- Analytics: typed event API ready, 5 funnel checkpoints instrumented (no-op until VITE_POSTHOG_KEY set)
- Design-system lint: **0 errors, 0 ADR-012 warnings** (full sweep complete [1.5.181]; K4 overline sweep extends coverage)
- **img-onerror baseline: 0** — all 34 pre-existing offenders migrated in S54–S56; new violations fail CI immediately
- Raw branded `<button>` count: **1** (TodaysMeals only, inline edit-confirm w-8)
- Build main: 913.3 KB raw / 287.7 KB gzip (budget 920/290 → OK); total gzip 900.8 KB (budget 920 KB → OK)
- Button adoption allowlist: **2 entries** (TodaysMeals edit-confirm + HealthSyncCard switch track)
- `Recipe.tag` typed: **`string` → `FoodTag`** (S37, fixes EN filter regression)
- **`any` sweep** substantially complete: ~38 residual intentional any in production code — all documented. Categories: browser API workarounds (wakeLock, AudioContext, import.meta), i18n missing-key casts `(t as any)`, legacy archive format, `MealPlan = Record<number, any[]>`, pre-existing contract mismatches (eslint-disabled), migration code, untyped library (html5-qrcode).
- `AppStateContextType` interface: **0 `any` types** (Sprint 4 ✓); `recipeToEdit: Partial<Recipe>|null` (Sprint 26 ✓)
- **Handler + util files**: 78 `any` → 0 (Sprints 5-9); screens/components Sprints 19-28.
- `LoggableMeal`: canonical `src/types/food.ts`. `PostComment.createdAt`: added to type. `FastingEntry`, `ExtractedRecipeData`, `PickedRecipe`: new local interfaces. `DailyLogEntry`: typed in useDailyReset/top-meals. `UserProfile`: imported in weight-handlers (no more `[key:string]:any`). Test fixtures: `as unknown as UserProfile` casts for partial mocks.
- Build main: size:check PASS — main entry 895.8 KB raw / 282.0 KB gzip (budget 920/290).
- **AppStateContext**: 1075 → 584 lines (-46%), composer of 8 domain hooks.
- **RecipeDetail**: 1066 → 678 lines (-36%), composer of 7 detail components.
- **CreateRecipe**: 1052 → 460 lines (-56%), 5 step components in `components/create/`.
- **BarcodeScanner**: 823 → 378 lines (-54%), 4 sub-components in `components/barcode/`.
- **AddMeal**: 714 → 422 lines (-41%), 5 sub-components in `components/add-meal/`.
- **i18n locales**: 4506 → 23 domain files via codemod (onboarding.ts namespace added S51). **1998 keys total** (post-PRs 1-4).
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

## Next sprint candidates (ordered by long-term impact)
- ~~**Sprints A+B+C+D**~~ ✓ — limpieza completa + distribución básica.
- **🔴 Owner action requerida ahora**: activar Supabase en producción (~1h):
  1. `supabase db push` (applies `001_initial_schema.sql`)
  2. Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to Vercel project env vars
- **🟠 PostHog analytics** (~1 día): `npm install posthog-js` → uncomment block en `src/lib/analytics.ts` → add `VITE_POSTHOG_KEY` in Vercel. La infraestructura ya está lista.
- **🔴 SEO / páginas públicas** (~3-5 días): Astro mini-site para landing + recetas públicas. Mayor impacto en user acquisition. Requiere Supabase activado primero para endpoint `isPublic=true`.
- **Q6-B** — Recipe photo migration to Supabase Storage bucket `recipe-photos` + RLS.
  Unblocks sync for recipes with multi-media photos. Medium complexity, deferred.
- **Phase 2 Home** — chips → bottom sheets (Hydration slider in-place); ADR-009 V3 justification per chip. Deferred.
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
