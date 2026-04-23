import { toast } from 'sonner';
import {
  aggregateShoppingItems,
  detectCategory,
  type GroceryItem,
} from '../../planner/utils/grocery';
import { getRecipeSlots } from '../utils/meal-slot';

interface RecipeHandlerDeps {
  setSavedRecipes: (fn: any) => void;
  setMealPlan: (fn: any) => void;
  setShoppingList: (fn: any) => void;
  navigateTo: (screen: string) => void;
  t?: any;
}

export function createHandleSaveRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 't'>) {
  return (recipe: any) => {
    deps.setSavedRecipes((prev: any[]) => {
      const exists = prev.find((r: any) => r.id === recipe.id);
      if (exists) {
        toast.info(deps.t?.toast?.recipeRemoved || 'Receta eliminada de la Bóveda');
        return prev.filter((r: any) => r.id !== recipe.id);
      }
      toast.success(deps.t?.toast?.recipeSaved || '¡Receta guardada en la Bóveda!');
      return [...prev, { ...recipe, tag: 'GUARDADO' }];
    });
  };
}

// Maps `recipe.mealType` (from seed + ImportRecipeURL classifier) to a planned
// slot. Replaces the previous hardcoded `'12:00' / 'COMIDA'` that ignored the
// recipe's intended meal slot. Labels come from i18n so EN renders correctly.
type MealSlotKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

function resolveMealSlot(mealType: string | undefined, t: any): { time: string; type: string } {
  const key: MealSlotKey = ((): MealSlotKey => {
    const normalized = String(mealType || '').toLowerCase();
    if (normalized === 'breakfast' || normalized === 'desayuno') return 'breakfast';
    if (normalized === 'dinner' || normalized === 'cena') return 'dinner';
    if (normalized === 'snack' || normalized === 'merienda') return 'snack';
    return 'lunch';
  })();

  const plan = t?.plan || {};
  const labelMap: Record<MealSlotKey, string> = {
    breakfast: plan.mealTypeBreakfast || 'DESAYUNO',
    lunch: plan.mealTypeLunch || 'COMIDA',
    dinner: plan.mealTypeDinner || 'CENA',
    snack: plan.mealTypeSnack || 'MERIENDA',
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
  return (recipe: any, dayIndex: number, mealSlot?: MealSlotKey) => {
    // Explicit slot (from MealSlotSelector) wins over the recipe's own suitableFor.
    // Falls back to the first entry in `suitableFor` (or legacy `mealType`) via
    // `getRecipeSlots`; if the recipe is versatile, `resolveMealSlot` defaults to lunch.
    const slotHint = mealSlot ?? getRecipeSlots(recipe)?.[0];
    const slot = resolveMealSlot(slotHint, deps.t);

    deps.setMealPlan((prev: Record<number, any[]>) => ({
      ...prev,
      [dayIndex]: [
        ...(prev[dayIndex] || []),
        {
          id: Date.now(),
          time: slot.time,
          type: slot.type,
          title: recipe.title,
          cal: recipe.cal || recipe.macros?.calories || 0,
          pro: recipe.pro || recipe.macros?.protein || 0,
          carbs: recipe.carbs || recipe.macros?.carbs || 0,
          fats: recipe.fats || recipe.macros?.fats || 0,
          micros: recipe.micros,
          recipeIngredients: recipe.recipeIngredients,
          tag: 'PLANEADO',
        },
      ],
    }));

    // Build GroceryItem[] with quantity/unit/category/source so the shopping
    // list stays deduped + aisle-bucketed. Prior implementation appended raw
    // `"name (200g)"` strings with no dedup, leading to two shapes coexisting.
    const baseId = Date.now();
    let newItems: GroceryItem[] = [];
    if (recipe.recipeIngredients?.length > 0) {
      newItems = recipe.recipeIngredients.map((ri: any, idx: number): GroceryItem => {
        const name = ri.ingredient?.name || ri.name || 'Ingrediente';
        const quantity = typeof ri.amount === 'number' ? ri.amount : Number(ri.amount) || undefined;
        const unit = ri.ingredient?.baseUnit || ri.unit || '';
        return {
          id: baseId + idx,
          name,
          category: ri.ingredient?.category || detectCategory(name),
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

    deps.setShoppingList((prev: GroceryItem[]) =>
      aggregateShoppingItems([...(prev || []), ...newItems]),
    );

    toast.success(deps.t?.toast?.addedToPlan?.replace('{title}', recipe.title) || `${recipe.title} añadido al plan!`);
    deps.navigateTo('cocina');
  };
}

export function createHandleCreateRecipeSubmit(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipe: any) => {
    if (recipe.id) {
      // Update existing recipe — preserve publishedBy + tag
      deps.setSavedRecipes((prev: any[]) => prev.map((r: any) =>
        r.id === recipe.id ? { ...r, ...recipe } : r
      ));
      toast.success(deps.t?.toast?.recipeUpdated || 'Receta actualizada');
    } else {
      // Create new
      deps.setSavedRecipes((prev: any[]) => [{ ...recipe, id: Date.now(), tag: 'MI RECETA', publishedBy: 'self' }, ...prev]);
    }
    deps.navigateTo('cocina');
  };
}

export function createHandleDeleteRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipeId: any) => {
    deps.setSavedRecipes((prev: any[]) => prev.filter((r: any) => r.id !== recipeId));
    toast.success(deps.t?.toast?.recipeDeleted || 'Receta eliminada');
    deps.navigateTo('cocina');
  };
}

export function createHandleDuplicateRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipe: any) => {
    // Fork-the-original policy: if this recipe is itself a fork, trace back to the original
    const origin = recipe.forkedFrom || {
      recipeId: recipe.id,
      creatorId: recipe.publishedBy || 'unknown',
      creatorName: recipe.publishedByName || recipe.publishedBy || 'Unknown',
      title: recipe.title,
    };

    const prefix = deps.t?.recipeDetail?.duplicatePrefix || 'Copia de';
    const newRecipe = {
      ...recipe,
      id: Date.now(),
      title: `${prefix} ${origin.title}`,
      publishedBy: 'self',
      publishedByName: undefined,
      tag: 'MI RECETA',
      forkedFrom: origin,
      forkCount: 0,
    };

    deps.setSavedRecipes((prev: any[]) => {
      // Increment forkCount on the original recipe
      const updated = prev.map((r: any) =>
        String(r.id) === String(origin.recipeId)
          ? { ...r, forkCount: (r.forkCount || 0) + 1 }
          : r
      );
      return [newRecipe, ...updated];
    });
    toast.success(deps.t?.toast?.recipeDuplicated || 'Receta duplicada');
    deps.navigateTo('cocina');
  };
}

export function createHandleImportRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo' | 't'>) {
  return (recipe: any) => {
    deps.setSavedRecipes((prev: any[]) => [{ ...recipe, id: Date.now(), tag: 'IMPORTADA', publishedBy: 'self' }, ...prev]);
    toast.success(deps.t?.toast?.recipeImported || '¡Receta importada!');
    deps.navigateTo('cocina');
  };
}

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
export function createHandleMarkAsCooked(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 't'>) {
  return (recipe: any) => {
    const ts = new Date().toISOString();
    deps.setSavedRecipes((prev: any[]) => {
      const idx = prev.findIndex((r: any) => r.id === recipe.id);
      if (idx === -1) {
        // Recipe not yet saved — save it first, then mark as cooked.
        const saved = { ...recipe, tag: recipe.tag ?? 'GUARDADO', cookedAt: [ts] };
        toast.success(deps.t?.toast?.recipeSavedAndCooked || '¡Receta guardada y marcada como cocinada!');
        return [...prev, saved];
      }
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        cookedAt: [...(updated[idx].cookedAt ?? []), ts],
      };
      const count = updated[idx].cookedAt.length;
      const msg = deps.t?.toast?.recipeCooked
        ? deps.t.toast.recipeCooked.replace('{n}', String(count))
        : `¡Cocinada ${count} ${count === 1 ? 'vez' : 'veces'}!`;
      toast.success(msg);
      return updated;
    });
  };
}
