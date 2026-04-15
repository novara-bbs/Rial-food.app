# RIAL Skills and Agent Mapping

## Repo-owned skills today
- `.claude/skills/pre-task/`
  - Start-of-session loading, health checks, and scoping
- `.claude/skills/learn/`
  - Capture one durable learning into repo-owned memory
- `.claude/skills/session-retro/`
  - End-of-session synthesis and documentation sync

## Shared intent behind those skills
- Pre-task: load project context quickly without rereading the entire repo
- Learn: turn a useful discovery into durable, versioned team knowledge
- Session retro: compress a session into the minimum context another agent needs

## Equivalent patterns by tool
- Codex / ChatGPT Codex
  - Start from `AGENTS.md`
  - Use `docs/ai/state.md` plus the task-relevant docs
  - Record task transfer in `docs/ai/handoffs.md`
- Claude Code
  - Use `CLAUDE.md`
  - Reuse `.claude/skills/*`
  - Write shared memory back into `docs/ai/`, not only home-directory memory
- Gemini CLI
  - Use `GEMINI.md`
  - Let `.gemini/settings.json` load the root context files
- Cursor
  - Use root `AGENTS.md` plus `.cursor/rules/`
  - Keep rules small and split by concern
- Windsurf
  - Use root `AGENTS.md` plus `.windsurf/rules/`
  - Prefer rules for cross-cutting guidance and `AGENTS.md` for location-based guidance
- Local models / Ollama / manual ChatGPT
  - Start with `AGENTS.md`
  - Pull deeper context from `docs/ai/` as needed

## Recommended role split
- Explore or research agent:
  - locate files, compare patterns, audit impact
- Planner:
  - decide write set, risks, and validation strategy
- Implementer:
  - make code or doc changes with minimal drift
- Reviewer:
  - inspect bugs, regressions, missing docs, and deploy risk
- Release guardian:
  - check env, Vercel, Supabase, CI, changelog, and branch target

## What not to do
- Do not create separate contradictory rule systems for each tool.
- Do not store team memory only in private IDE memory.
- Do not confuse development-agent skills with the app's end-user AI features.
