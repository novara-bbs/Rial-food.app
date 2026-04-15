# RIAL Handoffs

Use this file for compact, task-scoped handoffs between agents.
Do not dump the whole repository here.

## Handoff template
```md
## YYYY-MM-DD - Task title
- Goal:
- Files touched or relevant:
- Decisions already made:
- Checks already run:
- Risks or open questions:
- Recommended next step:
```

## Example
## 2026-04-14 - Multi-agent docs rollout
- Goal: Replace single-tool agent docs with a shared `docs/ai/` knowledge base and thin adapters.
- Files touched or relevant: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/ai/*`, `.cursor/rules/*`, `.windsurf/rules/*`, `.claude/skills/*`, `README.md`, `CHANGELOG.md`.
- Decisions already made: `AGENTS.md` is universal; `docs/ai/` is the canonical shared context folder; local IDE memory is not the source of truth.
- Checks already run: structure review pending final validation.
- Risks or open questions: older docs outside `docs/ai/` may still reference legacy structures until they are refreshed.
- Recommended next step: run repo validation and keep future workflow changes synchronized through `docs/ai/`.
