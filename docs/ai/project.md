# RIAL Project Map

## Product summary
RIAL is a mobile-first nutrition product that combines tracking, recipes, meal planning, wellness logging, social features, and creator flows in one app.

## Current stack
- Frontend: React 19 + TypeScript + Vite
- Styling: Tailwind CSS 4 + design tokens in `src/index.css`
- Native shell: Capacitor
- Backend and cloud functions: Supabase
- Runtime AI inside the app: Gemini through local dev keys or the Supabase `gemini-proxy`
- Monitoring and subscriptions: Sentry and RevenueCat

## Repository structure
- `src/`
  - `config/`: routes and environment access
  - `components/`: layout, shared UI, feedback
  - `contexts/`: app state, navigation, theme
  - `features/`: domain-first feature modules
  - `i18n/`: locale files and provider
  - `lib/`: shared utilities and Supabase client
  - `types/`: typed domain models
- `supabase/`
  - `functions/gemini-proxy/`: production-safe Gemini proxy
- `docs/`
  - core human docs plus `docs/ai/` for shared agent context
- `.claude/skills/`: Claude-local skills aligned to repo-owned memory

## Key docs
- Architecture: `docs/ARCHITECTURE.md`
- Contributing: `docs/CONTRIBUTING.md`
- Business and logic rules: `docs/RULES.md`
- Legacy Claude skill notes: `docs/SKILLS.md`
- Change history: `CHANGELOG.md`
- Competitive baseline: `docs/market/` — índice, fichas deep-dive, matriz features, UX patterns, rankings (no auto-cargado — consultar por demanda)

## Design System
- Spec: `docs/DESIGN-SYSTEM.md` — tokens, themes, do/don't
- Primitives index: `docs/PRIMITIVES.md` — canonical components with minimal examples
- New-screen checklist: `docs/NEW-SCREEN-CHECKLIST.md` — mandatory for each new screen
- ADRs: `docs/adr/` — versioned architectural decisions (ADR-001 through ADR-007)
- Audit origin: `docs/DESIGN-AUDIT-2026-04-16.md`
- Guardrails in CI: ESLint `no-restricted-syntax` rules (design-system guardrails), `npm run check:i18n`, and three convention tests under `src/test/conventions/`

## Commands
- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npx tsc --noEmit`

## Release and deployment context
- Release branch line: root `main`
- Push target: `rial-food` remote to `novara-bbs/Rial-food.app`
- Do not push to `origin` unless the user explicitly asks
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`

## Environment contract
- Client env:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SENTRY_DSN`
  - `VITE_RC_APPLE_API_KEY`
  - `VITE_RC_GOOGLE_API_KEY`
  - `VITE_GEMINI_API_KEY` for local-only direct Gemini development
- Server-side secret:
  - `GEMINI_API_KEY` in Supabase Edge Functions

## Current architecture notes
- Navigation is state-based, not React Router.
- App state is centered in `AppStateContext` and local persistence helpers.
- User-facing text should remain bilingual through the custom i18n layer.
- AI features in production should prefer the Supabase proxy over browser-shipped secrets.
