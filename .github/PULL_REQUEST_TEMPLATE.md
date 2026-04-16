<!-- Gracias por contribuir a RIAL. Rellena las secciones relevantes. -->

## Summary

<!-- 1-3 frases: qué cambia y por qué. Enlaza el issue si aplica. -->

## Sprint tag

<!-- Elige uno: -->
- [ ] `sprint-qN` (feature de sprint — especificar N)
- [ ] `enterprise` (gobernanza / legal / hygiene)
- [ ] `agents` (AI-agent UX / Claude / Cursor / Windsurf)
- [ ] `ci` / `quality` (pipelines, tests, observabilidad)
- [ ] `fix` (bugfix)
- [ ] `docs` (solo documentación)

## Changes

<!-- Lista de cambios concretos (archivos o áreas). -->

## Test plan

- [ ] `npm run lint` (tsc --noEmit) pasa
- [ ] `npm run lint:code` (eslint) pasa
- [ ] `npm run test` (vitest) pasa
- [ ] `npm run build` pasa
- [ ] E2E local (si aplica)
- [ ] Verificación manual en Preview (si aplica)

## i18n checklist

- [ ] Strings user-facing añadidas en `src/i18n/locales/es.ts`
- [ ] Strings user-facing añadidas en `src/i18n/locales/en.ts`
- [ ] No aplica (no hay nuevas strings user-facing)

## Docs updated

- [ ] `CHANGELOG.md` (si es user-visible o arquitectónico)
- [ ] `docs/ai/state.md` (si cambia release line, riesgos o quality baseline)
- [ ] Documentación de módulo en `docs/modules/` (si aplica)
- [ ] No aplica

## Release impact

- [ ] Afecta Vercel deploy (cambios en `vercel.json`, build, env)
- [ ] Afecta Supabase (migrations, edge functions)
- [ ] Afecta Capacitor native (iOS/Android)
- [ ] Ninguno de los anteriores

## Notes for reviewers

<!-- Cualquier contexto útil: decisiones, alternativas consideradas, riesgos. -->
