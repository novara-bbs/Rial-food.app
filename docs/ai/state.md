# RIAL Current State

> **Keep this file ≤ 150 lines.** Verbose sprint writeups belong in `CHANGELOG.md`.
> Run `.claude/skills/session-retro` before ending a session — that's the mechanism that
> prunes this file back down. Everything below should answer: *what's the release line,
> what's the quality baseline, what's the next move, what's broken?*

Last updated: **2026-04-23** — R2.1 data-model foundation shipped (`9e540b6` → `rial-food/main`).

## Release snapshot
- **Branch**: `main`, in sync with `rial-food/main` through `9e540b6`.
- **Last shipped**: `[1.5.75]` R2.1 — verified tier (`Recipe.verified`) + `cookedAt[]` +
  8 hero seeds marked + featureFlag + convention test (11 asserts). Zero UI, zero flag-on.
- **Last code sprint (user-visible)**: Food Families P16 `[1.5.74]` (seed-variant inline log).
- **Active plan**: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md` (v2 re-sync).
  R1 ✓, R2.1 ✓. **R4 + R6 CERRADO**. Next: **R2.2–R2.6** (user-visible editorial polish,
  3 new primitives + RecipeDetail branches + Cocina chips + Fraunces + i18n +12 keys).
  Then R3 / R8 (parallelizable) → R5 → R7.
- **Release target**: `rial-food/main` (`novara-bbs/Rial-food.app`). Origin `rial-food`.
- **Vercel project**: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`).
- **Governance**: work directly on `main`. "continua" = push approval post green preflight.

## Quality baseline (post-R2.1, 2026-04-23)
- TypeScript: **0 errors** (`npx tsc --noEmit`)
- Tests: **969/969** passing (60 files) — +120 vs P16 baseline
- i18n symmetry: **1782** keys aligned ES ↔ EN
- Design-system lint: 0 errors (warnings pre-existing, unchanged)
- Build main: **862.6 KB raw / 271.4 KB gzip** · `size:check` PASS
- Drift: `text-[Npx]` = **0**, SectionCard shape = **0**
- Design-system lint: 0 errors (573 warnings pre-existing type-debt + 5-file shadcn allowlist)
- Build main: ~779 KB raw / ~244 KB gzip · `size:check` PASS
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
- **R2.2–R2.6** — 3 primitives (TimeTileComposite, AuthorAttributionCard, StickyCookCTA)
  + RecipeDetail editorial branches (flag-on) + Cocina chips "Verificadas"/"Ya cocinadas"
  + Fraunces serif load + i18n +12 keys + convention tests. ~2.5d.
- **R3** — Cocina collections first-class + RelatedRecipesCarousel + sort dropdown.
  Builds on R2 `cookedAt` + "Ya cocinadas" chip. ~2-3d.
- **R8** — INDYA adoption: onboarding kcal breakdown + paywall "Te sale a N€/mes" +
  trinario likes/dislikes + personal notes textarea. Parallelizable with R3. ~2-3d.
- **R5** — CookMode deeper + mise-en-place + voice read-aloud. ~3d.
- **R7** — CreateRecipe paste-bulk + drag-drop + verified-creator path. ~2d.
- **Q6** — Supabase integration (gated by feature-freeze gate above).
- **Q15** — ICP-adaptive Progress widgets + `calculateStreak` sweep.
- **Q17** — CSP header + contrast + responsive audit.

**Shipped sprints** (full detail in CHANGELOG.md): Q1-Q14, Q15.5 (design-system),
Q16-B1 (text-[Npx] 249→0), Q16-B2 (SectionCard drift 72→0), Tab audit 2026-04-18,
S3 tranche, Bevel PR 1-9, Q19 meal-taxonomy, Fase 1+2 multi-media recipes,
Food Families P0-P16, R1 docs, **R2.1 data-model**.

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
