# RIAL Shared AI Context

This directory is the versioned, cross-tool knowledge base for development agents.
It is intentionally separate from product prompts or runtime AI logic.

## Why this folder exists
- `AGENTS.md` stays short and universal.
- Deep shared context lives in one repo-owned place.
- Tool-specific files can stay thin and avoid duplicating rules.
- Automatic IDE memory is optional, but this folder is the source of truth.

## Read order
1. `AGENTS.md`
2. `docs/ai/project.md`
3. `docs/ai/workflow.md`
4. `docs/ai/state.md`
5. `docs/ai/reference.md` (skills + tool compatibility + dev-AI vs product-AI boundary)
6. `docs/ai/handoffs.md` — only when picking up a partial task

## File guide
- `project.md`: stable system map and deployment context
- `workflow.md`: how we work, verify, document, and coordinate (+ exploration rules for token discipline)
- `state.md`: current snapshot of the release line and active risks — keep ≤ 150 lines
- `reference.md`: skills, tool adapters, dev-AI vs product-AI boundary (stable)
- `handoffs.md`: compact handoff format for partial memory between agents (transactional)

## Maintenance rules
- Put durable repo knowledge here, not in private local memory.
- Keep files concise so importing them does not waste tokens.
- Prefer linking to canonical docs over copying long sections.
- If a rule becomes directory-specific, consider a nested `AGENTS.md` later instead of bloating the root file.
