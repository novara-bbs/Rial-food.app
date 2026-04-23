@AGENTS.md
@docs/ai/README.md
@docs/ai/project.md
@docs/ai/workflow.md
@docs/ai/state.md
@docs/ai/reference.md

# Claude Code Adapter

## Claude-specific notes
- Use the repo-owned context in `docs/ai/` as the shared source of truth.
- Treat home-directory memory as personal cache only, never as the project's canonical memory.
- Reuse the local skills in `.claude/skills/` when they fit the task.
- If a Claude skill discovers durable team knowledge, write it back into this repository.
- `docs/ai/handoffs.md` is **not** auto-imported — load only when picking up a partial task. Everything else (skills, tool adapters, dev-AI/product-AI boundary) lives in `docs/ai/reference.md` which IS auto-imported.

## Preferred Claude workflow
1. Run the `pre-task` skill before substantial work.
2. Use `learn` for one focused durable insight.
3. Use `session-retro` before ending a meaningful session — it's what keeps `state.md` compact.
