# RIAL Agent Guide

`AGENTS.md` is the universal entrypoint for development agents in this repository.
Use it as the first read whether you are working from Codex, ChatGPT, Claude Code, Gemini CLI, Cursor, Windsurf, or a local model wrapper.

## Read order
1. Read this file first.
2. Read `docs/ai/README.md` for the shared map.
3. Read the specific files in `docs/ai/` that match the task.
4. Use tool-specific adapters only when your IDE needs them:
   - `CLAUDE.md`
   - `GEMINI.md`
   - `.cursor/rules/`
   - `.windsurf/rules/`

## Project identity
- Product: RIAL, a mobile-first nutrition platform with tracking, recipes, planning, wellness, social, and creator layers.
- App stack: React 19, TypeScript, Vite, Tailwind CSS 4, Supabase, Capacitor.
- Repo mode: active production candidate on the root checkout.
- Release target: push and release from `main` to `rial-food/main` unless the user says otherwise.
- Reference-only branch line: `.claude/worktrees/sleepy-knuth` exists, but do not treat it as the release baseline unless explicitly asked.

## Repo map
- Product architecture: `docs/ARCHITECTURE.md`
- Shared agent context: `docs/ai/`
- App code: `src/`
- Serverless AI proxy and backend glue: `supabase/`
- CI: `.github/workflows/ci.yml`
- Claude-specific local skills: `.claude/skills/`

## Universal working rules
- Keep changes small, explicit, and easy to review.
- Never commit secrets or move secrets into tracked config files.
- Treat `docs/ai/` as the shared, versioned memory for the team.
- Do not rely on local IDE memory as the source of truth for project knowledge.
- Preserve existing architectural patterns unless the task explicitly changes them.
- Do not edit `.claude/worktrees/sleepy-knuth` unless the user asks for that repo line.
- For user-facing text in the app, keep i18n discipline: update both `src/i18n/locales/es.ts` and `src/i18n/locales/en.ts`.
- For app behavior changes, update stable docs and `CHANGELOG.md` when the change is user-visible or architectural.
- Proprietary license — see `LICENSE`. Do not publish snippets of `src/`, `supabase/functions/`, or internal docs publicly (Stack Overflow, public gists, blog posts) without written consent.

## Multi-agent workflow
Use this default flow:
1. Explore the current implementation and reuse paths.
2. Plan the write set before editing.
3. Execute changes with minimal overlap between agents.
4. Verify with the cheapest useful checks first.
5. Record durable knowledge in `docs/ai/state.md` or `CHANGELOG.md`.
6. Leave a task handoff in `docs/ai/handoffs.md` when another agent may continue the work.

## Verification baseline
- Cheap iteration check: `npx tsc --noEmit`
- Repo validation for meaningful changes:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- Deployment-sensitive changes should also review:
  - `vercel.json`
  - `.env.example`
  - `src/config/env.ts`
  - `supabase/functions/`
  - `.github/workflows/ci.yml`

## Development AI vs product AI
Do not mix these systems:

- Development AI:
  - Codex, ChatGPT, Claude Code, Gemini CLI, Cursor, Windsurf, local models, and related tooling used to build the repo.
- Product AI:
  - RIAL app features such as AI Coach, recipe import, photo recognition, receipt or ticket scanning, and future low-cost production model flows.

Development agents may read repo context, docs, tasks, and handoffs.
Product AI flows must stay isolated behind app prompts, runtime safeguards, cost controls, and server-side secrets.

## Shared context files
- `docs/ai/project.md`: stable project map, architecture, commands, deployment context
- `docs/ai/workflow.md`: collaboration style, validation, documentation rules, task routing
- `docs/ai/state.md`: current release line, recent changes, active risks, next updates
- `docs/ai/reference.md`: skills, tool adapters (Claude/Gemini/Cursor/Windsurf/Codex/local), dev-AI vs product-AI boundary
- `docs/ai/handoffs.md`: partial-memory handoff template and log (transactional — not auto-loaded)

## Tool-specific notes
- Claude Code reads `CLAUDE.md`, so `CLAUDE.md` imports this file and the shared docs.
- Claude Code slash commands: `/rial-status`, `/rial-handoff`, `/rial-ship`, `/rial-freeze-check` (see `.claude/commands/`).
- Claude Code subagents: `explore-rial`, `reviewer-rial` (see `.claude/agents/`).
- SessionStart hook auto-runs `npm run rial:status` to inject repo snapshot at session open.
- Gemini CLI reads `GEMINI.md`, and `.gemini/settings.json` points Gemini to this repo's context files.
- Cursor and Windsurf can read this root `AGENTS.md` directly; cross-cutting repo rules also live in `.cursor/rules/` and `.windsurf/rules/`.
- VS Code + GitHub Copilot read `.vscode/settings.json` and `.github/copilot-instructions.md`.
- Local-model or manual ChatGPT workflows should start here and then follow `docs/ai/README.md`.

## Release helpers (scripts)
- `npm run rial:status` — snapshot (branch, last commit, TS, tests, bundle, sprint, gaps).
- `npm run release:preflight` — tsc + lint + test + build.
- `npm run release:push:dry` — preflight + dry-run push a `rial-food/main`.
- `npm run release:push` — preflight + real push a `rial-food/main` (solo tras aprobación explícita).
