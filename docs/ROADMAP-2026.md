# RIAL Roadmap 2026 — post-cleanup priorities

> Companion to [ADR-015](adr/ADR-015-domain-state-and-screen-decomposition.md). Written after the structural cleanup PR (Phases 2.4 + 2.5 + 3.1) to set the next 6-12 months of work for human onboarding.

---

## Status snapshot (post-[1.5.130])

### What's done
- ✅ **Pre-Supabase ready**: signOut hygiene, 25/37 SyncKeys wired, sync model documented
- ✅ **i18n modular** (Phase 2.4): 22 domain files, codemod-driven, 1917 keys symmetric
- ✅ **State decomposed** (Phase 2.5): AppStateContext god-object → 8 cohesive hooks
- ✅ **RecipeDetail decomposed** (Phase 3.1): 7 section components, container-presenter pattern
- ✅ **Architecture docs**: ARCHITECTURE-INTERNALS, GLOSSARY, SITEMAP, FIRST-DAY, RELEASE, SUPABASE-LOCAL, HOW-TO-ADD-FEATURE
- ✅ **ADRs 1-15** documenting design decisions

### What blocks production launch (owner actions, not code)
1. Apply Supabase migration (`supabase db push` for `001_initial_schema.sql`)
2. Set Vercel env vars (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)

After these two: cloud sync activates and Mi Cuenta becomes visible.

### What's left from the cleanup roadmap (ADR-015)
| Phase | Scope | Effort | Risk |
|-------|-------|--------|------|
| 3.2 | CreateRecipe (1051 lines) → React Hook Form + Zod schema-first | 4-5 days | Very high |
| 3.3 | BarcodeScanner (823 lines) → sub-feature `food/barcode/` | 1-2 days | Medium |
| 4 | Husky + lint-staged + Lighthouse CI re-enable | 1 day | Low |

---

## Recommended execution order (next 6-12 weeks)

The cleanup is structurally complete. **Don't extract more components reflexively** — instead, address the hidden tech debt the structural work surfaced.

### Sprint 1 — Polish + safety nets (1 week)

**Why first**: closes loose ends from the cleanup PR; builds confidence to do the bigger refactors safely.

| Task | Effort | Owner action |
|------|--------|--------------|
| Phase 4: Husky + lint-staged pre-commit | 0.5 d | `npm install -D husky lint-staged` |
| Add unit tests for the 8 new state hooks (mock localStorage, assert state shape + sync calls) | 2-3 d | Snapshot the 8 hook contracts before they evolve |
| Add unit tests for the 7 RecipeDetail section components (RTL render assertions) | 1-2 d | Lock the prop contracts before Phase 3.2 |
| Re-enable / decide Lighthouse workflow | 0.5 d | Either fix or delete `.github/workflows/lighthouse.yml` |

Output: every new artifact from the cleanup PR has at least 1 test pinning its contract.

### Sprint 2 — Phase 3.3 BarcodeScanner promote (1-2 weeks)

**Why second**: contained scope (one feature), pattern-validation for "promote-to-sub-feature" approach (different from Phase 3.1's container-presenter).

Target structure (per ADR-015):
```
src/features/food/barcode/
  screens/BarcodeScannerScreen.tsx
  components/BarcodeMatchResult.tsx
  components/BarcodeUnknownProduct.tsx
  hooks/useBarcodeScanner.ts        ← camera lifecycle
  hooks/useProductLookup.ts          ← Open Food Facts + RIAL DB
  utils/match-result.ts              ← scoring
```

Migration: gradual extraction, one chunk per PR, the same pattern Phase 3.1 used.

### Sprint 3 — Phase 3.2 CreateRecipe + RHF/Zod (3-4 weeks)

**Why last in cleanup**: this is the biggest architectural shift in the codebase. Forms migrate from hand-rolled `useState` to schema-first React Hook Form + Zod. **Add `react-hook-form` to dependencies** (Zod already present).

Sub-PRs (each independently reviewable):
1. **PR A** — Define Zod schema for `RecipeFormValues` + unit tests (no UI changes)
2. **PR B** — Replace difficulty enum (`'Fácil' | 'Medio' | 'Difícil'` → `'easy' | 'medium' | 'hard'`) + i18n display mapping. **Codemod existing 46 seed recipes.**
3. **PR C** — Extract section components (BasicInfoSection, IngredientsForm, StepsForm, MediaUploaderSection, NutritionPreviewSection)
4. **PR D** — Wire RHF + Zod resolver in CreateRecipe orchestrator
5. **PR E** — Migrate validation logic from manual checks to Zod + remove dead code

Side benefit: closes the long-standing "Recipe.tag is ES literal" drift (B in this list), unblocking EN-only filters.

---

## Beyond the cleanup roadmap

After Sprints 1-3, the immediate audit-driven work is done. The next 6 months should target:

### Type-safety sweep (3-4 weeks)
The structural refactor surfaced ~150+ `any` usages in handlers, hook returns, and the AppStateContext interface. Replace with proper types:
- `Recipe`, `RecipeIngredient`, `RecipeStep` (already defined, just wire them)
- `ChallengeProgress`, `Notification`, `CommunityPost` (defined, replace `any[]` arrays)
- New `EditableRecipe` type for `recipeToEdit` (currently `any`)
- New `MealPlan` discriminated union (currently `Record<number, any[]>`)

Pair with eslint rule: enable `no-explicit-any` with allowlist for true edge cases.

### TanStack Query for Supabase (when production launch nears)
Current sync model: per-key `useEffect` + `pushToCloud()`. Works, but:
- No retry-on-failure
- No optimistic updates with rollback
- No request deduplication
- No stale-while-revalidate

When Supabase goes live for real users, migrate the cloud read path to TanStack Query. The 8 domain hooks become natural query/mutation owners. Don't migrate before launch — current model works for MVP.

### Test coverage push (ongoing)
Current threshold: 30%. Real coverage probably ~30-40% on business logic, much lower on UI. Target: 60% by end of 2026.

Priorities:
1. Pure utils (already well-tested)
2. Hook contracts (Sprint 1 starts this)
3. Critical paths via Playwright E2E (already exists for mobile-chrome)
4. Component snapshots for design-system primitives

### Recipe photo migration (Q6-B sprint, blocked on Supabase)
`savedRecipes` skips sync when any recipe has a data-URL photo. Migration plan: upload photos to Supabase Storage bucket `recipe-photos` (with RLS), replace data-URLs with file URLs, lift the data-URL guard in `useRecipeState`.

Estimated 1 sprint after Supabase activation.

### Performance + Web Vitals
Current bundle: 3012 KB raw / 862 KB gzip. Within budget but trending up. Audit candidates:
- `vendor-recharts` 332 KB — only used in Progress + Wellness; lazy-load that vendor chunk
- `ingredients.ts` 3402 lines — already lazy-loaded; verify chunk separation
- Re-enable Lighthouse CI to track regressions

### Accessibility audit
ADR-003 enforces 44×44 tap targets, but no end-to-end a11y audit done. Target: WCAG 2.2 AA for all primary screens by mid-2026. axe-core integration in Playwright E2E would automate this.

---

## What we explicitly do NOT do (anti-patterns)

The cleanup story tempts certain over-engineering. Avoid:

1. **Don't migrate to Zustand for the sake of it.** Context + 8 hooks works fine for RIAL's scale (60K req/day projected). Profile first; only migrate if render-cascade shows up as a bottleneck.
2. **Don't adopt React Server Components.** RIAL is an SPA inside Capacitor. Server Components solve a different problem.
3. **Don't abstract for hypothetical reuse.** A 50-line styled `<div>` doesn't deserve its own component file. Extract for testability + composability, not line count.
4. **Don't migrate i18n to JSON files** until translation backends (Crowdin, Lokalise) are actually integrated. TypeScript objects give better type safety today.
5. **Don't replace the state-based nav with React Router.** State-based nav works, scroll restoration is bespoke and tested. Switching costs 2-3 weeks for marginal gains.

---

## Verification metric (when Roadmap 2026 is "done")

By end of Sprint 3 (end of cleanup):
- ✅ No file in `src/contexts/` exceeds 600 lines
- ✅ No file in `src/features/*/screens/` exceeds 400 lines
- ✅ No file in `src/features/*/components/` exceeds 250 lines (excluding data files)
- ✅ Every state hook has a unit test pinning its return shape
- ✅ Every extracted screen section has a test pinning its prop contract

By end of 2026:
- 60% test coverage threshold
- 0 `any` types outside the explicit allowlist
- All critical paths covered by Playwright E2E
- Husky pre-commit blocks lint errors
- Supabase fully active in production
- Recipe photo migration complete

---

## Owner action register (open items)

| Action | Owner | Blocking | Due |
|--------|-------|----------|-----|
| `supabase db push` migration | Owner | Mi Cuenta UI hidden until done | Pre-launch |
| Vercel env vars `VITE_SUPABASE_*` | Owner | Cloud sync inactive until done | Pre-launch |
| Decide Lighthouse workflow fate | Owner | Sprint 1 task | Sprint 1 |
| Approve adding `react-hook-form` dep | Owner | Sprint 3 PR D blocker | Pre-Sprint 3 |
| Decide on Husky pre-commit rollout | Owner | Sprint 1 task | Sprint 1 |
