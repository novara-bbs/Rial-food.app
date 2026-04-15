# RIAL Current State

Last updated: 2026-04-15

## Release snapshot
- Root branch: `main` (clean, no open PRs)
- Release remote: `rial-food`
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`

## Recent merged commits (Rial-food.app main)
- `3369b50` `feat(sprint-o): Supabase migration, WeeklyReview, 5 test suites, a11y + bundle v2`
- `dd085b8` `perf + refactor: AppStateContext memoization, lazy seeds, Settings/RecipeDetail splits`
- `d8bb14e` `refactor(recipes): extract NutritionBar, SubstitutionPicker, DaySelectorSheet`
- `080c5d6` `refactor(settings): split Settings.tsx into 4 focused section components`
- `a1b620e` `fix: route Gemini features through Supabase proxy`

## Quality baseline (2026-04-15)
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Tests: 325/325 passing (`npx vitest run`) — 5 new suites added in Sprint O
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

## Current risks to watch
- Supabase DB migration not yet applied to remote project (apply before backend features land)
- `useSupabasePersistence` flag not wired in Settings UI (add toggle in SettingsSystem)
- WeeklyReview has no Sunday trigger/notification yet (manual navigation from More menu only)
- vendor-recharts chunk is 102 KB gzip — acceptable but worth monitoring

## Next sprint candidates
- P1: Apply Supabase migration + wire `useSupabasePersistence` flag in SettingsSystem
- P2: Auth flow (Login/Signup screens already exist + routed, wire to Supabase auth)
- P3: WeeklyReview Sunday trigger (service worker notification + Home card)
- P4: Lighthouse audit (target: Performance ≥ 85, A11y ≥ 95, PWA ≥ 90)

## When to update this file
- A release line or deployment target changes
- A new agent workflow becomes part of normal practice
- A new active risk appears or is resolved
- A stable project decision affects how future agents should operate
