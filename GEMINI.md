@./AGENTS.md
@./docs/ai/README.md
@./docs/ai/project.md
@./docs/ai/workflow.md
@./docs/ai/state.md
@./docs/ai/reference.md

# Gemini CLI Adapter

## Gemini-specific notes
- Let `AGENTS.md` stay universal and keep this file tool-specific.
- Use markdown imports instead of copying shared rules into multiple files.
- When durable repo knowledge changes, update `docs/ai/` rather than creating Gemini-only memory.
- If future Gemini subagents are added, align their responsibilities with `docs/ai/reference.md` §1 (skills + role split).
- `docs/ai/handoffs.md` is transactional — load on demand, not at session start.
