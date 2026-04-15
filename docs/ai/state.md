# RIAL Current State

Last updated: 2026-04-15

## Release snapshot
- Root branch: `main` (clean, no open PRs)
- Release remote: `rial-food` (worktree remote: `origin`)
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`

## Recent merged commits (Rial-food.app main)
- `6f7bcc3` `feat(sprint-q11): Progress UX consolidation — 2 tabs, unified modal, timeline+calendar, seed data`
- `1824bae` `feat(sprint-q10): BodySnapshot type, Progress tabs, photo timeline, measurements`
- `94b16f7` `feat(sprint-q9): avatar upload, GlobalHeader fix, hydration/movement goal editors`
- `f933347` `feat(sprint-q8): ProgressPreviewCard — sparkline, 7d delta, goal bar, quick-log, deep-link`
- `a9d2ec3` `feat(sprint-q7): unified weight flow — single handler, onboarding seed, Settings sync`
- `ab34efa` `feat(sprint-q5): Lighthouse/PWA audit — A11y form labels, nav aria, manifest dedup`
- `ea9108b` `docs(ai): update Q4 commit hash in state.md`
- `9554b9c` `feat(sprint-q4): A11y nested-button fix, day i18n, weight entries list`
- `deef2ed` `feat(sprint-q3): batch cooking UI, weight note + target progress, i18n, type fix`
- `133e68e` `feat(sprint-q2): AddMeal unified search + OFFResult type fix`
- `1659206` `feat(sprint-q1): fuzzy ingredient matching v2 — aliases, prep-strip, measurements`

## Quality baseline (2026-04-15)
- TypeScript: 0 errors (`npx tsc --noEmit`) — verified after each of Q7–Q10
- Tests: 370/370 unit tests passing — 7 new tests in Q7 (weight-handlers); vitest.config .claude/** exclude prevents worktree bleed
- E2E: fixed after Sprint P (regex matched Spanish `"Entendido, continuar"`; webServer now `vite preview` in CI)
- Build: main app chunk 284 KB raw / 56 KB gzip (recharts + react-markdown deferred)
- Lint: 0 errors

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
- **Q6** — Supabase integration (gated — see feature-freeze gate above): apply migration → expand SyncKey per audit (now includes `BodySnapshot.photoUrl` photos → Storage bucket) → wire `syncOnSignIn`/`pushToCloud` in AppStateContext → `useSupabasePersistence` toggle in SettingsSystem → E2E with real Supabase project

## When to update this file
- A release line or deployment target changes
- A new agent workflow becomes part of normal practice
- A new active risk appears or is resolved
- A stable project decision affects how future agents should operate
