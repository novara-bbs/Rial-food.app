---
name: session-retro
description: End-of-session synthesis that writes durable repo knowledge into `docs/ai/` and keeps changelog or handoffs aligned.
---

# Session Retrospective

Use this before ending a meaningful session.

## Step 1: Summarize the session

Review:
- what was built or changed
- what checks were run
- what risks remain
- whether another agent needs to continue

## Step 2: Sync the right files

Choose only the files that actually need updating:
- `docs/ai/state.md` for release posture, active risks, or current conventions
- `docs/ai/handoffs.md` for compact task transfer
- `CHANGELOG.md` for shipped behavior or architectural changes
- `docs/ai/workflow.md` only if a stable team practice changed
- `docs/ai/project.md` only if the stable system map changed

## Step 3: Keep the memory clean

- Do not duplicate the same note across several files.
- Keep handoffs concise and action-oriented.
- Prefer repo-owned memory over private local notes.

## Output

Briefly summarize:
- files changed this session
- durable knowledge captured
- next step if another agent should continue
