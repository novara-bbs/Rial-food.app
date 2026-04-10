import { toast } from 'sonner';

interface DailyMacros {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
}

/** A single logged food entry for the daily food diary */
export interface DailyLogEntry {
  id: number;
  title: string;
  portionDescription: string;
  mealSlot: string;
  time: string;
  macros: { cal: number; pro: number; carbs: number; fats: number };
  grams?: number;
  servingUsed?: string;
  /** Ingredient IDs involved — single food or recipe ingredients */
  ingredientIds?: string[];
}

/** Persistent cross-day food history for recents */
export interface FoodHistoryEntry {
  foodId: string;
  title: string;
  lastUsed: number; // timestamp
  useCount: number;
  lastMacros: { cal: number; pro: number; carbs: number; fats: number };
  lastPortionDescription: string;
  lastGrams?: number;
  source: 'dictionary' | 'api' | 'recipe';
}

interface MealHandlerDeps {
  targetPlanDay: number | null;
  setMealPlan: (fn: any) => void;
  setShoppingList: (fn: any) => void;
  setTargetPlanDay: (v: number | null) => void;
  setDailyMacros: (fn: any) => void;
  setDailyLog: (fn: any) => void;
  setFoodHistory: (fn: any) => void;
  navigateTo: (screen: string) => void;
  previousScreen: string;
  t: any;
}

function updateFoodHistory(setFoodHistory: (fn: any) => void, meal: any) {
  const foodId = String(meal.id || meal.title || Date.now());
  const isRecipe = !!(meal.servings || meal.steps);
  setFoodHistory((prev: FoodHistoryEntry[]) => {
    const existing = prev.find(e => e.foodId === foodId);
    const entry: FoodHistoryEntry = {
      foodId,
      title: meal.title || meal.name || 'Food',
      lastUsed: Date.now(),
      useCount: (existing?.useCount || 0) + 1,
      lastMacros: {
        cal: meal.cal || meal.macros?.calories || 0,
        pro: meal.pro || meal.macros?.protein || 0,
        carbs: meal.carbs || meal.macros?.carbs || 0,
        fats: meal.fats || meal.macros?.fats || 0,
      },
      lastPortionDescription: meal.portionDescription || `${meal.grams || 100}g`,
      lastGrams: meal.grams,
      source: isRecipe ? 'recipe' : meal.isApiResult ? 'api' : 'dictionary',
    };
    const filtered = prev.filter(e => e.foodId !== foodId);
    return [entry, ...filtered].slice(0, 50); // keep last 50
  });
}

export function createHandleLogMeal(deps: MealHandlerDeps) {
  return (meal: any) => {
    const { targetPlanDay, setMealPlan, setShoppingList, setTargetPlanDay, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t } = deps;

    if (targetPlanDay !== null) {
      setMealPlan((prev: Record<number, any[]>) => ({
        ...prev,
        [targetPlanDay]: [...(prev[targetPlanDay] || []), { ...meal, time: 'Planeado', type: 'Comida' }],
      }));
      if (meal.recipeIngredients?.length > 0) {
        setShoppingList((prev: ShoppingItem[]) => [
          ...prev,
          ...meal.recipeIngredients.map((ri: any, idx: number) => ({
            id: Date.now() + idx,
            name: `${ri.ingredient?.name || ri.name || 'Ingrediente'} (${ri.amount}${ri.ingredient?.baseUnit || ri.unit || ''})`,
            category: ri.ingredient?.category || 'Otros',
            checked: false,
          })),
        ]);
      } else {
        setShoppingList((prev: ShoppingItem[]) => [
          ...prev,
          { id: Date.now(), name: `Ingredientes de ${meal.title || meal.name}`, category: 'Comidas Planeadas', checked: false },
        ]);
      }
      setTargetPlanDay(null);
      toast.success(t.mealToasts.addedToPlan);
      navigateTo('cocina');
    } else {
      setDailyMacros((prev: DailyMacros) => ({
        ...prev,
        consumed: {
          cal: prev.consumed.cal + (meal.cal || meal.macros?.calories || 0),
          pro: prev.consumed.pro + (meal.pro || meal.macros?.protein || 0),
          carbs: prev.consumed.carbs + (meal.carbs || meal.macros?.carbs || 0),
          fats: prev.consumed.fats + (meal.fats || meal.macros?.fats || 0),
        },
      }));

      const ingredientIds: string[] = meal.recipeIngredients?.length
        ? meal.recipeIngredients.map((ri: any) => String(ri.ingredientId || ri.id))
        : [String(meal.id || meal.title || Date.now())];

      const entry: DailyLogEntry = {
        id: Date.now(),
        title: meal.title || meal.name || t.mealToasts.defaultMealName,
        portionDescription: meal.portionDescription || `${meal.grams || 100}g`,
        mealSlot: meal.mealSlot || 'other',
        time: meal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        macros: {
          cal: meal.cal || meal.macros?.calories || 0,
          pro: meal.pro || meal.macros?.protein || 0,
          carbs: meal.carbs || meal.macros?.carbs || 0,
          fats: meal.fats || meal.macros?.fats || 0,
        },
        grams: meal.grams,
        servingUsed: meal.servingUsed,
        ingredientIds,
      };
      setDailyLog((prev: DailyLogEntry[]) => [...prev, entry]);
      updateFoodHistory(setFoodHistory, meal);

      toast.success(t.mealToasts.mealLogged);
      navigateTo(previousScreen);
    }
  };
}

export function createHandleRepeatYesterday(deps: {
  setDailyLog: (fn: any) => void;
  setDailyMacros: (fn: any) => void;
  nutritionHistory: any[];
  t: any;
}) {
  return () => {
    const sorted = [...deps.nutritionHistory].sort((a, b) => b.date.localeCompare(a.date));
    const yesterday = sorted[0];
    if (!yesterday?.dailyLog?.length) return;

    const newEntries: DailyLogEntry[] = yesterday.dailyLog.map((e: any) => ({
      ...e,
      id: Date.now() + Math.random(),
    }));
    deps.setDailyLog(newEntries);

    const totalMacros = newEntries.reduce(
      (acc, e) => ({
        cal: acc.cal + (e.macros?.cal || 0),
        pro: acc.pro + (e.macros?.pro || 0),
        carbs: acc.carbs + (e.macros?.carbs || 0),
        fats: acc.fats + (e.macros?.fats || 0),
      }),
      { cal: 0, pro: 0, carbs: 0, fats: 0 },
    );

    deps.setDailyMacros((prev: DailyMacros) => ({ ...prev, consumed: totalMacros }));
    toast.success(deps.t.mealToasts?.mealLogged || 'Meals repeated');
  };
}

export function createHandleLogMealNow(deps: Pick<MealHandlerDeps, 'setDailyMacros' | 'setDailyLog' | 'setFoodHistory' | 'navigateTo' | 't'>) {
  return (meal: any, servings: number) => {
    deps.setDailyMacros((prev: DailyMacros) => ({
      ...prev,
      consumed: {
        cal: prev.consumed.cal + ((meal.cal || meal.macros?.calories || 0) * servings),
        pro: prev.consumed.pro + ((meal.pro || meal.macros?.protein || 0) * servings),
        carbs: prev.consumed.carbs + ((meal.carbs || meal.macros?.carbs || 0) * servings),
        fats: prev.consumed.fats + ((meal.fats || meal.macros?.fats || 0) * servings),
      },
    }));

    const ingredientIds: string[] = meal.recipeIngredients?.length
      ? meal.recipeIngredients.map((ri: any) => String(ri.ingredientId || ri.id))
      : [String(meal.id || meal.title || Date.now())];

    const defaultPortion = deps.t.mealToasts.defaultPortion;
    const entry: DailyLogEntry = {
      id: Date.now(),
      title: meal.title || meal.name || deps.t.mealToasts.defaultMealName,
      portionDescription: servings === 1
        ? (meal.portionDescription || defaultPortion)
        : `${servings} × ${meal.portionDescription || defaultPortion}`,
      mealSlot: meal.mealSlot || 'other',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      macros: {
        cal: (meal.cal || meal.macros?.calories || 0) * servings,
        pro: (meal.pro || meal.macros?.protein || 0) * servings,
        carbs: (meal.carbs || meal.macros?.carbs || 0) * servings,
        fats: (meal.fats || meal.macros?.fats || 0) * servings,
      },
      ingredientIds,
    };
    deps.setDailyLog((prev: DailyLogEntry[]) => [...prev, entry]);
    updateFoodHistory(deps.setFoodHistory, meal);

    toast.success(deps.t.mealToasts.portionsLogged.replace('{servings}', String(servings)).replace('{title}', meal.title || ''));
    deps.navigateTo('home');
  };
}
