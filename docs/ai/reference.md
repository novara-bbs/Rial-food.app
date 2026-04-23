# RIAL Agent Reference

Consolidated reference for skills, tool compatibility, and the dev-AI vs product-AI boundary.
This file is imported at session start via `CLAUDE.md`. Keep it stable and compact — one file
instead of three so the session-start token budget stays small.

## 1. Skills and role split

### Repo-owned Claude skills
- `.claude/skills/pre-task/` — start-of-session loading, health checks, scoping
- `.claude/skills/learn/` — capture one durable learning into repo-owned memory
- `.claude/skills/session-retro/` — end-of-session synthesis and documentation sync

**Run `session-retro` before ending a meaningful session** — it's the mechanism that keeps
`docs/ai/state.md` from growing unboundedly. If state.md exceeds ~150 lines, retro is overdue.

### Slash commands (Claude Code)
- `/rial-status` — runs `npm run rial:status` + 4-line summary
- `/rial-handoff` — appends a handoff block to `docs/ai/handoffs.md`
- `/rial-ship` — preflight + commit proposal (never pushes without approval)
- `/rial-freeze-check` — evaluates the 6 feature-freeze-gate criteria before Q6 Supabase work

### Subagents (Claude Code)
- `explore-rial` — codebase exploration with pre-loaded feature-first / handler-factory / i18n-dual conventions
- `reviewer-rial` — 10-item RIAL-specific checklist before commit (i18n symmetry, SyncKey, release target, etc.)

### Recommended role split (any tool)
- **Explore / research** — locate files, compare patterns, audit impact
- **Planner** — decide write set, risks, validation strategy
- **Implementer** — make code or doc changes with minimal drift
- **Reviewer** — inspect bugs, regressions, missing docs, deploy risk
- **Release guardian** — check env, Vercel, Supabase, CI, changelog, branch target

## 2. Tool compatibility matrix

| Tool | Primary entrypoint | Extra config | Notes |
| --- | --- | --- | --- |
| Codex / ChatGPT Codex | `AGENTS.md` | none | Reads shared docs directly |
| Claude Code | `CLAUDE.md` | `.claude/skills/`, `.claude/commands/`, `.claude/agents/` | `CLAUDE.md` imports shared repo context |
| Gemini CLI | `GEMINI.md` | `.gemini/settings.json` | Uses root context + markdown imports |
| Cursor | `AGENTS.md` | `.cursor/rules/*.mdc` | Rules for cross-cutting concerns; lighter token load |
| Windsurf | `AGENTS.md` | `.windsurf/rules/*.md` | Rules for cross-cutting; `AGENTS.md` for location-based |
| VS Code + Copilot | `.vscode/settings.json` | `.github/copilot-instructions.md` | Thin adapter |
| Ollama / local wrappers | `AGENTS.md` | none | Manual — follow the shared docs |

### Portability rules
- `AGENTS.md` stays plain markdown.
- `docs/ai/` stays free of IDE-specific syntax except where an adapter explicitly imports it.
- One shared idea written once beats parallel copies in multiple tool files.
- Optional tools (Continue, Cline, Roo, Amazon Q) are documented as consumers of the shared
  docs only — no heavy repo-specific config until real usage justifies it.

## 3. Dev-AI vs product-AI boundary

Two distinct AI layers that must not mix.

### 3.1 Development AI
Tools that help build, review, refactor, document, or deploy the repo.
Examples: Codex, ChatGPT coding sessions, Claude Code, Gemini CLI, Cursor, Windsurf, Ollama-wrapped local models.

These tools may consume: `AGENTS.md`, `docs/ai/`, repo source code, handoffs, release context.

### 3.2 Product AI
User-facing capabilities inside the RIAL app.
Examples: AI Coach, recipe import, photo recognition, future receipt scanning, future low-cost Pro automation.

These flows must use: app-specific prompts, runtime auth + quotas, server-side secrets,
cost-aware model selection, user-safe storage + logging.

### 3.3 Hard boundaries
- **Do not** copy development-agent instructions into runtime prompts.
- **Do not** expose repo memory, handoffs, or internal workflows to end users.
- **Do not** treat product AI configuration as the same problem as multi-agent dev tooling.
- **Do not** mix development secrets (personal Gemini key) with runtime app secrets (Supabase Edge Function env).

### 3.4 Practical rule
- Document helps an agent **build** the repo → `docs/ai/`.
- Document helps the shipped app **use** AI → product feature folder or product docs.

## 4. When this file is not enough
- Transactional handoffs: `docs/ai/handoffs.md`
- Current release / risks / next candidates: `docs/ai/state.md`
- Deep architecture: `docs/ARCHITECTURE.md`, ADRs in `docs/adr/`
- Design-system canon: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/NEW-SCREEN-CHECKLIST.md`
- Competitive baseline: `docs/market/competitors-index.md` (not auto-loaded — read on demand)
