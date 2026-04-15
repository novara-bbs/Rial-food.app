# RIAL Current State

Last updated: 2026-04-14

## Release snapshot
- Root branch: `main`
- Release remote: `rial-food`
- Legacy remote present but inactive for release work: `origin`
- Active Vercel project: `rial.app.v1.5`
- Vercel project id: `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`

## Recent release-relevant changes
- `a1b620e` `fix: route Gemini features through Supabase proxy`
- `9856db2` `chore: remove Vercel Gemini secret mapping`
- `7cc5ba8` `chore: clean repo + harden security`
- `c11bc2d` `feat(sprint-n): enterprise hardening - testing, CI, auth, Capacitor, Supabase edge functions`

## Current runtime AI posture
- Local development can still use `VITE_GEMINI_API_KEY`.
- Production-safe runtime AI should prefer `supabase/functions/gemini-proxy`.
- `vercel.json` no longer injects Gemini secrets.
- Supabase secrets must provide `GEMINI_API_KEY` for the Edge Function.

## Active repository conventions
- Shared dev-agent memory now belongs in `docs/ai/`.
- `AGENTS.md` is the universal repo entrypoint.
- `CLAUDE.md` and `GEMINI.md` are thin adapters, not separate sources of truth.
- Cursor and Windsurf cross-cutting instructions live in their rule directories.

## Current risks to watch
- Build still reports the existing Vite large-chunk warning.
- Product docs in older files may still mention outdated flat `src/screens` structure.
- Local-only IDE memory may diverge unless durable learnings are written back into this repo.

## When to update this file
- A release line or deployment target changes
- A new agent workflow becomes part of normal practice
- A new active risk appears
- A stable project decision affects how future agents should operate
