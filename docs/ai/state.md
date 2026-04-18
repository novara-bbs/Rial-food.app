# RIAL Current State

Last updated: 2026-04-19 (PR 6c Bevel staged — WeeklyInsight A1 goalType hardening + BeforeAfterCompare B13 delta-color/B8 auto-seed/B4 scrollable picker/B7 log-CTA + docs pass `[1.5.39]`; PR 6.5 shipped at `4e3840b`)

## Release snapshot
- Root branch: `main`, HEAD `4e3840b` (PR 6.5 Bevel selective migrations, in sync with `rial-food/main`). PR 6c + docs pass `[1.5.39]` staged on working tree.
- **PR 6c staged (2026-04-19).** Refinement of shipped PR 6a (`cb674b9` WeeklyInsightsCard) + PR 6b (`d9d7b77` BeforeAfterCompare). Re-review after ship surfaced 5 issues — 2 real bugs (A1 + B13) + 3 polish (B8/B4/B7). Write set: (1) `utils/week-insights.ts` — `trendMatchesGoal()` unknown-goal fallback changed from `Math.abs(deltaKg) >= 0.1` to `false`; adherence ≥ 70 is the only path to `positive` tone when `goalType` is missing (prevents "Good week" on ambiguous +0.5 kg drift). Docstring updated with "unknown → never" clause. (2) `components/BeforeAfterCompare.tsx` — rewrite via Write tool adding `deltaColorClass(delta, goalType)` exported pure helper (loss+drop/gain+rise → `text-primary` desired; opposite → `text-brand-secondary` undesired; maintain or zero-delta → `text-on-surface-variant` neutral), auto-seed `{before: photos[0], after: photos[N-1]}` on mount so viewing branch is 1-tap, `useEffect` re-seed if pair becomes invalid, picker grid gets `max-h-[60vh] overflow-y-auto scrollbar-thin` container, not-enough branch renders optional `<Camera/> Registrar foto` CTA when `onLogSnapshot` prop wired (min-h-11 HIG pill), 3 branches share extracted `exitButton` JSX. New exports: `CompareGoalType`, `deltaColorClass`. New props: `onLogSnapshot?`, `goalType?`, `copy.notEnoughCta?`. (3) `components/BodyTimeline.tsx` — prop passthrough (`goalType`, `onLogSnapshot`, `copy.notEnoughCta`) to `<BeforeAfterCompare>`. (4) `screens/Progress.tsx` — pass `goalType={(userProfile as any)?.goalType}` + `onLogSnapshot={() => openWithDate()}` to `<BodyTimeline>` history sub-tab. (5) i18n: +1 key `compareNotEnoughCta` × ES/EN ("Registrar foto" / "Log photo"). 1560 → **1561** symmetric. (6) Convention tests: +1 assert in `week-insights.test.ts` locking A1 (undefined goalType + drift ≥ 0.1 + adherence < 70 → `tone: 'neutral'`); +4 asserts in `BeforeAfterCompare.test.ts` locking `deltaColorClass` semantics. Preflight green: tsc 0, lint 0, tests 645 → **651** (+6 total incl. PR 6.5's actionSlot-min-width assert), i18n **1561**, build + size:check PASS. Preview verified with `goalType='gain'` seed: delta `-1.4 kg` pints `text-brand-secondary` (undesired for a gainer). CHANGELOG `[1.5.40]`.
- **Docs pass `[1.5.39]` staged (2026-04-19).** Triggered by owner question "¿dónde más afectan estos pop-ups de casi toda la pantalla? p.ej. el diario diario, ventanas de métricas". Exhaustive audit of 18 RIAL surfaces that occupy total-or-partial screen area — radix `Dialog` modals + manual `fixed inset-0` overlays + full-screen routes — classified HIGH / MEDIUM / LOW / STAY with surface-by-surface rationale. Formalized a **5-criteria decision framework** a reviewer can apply in order to pick between `<BottomSheet>`, `<ConfirmDialog>`, route + `<PageShell>`, or full-screen overlay. **HIGH migration candidates**: `SnapshotDetailModal` (`Dialog` → `focus + title-centered`) + `GdprConsent` (manual overlay → `compact + title-centered`) — both 0-risk. **MEDIUM**: `BarcodeScanner` result panel (split camera viewport + sheet), `ImportRecipeURL` (conditional), `DailyCheckIn` (conditional). **STAY justified** for 13 surfaces including `MediaLightbox`, `CookMode` (WakeLock), `StoryViewer` (auto-advance), `ConfirmDialog`, `Onboarding` (first-run), `CreateRecipe`/`CreatePost`/`CreateStory`/`AddMeal` (forms > 3 sections), `WeeklyCheckIn`, `Progress` (bottom-nav tab), `RealFeelDiary` ("diario diario" — module not action; Bevel IMG_0973 confirms diary-as-tab). Criterion 5 ("form with > 3 semantic sections → route") formalizes why complex creators don't wrap in sheets (avoid scroll dual). Docs only — no code. CHANGELOG `[1.5.39]`.
- **PR 6.5 — `4e3840b`** (shipped, in sync with `rial-food/main`). Selective migrations of existing `<BottomSheet>` consumers to ADR-009 V2 `size` + `headerLayout` variants. Audit rule: only consumers whose content matches the `focus`/"work on something" intent migrate; the rest stay `compact`. Selective migrations of the existing `<BottomSheet>` consumers to ADR-009 V2 `size` + `headerLayout` variants. Audit rule: only consumers whose content matches the `focus`/"work on something" intent migrate; the rest stay `compact`. Migrations: (1) `RecipePicker.tsx` — `size="focus"` (keyboard-first search + list, IMG_1004 pattern); header stays `title-centered` because the flow is pick-and-close. (2) `LogSnapshotModal.tsx` — `size="focus" + headerLayout="cancel-action"`; Save button migrated from footer to `actionSlot` as text button, Cancel migrated to header via native radix Close; the `footer` prop is dropped entirely. Stay-compact: `PortionSheet`, `PublishRecipeSheet`, `CreateModal`. Primitive bug fixed en-passant: `actionSlot` wrapper `w-11 h-11` → `min-w-11 h-11` (preserves HIG 44×44 minimum, lets text buttons auto-size). Convention test `bottom-sheet.test.ts` +1 assertion. `Check` import removed from `LogSnapshotModal`. CHANGELOG `[1.5.38]`.
- **PR 7 — `0e11fe0`** (shipped, in sync with `rial-food/main`). `<ConstantTile>` biometric tile primitive per ADR-009 V2 §4.10. Distinct from `StatTile` — built around 6 canonical states (`loading`, `empty-no-template`, `empty-no-data`, `value-stable`, `value-trending-up`, `value-trending-down`) that reflect biometric reality (not-tracked / tracked-but-no-data / data-with-or-without-trend). Added: `src/components/ConstantTile.tsx` (default export + `ConstantTileState` type, anatomy §4.10: `aspect-[1.2/1]`, `rounded-sm`, `bg-surface-container-low`, icon 16px + label uppercase 11px `tracking-widest`, hero `text-title-sm` bold, color map up→`text-brand-secondary` / down→`text-primary` / stable→`text-on-surface-variant`; `copy` prop for default override; `data-state` attr; renders as `<button>` when `onClick` provided) + `src/features/wellness/utils/body-constants.ts` (`computeBodyConstants(snapshots, heightCm, unitSystem)` — 14-day window via `pickReference` nearest-to-target sample, DST-safe `T12:00:00` anchor; thresholds 0.5 kg / 0.2 BMI / 0.5 pp fat / 1 cm girths; unit-aware via `bodyWeightFromKg`) + `src/features/wellness/components/BodyConstantsGrid.tsx` (presentational 2-col grid; icons `Scale`/`Calculator`/`Percent`/`Ruler`) + `src/test/conventions/constant-tile.test.ts` (static file-read pattern matching `bottom-sheet.test.ts` — ~26 assertions across 7 describe blocks: module surface, 6 canonical state branches, empty copy distinction, anatomy invariants, trend semantics, interactive HIG). `Progress.tsx` Body → Summary mounts `<BodyConstantsGrid>` inside `<SectionCard title="Constantes">` below `<RitmoSection>`. `eslint.config.mjs` adds `ConstantTile.tsx` to the primitive-shape-exception block alongside `SectionCard.tsx` + `surface.ts`. i18n +11 keys × 2 locales under `t.progress.constants.*`. `PRIMITIVES.md` gets `ConstantTile` table entry + 3 minimal examples + 6-state anatomy table. CHANGELOG `[1.5.37]`. No migrations of `StatTile` call-sites — the two primitives coexist without overlap.
- **PR 6b — `d9d7b77`** (shipped, in sync with `rial-food/main`). `<BeforeAfterCompare>` photo comparator inside `<BodyTimeline>` closes the MacroFactor/Yazio/Cronometer market gap (side-by-side progress-photo compare with weight delta + days). Added: `src/features/wellness/components/BeforeAfterCompare.tsx` (3-branch state machine: not-enough → picker → viewing), `BeforeAfterCompare.test.ts` (6 assertions on `daysBetweenISO`, including DST-boundary safety via midday anchor). Wiring: `BodyTimeline.tsx` gains "Comparar" pill-chip next to filter chips (only visible with ≥2 photos, `aria-pressed` toggle); `Progress.tsx` adds `shareComparePair(before, after)` that delegates to canonical `handleShareProgress({ snapshot: after, referenceSnapshot: before })` — feed post cards already compute delta + sinceDate from reference, so zero plumbing in `PostCard`. i18n +11 keys × 2 locales. Graceful-degradation: timeline falls back to `onShare(after)` when consumer doesn't wire `onShareCompare`. Transient pair state (not persisted). CHANGELOG `[1.5.36]`.
- **Playbook re-audit** (`4ffc989`, docs-only): re-read 64 Bevel captures on 2026-04-18 and surfaced patterns the original PR 1 playbook missed — notably the second sheet typology (`focus` at 92vh for forms/searches/keyboard-first/detail-edit, distinct from `compact` at 88vh for pickers). Playbook §2 matrix grew by 12 rows; §3 catalog now covers 64/64 captures with detailed annotations for IMG_0953/4/6/7/8, 0962, 0993, 1011, 1015, 1016, 1019; §4.4.a NEW (dual typology), §4.10 NEW (ConstantTile primitive with 6 canonical states), §4.11 NEW (Onboarding primitives). Roadmap §5 expanded from 4 to 9 PRs.
- **PR 6a — `cb674b9`** (shipped, in sync with `rial-food/main`). `WeeklyInsightsCard` narrative weekly recap (Yazio/Noom gap identified in `feature-matrix.md`). Sits above Progress tabs, complements raw `WeeklyScoreCard` stats with a "how's your week going" synthesis. Added: `utils/week-insights.ts` (`buildWeekInsight` synthesizer: tone `positive` when trend aligns with `goalType` OR adherence ≥ 70, `neutral` otherwise, `lowdata` when `daysLogged < 3`; chips trend/streak/top-meal with template interpolation for `{{name}}`; unit-system agnostic via `formatWeightDelta` callback) + `utils/top-meals.ts` (canonical aggregator extracted from `Progress.tsx`) + `components/WeeklyInsightsCard.tsx` (presentational; returns null on empty) + `utils/week-insights.test.ts` (9 assertions covering tone selection, chip composition, template interpolation). i18n +8 keys × 2 locales (`weeklyInsights`, `weekInsightPositive/Neutral/LowData/LowDataWithName` with `{{name}}` templates, `trendChip`, `streakChip`, `topMealChip`). `Progress.tsx` refactored to call `calcTopMeals` shared util + mount `<WeeklyInsightsCard>` above sub-tabs.
- **PR 6 — `6eed7fa`** (shipped, in sync with `rial-food/main`). `<BottomSheet>` V2 — non-breaking extension of the primitive at `src/components/ui/bottom-sheet.tsx`. New props: `size: 'compact' | 'focus'` (default `compact`; `focus` = `max-h-[92vh]`), `headerLayout: 'title-centered' | 'cancel-action' | 'back-title-action'` (default `title-centered`; the two new ones render "Cancel" text button left or back chevron left for Bevel IMG_1004/1015 patterns), `hideHandle: boolean` (default `false`; hides the swipe pill for keyboard-first IMG_1011 or navigation-stack IMG_1016), `leftSlot: ReactNode` escape hatch (IMG_1015 tri-column trash + title + add). `cancelLabel` / `backLabel` / `onBack` for i18n + handler overrides. New exports: `BottomSheetSize` + `BottomSheetHeaderLayout` types. `data-size` + `data-header-layout` attributes on `SheetPrimitive.Content` for introspection. Convention test `bottom-sheet.test.ts` expanded from 10 → 25 assertions. `PRIMITIVES.md` updated with 3 examples + size + header layout tables. ADR-009 gains a **V2 addendum**. CHANGELOG `[1.5.35]`. No consumer migrations in PR 6 — deferred to PR 6.5+.
- Previous HEAD `8c86b40` (in sync with `rial-food/main`): PR 5 Bevel — 7d EMA weight-trend overlay (MacroFactor/Yazio semantics, `EMA_ALPHA_7D ≈ 0.0943`, half-life-7) + Progress Body sub-tabs (Summary/History/Calendar via `SegmentedTabs`). `weight-trend.ts` extends `WeightTrend` with `emaSeries`/`currentEma`/`emaWeekDelta`; `WeightTrendCard` rewritten with simpler API + 3-layer SVG; convention test `weight-ema.test.ts` (8 assertions) locks the smoothing contract.
- Previous HEAD `4622f76` (in sync with `rial-food/main`): PR 4 Bevel sheet migrations — `LogSnapshotModal` (radix `Dialog` → `<BottomSheet>` + footer + sub-HIG fix), `RecipePicker` (raw-div → `<BottomSheet>`, API conditional-mount → controlled-open), `CreateModal` (radix `Dialog` → `<BottomSheet>`), `ShareSheet.tsx` deleted (0 consumers).
- Previous HEAD `18938a6`: PR 3 of the Bevel adoption roadmap + Más/Perfil/Ajustes navigation reorg (same screens touched by both, shipped together). PR 3 rewrites theme system to **`{palette, mode}` state machine** with 4 palettes (`volt` · `ocean` · `ember` · `neutral`) × 3 modes (`auto` · `light` · `dark`). NEUTRAL is the new Bevel-inspired palette (warm neutrals, emerald accent). `mode: 'auto'` subscribes to `matchMedia('(prefers-color-scheme: dark)')` and swaps class at runtime. Legacy `rial-theme` values migrated automatically to `rial-theme-v2`. Default for new users: `{palette:'neutral', mode:'auto'}`. 2-section Settings picker rewritten (Paleta grid 2×2 + Apariencia segmented control). Onboarding step 5 simplified to 4-tile palette (mode stays auto). Reorg ships hero card + 4 semantic groups (Nutrición/Bienestar/Creador-conditional/Cuenta) in More, dual gear+item entry to Settings, `SegmentedTabs` Perfil/Comida/Tema/Sistema in Settings, Dialog-confirmed logout in Profile, Social Links relocated SettingsSystem→SettingsProfile inside SectionCard. i18n 13 theme keys + 15 reorg keys × 2 locales (1499 → 1523, net +24 after dropping 4 orphans). Convention test `theme-palettes.test.ts` locks the 8 CSS classes + pure helpers (14 assertions). Q16-B2 baseline preserved: **SectionCard-shape drift = 0**; **ESLint Q16 allowlist = 5 files** (shadcn/ui only).
- Release remote: `rial-food` (worktree remote: `origin`)
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`
- **Governance (2026-04-17):** work directly on `main`. No feature branches, no worktrees going forward. Reconcile in-flight divergence by merging directly into `main`.

## Recent commits on `main` (in sync with `rial-food/main` at `4e3840b`)
- `4e3840b` `feat(ui): PR 6.5 Bevel — selective <BottomSheet> V2 migrations (focus + cancel-action)`
- `0e11fe0` `feat(wellness): PR 7 Bevel — <ConstantTile> biometric primitive + Progress Body Summary grid`
- `d9d7b77` `feat(wellness): PR 6b Bevel — BeforeAfterCompare photo comparator inside BodyTimeline`
- `6eed7fa` `feat(ui): PR 6 Bevel — <BottomSheet> V2: focus size variant + 3 canonical header layouts`
- `cb674b9` `feat(wellness): WeeklyInsightsCard — narrative weekly recap (Yazio/Noom gap)`
- `4ffc989` `docs(market): Bevel playbook re-audit — focus sheet variant + ConstantTile + Onboarding primitives + PR 6-9 roadmap`
- `8c86b40` `feat(wellness): PR 5 Bevel — 7d EMA weight-trend overlay + Progress Body sub-tabs`
- `4622f76` `feat(ui): PR 4 Bevel sheet migrations — CreateModal + LogSnapshotModal + RecipePicker + ShareSheet dead-code purge`
- `18938a6` `feat: PR 3 Bevel theme (4 palettes × 3 modes) + Más/Perfil/Ajustes reorg`
- `e848e86` `docs(state): post-push snapshot — PR 2 Bevel BottomSheet primitive shipped`
- `82d73f8` `feat(ui): BottomSheet primitive (ADR-009) + 2 consumer migrations (PortionSheet + PublishRecipeSheet)`
- `cc2a30b` `docs(design): Bevel playbook + ADR-008 (pricing) + ADR-009 (bottom-sheet anatomy)`
- `dc9731d` `docs(state): Q16-B2 complete — SectionCard drift 22->0, allowlist 18->5 shadcn-only`
- `350662f` `refactor(q16-b2): TodaysMeals + CreatorProfile SectionCard shapes -> primitive (3 migrations)`
- `8b600c9` `refactor(q16-b2): RealFeelDiary SectionCard shapes -> primitive (6 migrations)`
- `8f48068` `refactor(q16-b2): Planner+Pantry+ShoppingList+AICoach+BarcodeScanner+Onboarding -> SectionCard/INPUT_SURFACE_CLASSES`
- `aeaee0b` `refactor(q16-b2): PostDetail + Profile SectionCard shapes -> primitive`
- `dd7cabb` `refactor(q16-b2): RialPlus SectionCard shape -> primitive`
- `14ecb8c` `refactor(q16-b2): CreatorVerification SectionCard shapes -> primitive (2 migrations)`
- `03e5c41` `refactor(q16-b2): Challenges + Discover SectionCard shapes -> primitive (3 migrations)`
- `5403567` `docs(state): post-wave snapshot — 6 commits to 088a40a, drift 41->27, allowlist 27->19`
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

## Quality baseline (2026-04-18, PR 6.5 Bevel staged — BottomSheet `focus` + `cancel-action` migrations; PR 7 shipped at `0e11fe0`)
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Tests: **646/646** expected (+1 vs PR 7 baseline — `bottom-sheet.test.ts` gains a V2 actionSlot-min-width assertion; 645 → 646)
- i18n symmetry: **1560** keys aligned ES ↔ EN (unchanged — PR 6.5 reuses `t.common.cancel` + `t.progress.save`)
- Design-system lint: 0 errors, warnings pre-existing (type-debt `no-explicit-any` + 5 intentional shadcn allowlist entries).
- Build (pending `release:preflight` for PR 6.5 — expected ±0.1 KB vs PR 7 since changes are 1-line class swap + JSX shape reshuffle):
  - main entry: ~777.6 KB raw / ~243.3 KB gzip (PR 7 baseline — no primitive additions in PR 6.5)
  - `size:check`: expected PASS
- Drift baselines (final, post Q16-B2 complete):
  - `text-[Npx]` occurrences across `src/`: **0** (Q16 B1 codemod `78786fc` eliminated all 249)
  - SectionCard shape: **0** real drift. All 22 remaining occurrences migrated across this session's commits. Only legitimate matches remain: `SectionCard.tsx` (primitive itself) + 2 helpers in `surface.ts` (INPUT_SURFACE_CLASSES / BUTTON_CARD_SURFACE_CLASSES).
  - ESLint Q16 migration allowlist: **5 files** (shadcn/ui only: `badge.tsx`, `input.tsx`, `select.tsx`, `tabs.tsx`, `textarea.tsx` — library convention, intentional, not to be removed).
  - `INPUT_SURFACE_CLASSES` helper consumers: **4** (BarcodeScanner, Onboarding, PostDetail, SettingsNutrition).
  - `BUTTON_CARD_SURFACE_CLASSES` helper consumers: **5** (BodySnapshotCard, Discover ×2, PostDetail, Profile).

## 2026-04-17/18 Bevel adoption roadmap (in progress)
Plan: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md`. Playbook: `docs/market/bevel-design-playbook.md`. Derived from 64 Bevel captures IMG_0951–IMG_1019.

- **PR 1 — `cc2a30b`** (shipped). Docs: `bevel-design-playbook.md`, `ADR-008-pricing-model.md` (free-generous core + single premium tier), `ADR-009-bottom-sheet-anatomy.md` (handle pill, max-h-88vh, rounded-t-3xl, overlay `bg-black/25`, sticky header, safe-area footer). CHANGELOG `[1.5.30]`.
- **PR 2 — `82d73f8`** (shipped). `<BottomSheet>` primitive at `src/components/ui/bottom-sheet.tsx` wrapping radix `Dialog`. Convention test `src/test/conventions/bottom-sheet.test.ts` (10 assertions locking ADR-009 defaults). 2 consumer migrations — **piloto pivot** vs plan: originally-planned `RecipeDaySelectorSheet` + `MealSlotMultiSelect` turned out to be inline components (chip groups), not real sheets. Migrated instead: `PortionSheet` (active in `AddMeal.tsx:561`) + `PublishRecipeSheet` (active in `RecipeDetail.tsx:843`). Docs: `PRIMITIVES.md` table + example updated; `primitives-export.test.ts` extended; `bevel-design-playbook.md` §4.1.a added capturing the owner directive "implantar Paleta 1 light **y dark** · unificar 6 → 3 con `prefers-color-scheme` auto-switch". CHANGELOG `[1.5.31]`. Verified via `preview_inspect` on real flows: content `max-height: 716.486px` (88% of 813.8px viewport ≈ 88vh ✓), `border-top-*-radius: 24px` ✓, overlay `oklab(0 0 0 / 0.25)` ✓, status bar + parent screen visible behind sheet.
- **PR 3 — staged (pending commit + push)**. Pivot vs plan: owner directed **4 palettes** (not 3 — VOLT preserved) + **manual mode axis** (`auto` / `light` / `dark`). Implemented as a runtime `{palette, mode}` state machine in `ThemeContext` with matchMedia listener (vs CSS `@media (prefers-color-scheme)` only). Write set: `ThemeContext.tsx` rewrite (new exports `Palette`, `ColorMode`, `PALETTES`, `COLOR_MODES`, `resolveMode`, `themeClassName`, legacy `rial-theme` → `rial-theme-v2` migration map), `src/index.css` (rename 5 classes to `theme-{palette}-{mode}` family + new `.theme-neutral-dark` + `.theme-neutral-light` blocks + EMBER polish: `--brand-secondary` amber-700→amber-600 in light, `--tertiary` pure white → stone-50 in dark), `App.tsx` (consume `themeClassName` + `resolvedMode`), `SettingsAppearance.tsx` rewrite (2-section picker: Paleta 2×2 grid with NEUTRAL first + Apariencia segmented control Auto/Light/Dark with `modeAutoHint`), `Onboarding.tsx` step 5 (simplified 4-tile picker), i18n 13 keys × 2 locales, `theme-palettes.test.ts` (14 assertions). Verified via preview: 8 combinations render correct tokens, legacy `orange-dark` migrates to `{ember,dark}`, `auto` mode resolves via matchMedia (system prefers light → `theme-neutral-light`). CHANGELOG `[1.5.32]`.
- **PR 4 — `4622f76`** (shipped). Scope pivot vs plan: audit of the 5 originally-scoped targets revealed only `LogSnapshotModal` is a real sheet; the other 4 (`PhotoUploader`/`AddMeal`/`ImportRecipeURL`/`BarcodeScanner`) are Dialog pickers / inline flows / full-screen overlays. Discovered 3 new real sheets during the audit. Write set: (1) `LogSnapshotModal.tsx` migrated to `<BottomSheet>` with `footer` slot (Cancelar/Guardar), fixed sub-HIG `w-7 h-7` → `w-11 h-11` on photo-remove button, converted `text-sm` → `text-body-sm` tokens. (2) `RecipePicker.tsx` migrated from raw `fixed inset-0 bg-background/80 rounded-t-lg max-h-[70vh]` to `<BottomSheet actionSlot={<ChefHat/>}>`; API changed `{recipes, onSelect, onClose}` → `{open, onOpenChange, recipes, onSelect}`; consumers `CreatePost.tsx` + `CreateStory.tsx` updated. (3) `CreateModal.tsx` migrated from radix `Dialog` centered-modal to `<BottomSheet>`; public API `{isOpen, onClose, onSelect}` preserved for `App.tsx` compatibility via internal `onOpenChange` mapping. (4) `ShareSheet.tsx` **deleted** (68 lines, 0 consumers — dead code since feature inception). Verified live via `preview_inspect` on real flows: all 3 report `border-top-left-radius: 24px` + `max-height: 322.8px ≈ 88vh` + overlay `oklab(0 0 0 / 0.25)` + content `y=44` (status bar visible) + zero console errors. CHANGELOG `[1.5.33]`.
- **PR 5 — `8c86b40`** (shipped to `rial-food/main`). **Scope pivot vs plan:** originally Home ring-grid consolidation (IMG_0974) behind `featureFlags.homeRingGrid`. Pivoted in execution to consolidate pre-existing uncommitted weight-EMA work the owner had in the tree — clear MacroFactor/Yazio trend-line intent that deserved a single PR. Write set: (1) `src/features/wellness/utils/weight-trend.ts` adds `EMA_ALPHA_7D = 1 − 2^(−1/7) ≈ 0.0943` + `calcEmaSeries(values, alpha?)`; extends `WeightTrend` with `emaSeries: number[]`, `currentEma: number | null`, `emaWeekDelta: number | null`. (2) `src/test/conventions/weight-ema.test.ts` (new, 8 assertions) locks `EMA_ALPHA_7D` constant, anchor-to-first-value initial condition, monotonicity preservation for monotonic input, variance reduction vs raw, half-life midpoint (step 70→72 reaches ~71 after 7 samples, tolerance ±0.1), `(1 − α)^7 ≈ 0.5`, and `calcWeightTrend` EMA fields nulling on empty input / first-value anchoring on single snapshot / positive delta on rising 14-day series. (3) `WeightTrendCard.tsx` rewrite: API `{snapshots, targetKg, unitSystem, onLog, t}` replaces legacy 11-prop inline-edit API; calls `calcWeightTrend(snapshots, targetKg ?? null)` internally; 3-layer SVG chart (faded raw path opacity 0.22 + raw dots opacity 0.5 + solid EMA stroke 2.5); action badge uses `emaWeekDelta`; stats grid **Tendencia 7d** / **Hoy** / **Cambio**; single "Registrar peso" button delegates to `onLog()`. (4) `Progress.tsx` Body tab gains `SegmentedTabs` sub-tabs `summary` / `history` / `calendar` — Summary mounts `WeightTrendCard` + `RitmoSection` + `LatestReflectionCard`; History mounts `BodyTimeline`; Calendar mounts `BodyCalendar`. Weight-log flow delegates to global `useLogSnapshot().open()` (no inline edit). (5) i18n +7 keys × 2 locales: `trend7d`, `weightRawLabel`, `trendHint`, `bodySummary`, `bodyHistory`, `bodyCalendar`, `shared`. Total 1523 → 1530 symmetric. Preflight green: tsc 0, lint 0, tests **589/589** (+9 from `weight-ema.test.ts`), i18n 1530, build + size:check PASS. CHANGELOG `[1.5.34]`. Home ring-grid consolidation deferred to PR 6.
- **PR 6a — `cb674b9`** (shipped, in sync with `rial-food/main`). `WeeklyInsightsCard` narrative weekly recap. See Release snapshot above.
- **PR 6 — `6eed7fa`** (shipped, in sync with `rial-food/main`). `<BottomSheet>` V2 — see Release snapshot above. CHANGELOG `[1.5.35]`.
- **PR 6b — `d9d7b77`** (shipped, in sync with `rial-food/main`). `<BeforeAfterCompare>` photo comparator — see Release snapshot above. CHANGELOG `[1.5.36]`.
- **PR 7 — `0e11fe0`** (shipped, in sync with `rial-food/main`). `<ConstantTile>` biometric tile primitive + Progress Body Summary grid. CHANGELOG `[1.5.37]`.
- **PR 6.5 — staged (pending commit + push)**. Selective V2 migrations of existing `<BottomSheet>` consumers. Audit of 5 callers using the ADR-009 V2 "elegir algo vs trabajar en algo" rule: only 2 match `focus`/form/keyboard-first intent. Migrations: (1) `RecipePicker.tsx` gains `size="focus"` (keyboard search + list justifies +4vh); keeps `headerLayout="title-centered"` because pick-and-close UX doesn't warrant the multi-step `cancel-action` pattern from IMG_1004. (2) `LogSnapshotModal.tsx` adopts `size="focus" + headerLayout="cancel-action"`: Save becomes a text-button `actionSlot`, Cancel becomes the native radix Close via header, `footer` prop dropped entirely. ~56px of content space reclaimed + no close-X/Cancel duplication. Stay-compact: `PortionSheet` (short picker), `PublishRecipeSheet` (1-textarea short form), `CreateModal` (FAB action grid, no input). Primitive bug fixed en-passant: `actionSlot` wrapper was `w-11 h-11` (fixed), clipping V2 text buttons like "Guardar" — changed to `min-w-11 h-11` (HIG 44×44 preserved, content auto-sizes). Convention test +1 assertion locking the min-width. `Check` import removed from `LogSnapshotModal` (orphan after text-only CTA). No new i18n keys. CHANGELOG `[1.5.38]`.
- **PR 8 (deferred)** — Home hero ring-grid consolidation behind feature flag `featureFlags.homeRingGrid` (Bevel IMG_0974 pattern). Owner directive 2026-04-18: defer until more competitor Home data is available — requires broader UX benchmarking before committing to the refactor shape.
- **PR 9 (future)** — Onboarding refactor: extract `<OnboardingScaffold>` + `<RadioCardGroup>` + `<SelectList>` primitives. See playbook §4.11.

**Governance.** Owner authorized push of PR 2, PR 3, PR 4, PR 5, PR 6, PR 6b, PR 7 via "continua" directive after green preflight. Same pattern applies to PR 6.5.

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
- ~~**SectionCard shape drift**~~ ✓ **Q16-B2 COMPLETE** — 0 real occurrences remain (72 → 41 → 22 → **0** across B1+B2). ESLint allowlist 5 files (shadcn-only, intentional). Convention test `sectioncard-usage` still enforces the guardrail for new code. `INPUT_SURFACE_CLASSES` + `BUTTON_CARD_SURFACE_CLASSES` helpers cover the two edge cases (form inputs + clickable button-cards). No further SectionCard shape migration work needed.

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
- ~~**Q16 B2**~~ ✓ **DONE** — SectionCard shape drift **72 → 0** across the full migration wave. HEAD `350662f`. `INPUT_SURFACE_CLASSES` + `BUTTON_CARD_SURFACE_CLASSES` helpers in `src/components/ui/surface.ts` cover edge-cases. ESLint allowlist: 5 shadcn-only files. Convention test `sectioncard-usage` remains as ongoing guardrail (never delete — keeps new drift at 0).
- **Q17** — Security + responsive hardening. (1) CSP header in `vercel.json` (deferred from Q15.5) — audit third-party origins: Supabase, Sentry, Google GenAI, RevenueCat, recharts CDN, Capacitor bridges. (2) WCAG AA contrast fix on `theme-orange-light` (`on-surface-variant` 4.4:1 → ≥4.5:1). (3) Responsive tablet/desktop breakpoints — audit `PageShell` variants and current `sm:/md:` usage; promote layouts that rely on mobile-only heuristics.
- **Q6** — Supabase integration (gated — see feature-freeze gate above): apply migration → expand SyncKey per audit (now includes `BodySnapshot.photoUrl` photos → Storage bucket) → wire `syncOnSignIn`/`pushToCloud` in AppStateContext → `useSupabasePersistence` toggle in SettingsSystem → E2E with real Supabase project.

## When to update this file
- A release line or deployment target changes
- A new agent workflow becomes part of normal practice
- A new active risk appears or is resolved
- A stable project decision affects how future agents should operate
