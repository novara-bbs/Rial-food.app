/**
 * Planner state slice — owns weekly meal plan + shopping list.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015).
 * This hook owns:
 *   - 2 persisted state vars (mealPlan, shoppingList)
 *   - 2 lazy-seed effects (preserve-if-nonempty strategy)
 *   - 2 Supabase sync effects
 *
 * No external deps — these vars are independent of profile/vitals/recipes.
 * Recipe and Food handlers consume `setMealPlan` / `setShoppingList`
 * via dependency injection; planner doesn't depend on them in return.
 */
import { useEffect } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { pushToCloud } from '../../lib/sync';
import { shouldReseed, setStoredSeedVersion } from '../../lib/seedVersion';
import { logger } from '../../lib/logger';
import type { ShoppingItem } from '../../types/planner';

/**
 * Per-day plan: keyed by day index (0–6 = Mon–Sun).
 * Value shape varies between recipes / planned ingredients / leftovers,
 * tightening to a discriminated union is a V2 task (current `any[]` matches
 * the legacy contract used by 8 screens).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MealPlan = Record<number, any[]>;

export function usePlannerState() {
  const [mealPlan, setMealPlan] = useLocalStorageState<MealPlan>('mealPlan', {});

  // Lazy seed — preserve-if-nonempty: user's existing plan is sacred.
  useEffect(() => {
    if (!shouldReseed('mealPlan', 'mealPlan')) return;
    import('../../features/planner/data/seed-meal-plan')
      .then((m) => {
        setMealPlan((prev: MealPlan) =>
          Object.keys(prev).length === 0 ? m.SEED_MEAL_PLAN : prev,
        );
        setStoredSeedVersion('mealPlan');
      })
      .catch((err) => logger.warn('seed.mealPlan load failed', { err }));
  }, [setMealPlan]);

  const [shoppingList, setShoppingList] = useLocalStorageState<ShoppingItem[]>('shoppingList', []);

  // Lazy seed — preserve-if-nonempty: user may have a real list in progress.
  useEffect(() => {
    if (!shouldReseed('shoppingList', 'shoppingList')) return;
    import('../../features/planner/data/seed-shopping')
      .then((m) => {
        setShoppingList((prev: ShoppingItem[]) =>
          prev.length === 0 ? m.SEED_SHOPPING_LIST : prev,
        );
        setStoredSeedVersion('shoppingList');
      })
      .catch((err) => logger.warn('seed.shoppingList load failed', { err }));
  }, [setShoppingList]);

  // Supabase sync — no-op when offline / not signed in.
  useEffect(() => { pushToCloud('mealPlan', mealPlan); }, [mealPlan]);
  useEffect(() => { pushToCloud('shoppingList', shoppingList); }, [shoppingList]);

  return {
    mealPlan, setMealPlan,
    shoppingList, setShoppingList,
  };
}

export type PlannerState = ReturnType<typeof usePlannerState>;
