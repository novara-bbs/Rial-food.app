/**
 * useDemoSeedHandlers — wires the dev-only demo-seed factory handlers. Both
 * are gated by IS_DEV so production bundles tree-shake them out.
 */
import { useMemo } from 'react';
import { IS_DEV } from '../../config/env';
import {
  createHandleLoadDemoSeed,
  createHandleClearDemoSeed,
} from '../../features/dev/handlers/demo-seed-handlers';
import type { Recipe } from '../../types';
import type { ShoppingItem } from '../../types/planner';
import type { DailyArchive } from '../../hooks/useDailyReset';
import type { BodySnapshot, ToleranceLog, StoredRealFeelEntry } from '../../types/wellness';
import type { UserProfile } from '../../types/user';
import type { DailyMacros } from '../state/useVitalsState';
import type { DailyLogEntry, FoodHistoryEntry } from '../../features/food/handlers/meal-handlers';
import type { Story, CommunityPost } from '../../types/social';
import type { HydrationState, MovementState, Setter } from '../types/app-state';

export interface UseDemoSeedHandlersInputs {
  setUserProfile: Setter<UserProfile>;
  setDailyMacros: (v: DailyMacros | ((prev: DailyMacros) => DailyMacros)) => void;
  setHydration: Setter<HydrationState>;
  setMovement: Setter<MovementState>;
  setDailyGoal: (v: string) => void;
  setDailyLog: Setter<DailyLogEntry[]>;
  setFoodHistory: Setter<FoodHistoryEntry[]>;
  setWeightHistory: Setter<BodySnapshot[]>;
  setNutritionHistory: Setter<DailyArchive[]>;
  setRealFeelLogs: Setter<StoredRealFeelEntry[]>;
  setSavedRecipes: Setter<Recipe[]>;
  setMealPlan: Setter<Record<number, Recipe[]>>;
  setShoppingList: Setter<ShoppingItem[]>;
  setCommunityPosts: Setter<CommunityPost[]>;
  setCommunityStories: Setter<Story[]>;
  setToleranceLogs: Setter<ToleranceLog[]>;
}

export function useDemoSeedHandlers(inputs: UseDemoSeedHandlersInputs) {
  const handleLoadDemoSeed = useMemo(
    () => (IS_DEV ? createHandleLoadDemoSeed(inputs) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(inputs),
  );
  const handleClearDemoSeed = useMemo(
    () => (IS_DEV ? createHandleClearDemoSeed(inputs) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(inputs),
  );
  return { handleLoadDemoSeed, handleClearDemoSeed };
}
