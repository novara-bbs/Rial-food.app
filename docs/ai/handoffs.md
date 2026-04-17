# RIAL Handoffs

Use this file for compact, task-scoped handoffs between agents.
Do not dump the whole repository here.

## Handoff template
```md
## YYYY-MM-DD - Task title
- Goal:
- Files touched or relevant:
- Decisions already made:
- Checks already run:
- Risks or open questions:
- Recommended next step:
```

## 2026-04-17 - Multi-media recipes Fase 1 + Fase 2
- Goal: Cerrar el gap display-only → publicable de recetas con galería + video + uploader, sin comprometer la decisión de storage (bucket Supabase diferido a Q6).
- Files touched or relevant (Fase 1 `58aa9c7`): `src/types/recipe.ts`, `src/components/patterns/RecipeCard.tsx`, `src/features/recipes/screens/RecipeDetail.tsx`, `src/features/recipes/components/{HeroGallery,MediaLightbox,VideoSection}.tsx`, `src/features/recipes/utils/videoEmbed.{ts,test.ts}`, `src/features/food/data/seed-recipes.ts`, `src/lib/{platform,seedVersion}.ts`, `src/i18n/locales/{es,en}.ts`, `CHANGELOG.md`.
- Files touched or relevant (Fase 2 `dd22be8`): `src/lib/imageCompress.{ts,test.ts}`, `src/lib/platform.ts` (+ `pickImage`), `src/features/recipes/components/PhotoUploader.tsx`, `src/features/recipes/screens/CreateRecipe.tsx`, `src/features/social/utils/image-utils.ts` (delegación), `src/i18n/locales/{es,en}.ts`, `CHANGELOG.md`.
- Decisions already made:
  - Hero carrusel swipeable + counter + dots (patrón Yummly/NYT), lightbox shadcn Dialog, sin pinch-zoom (V2).
  - Video híbrido: YouTube iframe inline (sandbox), TikTok/IG/Vimeo/otros → card + CTA `openExternalVideo` (Capacitor Browser en native, `window.open` en web). Sin SDK Meta, sin oEmbed TikTok.
  - `photos: string[]` sigue plano (data URLs). No introducimos `MediaAsset` hasta Q6.
  - Uploader multi-foto con compresión 1200px/0.82 JPEG (más conservador que el 800/0.6 del feed). Cap 10 MB pre-compresión.
  - Persistencia local vía `migrateLocalStorageToIDB`; sync push **excluye** `savedRecipes` con data URLs hasta Q6 migre a Storage bucket.
  - `compressImage` canónico en `src/lib/imageCompress.ts`; social/utils delega vía re-export (3 callers legacy siguen compilando).
- Checks already run: `npm run release:preflight` verde — tsc 0, lint 0 errors / 883 warnings, i18n 1499 simétrico, tests 549/549, build + size:check dentro de budget (main 769.8 KB raw / 240.9 KB gzip).
- Risks or open questions:
  - Data URL payload en `savedRecipes` excede row-limit Supabase `user_data` — Q6 debe añadir Storage bucket + SyncKey sanitize.
  - `ImportRecipeURL` no auto-popula `videoUrl` — requiere Edge function `og-fetch` en Q6.
  - Runtime verification en preview NO ejecutada (continuando desde sesión compactada — los cambios fueron hechos en sesión previa y Fase 1 ya verificada visualmente allí).
- Recommended next step: push Fase 2 (`dd22be8`) a `rial-food/main` tras docs commit. Después, retomar el handoff a Q6 Supabase según el plan file `revisa-el-recepi-card-crystalline-moore.md` (addendum Fase 3 + decisión SyncKey).

## Example
## 2026-04-14 - Multi-agent docs rollout
- Goal: Replace single-tool agent docs with a shared `docs/ai/` knowledge base and thin adapters.
- Files touched or relevant: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/ai/*`, `.cursor/rules/*`, `.windsurf/rules/*`, `.claude/skills/*`, `README.md`, `CHANGELOG.md`.
- Decisions already made: `AGENTS.md` is universal; `docs/ai/` is the canonical shared context folder; local IDE memory is not the source of truth.
- Checks already run: structure review pending final validation.
- Risks or open questions: older docs outside `docs/ai/` may still reference legacy structures until they are refreshed.
- Recommended next step: run repo validation and keep future workflow changes synchronized through `docs/ai/`.
