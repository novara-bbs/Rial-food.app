# RIAL Current State

Last updated: 2026-04-16

## Release snapshot
- Root branch: `main` (clean, no open PRs)
- Release remote: `rial-food` (worktree remote: `origin`)
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`

## Recent merged commits (Rial-food.app main)
- `(pending)` `feat(sprint-q): Progress tab restructure — score ring, components, 5 bug fixes`
- `88b64bc` `fix(e2e): fix CI E2E failures — consent selectors + vite preview in CI`
- `83e6c49` `feat(sprint-p): WeeklyReview Sunday home card + a11y AvatarRing button`
- `fb5e062` `docs(ai): update state.md with Sprint O results and next sprint roadmap`
- `6075a36` `docs(v1.5.2): multi-agent context system — shared docs/ai/, thin tool adapters`

## Quality baseline (2026-04-16)
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Tests: 325/325 passing (`npx vitest run`)
- Build: passing (main app chunk stable)
- Lint: 0 errors (440 pre-existing `any` warnings, unchanged)

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
- Supabase DB migration not yet applied to remote project (intentionally deferred — apply only after features stable)
- `useSupabasePersistence` flag not wired (intentionally deferred — full Supabase sprint after feature-complete)
- vendor-recharts chunk is 102 KB gzip — acceptable but worth monitoring
- Challenges/Creadores card divs still have onClick (complex to fix: nested buttons → needs restructure)

## Supabase integration strategy
Infrastructure is prepared (`migration SQL`, `sync.ts`, `AuthContext`, auth screens). Full wiring intentionally deferred until:
1. All major features complete and data model frozen
2. Dedicated "Sprint Supabase": apply migration + wire sync in AppStateContext + Settings toggle + E2E test

## Next sprint candidates
- R1: Feature completeness — C3 (ImportRecipeURL deeper ingredient parsing), D (AddMeal unified search + multi-add)
- R2: Feature completeness — E (batch cooking/leftovers v0 rule ports), custom weight refinements
- R3: A11y — Challenges/Creadores card restructure, remaining icon-only button audit
- R4: Lighthouse/PWA (Performance ≥ 85, A11y ≥ 95, PWA ≥ 90) — after features land
- Supabase (last sprint): migration → sync wiring → Settings toggle → E2E

## When to update this file
- A release line or deployment target changes
- A new agent workflow becomes part of normal practice
- A new active risk appears or is resolved
- A stable project decision affects how future agents should operate
