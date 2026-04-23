# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-04-23** — R3 + R8.2 + R8.4 shipped (`761bc83` → `rial-food/main`).

## Release snapshot
- **Branch**: `main`, in sync with `rial-food/main` through `761bc83`.
- **Last shipped**: `[1.5.76]` — R3 Cocina collections carousel + RelatedRecipesCarousel
  + sort dropdown + contextual empty states. R8.2 paywall "Te sale a N€/mes". R8.4
  personal notes textarea (SettingsProfile). i18n +17 keys R3 + 4 keys R8.2+R8.4.
- **Active plan**: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md` (v2 re-sync).
  R1 ✓, R2 ✓, R3 ✓, R8.2 ✓, R8.4 ✓. **R4 + R6 CERRADO**.
  Next: **R8.1** (onboarding kcal breakdown) + **R8.3** (trinario food preferences).
  Then R5 (CookMode deeper) → R7 (CreateRecipe authoring).
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-R3 + R8.2 + R8.4, 2026-04-23)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **982/982** passing (61 files)
- i18n symmetry: **1813** keys aligned ES ↔ EN
- Design-system lint: 0 errors (621 warnings pre-existing type-debt + 5-file shadcn allowlist)
- Build main: **864.4 KB raw / 272.0 KB gzip** · `size:check` PASS
- Drift: `text-[Npx]` = **0**, SectionCard shape = **0**, INPUT_SURFACE_CLASSES 4 consumers,
  BUTTON_CARD_SURFACE_CLASSES 5 consumers.

## Current runtime AI posture
- Local dev: `VITE_GEMINI_API_KEY` (personal) still works.
- Production: routes through `supabase/functions/gemini-proxy`.
- `vercel.json` does NOT inject Gemini secrets.

## Active risks
- **Data URL payload in `savedRecipes`** — Fase 2 multi-media stores photos as base64 data
  URLs. ~1.2 MB per recipe with 6 photos exceeds Supabase `user_data` row-limit (~1 MB).
  Mitigation: IDB local persistence, sync push excludes `savedRecipes` when any photo is
  data URL. Q6 must migrate to Supabase Storage bucket `recipe-photos` with RLS.
- **`ImportRecipeURL` doesn't auto-populate `videoUrl`** — TikTok/Instagram/YouTube links
  lose the source reference. Defer to Q6 (needs `og-fetch` Edge function parsing `og:video`
  + `twitter:player`).
- **SyncKey covers ~10 of ~35 localStorage keys** — full audit table moved to
  `docs/archive/` or reconstruct from Q6 sprint. Gap resolved in Supabase sprint.
- **Supabase DB migration not applied** — `supabase/migrations/001_initial_schema.sql` ready
  but intentionally deferred until features stable. Apply via `supabase db push` or SQL
  Editor when Q6 unlocks.
- **`useSupabasePersistence` flag not wired** — intentionally deferred, same Q6 trigger.
- **CSP header pending (Q17)** — `vercel.json` has HSTS + X-Frame + nosniff + Permissions-
  Policy + Referrer-Policy. CSP deferred until third-party origins audited (Supabase,
  Sentry, Google GenAI, RevenueCat, recharts).
- **Tag taxonomy regression** — `Recipe.tag: string` ad-hoc ES-literal (`'MI RECETA'`,
  `'VEGANO'`) fails in EN filters. `Discovery.tsx:126` filters `r.tag === 'VEGANO'` while
  `CreateRecipe` writes `tags[].includes('vegan')`. Requires `origin?: 'user'|'imported'|
  'seed'` + `FoodTag` enum + 40+ site migration. Defer to Q16 codemod sprint.
- **vendor-recharts chunk 102 KB gzip** — acceptable but monitor; ≤ 400 KB raw / 115 KB
  gzip budget.

## Feature-freeze gate (triggers Q6 Supabase sprint)
Execute Q6 ONLY when ALL hold:
- Q1-Q5 merged to main ✓
- `tsc` 0 errors ✓
- Tests 0 regressions ✓
- No refactor PRs open
- Data model stable for 1 full sprint
- E2E green on last 3 commits to main

## Next sprint candidates (ordered, only pending)
- ~~**R2**~~ ✓ — shipped `8f4e22c`.
- ~~**R3**~~ ✓ — shipped `761bc83`.
- ~~**R8.2 + R8.4**~~ ✓ — shipped `09f4326`.
- **R8.1 + R8.3** — INDYA: onboarding kcal breakdown (KcalBreakdownCard) + trinario
  food preferences (accordion by family + foodPreferences migration). ~1.5d.
- **R5** — CookMode deeper + mise-en-place + voice read-aloud. ~3d.
- **R7** — CreateRecipe paste-bulk + drag-drop + verified-creator path. ~2d.
- **Q6** — Supabase integration (gated by feature-freeze gate above).
- **Q15** — ICP-adaptive Progress widgets + `calculateStreak` sweep.
- **Q17** — CSP header + contrast + responsive audit.

**Shipped sprints** (full detail in CHANGELOG.md): Q1-Q14, Q15.5 (design-system),
Q16-B1, Q16-B2, Tab audit 2026-04-18, S3 tranche, Bevel PR 1-9, Q19 meal-taxonomy,
Fase 1+2 multi-media recipes, Food Families P0-P16, R1 docs, R2 recipes editorial,
**R3 Cocina collections**, **R8.2+R8.4 INDYA quick-wins**.

## Repository compliance
- `LICENSE`: Proprietary © 2026 RIAL FOOD WORLD S.L. Contact legal@rialfoodworld.com.
- `SECURITY.md`: security@rialfoodworld.com, SLA 72h ack / 7d triage / 30d fix critical.
- `CODE_OF_CONDUCT.md`: Contributor Covenant 2.1, conduct@rialfoodworld.com.
- `.github/`: PR template, 3 issue templates, CODEOWNERS `@novara-bbs`, Dependabot weekly.

## Active repository conventions (quick reference)
- Feature-based: `src/features/<domain>/{screens,components,handlers,utils,data}/`
- No barrel files except `src/types/index.ts`
- State: `localStorage` via `useLocalStorageState` in `AppStateContext`
- New handlers: factory in `features/*/handlers/`, wired in `AppStateContext`
- User-visible strings: `t.section.key` via `useI18n()` — ES + EN symmetric
- Seed hydration: `src/lib/seedVersion.ts` (`SEED_VERSIONS`, `shouldReseed`,
  `setStoredSeedVersion`). Bump version only to push new seed content to existing users.
- Market research docs: `docs/market/` (not auto-loaded — read on demand)

## When to update this file
- Release line or deployment target changes
- New active risk appears or is resolved
- Next sprint candidate list changes
- Quality baseline numbers change after a shipped sprint

**Not** for:
- Per-sprint narrative (goes to CHANGELOG)
- Per-file writeups (goes to CHANGELOG)
- Commit-by-commit history (git log handles that)
