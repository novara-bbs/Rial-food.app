import { toast } from 'sonner';
import * as Sentry from '@sentry/react';
import { logger } from '../../../lib/logger';
import type { LoggableMeal } from '../../../types/food';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { Translations } from '../../../i18n';
import type { Recipe } from '../../../types/recipe';

// ─── State shapes ─────────────────────────────────────────────────────────────

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

// ─── Setter helper ─────────────────────────────────────────────────────────────

type Setter<T> = (fn: T | ((prev: T) => T)) => void;

// ─── Deps ──────────────────────────────────────────────────────────────────────

interface MealHandlerDeps {
  targetPlanDay: number | null;
  setMealPlan: Setter<Record<number, Recipe[]>>;
  setShoppingList: Setter<ShoppingItem[]>;
  setTargetPlanDay: (v: number | null) => void;
  setDailyMacros: Setter<DailyMacros>;
  setDailyLog: Setter<DailyLogEntry[]>;
  setFoodHistory: Setter<FoodHistoryEntry[]>;
  navigateTo: (screen: string) => void;
  previousScreen: string;
  t?: Translations;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function updateFoodHistory(setFoodHistory: Setter<FoodHistoryEntry[]>, meal: LoggableMeal) {
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

// ─── createHandleLogMeal ──────────────────────────────────────────────────────

export function createHandleLogMeal(deps: MealHandlerDeps) {
  return (meal: LoggableMeal) => {
    const { targetPlanDay, setMealPlan, setShoppingList, setTargetPlanDay, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t } = deps;

    if (targetPlanDay !== null) {
      setMealPlan((prev: Record<number, Recipe[]>) => ({
        ...prev,
        [targetPlanDay]: [
          ...(prev[targetPlanDay] || []),
          // LoggableMeal ⊄ Recipe but at runtime planner only reads title/macros/type/time
          { ...meal, time: 'Planeado', type: 'Comida' } as unknown as Recipe,
        ],
      }));
      if (meal.recipeIngredients && meal.recipeIngredients.length > 0) {
        setShoppingList((prev: ShoppingItem[]) => [
          ...prev,
          ...meal.recipeIngredients!.map((ri, idx: number) => ({
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
      toast.success(t?.mealToasts?.addedToPlan || 'Meal added to planner!');
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
        ? meal.recipeIngredients.map(ri => String(ri.ingredientId || ri.id))
        : [String(meal.id || meal.title || Date.now())];

      const entry: DailyLogEntry = {
        id: Date.now(),
        title: meal.title || meal.name || t?.mealToasts?.defaultMealName || 'Meal',
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

      toast.success(t?.mealToasts?.mealLogged || 'Meal logged!');
      navigateTo(previousScreen);
    }
  };
}

// ─── createHandleRepeatYesterday ──────────────────────────────────────────────

export function createHandleRepeatYesterday(deps: {
  setDailyLog: Setter<DailyLogEntry[]>;
  setDailyMacros: Setter<DailyMacros>;
  nutritionHistory: DailyArchive[];
  t?: Translations;
}) {
  return () => {
    const sorted = [...deps.nutritionHistory].sort((a, b) => b.date.localeCompare(a.date));
    const yesterday = sorted[0];
    if (!yesterday?.dailyLog?.length) return;

    const newEntries: DailyLogEntry[] = (yesterday.dailyLog as DailyLogEntry[]).map(e => ({
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
    toast.success(deps.t?.mealToasts?.mealLogged || 'Meals repeated');
  };
}

// ─── createHandleLogMealNow ───────────────────────────────────────────────────

/**
 * Defensive log handler for "log a planned/recommended meal now" action.
 *
 * [1.5.175] hardened after a planned-meal click could crash the render tree
 * (corrupt `recipeIngredients` entries, missing macros) and leave the user
 * stuck behind the global ErrorBoundary. The body is now wrapped in a
 * try/catch that logs to Sentry, shows a toast, and bails out without
 * mutating state — the home stays consistent and the user can retry.
 */
export function createHandleLogMealNow(deps: Pick<MealHandlerDeps, 'setDailyMacros' | 'setDailyLog' | 'setFoodHistory' | 'navigateTo' | 't'>) {
  return (meal: LoggableMeal, servings: number) => {
    try {
      // ── Pre-condition: meal must be an object. Defensive against null/undefined
      // payloads that could leak from corrupt mealPlan localStorage.
      if (meal == null || typeof meal !== 'object') {
        logger.error('logMealNow: invalid meal payload', { meal });
        toast.error(deps.t?.errors?.logMealFailed ?? "We couldn't log this meal. Please try again.");
        return;
      }

      const safeServings = Number.isFinite(servings) && servings > 0 ? servings : 1;
      const cal = Number(meal.cal ?? meal.macros?.calories ?? 0) * safeServings;
      const pro = Number(meal.pro ?? meal.macros?.protein ?? 0) * safeServings;
      const carbs = Number(meal.carbs ?? meal.macros?.carbs ?? 0) * safeServings;
      const fats = Number(meal.fats ?? meal.macros?.fats ?? 0) * safeServings;

      // ── Validate computed macros are finite numbers before mutating state.
      if (![cal, pro, carbs, fats].every(Number.isFinite)) {
        logger.error('logMealNow: non-finite macros computed', { meal, servings: safeServings });
        toast.error(deps.t?.errors?.logMealFailed ?? "We couldn't log this meal. Please try again.");
        return;
      }

      const ingredientIds: string[] = Array.isArray(meal.recipeIngredients) && meal.recipeIngredients.length
        ? meal.recipeIngredients
            .filter((ri): ri is NonNullable<typeof ri> => ri != null && typeof ri === 'object')
            .map(ri => String(ri.ingredientId || ri.id || ''))
            .filter(Boolean)
        : [String(meal.id || meal.title || Date.now())];

      const defaultPortion = deps.t?.mealToasts?.defaultPortion || '1 serving';
      const entry: DailyLogEntry = {
        id: Date.now(),
        title: meal.title || meal.name || deps.t?.mealToasts?.defaultMealName || 'Meal',
        portionDescription: safeServings === 1
          ? (meal.portionDescription || defaultPortion)
          : `${safeServings} × ${meal.portionDescription || defaultPortion}`,
        mealSlot: meal.mealSlot || 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        macros: { cal, pro, carbs, fats },
        ingredientIds,
      };

      deps.setDailyMacros((prev: DailyMacros) => ({
        ...prev,
        consumed: {
          cal: prev.consumed.cal + cal,
          pro: prev.consumed.pro + pro,
          carbs: prev.consumed.carbs + carbs,
          fats: prev.consumed.fats + fats,
        },
      }));
      deps.setDailyLog((prev: DailyLogEntry[]) => [...prev, entry]);
      updateFoodHistory(deps.setFoodHistory, meal);

      const portionsMsg = deps.t?.mealToasts?.portionsLogged
        ?.replace('{servings}', String(safeServings))
        .replace('{title}', meal.title || '') || `Logged ${safeServings}x`;
      toast.success(portionsMsg);
      deps.navigateTo('home');
    } catch (err) {
      Sentry.captureException(err, { tags: { handler: 'logMealNow' } });
      logger.error('logMealNow failed', { err: err instanceof Error ? err.message : String(err) });
      toast.error(deps.t?.errors?.logMealFailed ?? "We couldn't log this meal. Please try again.");
    }
  };
}
