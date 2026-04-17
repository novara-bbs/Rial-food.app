---
description: Genera un bloque de handoff RIAL y lo añade a docs/ai/handoffs.md
---

Genera un bloque de handoff siguiendo exactamente la plantilla de `docs/ai/handoffs.md`:

```md
## YYYY-MM-DD - <Task title>
- Goal:
- Files touched or relevant:
- Decisions already made:
- Checks already run:
- Risks or open questions:
- Recommended next step:
```

Pasos:
1. Obtén la fecha actual en formato `YYYY-MM-DD`.
2. Infer la tarea activa del contexto de la sesión (último prompt + últimos edits).
3. Si `Task title`, `Goal` o `Files touched` no son inferibles del diff/contexto, **pregunta** al usuario antes de escribir. No inventes.
4. Para `Checks already run`: inspecciona si el usuario corrió tsc, tests, build. Si no sabes, pregunta o pon "pending".
5. Añade el bloque al final de `docs/ai/handoffs.md` (NO reemplaces nada; usa Edit con el último `##` existente como ancla).
6. Muestra al usuario el bloque que agregaste.

No modifiques otros archivos.
