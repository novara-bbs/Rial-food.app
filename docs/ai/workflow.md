# RIAL Workflow

## Collaboration defaults
- Answer the user clearly and directly.
- Match the user's language; Spanish is the default when the user is speaking Spanish.
- Make reasonable assumptions when they are low-risk, but call out hidden deployment or data risks.
- Prefer progress over ceremony, but leave the repo easier to understand than you found it.

## Default task flow
1. Read `AGENTS.md` and `docs/ai/state.md`.
2. Identify the write set and the validation scope.
3. Reuse existing patterns before inventing new abstractions.
4. Run the cheapest meaningful verification while iterating.
5. Run repo-level checks before closing meaningful implementation work.
6. Update docs when behavior, architecture, workflows, or release expectations change.

## Documentation rules
- Update `CHANGELOG.md` for user-visible, architectural, or release-relevant changes.
- Update `docs/ai/state.md` when the current release line, deploy status, or active risks change.
- Update `docs/ai/workflow.md` only for stable team practices.
- Use `docs/ai/handoffs.md` for partial task transfer, not as a permanent design document.
- Avoid duplicating large sections across `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and IDE rules.

## Verification rules
- During iteration, use `npx tsc --noEmit` as the cheapest guard.
- Before handing off substantial changes, prefer:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- If the change touches deploy or env behavior, review `vercel.json`, `.env.example`, `src/config/env.ts`, and relevant `supabase/functions/` code.

## Multi-agent coordination
- Split work only when write scopes do not overlap.
- One agent should own the final integration and verification pass.
- Durable shared decisions go to `docs/ai/state.md` or `CHANGELOG.md`.
- Temporary task transfer goes to `docs/ai/handoffs.md`.
- Use `docs/ai/skills.md` to map capabilities between tools instead of rewriting instructions per IDE.

## Scope and safety
- Keep release work on the root repo unless the user explicitly switches to another worktree.
- Do not treat `.claude/worktrees/sleepy-knuth` as the default source of truth.
- Never move secrets into tracked repo config.
- Keep dev-AI instructions and product-AI prompts separate.
