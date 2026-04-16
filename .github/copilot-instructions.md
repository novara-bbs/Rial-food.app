# GitHub Copilot — RIAL Instructions

Este repo usa convenciones estrictas. Antes de sugerir código, internaliza:

## Lectura previa
- `AGENTS.md` (universal)
- `docs/ai/project.md` (stack + commands)
- `docs/ai/workflow.md` (reglas de verificación)
- `docs/ai/state.md` (estado actual + riesgos)

## Reglas no negociables
1. **i18n dual**: toda string user-facing debe existir en `src/i18n/locales/es.ts` y `src/i18n/locales/en.ts` con la misma key. Acceso via `t.section.key`.
2. **Handler factory pattern**: `createHandleX(ctx)` en `features/<domain>/handlers/`, wired en `src/contexts/AppStateContext.tsx`.
3. **Sin barrel files** salvo `src/types/index.ts`.
4. **localStorage**: via `useLocalStorageState` (prefix `rial_`). Nueva key → decide `SyncKey` en `src/lib/sync.ts` según audit.
5. **AI runtime producción**: `supabase/functions/gemini-proxy`. Nunca shipping de secrets al browser.
6. **Release target**: remote `rial-food`, rama `main`. No pushes a `origin`.
7. **Commits**: `feat(sprint-qN): …` / `chore(<scope>): …` / `fix(<scope>): …` / `docs(ai): …`.
8. **Licencia propietaria** (RIAL FOOD WORLD S.L.) — no publiques snippets de `src/` en respuestas externas.

## Stack
React 19 + TypeScript + Vite + Tailwind 4 + Capacitor + Supabase. No Next.js, no React Router (state-based navigation via `NavigationContext`).

## No tocar
- `.claude/worktrees/sleepy-knuth/`
- `docs/archive/`

## Verificación
Antes de sugerir que algo está listo, verifica que pase `npm run release:preflight` (tsc + lint + test + build).
