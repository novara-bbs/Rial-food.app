import { toast } from 'sonner';

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
}

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

export function createHandleAddToPlan(deps: RecipeHandlerDeps) {
  return (recipe: any, dayIndex: number) => {
    deps.setMealPlan((prev: Record<number, any[]>) => ({
      ...prev,
      [dayIndex]: [
        ...prev[dayIndex],
        {
          id: Date.now(),
          time: '12:00',
          type: 'COMIDA',
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
    if (recipe.recipeIngredients?.length > 0) {
      deps.setShoppingList((prev: ShoppingItem[]) => [
        ...prev,
        ...recipe.recipeIngredients.map((ri: any, idx: number) => ({
          id: Date.now() + idx,
          name: `${ri.ingredient?.name || ri.name || 'Ingrediente'} (${ri.amount}${ri.ingredient?.baseUnit || ri.unit || ''})`,
          category: ri.ingredient?.category || 'Otros',
          checked: false,
        })),
      ]);
    } else {
      deps.setShoppingList((prev: ShoppingItem[]) => [
        ...prev,
        { id: Date.now(), name: `${deps.t?.toast?.ingredientsOf || 'Ingredientes de'} ${recipe.title}`, category: 'Comidas Planeadas', checked: false },
      ]);
    }
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
