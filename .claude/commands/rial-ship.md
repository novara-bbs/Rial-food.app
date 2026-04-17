---
description: Preflight (tsc + lint + test + build) + propuesta de commit RIAL. Sin push automático.
allowed-tools: Bash(npm run release:preflight), Bash(git status*), Bash(git diff*), Bash(git log*)
---

Flujo de pre-release RIAL. NUNCA hagas push sin que el usuario lo apruebe explícitamente.

1. Corre `npm run release:preflight` (tsc + lint + test + build).
2. Si falla cualquier paso:
   - Reporta qué falló (extracto relevante).
   - NO propongas commit.
   - Detente.
3. Si todo pasa:
   - Muestra `git status --short` y `git diff --stat`.
   - Propón un mensaje de commit siguiendo el patrón del repo:
     - `feat(sprint-qN): <descripción>` si es feature de sprint.
     - `chore(agents|enterprise|ci|quality): <descripción>` si es mejora de tooling.
     - `fix(<scope>): <descripción>` si es fix.
     - `docs(ai): <descripción>` si solo toca docs/ai/ o docs/.
   - Pregunta al usuario si el mensaje es correcto antes de commitear.
4. Tras commit local, sugiere (pero NO ejecutes) `npm run release:push:dry` y luego `npm run release:push`.

Restricciones:
- NO hagas `git push` sin confirmación explícita del usuario.
- NO uses `--no-verify`, `--force`, `--amend`.
- NO toques `.claude/worktrees/sleepy-knuth`.
