# docs/archive/

Cold-storage for product research, market analysis, and strategy docs that are no longer loaded by development agents.

## What lives here
- `RIALFOOD-PRODUCT-BIBLE.md` — product spec/vision doc
- `RIALFOOD-UNIFICACION.md` — multi-variant unification analysis
- `RIALFOOD-INTEGRACION-ANALISIS.md` — local vs cloud AI tradeoff analysis
- `RIALFOOD-COMPLETE-ANALYSIS.md` — cross-project analysis
- `RIALFOOD-MARKET-RESEARCH-2026.md` — market positioning research

## Why archived
These docs are product/market context, not agent guidance. No file in `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, `.windsurf/rules/`, or `docs/ai/` loads them. Moved here to keep the active docs tree lean for agent sessions.

## When to use
- Historical reference for product decisions
- Onboarding a human PM or investor
- Reviving a strategy conversation

## Agent rule
Do not auto-load anything in this directory. Only read on explicit user request.
