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
}

export function createHandleSaveRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes'>) {
  return (recipe: any) => {
    deps.setSavedRecipes((prev: any[]) => {
      const exists = prev.find((r: any) => r.id === recipe.id);
      if (exists) {
        toast.info('Receta eliminada de la Bóveda');
        return prev.filter((r: any) => r.id !== recipe.id);
      }
      toast.success('¡Receta guardada en la Bóveda!');
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
        { id: Date.now(), name: `Ingredientes de ${recipe.title}`, category: 'Comidas Planeadas', checked: false },
      ]);
    }
    toast.success(`${recipe.title} añadido al plan!`);
    deps.navigateTo('cocina');
  };
}

export function createHandleCreateRecipeSubmit(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo'>) {
  return (recipe: any) => {
    deps.setSavedRecipes((prev: any[]) => [{ ...recipe, id: Date.now(), tag: 'MI RECETA', publishedBy: 'self' }, ...prev]);
    deps.navigateTo('cocina');
  };
}

export function createHandleImportRecipe(deps: Pick<RecipeHandlerDeps, 'setSavedRecipes' | 'navigateTo'>) {
  return (recipe: any) => {
    deps.setSavedRecipes((prev: any[]) => [{ ...recipe, id: Date.now(), tag: 'IMPORTADA', publishedBy: 'self' }, ...prev]);
    toast.success('¡Receta importada!');
    deps.navigateTo('cocina');
  };
}
