/**
 * Recipe state slice — owns the savedRecipes vault + 7 recipe handlers.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015).
 * This hook owns:
 *   - savedRecipes persisted state + lazy seed (preserve-user merge)
 *   - 2 idempotent in-memory migrations:
 *       • Q19 meal-taxonomy (mealType string → suitableFor: MealSlot[])
 *       • P4.4 RecipeIngredient hydration (ingredientId → familyId+variantId)
 *   - 7 handler factories (save, addToPlan, create, delete, markAsCooked,
 *     duplicate, importRecipe)
 *   - navigateToRecipe (selects + navigates with guided-setup side-effect)
 *   - 1 sync effect (with data-URL skip guard for the photo row-size limit)
 *
 * Cross-domain deps:
 *   - setMealPlan, setShoppingList (planner) — addToPlan writes both
 *   - setSelectedRecipe (UI transient) — navigateToRecipe writes it
 *   - navigateTo, t — generic navigation + i18n
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { STORAGE_KEYS } from '../../lib/storage-keys';
import { pushToCloud } from '../../lib/sync';
import { shouldReseed, setStoredSeedVersion } from '../../lib/seedVersion';
import { logger } from '../../lib/logger';
import { getRecipeSlots } from '../../features/recipes/utils/meal-slot';
import { ingredientIdToFamilyVariant } from '../../features/food/utils/food-family-resolver';
import {
  createHandleSaveRecipe,
  createHandleAddToPlan,
  createHandleCreateRecipeSubmit,
  createHandleImportRecipe,
  createHandleDeleteRecipe,
  createHandleDuplicateRecipe,
  createHandleMarkAsCooked,
} from '../../features/recipes/handlers/recipe-handlers';
import type { Recipe } from '../../types';
import type { Translations } from '../../i18n';
import type { MealPlan } from './usePlannerState';
import type { ShoppingItem } from '../../types/planner';

interface UseRecipeStateDeps {
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlan>>;
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  setSelectedRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  navigateTo: (screen: string, data?: Record<string, unknown>) => void;
  t: Translations;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecipeRow = any;

export function useRecipeState({
  setMealPlan, setShoppingList, setSelectedRecipe, navigateTo, t,
}: UseRecipeStateDeps) {
  const [savedRecipes, setSavedRecipes] = useLocalStorageState<RecipeRow[]>(STORAGE_KEYS.SAVED_RECIPES, []);

  // ── Lazy seed (preserve-user: keep user-created + imported, replace rest) ─
  useEffect(() => {
    if (!shouldReseed('savedRecipes', 'savedRecipes')) return;
    import('../../features/food/data/seed-recipes')
      .then((m) => {
        setSavedRecipes((prev: RecipeRow[]) => {
          if (prev.length === 0) return m.SEED_RECIPES;
          const userOwned = prev.filter(
            (r) => r && (r.publishedBy === 'self' || r.tag === 'IMPORTADA'),
          );
          const userIds = new Set(userOwned.map((r) => r.id));
          const seedFresh = m.SEED_RECIPES.filter((r: RecipeRow) => !userIds.has(r.id));
          return [...userOwned, ...seedFresh];
        });
        setStoredSeedVersion('savedRecipes');
      })
      .catch((err) => logger.warn('seed.savedRecipes load failed', { err }));
  }, [setSavedRecipes]);

  // ── Q19 meal-taxonomy migration: legacy mealType → suitableFor MealSlot[] ─
  // One-shot, idempotent. Skips when every recipe already matches target shape.
  useEffect(() => {
    setSavedRecipes((prev: RecipeRow[]) => {
      if (!prev.length) return prev;
      const needsMigration = prev.some(
        (r) => r && r.mealType && (!r.suitableFor || r.suitableFor.length === 0),
      );
      if (!needsMigration) return prev;
      return prev.map((r) => {
        if (!r || r.suitableFor?.length) return r;
        const slots = getRecipeSlots(r);
        if (!slots) return r;
        const { mealType: _legacy, ...rest } = r;
        return { ...rest, suitableFor: slots };
      });
    });
  }, [setSavedRecipes]);

  // ── P4.4 RecipeIngredient hydration: ingredientId → familyId+variantId ────
  // In-memory projection only (does NOT rewrite localStorage).
  // A future seedVersion bump + eager migration will persist the change.
  // Idempotent: skips recipes where every ingredient already has familyId.
  useEffect(() => {
    setSavedRecipes((prev: RecipeRow[]) => {
      if (!prev.length) return prev;
      const needsMigration = prev.some((r: RecipeRow) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        r?.recipeIngredients?.some((ri: any) => !ri.familyId && ri.ingredientId),
      );
      if (!needsMigration) return prev;
      return prev.map((r: RecipeRow) => {
        if (!r?.recipeIngredients) return r;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const migratedRIs = r.recipeIngredients.map((ri: any) => {
          if (ri.familyId || !ri.ingredientId) return ri;
          const mapped = ingredientIdToFamilyVariant(ri.ingredientId);
          if (!mapped) return ri;
          return { ...ri, familyId: mapped.familyId, variantId: mapped.variantId };
        });
        return { ...r, recipeIngredients: migratedRIs };
      });
    });
  }, [setSavedRecipes]);

  // ── Sync to Supabase, skip on data-URL photos (row-size guard ~1 MB) ─────
  useEffect(() => {
    const hasDataUrl = savedRecipes.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) =>
        r?.photos?.some((p: string) => p?.startsWith('data:')) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        r?.steps?.some((s: any) => s?.photoUrl?.startsWith('data:')),
    );
    if (!hasDataUrl) pushToCloud('savedRecipes', savedRecipes);
  }, [savedRecipes]);

  // ── Recipe-specific UI navigation ────────────────────────────────────────
  const navigateToRecipe = useCallback((recipe: RecipeRow) => {
    setSelectedRecipe(recipe);
    // Mark the Guided Setup "Explora una receta" step complete (Home.tsx reads this key).
    // Home.tsx checks STORAGE_KEYS.RECIPE_VIEWED to show the first-use prompt.
    try { window.localStorage.setItem(STORAGE_KEYS.RECIPE_VIEWED, '1'); } catch { /* private mode */ }
    navigateTo('recipe-detail', { recipeId: recipe.id });
  }, [setSelectedRecipe, navigateTo]);

  // ── Memoized handler factories (delegated to features/recipes/handlers/) ─
  const handleSaveRecipe = useMemo(
    () => createHandleSaveRecipe({ setSavedRecipes, t }),
    [setSavedRecipes, t],
  );
  const handleAddToPlan = useMemo(
    () => createHandleAddToPlan({ setSavedRecipes, setMealPlan, setShoppingList, navigateTo, t }),
    [setSavedRecipes, setMealPlan, setShoppingList, navigateTo, t],
  );
  const handleCreateRecipeSubmit = useMemo(
    () => createHandleCreateRecipeSubmit({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );
  const handleDeleteRecipe = useMemo(
    () => createHandleDeleteRecipe({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );
  const handleMarkAsCooked = useMemo(
    () => createHandleMarkAsCooked({ setSavedRecipes, t }),
    [setSavedRecipes, t],
  );
  const handleDuplicateRecipe = useMemo(
    () => createHandleDuplicateRecipe({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );
  const handleImportRecipe = useMemo(
    () => createHandleImportRecipe({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );

  return {
    savedRecipes, setSavedRecipes,
    navigateToRecipe,
    handleSaveRecipe,
    handleAddToPlan,
    handleCreateRecipeSubmit,
    handleDeleteRecipe,
    handleMarkAsCooked,
    handleDuplicateRecipe,
    handleImportRecipe,
  };
}

export type RecipeState = ReturnType<typeof useRecipeState>;
