/**
 * Food state slice — owns all food-related persisted data.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015).
 * This hook owns:
 *   - 6 persisted state vars (userFoods, userVariants, userVariantBarcodes,
 *     dailyLog, foodHistory, favoriteIds)
 *   - 5 utility callbacks (addUserFood, addUserVariant, updateUserVariant,
 *     removeUserVariant, addVariantBarcode, toggleFavorite)
 *   - 2 lazy imports (baseDictionary, baseFoodVariants — code-splitting)
 *   - 2 derived memos (mergedDictionary, mergedVariants)
 *   - 6 Supabase sync effects
 *
 * Deps: `t` for toast labels in add* callbacks.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { pushToCloud } from '../../lib/sync';
import { logger } from '../../lib/logger';
import type { Ingredient } from '../../types';
import type { FoodVariant } from '../../types/food-family';
import type { DailyLogEntry, FoodHistoryEntry } from '../../features/food/handlers/meal-handlers';
import type { Translations } from '../../i18n';

interface UseFoodStateDeps {
  t: Translations;
}

export function useFoodState({ t }: UseFoodStateDeps) {
  // ── User-created / scanned foods ─────────────────────────────────────────
  const [userFoods, setUserFoods] = useLocalStorageState<Ingredient[]>('userFoods', []);

  const addUserFood = useCallback((food: Ingredient) => {
    setUserFoods((prev: Ingredient[]) => {
      // Avoid duplicates by id.
      if (prev.some(f => f.id === food.id)) return prev;
      return [food, ...prev];
    });
    toast.success(t.mealToasts.foodSaved);
  }, [setUserFoods, t]);

  // ── User variants: brand/product FoodVariants stored under a FoodFamily ──
  // New localStorage key — no seedVersion bump (user-only data, no seed to merge).
  const [userVariants, setUserVariants] = useLocalStorageState<FoodVariant[]>('userVariants', []);
  const [userVariantBarcodes, setUserVariantBarcodes] = useLocalStorageState<Record<string, string>>('userVariantBarcodes', {});

  const addUserVariant = useCallback((variant: FoodVariant) => {
    setUserVariants((prev: FoodVariant[]) => {
      if (prev.some(v => v.id === variant.id)) return prev;
      return [variant, ...prev];
    });
    toast.success(t.mealToasts.foodSaved);
  }, [setUserVariants, t]);

  const updateUserVariant = useCallback((id: string, updates: Partial<Pick<FoodVariant, 'brand' | 'macros'>>) => {
    setUserVariants((prev: FoodVariant[]) =>
      prev.map(v => v.id === id ? { ...v, ...updates } : v),
    );
  }, [setUserVariants]);

  const removeUserVariant = useCallback((id: string) => {
    setUserVariants((prev: FoodVariant[]) => prev.filter(v => v.id !== id));
    setUserVariantBarcodes((prev: Record<string, string>) => {
      const next = { ...prev };
      Object.keys(next).forEach(barcode => {
        if (next[barcode] === id) delete next[barcode];
      });
      return next;
    });
  }, [setUserVariants, setUserVariantBarcodes]);

  const addVariantBarcode = useCallback((barcode: string, variantId: string) => {
    setUserVariantBarcodes((prev: Record<string, string>) => ({ ...prev, [barcode]: variantId }));
  }, [setUserVariantBarcodes]);

  // ── Ingredient dictionary (lazy-loaded; ~90KB out of initial bundle) ─────
  const [baseDictionary, setBaseDictionary] = useState<Ingredient[]>([]);
  useEffect(() => {
    let cancelled = false;
    import('../../features/food/data/ingredients').then((m) => {
      if (!cancelled) setBaseDictionary(m.INGREDIENT_DICTIONARY);
    });
    return () => { cancelled = true; };
  }, []);

  const mergedDictionary = useMemo(
    () => [...baseDictionary, ...userFoods],
    [baseDictionary, userFoods],
  );

  // ── Seed FoodVariants (lazy-loaded; same pattern as baseDictionary) ──────
  const [baseFoodVariants, setBaseFoodVariants] = useState<FoodVariant[]>([]);
  useEffect(() => {
    let cancelled = false;
    import('../../features/food/data/food-variants').then((m) => {
      if (!cancelled) setBaseFoodVariants(m.FOOD_VARIANTS as FoodVariant[]);
    }).catch((err) => logger.warn('food-variants lazy load failed', { err }));
    return () => { cancelled = true; };
  }, []);

  /** Unified variant pool used by matchFamilyForScan + searchFamilies (P5/P3). */
  const mergedVariants = useMemo<FoodVariant[]>(
    () => [...baseFoodVariants, ...userVariants],
    [baseFoodVariants, userVariants],
  );

  // ── Daily food diary log (persisted; cleared by midnight rollover) ───────
  const [dailyLog, setDailyLog] = useLocalStorageState<DailyLogEntry[]>('dailyLog', []);

  // ── Persistent food history + favorites (NOT reset daily) ────────────────
  const [foodHistory, setFoodHistory] = useLocalStorageState<FoodHistoryEntry[]>('foodHistory', []);
  const [favoriteIds, setFavoriteIds] = useLocalStorageState<string[]>('favoriteIds', []);

  const toggleFavorite = useCallback((foodId: string) => {
    setFavoriteIds((prev: string[]) =>
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId],
    );
  }, [setFavoriteIds]);

  // ── Supabase sync (no-op when offline / not signed in) ───────────────────
  useEffect(() => { pushToCloud('userFoods', userFoods); }, [userFoods]);
  useEffect(() => { pushToCloud('userVariants', userVariants); }, [userVariants]);
  useEffect(() => { pushToCloud('userVariantBarcodes', userVariantBarcodes); }, [userVariantBarcodes]);
  useEffect(() => { pushToCloud('dailyLog', dailyLog); }, [dailyLog]);
  useEffect(() => { pushToCloud('foodHistory', foodHistory); }, [foodHistory]);
  useEffect(() => { pushToCloud('favoriteIds', favoriteIds); }, [favoriteIds]);

  return {
    userFoods, addUserFood,
    userVariants, addUserVariant, updateUserVariant, removeUserVariant,
    userVariantBarcodes, addVariantBarcode,
    mergedDictionary, mergedVariants,
    dailyLog, setDailyLog,
    foodHistory, setFoodHistory,
    // setFavoriteIds exposed for the cloud-pull merge in AppStateContext.applyRemoteData.
    // toggleFavorite is the recommended public API for UI consumers.
    favoriteIds, toggleFavorite, setFavoriteIds,
  };
}

export type FoodState = ReturnType<typeof useFoodState>;
