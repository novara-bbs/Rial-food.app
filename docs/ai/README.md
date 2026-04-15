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
5. Read the task-specific file that matters next:
   - `skills.md`
   - `handoffs.md`
   - `boundaries.md`
   - `compatibility.md`

## File guide
- `project.md`: stable system map and deployment context
- `workflow.md`: how we work, verify, document, and coordinate
- `state.md`: current snapshot of the release line and active risks
- `skills.md`: repo skills and cross-tool equivalents
- `handoffs.md`: compact handoff format for partial memory between agents
- `boundaries.md`: development AI versus product AI separation
- `compatibility.md`: adapter strategy by tool or IDE

## Maintenance rules
- Put durable repo knowledge here, not in private local memory.
- Keep files concise so importing them does not waste tokens.
- Prefer linking to canonical docs over copying long sections.
- If a rule becomes directory-specific, consider a nested `AGENTS.md` later instead of bloating the root file.
