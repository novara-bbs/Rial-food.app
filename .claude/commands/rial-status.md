---
description: Snapshot rápido del repo RIAL — rama, último commit, tests, bundle, gaps
allowed-tools: Bash(npm run rial:status)
---

Ejecuta `npm run rial:status` y muestra la salida tal cual al usuario.

Después, resume en 4 líneas máximo:
1. Rama actual + ahead/behind vs `rial-food/main`.
2. Último commit (hash + subject).
3. Estado: TS ✓/✗ · tests · bundle size.
4. Último sprint Q completado + cualquier gap crítico abierto en `docs/ai/state.md`.

No propongas acciones salvo que el usuario las pida. Solo report.
