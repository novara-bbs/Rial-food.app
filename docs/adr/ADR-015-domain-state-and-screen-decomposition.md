# ADR-015: Domain-driven state and screen decomposition

**Status**: Accepted (plan) — Phase 2.5 + Phase 3 of the human-onboarding roadmap.
**Date**: 2026-04-26.
**Superseded by**: —
**Related**: ADR-001, ADR-012, ADR-013, ARCHITECTURE-INTERNALS.md.

---

## Context

Two structural debts remain after Phase 1 (docs), Phase 2.1–2.4 (orphan relocation, dev guard, gemini move, i18n split) and the architecture audit:

1. **`src/contexts/AppStateContext.tsx` is 1075 lines** (god-object). Holds 42 state vars, 21 handler factories, 13 sync effects, 8 lazy-seed effects, 5 inline callbacks. Re-renders cascade across all consumers on any change. Single merge conflict surface for all 11 features.
2. **Three screen monoliths** stay above 800 lines:
   - `RecipeDetail.tsx` — 1066 lines
   - `CreateRecipe.tsx` — 1051 lines
   - `BarcodeScanner.tsx` — 823 lines (in `components/`, not `screens/`)

Both blockers are tolerable for AI agents (they read whole files into context) but unreviewable for humans. The 2026 industry standard for React apps is:
- **State: domain hooks > god-context.** Separate concerns, narrow re-render scope.
- **Screens: container-presenter + composition over giant files.** One file = one responsibility.
- **Forms: schema-first with React Hook Form + Zod** instead of hand-rolled `useState`.

This ADR records the pattern + execution plan for both decompositions.

---

## Decision: state decomposition (Phase 2.5)

### Pattern

Each feature domain owns its persisted state via a custom hook in `src/contexts/state/`. `AppStateContext` becomes a thin composer that calls the domain hooks in dependency order and assembles their outputs into the existing context value object. **The context value shape stays unchanged** — consumers don't need to migrate.

```typescript
// src/contexts/state/useProfileState.ts
import { useEffect } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { pushToCloud } from '../../lib/sync';
import type { UserProfile } from '../../types/user';

const DEFAULT_PROFILE: UserProfile = { /* ... */ };

export function useProfileState() {
  const [isPro, setIsPro] = useLocalStorageState<boolean>('isPro', false);
  const [showAIBot, setShowAIBot] = useLocalStorageState<boolean>('showAIBot', true);
  const [isFirstTime, setIsFirstTime] = useLocalStorageState<boolean>('isFirstTime', true);
  const [miseEnPlaceEnabled, setMiseEnPlaceEnabled] = useLocalStorageState<boolean>('miseEnPlacePreCook', true);
  const [userProfile, setUserProfile] = useLocalStorageState<UserProfile>('userProfile', DEFAULT_PROFILE);

  // R8.3 migration (foodDislikes[] → foodPreferences Record)
  useEffect(() => {
    setUserProfile(prev => {
      if (!prev?.foodDislikes?.length || prev.foodPreferences) return prev;
      const foodPreferences: Record<string, 'like' | 'dislike'> = {};
      prev.foodDislikes.forEach(id => { foodPreferences[id] = 'dislike'; });
      return { ...prev, foodPreferences };
    });
  }, [setUserProfile]);

  // Supabase sync (key-by-key)
  useEffect(() => { pushToCloud('isPro', isPro); }, [isPro]);
  useEffect(() => { pushToCloud('isFirstTime', isFirstTime); }, [isFirstTime]);
  useEffect(() => { pushToCloud('userProfile', userProfile); }, [userProfile]);

  return {
    isPro, setIsPro,
    showAIBot, setShowAIBot,
    isFirstTime, setIsFirstTime,
    miseEnPlaceEnabled, setMiseEnPlaceEnabled,
    userProfile, setUserProfile,
  };
}
```

```typescript
// src/contexts/AppStateContext.tsx — composer (~250 lines after full migration)
const profile  = useProfileState();
const vitals   = useVitalsState();
const planner  = usePlannerState({ t });
const recipes  = useRecipeState({ setMealPlan: planner.setMealPlan, setShoppingList: planner.setShoppingList, navigateTo, t });
const food     = useFoodState({ setMealPlan: planner.setMealPlan, navigateTo, t });
const social   = useSocialState({ navigateTo, t });
const wellness = useWellnessState({ setCommunityPosts: social.setCommunityPosts, navigateTo, t });
const ui       = useUITransientState();

const value = useMemo(() => ({
  ...profile,
  ...vitals,
  ...planner,
  ...recipes,
  ...food,
  ...social,
  ...wellness,
  ...ui,
}), [profile, vitals, planner, recipes, food, social, wellness, ui]);
```

### Rules

1. **Each hook owns its state, sync effects, lazy-seed effects, and handler factory wiring** for one domain.
2. **Hooks are called in dependency order**: hooks with no deps first, then hooks that consume earlier outputs as deps.
3. **No hook reads global state** — all deps come through the parameter object.
4. **The exported context value shape stays identical** to current `AppStateContextType`. Consumers continue using `const { savedRecipes, handleSaveRecipe } = useAppState()` without changes.
5. **Handler factories stay in `features/*/handlers/`** — only their wiring (the `useMemo`) moves into the domain hook.

### Migration order (lowest risk first)

| Order | Hook | Owns | Deps | Risk |
|-------|------|------|------|------|
| 1 | `useProfileState` | userProfile, isPro, isFirstTime, showAIBot, miseEnPlace | none | Low |
| 2 | `useVitalsState` | dailyMacros, hydration, movement, dailyGoal, checkInStatus | none | Low |
| 3 | `usePlannerState` | mealPlan, shoppingList | t | Medium |
| 4 | `useFoodState` | userFoods, userVariants, dailyLog, foodHistory, favoriteIds | setMealPlan, navigateTo, t | Medium |
| 5 | `useRecipeState` | savedRecipes + recipe handlers | setMealPlan, setShoppingList, navigateTo, t | Medium |
| 6 | `useSocialState` | communityPosts, stories, notifications, followedCreators, etc. | navigateTo, t | Medium |
| 7 | `useWellnessState` | weightHistory, nutritionHistory, realFeelLogs, toleranceLogs | setCommunityPosts, navigateTo, t | Medium |
| 8 | `useUITransientState` | selectedRecipe, selectedCreatorId, etc. | none | Low |

### Verification per extraction

```bash
npx tsc --noEmit                # cheap iteration
npm run check:i18n              # locale unaffected
npm run test                    # 1188 tests baseline
npm run release:preflight       # full pipeline before commit
```

Smoke manual after each: open Cocina → drill into a recipe → goBack with scroll restored → Plan → Mi Cuenta. If any feature breaks, revert that hook and reassess.

---

## Decision: screen decomposition (Phase 3)

### Pattern: container-presenter + section components

Each large screen splits into:
- **Container** (the original file, kept as `Screen.tsx`): ~250 lines max. Owns local state, hooks, navigation, business logic.
- **Section components** (under `features/<domain>/components/<screen>/`): one component per visually distinct section. ~100–250 lines each. Pure-presentation when possible.
- **Logic hooks** (under `features/<domain>/hooks/`): `useRecipeServingScaler`, `useRecipeImport`, etc. Extract reusable logic.

### Phase 3.1 — `RecipeDetail.tsx` (1066 → ~300 lines)

Extract under `src/features/recipes/components/detail/`:
- `RecipeHero.tsx` — image carousel + meta badges
- `RecipeMacros.tsx` — macro tiles + score ring
- `RecipeIngredientsList.tsx` — ingredient checklist + add-to-shopping
- `RecipeStepsList.tsx` — steps + step photos + timer triggers
- `RecipeMediaGallery.tsx` — video embed + photo lightbox
- `RecipeActionsBar.tsx` — save, plan, cook, share buttons
- `RecipeAuthorAttribution.tsx` — creator card + verified badge

Tests: add unit tests for each section component (currently RecipeDetail has 0 unit tests).

### Phase 3.2 — `CreateRecipe.tsx` (1051 → ~300 lines)

The biggest refactor. **Adopt React Hook Form + Zod** (Zod already in dependencies).

```typescript
// features/recipes/schemas/recipe-form.schema.ts
import { z } from 'zod';

export const recipeFormSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  prepTime: z.number().min(0).max(600),
  cookTime: z.number().min(0).max(600),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  servings: z.number().int().min(1).max(50),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
  photos: z.array(z.string()).max(6),
});
export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
```

Section components under `src/features/recipes/components/create/`:
- `BasicInfoSection.tsx` — title, description, time, difficulty, servings
- `IngredientsForm.tsx` — pickable ingredient list + paste-list parser
- `StepsForm.tsx` — ordered steps + per-step photo
- `MediaUploaderSection.tsx` — cover + gallery
- `NutritionPreviewSection.tsx` — computed macros per serving
- `RecipeReviewStep.tsx` — final review screen

`CreateRecipe.tsx` becomes a step orchestrator using `useForm<RecipeFormValues>` + `<FormProvider>`. **Side benefit: validation centralizes in one schema; difficulty enum-shaped values replace ES literals (`'Fácil' | 'Medio' | 'Difícil'`) — fixes the i18n drift documented in ARCHITECTURE-INTERNALS.md § "Type-first design".**

Add `react-hook-form` to dependencies (the only new dep needed; Zod is already installed).

### Phase 3.3 — `BarcodeScanner.tsx` (823 lines) → promote to sub-feature

Move to `src/features/food/barcode/`:
- `screens/BarcodeScannerScreen.tsx` — camera + scan UI
- `components/BarcodeMatchResult.tsx` — verified-data card
- `components/BarcodeUnknownProduct.tsx` — fallback with manual create
- `hooks/useBarcodeScanner.ts` — camera lifecycle, html5-qrcode wiring
- `hooks/useProductLookup.ts` — Open Food Facts + RIAL DB resolution
- `utils/match-result.ts` — match scoring logic

Update `routes.ts` if BarcodeScanner has a route entry; otherwise the screen stays mounted via parent. No public API change.

---

## Anti-patterns to avoid

1. **Don't create N separate Contexts.** One composer Context, multiple hooks. Multiple Contexts re-introduce the prop-drilling problem and double the test surface.
2. **Don't import Zustand "just because".** The current Context+hook composition is fine for RIAL's scale. Zustand is the right move only if profiling shows render-cascade as a bottleneck (currently not the case).
3. **Don't break the `features/<domain>/{screens,components,handlers,utils,data}` contract.** Section components for RecipeDetail go under `features/recipes/components/detail/`, not in a new folder.
4. **Don't extract pure styling.** A 50-line styled `<div>` doesn't deserve its own component file. Extract for composability + testability, not just to lower line count.
5. **Don't skip tests for extracted components.** The reason to extract is that they become testable in isolation — write the unit tests as part of the extraction PR.

---

## Verification end-to-end

After Phase 2.5 complete:
- `AppStateContext.tsx` ≤ 300 lines (currently 1075)
- 8 hooks in `src/contexts/state/`
- All 1188 tests pass + new tests added per hook
- Bundle size unchanged ±5%
- Smoke manual: every feature works (Hoy, Cocina, Crear, Mi Cuenta, Discover, Plan, Wellness, Profile)

After Phase 3 complete:
- No file in `src/features/*/screens/` exceeds 400 lines
- No file in `src/features/*/components/` exceeds 250 lines (excluding data files)
- New unit tests for each extracted section
- Coverage ≥ 30% threshold maintained
- E2E Playwright passing

---

## Open questions

- **Should `useFoodState` and `useRecipeState` share a parent feature hook (`useNutritionState`)?** Probably no — they have distinct domains and clear boundaries. Revisit if a third "nutrition-shaped" hook appears.
- **When should we adopt TanStack Query?** When real Supabase data starts flowing (post Q6-B). Phase 2.5 keeps the in-memory + localStorage model; TanStack Query slots in cleanly later as the cloud read layer.
- **Migration: gradual or single PR?** Gradual. One hook per PR, fully tested, easy to revert. The composer in `AppStateContext` makes incremental rollout safe (each domain hook is independent).
