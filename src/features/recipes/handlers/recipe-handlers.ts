import { toast } from 'sonner';
import {
  aggregateShoppingItems,
  detectCategory,
  type GroceryItem,
} from '../../planner/utils/grocery';
import { getRecipeSlots } from '../utils/meal-slot';
import type { Recipe } from '../../../types/recipe';
import type { RecipeIngredient } from '../../../types/food';
import type { Translations } from '../../../i18n';

// ─── Deps ─────────────────────────────────────────────────────────────────────

type RecipeSetter = (fn: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
type MealPlanSetter = (fn: Record<number, Recipe[]> | ((prev: Record<number, Recipe[]>) => Record<number, Recipe[]>)) => void;
type ShoppingListSetter = (fn: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;

interface RecipeHandlerDeps {
  setSavedRecipes: RecipeSetter;
  setMealPlan: MealPlanSetter;
  setShoppingList: ShoppingListSetter;
  navigateTo: (screen: string) => void;
  t?: Translations;
}

// ─── Save / unsave toggle ─────────────────────────────────────────────────────

export function createHandleSaveRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 't'>) {
  return (recipe: Recipe) => {
    deps.setSavedRecipes((prev) => {
      const exists = prev.find((r) => r.id === recipe.id);
      if (exists) {
        toast.info(deps.t?.toast?.recipeRemoved || 'Receta eliminada de la Bóveda');
        return prev.filter((r) => r.id !== recipe.id);
      }
      toast.success(deps.t?.toast?.recipeSaved || '¡Receta guardada en la Bóveda!');
      return [...prev, { ...recipe, tag: 'saved' }];
    });
  };
}

// ─── Add to plan ──────────────────────────────────────────────────────────────

// Maps `recipe.mealType` (from seed + ImportRecipeURL classifier) to a planned
// slot. Replaces the previous hardcoded `'12:00' / 'COMIDA'` that ignored the
// recipe's intended meal slot. Labels come from i18n so EN renders correctly.
type MealSlotKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

function resolveMealSlot(mealType: string | undefined, t: Translations | undefined): { time: string; type: string } {
  const key: MealSlotKey = ((): MealSlotKey => {
    const normalized = String(mealType || '').toLowerCase();
    if (normalized === 'breakfast' || normalized === 'desayuno') return 'breakfast';
    if (normalized === 'dinner' || normalized === 'cena') return 'dinner';
    if (normalized === 'snack' || normalized === 'merienda') return 'snack';
    return 'lunch';
  })();

  const labelMap: Record<MealSlotKey, string> = {
    breakfast: t?.plan?.mealTypeBreakfast || 'DESAYUNO',
    lunch: t?.plan?.mealTypeLunch || 'COMIDA',
    dinner: t?.plan?.mealTypeDinner || 'CENA',
    snack: t?.plan?.mealTypeSnack || 'MERIENDA',
  };
  const timeMap: Record<MealSlotKey, string> = {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '20:00',
    snack: '17:00',
  };

  return { time: timeMap[key], type: labelMap[key] };
}

export function createHandleAddToPlan(deps: RecipeHandlerDeps) {
  return (recipe: Recipe, dayIndex: number, mealSlot?: MealSlotKey) => {
    // Explicit slot (from MealSlotSelector) wins over the recipe's own suitableFor.
    // Falls back to the first entry in `suitableFor` (or legacy `mealType`) via
    // `getRecipeSlots`; if the recipe is versatile, `resolveMealSlot` defaults to lunch.
    const slotHint = mealSlot ?? getRecipeSlots(recipe)?.[0];
    const slot = resolveMealSlot(slotHint, deps.t);

    deps.setMealPlan((prev) => ({
      ...prev,
      [dayIndex]: [
        ...(prev[dayIndex] || []),
        {
          ...recipe,
          id: String(Date.now()),
          time: slot.time,
          type: slot.type,
          tag: 'planned',
        } as Recipe,
      ],
    }));

    // Build GroceryItem[] with quantity/unit/category/source so the shopping
    // list stays deduped + aisle-bucketed. Prior implementation appended raw
    // `"name (200g)"` strings with no dedup, leading to two shapes coexisting.
    const baseId = Date.now();
    let newItems: GroceryItem[] = [];
    if (recipe.recipeIngredients && recipe.recipeIngredients.length > 0) {
      newItems = recipe.recipeIngredients.map((ri, idx): GroceryItem => {
        const ing = ri.ingredient as { name?: string; baseUnit?: string; category?: string } | undefined;
        // `ri.name` is a legacy field set by some recipe sources; not in RecipeIngredient type
        const legacyName = (ri as RecipeIngredient & { name?: string }).name;
        const name = ing?.name || legacyName || 'Ingrediente';
        const quantity = typeof ri.amount === 'number' ? ri.amount : Number(ri.amount) || undefined;
        const unit = ing?.baseUnit || ri.unit || '';
        return {
          id: baseId + idx,
          name,
          category: ing?.category || detectCategory(name),
          checked: false,
          quantity,
          unit,
          source: [recipe.title],
        };
      });
    } else {
      newItems = [
        {
          id: baseId,
          name: `${deps.t?.toast?.ingredientsOf || 'Ingredientes de'} ${recipe.title}`,
          category: 'Comidas Planeadas',
          checked: false,
          source: [recipe.title],
        },
      ];
    }

    deps.setShoppingList((prev) =>
      aggregateShoppingItems([...(prev || []), ...newItems]),
    );

    toast.success(deps.t?.toast?.addedToPlan?.replace('{title}', recipe.title) || `${recipe.title} añadido al plan!`);
    deps.navigateTo('cocina');
  };
}

// ─── Create / update recipe ───────────────────────────────────────────────────

export function createHandleCreateRecipeSubmit(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipe: Recipe) => {
    if (recipe.id) {
      // Update existing recipe — preserve publishedBy + tag
      deps.setSavedRecipes((prev) => prev.map((r) =>
        r.id === recipe.id ? { ...r, ...recipe } : r
      ));
      toast.success(deps.t?.toast?.recipeUpdated || 'Receta actualizada');
    } else {
      // Create new
      deps.setSavedRecipes((prev) => [{ ...recipe, id: String(Date.now()), tag: 'myRecipe', publishedBy: 'self' }, ...prev]);
    }
    deps.navigateTo('cocina');
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function createHandleDeleteRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipeId: string) => {
    deps.setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    toast.success(deps.t?.toast?.recipeDeleted || 'Receta eliminada');
    deps.navigateTo('cocina');
  };
}

// ─── Duplicate (fork) ─────────────────────────────────────────────────────────

/** Recipe extension fields for fork tracking (not yet in the canonical Recipe type). */
type RecipeWithForkMeta = Recipe & {
  forkedFrom?: { recipeId: string; creatorId: string; creatorName: string; title: string };
  forkCount?: number;
  publishedByName?: string;
};

export function createHandleDuplicateRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipe: Recipe) => {
    // Fork-the-original policy: if this recipe is itself a fork, trace back to the original
    const ext = recipe as RecipeWithForkMeta;
    const origin = ext.forkedFrom || {
      recipeId: recipe.id,
      creatorId: recipe.publishedBy || 'unknown',
      creatorName: ext.publishedByName || recipe.publishedBy || 'Unknown',
      title: recipe.title,
    };

    const prefix = deps.t?.recipeDetail?.duplicatePrefix || 'Copia de';
    const newRecipe: Recipe = {
      ...recipe,
      id: String(Date.now()),
      title: `${prefix} ${origin.title}`,
      publishedBy: 'self',
      tag: 'myRecipe',
      forkedFrom: origin,
      forkCount: 0,
    };

    deps.setSavedRecipes((prev) => {
      // Increment forkCount on the original recipe
      const updated = prev.map((r) =>
        String(r.id) === String(origin.recipeId)
          ? { ...r, forkCount: ((r as RecipeWithForkMeta).forkCount || 0) + 1 }
          : r
      );
      return [newRecipe, ...updated];
    });
    toast.success(deps.t?.toast?.recipeDuplicated || 'Receta duplicada');
    deps.navigateTo('cocina');
  };
}

// ─── Import ───────────────────────────────────────────────────────────────────

export function createHandleImportRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipe: Recipe) => {
    deps.setSavedRecipes((prev) => [{ ...recipe, id: String(Date.now()), tag: 'imported', publishedBy: 'self' }, ...prev]);
    toast.success(deps.t?.toast?.recipeImported || '¡Receta importada!');
    deps.navigateTo('cocina');
  };
}

// ─── Mark as cooked ───────────────────────────────────────────────────────────

/**
 * Mark a recipe as cooked — R2 plan v2 (NYT Cooking pattern).
 *
 * Appends the current ISO timestamp to `recipe.cookedAt[]`. Always appends,
 * never deduplicates — the intent is to log each distinct cook session.
 * If the recipe isn't in `savedRecipes` (e.g. the user is browsing a seed
 * recipe without having saved it yet), it is first saved, then marked.
 * This mirrors the NYT Cooking "saving implies interest" progressive-engagement
 * heuristic: cooking something is a stronger signal than just saving it.
 */
type RecipeWithCookedAt = Recipe & { cookedAt?: string[] };

export function createHandleMarkAsCooked(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 't'>) {
  return (recipe: Recipe) => {
    const ts = new Date().toISOString();
    deps.setSavedRecipes((prev) => {
      const idx = prev.findIndex((r) => r.id === recipe.id);
      if (idx === -1) {
        // Recipe not yet saved — save it first, then mark as cooked.
        const saved: RecipeWithCookedAt = { ...recipe, tag: recipe.tag ?? 'saved', cookedAt: [ts] };
        toast.success(deps.t?.toast?.recipeSavedAndCooked || '¡Receta guardada y marcada como cocinada!');
        return [...prev, saved];
      }
      const updated = [...prev];
      const existing = updated[idx] as RecipeWithCookedAt;
      updated[idx] = { ...existing, cookedAt: [...(existing.cookedAt ?? []), ts] };
      const count = (updated[idx] as RecipeWithCookedAt).cookedAt?.length ?? 1;
      const msg = deps.t?.toast?.recipeCooked
        ? deps.t.toast.recipeCooked.replace('{n}', String(count))
        : `¡Cocinada ${count} ${count === 1 ? 'vez' : 'veces'}!`;
      toast.success(msg);
      return updated;
    });
  };
}
