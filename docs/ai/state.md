# RIAL Current State

Last updated: 2026-04-17 (post-merge with rial-food/main)

## Release snapshot
- Root branch: `main` (merged with `rial-food/main` — 3 local commits + 2 upstream commits reconciled in a single merge commit)
- Release remote: `rial-food` (worktree remote: `origin`)
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`
- **Governance (2026-04-17):** work directly on `main`. No feature branches, no worktrees going forward. Reconcile in-flight divergence by merging directly into `main`.

## Recent merged commits (Rial-food.app main)
- `(pending merge commit)` `merge: reconcile Q14/Q15.5/walkthrough with sprint-q/sprint-q18`
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

## Quality baseline (2026-04-17)
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Tests: 481/481 unit tests passing (measured 2026-04-17 post-walkthrough) — Q13 added 64 (streaks, week-stats, weight-trend), Q14 added 40 (demo-personas shape + correlation integration), Q15.5 added 32 convention tests (`primitives-export`, `design-tokens`, `sectioncard-usage`), plus 20 from in-progress working-tree changes
- i18n symmetry: **1428** keys aligned ES ↔ EN (`npm run check:i18n`) — post-merge (merges walkthrough's +3 keys with upstream's `weekly.{dayHeaders,mealCount,daysLogged,historyTitle,writeFromProgress,thisWeekTitle,body,nutrition,fats,mealDot,rfDot,wellbeing,wellbeingTitle,reflectionTitle,noReflections,viewHistory,topCorrelations,viewDiary,topMeals,viewAllRecipes}`)
- Design-system lint: 0 errors, **~972** warnings (was 1016 pre-walkthrough; -44 via NutritionHero redesign + WeeklyCheckIn/WeeklyReview Q16 pilot migrations)
- Build (measured 2026-04-16 via `npm run build`):
  - main entry (resolved from `dist/index.html`): **751 KB raw / 234 KB gzip**
  - vendor-recharts: 331 KB raw / 100 KB gzip
  - total dist/assets/*.js: 2641 KB raw / 751 KB gzip
  - _(Prior state.md claimed 284/56 for the main chunk — that was one of several `index-*.js` feature chunks, not the true entry. Current numbers are from `dist/index.html` resolution.)_
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
- Archived product/market docs: `docs/archive/` (not loaded by agents)

## Current risks to watch
- Supabase DB migration not yet applied to remote project (intentionally deferred — apply only after features stable)
- `useSupabasePersistence` flag not wired (intentionally deferred — full Supabase sprint after feature-complete)
- vendor-recharts chunk is 102 KB gzip — acceptable but worth monitoring
- Challenges/Creadores card divs still have onClick (complex to fix: nested buttons → needs restructure)
- **SyncKey covers ~10 of ~35 localStorage keys** — see audit below. Gap must be resolved in Supabase sprint (Q6).
- **CSP header pending (Q17)** — `vercel.json` now ships HSTS + X-Frame + nosniff + Permissions-Policy + Referrer-Policy, but Content-Security-Policy is deferred until all third-party sources are audited (Supabase, Sentry, Google GenAI, RevenueCat, recharts).
- **Q14 + Q15.5 + walkthrough + Q16 pilot work uncommitted** — three logical chunks divergent from `main`. Recommended commit strategy before Q15: (a) `feat(sprint-q14)` — audit polish + multi-ICP seed, (b) `feat(sprint-q15.5)` — design-system remediation (tokens, primitives, ADRs, guardrails), (c) `feat(design-audit)` — walkthrough findings + Q16 pilot migrations. Keeps `git log` legible and makes per-wave revert possible.
- **~415–440 `text-[Npx]` + 93 SectionCard dup occurrences post-merge** — walkthrough pilot cleared 30 `text-[Npx]` and 50 SectionCard shapes (baselines 445→415 / 134→84). Merge with upstream then added 9 SectionCard shapes (4 new wellness components + rewritten Progress/WeeklyCheckIn) raising SectionCard baseline to **93**. `text-[Npx]` count needs re-measurement post-merge. Q16 codemod sprint drains the rest; new files error immediately via ESLint allowlist.
- **Top `text-[Npx]` offenders for Q16:** `RecipeDetail` (25), `CreateRecipe` (24), `AddMeal` (15), `Planner` (15), `SettingsProfile` (15). Distribution: 30× 8px, 155× 9px, 200× 10px, 27× 11px, 3× 12px.
- **Top SectionCard shape offenders for Q16:** `SettingsProfile` (11), `BarcodeScanner` (9), `Onboarding` (6), `ImportRecipeURL` (6), `RealFeelDiary` (6).

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
- **Q15** — ICP-adaptive Progress widgets (Clara/Marcos/Ana persona switches show/hide widget types) + before/after photo compare (Timeline tab, use `BodySnapshot.photoUrl` pairs) + remove deprecated `calculateStreak()` (callers already migrated to `calcStreaks` via Q13 — sweep for stale imports) + custom body measurements (extend `BodySnapshot` with user-defined metric definitions).
- **Q16** — Codemod sprint. Scope: remaining **415 `text-[Npx]`** + **84 SectionCard shape** occurrences. Plan: jscodeshift transform with literal→token map (7-10px→`text-micro`, 11px→`text-caption`, 12px→`text-label`, 13px→`text-body-sm`, 14px→`text-body`, 16px→`text-body-lg`, 18px→`text-title-sm`, ≥24px→`text-title`/`text-headline`/`text-display` with per-file review). For SectionCard: AST match on the regex shape, infer `title`/`icon`/`padding`/`spacing` props from surrounding JSX, per-file snapshot test to verify no visual diff. Prioritize top offenders (see "Current risks"). Success = `eslint.config.mjs` allowlist empty, `sectioncard-usage.test.ts` baseline = 0 (then delete the test), ESLint warnings = 0.
- **Q17** — Security + responsive hardening. (1) CSP header in `vercel.json` (deferred from Q15.5) — audit third-party origins: Supabase, Sentry, Google GenAI, RevenueCat, recharts CDN, Capacitor bridges. (2) WCAG AA contrast fix on `theme-orange-light` (`on-surface-variant` 4.4:1 → ≥4.5:1). (3) Responsive tablet/desktop breakpoints — audit `PageShell` variants and current `sm:/md:` usage; promote layouts that rely on mobile-only heuristics.
- **Q6** — Supabase integration (gated — see feature-freeze gate above): apply migration → expand SyncKey per audit (now includes `BodySnapshot.photoUrl` photos → Storage bucket) → wire `syncOnSignIn`/`pushToCloud` in AppStateContext → `useSupabasePersistence` toggle in SettingsSystem → E2E with real Supabase project.

## When to update this file
- A release line or deployment target changes
- A new agent workflow becomes part of normal practice
- A new active risk appears or is resolved
- A stable project decision affects how future agents should operate
