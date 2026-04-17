---
name: learn
description: Capture one durable learning in the repository itself so future agents can reuse it without relying on private local memory.
---

# Quick Learning Capture

Capture one focused learning and store it in the right repo-owned file.

## Choose the target

- Stable project structure or architecture -> `docs/ai/project.md`
- Stable workflow or team convention -> `docs/ai/workflow.md`
- Current release status, recent fix, or active risk -> `docs/ai/state.md`
- Task transfer or partial memory for another agent -> `docs/ai/handoffs.md`
- User-visible shipped change -> `CHANGELOG.md`

## Entry format

Keep the addition compact:
```md
- YYYY-MM-DD: what changed or was learned, why it matters, and where it applies.
```

## Rules
- Capture one learning per invocation.
- Prefer updating an existing section over creating a new file.
- Do not store shared knowledge only in home-directory memory.
- If the insight is task-specific and temporary, use `docs/ai/handoffs.md` instead of a permanent doc.
