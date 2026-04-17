---
name: pre-task
description: Run before significant work. Loads the shared repo context, checks project health, and scopes the task with the versioned memory in `docs/ai/`.
---

# Pre-Task Briefing

Start every meaningful session with a fast repo-aware check.

## Step 1: Load core context

Read these first:
1. `AGENTS.md`
2. `docs/ai/README.md`
3. `docs/ai/state.md`
4. `CHANGELOG.md`

Then load the deeper file that matches the task:
- Architecture or system mapping -> `docs/ai/project.md`
- Workflow or release process -> `docs/ai/workflow.md`
- Multi-agent coordination -> `docs/ai/handoffs.md`
- AI scope questions -> `docs/ai/boundaries.md`

## Step 2: Check project health

Run in parallel:
```bash
npx tsc --noEmit
git status --short
git log --oneline -5
```

## Step 3: Check current implementation surface

Use the actual feature-based structure:
```bash
Get-ChildItem src/features
Get-ChildItem src/components
Get-ChildItem supabase/functions
```

## Step 4: Plan the write set

Before editing:
1. Identify all files that need changing.
2. Decide which checks are needed.
3. Note whether the task changes stable docs, release posture, or only code.
4. Decide if another agent will need a handoff entry in `docs/ai/handoffs.md`.

## Output

Briefly report:
- repo state: clean or dirty
- context loaded
- planned write set and validation scope
