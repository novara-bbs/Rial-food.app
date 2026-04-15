# RIAL - Nutrition Platform

> Real nutrition. Real recipes. Real community.

RIAL is a mobile-first nutrition platform that combines tracking, recipes, meal planning, wellness logging, social community features, and creator workflows in one app.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run lint` | Run the TypeScript no-emit check |
| `npm run test` | Run the Vitest suite |
| `npm run build` | Build production assets into `dist/` |
| `npm run check` | Run TypeScript plus tests |
| `npm run cap:sync` | Build web assets and sync Capacitor |

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 + design tokens |
| Native shell | Capacitor |
| Backend | Supabase |
| Runtime AI | Gemini via local dev key or Supabase proxy |
| Monitoring | Sentry |
| Subscriptions | RevenueCat |

## Repository Shape

```text
src/
  config/
  components/
  contexts/
  features/
  hooks/
  i18n/
  lib/
  types/
supabase/
  functions/
docs/
  ai/
.claude/
  skills/
```

## Core Docs

| Document | Purpose |
| --- | --- |
| `AGENTS.md` | Universal repo entrypoint for development agents |
| `docs/ai/README.md` | Shared multi-agent context map |
| `docs/ai/project.md` | Stable project architecture and deployment map |
| `docs/ai/workflow.md` | Collaboration, verification, and documentation workflow |
| `docs/ai/state.md` | Current release snapshot and active risks |
| `docs/ai/skills.md` | Repo skills and cross-tool capability mapping |
| `docs/ai/handoffs.md` | Partial-memory handoff template and task log |
| `docs/ai/boundaries.md` | Separation between development AI and product AI |
| `docs/ai/compatibility.md` | Tool compatibility for Codex, Claude, Gemini, Cursor, Windsurf, and local models |
| `docs/ARCHITECTURE.md` | System architecture reference |
| `docs/CONTRIBUTING.md` | Development workflow and contribution checklist |
| `docs/RULES.md` | Business rules and product logic |
| `CHANGELOG.md` | Release history |

## Multi-agent setup

This repo now uses a layered approach:
- `AGENTS.md` is the universal first read for any coding agent.
- `docs/ai/` is the shared, versioned memory for deep project context.
- `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, and `.windsurf/rules/` are thin adapters for specific tools.

This keeps cross-tool guidance synchronized while avoiding large duplicated prompts.

## AI boundary

There are two separate AI systems in this repository:
- Development AI used to build and maintain the codebase
- Product AI used inside the shipped app, such as AI Coach, recipe import, and photo recognition

The shared docs in `docs/ai/` are only for development agents. They are not runtime prompts for end-user features.

## Deployment notes

- Release work should target `rial-food/main`.
- The active Vercel project is `rial.app.v1.5`.
- Production-safe Gemini usage should go through `supabase/functions/gemini-proxy`.
- Do not commit secrets into tracked config.

## License

Private / Confidential - RIAL 2026
