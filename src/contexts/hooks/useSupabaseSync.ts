/**
 * useSupabaseSync — Q6 sign-in pull. On the auth-status transition into
 * `authed`, fetches remote data and last-write-wins merges into the local
 * state slices via the provided setters. Pure side-effect; no public API.
 */
import { useCallback, useEffect, useRef } from 'react';
import { syncOnSignIn } from '../../lib/sync';
import { logger } from '../../lib/logger';
import { useAuth } from '../AuthContext';
import type { Recipe } from '../../types';
import type { ShoppingItem } from '../../types/planner';
import type { DailyArchive } from '../../hooks/useDailyReset';
import type { BodySnapshot, ToleranceLog, StoredRealFeelEntry } from '../../types/wellness';
import type { UserProfile } from '../../types/user';
import type { DailyMacros } from '../state/useVitalsState';
import type { DailyLogEntry, FoodHistoryEntry } from '../../features/food/handlers/meal-handlers';
import type { Setter } from '../types/app-state';

export interface UseSupabaseSyncInputs {
  setUserProfile: Setter<UserProfile>;
  setDailyMacros: (v: DailyMacros | ((prev: DailyMacros) => DailyMacros)) => void;
  setSavedRecipes: Setter<Recipe[]>;
  setMealPlan: Setter<Record<number, Recipe[]>>;
  setShoppingList: Setter<ShoppingItem[]>;
  setRealFeelLogs: Setter<StoredRealFeelEntry[]>;
  setToleranceLogs: Setter<ToleranceLog[]>;
  setWeightHistory: Setter<BodySnapshot[]>;
  setNutritionHistory: Setter<DailyArchive[]>;
  setIsPro: (v: boolean) => void;
  setDailyLog: Setter<DailyLogEntry[]>;
  setFoodHistory: Setter<FoodHistoryEntry[]>;
  setFavoriteIds: Setter<string[]>;
}

export function useSupabaseSync({
  setUserProfile,
  setDailyMacros,
  setSavedRecipes,
  setMealPlan,
  setShoppingList,
  setRealFeelLogs,
  setToleranceLogs,
  setWeightHistory,
  setNutritionHistory,
  setIsPro,
  setDailyLog,
  setFoodHistory,
  setFavoriteIds,
}: UseSupabaseSyncInputs) {
  const { status: authStatus } = useAuth();
  const prevAuthStatusRef = useRef<string>('loading');

  const applyRemoteData = useCallback((remote: Partial<Record<string, unknown>>) => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (remote.userProfile) setUserProfile(remote.userProfile as UserProfile);
    if (remote.dailyMacros) setDailyMacros(remote.dailyMacros as DailyMacros);
    if (remote.savedRecipes) setSavedRecipes(remote.savedRecipes as any[]);
    if (remote.mealPlan) setMealPlan(remote.mealPlan as Record<number, any[]>);
    if (remote.shoppingList) setShoppingList(remote.shoppingList as ShoppingItem[]);
    if (remote.realFeelLogs) setRealFeelLogs(remote.realFeelLogs as any[]);
    if (remote.toleranceLogs) setToleranceLogs(remote.toleranceLogs as any[]);
    if (remote.weightHistory) setWeightHistory(remote.weightHistory as BodySnapshot[]);
    if (remote.nutritionHistory) setNutritionHistory(remote.nutritionHistory as DailyArchive[]);
    if (typeof remote.isPro === 'boolean') setIsPro(remote.isPro);
    if (remote.dailyLog) setDailyLog(remote.dailyLog as DailyLogEntry[]);
    if (remote.foodHistory) setFoodHistory(remote.foodHistory as FoodHistoryEntry[]);
    if (remote.favoriteIds) setFavoriteIds(remote.favoriteIds as string[]);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [
    setUserProfile, setDailyMacros, setSavedRecipes, setMealPlan,
    setShoppingList, setRealFeelLogs, setToleranceLogs, setWeightHistory,
    setNutritionHistory, setIsPro, setDailyLog, setFoodHistory, setFavoriteIds,
  ]);

  useEffect(() => {
    if (authStatus !== 'authed' || prevAuthStatusRef.current === 'authed') {
      prevAuthStatusRef.current = authStatus;
      return;
    }
    prevAuthStatusRef.current = 'authed';
    syncOnSignIn()
      .then(applyRemoteData)
      .catch((err) => logger.warn('syncOnSignIn failed', { err: String(err) }));
  }, [authStatus, applyRemoteData]);
}
