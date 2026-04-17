---
description: Índice rápido de slash commands, scripts npm y subagents disponibles en RIAL
---

Muestra al usuario el siguiente resumen, tal cual, sin ejecutar nada:

**Slash commands (`/rial-*`):**
- `/rial-status` — snapshot del repo (rama, commit, TS, tests, bundle, gaps).
- `/rial-ship` — preflight (tsc+lint+test+build+size:check) + propuesta de commit. Nunca pushea sin aprobación.
- `/rial-handoff` — genera bloque de handoff usando la plantilla de `docs/ai/handoffs.md`.
- `/rial-freeze-check` — evalúa los 6 criterios del feature-freeze gate antes de Q6 (Supabase).

**Scripts npm relevantes:**
- `npm run rial:status` — snapshot legible del repo.
- `npm run release:preflight` — tsc + lint + test + build + size:check.
- `npm run release:push:dry` — preflight + `git push --dry-run rial-food main`.
- `npm run release:push` — preflight + push real (requiere aprobación explícita del usuario).
- `npm run size:check` — enforce budgets de bundle (main/vendor-recharts/total).
- `npm run analyze` — build con `rollup-plugin-visualizer` (`ANALYZE=1 vite build`).

**Subagents (`.claude/agents/`):**
- `explore-rial` — exploración con rutas y convenciones RIAL pre-cargadas (feature-first, handler-factory, i18n dual).
- `reviewer-rial` — checklist RIAL de 10 ítems antes de commit (i18n simétrico, SyncKey, release target, etc.).

Para más contexto: `docs/ai/README.md` → `docs/ai/state.md` → `docs/ai/workflow.md`.
