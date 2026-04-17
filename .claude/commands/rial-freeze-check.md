---
description: Evalúa los 6 criterios del Feature-freeze gate de docs/ai/state.md (para decidir si Q6 Supabase puede ejecutarse)
allowed-tools: Bash(npm run check), Bash(git log*), Bash(git status*)
---

Evalúa si se cumplen los 6 criterios del bloque "Feature-freeze gate (triggers Q6)" de `docs/ai/state.md`. Responde ✓/✗ por ítem con evidencia.

Criterios (del state.md actual):
1. **Q1-Q5 merged to main** — revisa `git log --oneline` y confirma que los commits `sprint-q1..q5` existen en `main`.
2. **`npx tsc --noEmit` → 0 errors** — corre `npm run lint` (alias de tsc --noEmit).
3. **`npx vitest run` → 0 regressions** — corre `npm run test` y confirma 429+ tests passing.
4. **No refactor PRs open** — pregunta al usuario (no podemos inspeccionar PRs desde CLI sin `gh`). Si hay `gh` disponible, usa `gh pr list --state open`.
5. **Data model (types + SyncKey shape) stable for 1 full sprint** — inspecciona `git log src/types/ src/lib/sync.ts` del último sprint y reporta si hubo cambios.
6. **E2E green on last 3 commits to main** — pregunta al usuario o confirma mirando GitHub Actions vía `gh run list` si disponible.

Formato de salida:
```
Feature-freeze gate — evaluation
================================
[✓/✗] 1. Q1-Q5 merged    — <evidencia>
[✓/✗] 2. tsc 0 errors    — <evidencia>
[✓/✗] 3. tests 0 reg     — <evidencia>
[✓/✗] 4. no refactor PRs — <evidencia o "user-confirm needed">
[✓/✗] 5. data model stable — <evidencia>
[✓/✗] 6. e2e green 3x    — <evidencia o "user-confirm needed">

Verdict: <READY / BLOCKED — reason>
```

NO ejecutes Q6 (no modifiques AppStateContext, sync.ts, ni apliques migrations). Solo reporta.
