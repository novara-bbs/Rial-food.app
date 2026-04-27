/**
 * useProductLookup — Open Food Facts lookup + RIAL family matching.
 *
 * Owns:
 * - The OFF API call and ScannedProduct construction.
 * - Family matching (known-barcode | seed-match | fuzzy | ambiguous | no-match).
 * - Seed-macros toggle (P16 [1.5.74]) and saved-brands guard (P15 [1.5.73]).
 * - Derived `pseudoIngredient` and `scoreVariant` memos.
 *
 * Extracted from BarcodeScanner.tsx (Phase 3.3, ADR-015).
 */
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { parseOFFServings } from '../../api/open-food-facts';
import {
  matchFamilyForScan,
  type FamilyMatchResult,
} from '../../utils/food-family-resolver';
import {
  scannedProductToIngredient,
  type ScannedProduct,
} from '../../utils/pseudo-ingredient';
import { variantToIngredient } from '../../utils/variant-to-ingredient';
import { normalizeGoal } from '../../utils/contextual-score';
import { logger } from '@/lib/logger';
import type { FoodVariant } from '../../../../types/food-family';
import type { Ingredient } from '../../../../types';

export type LookupStatus = 'idle' | 'looking-up' | 'found' | 'not-found';

interface UseProductLookupReturn {
  /** Trigger an OFF barcode lookup. */
  lookup: (barcode: string) => Promise<void>;
  status: LookupStatus;
  product: ScannedProduct | null;
  matchResult: FamilyMatchResult | null;
  /** When true, the PortionSelector uses curated seed macros instead of OFF data. */
  useSeedMacros: boolean;
  setUseSeedMacros: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * Effective ingredient for PortionSelector — switches between seed and OFF
   * depending on `useSeedMacros` and match type.
   */
  pseudoIngredient: Ingredient | null;
  /** FoodVariant built from the scanned product for ContextualScoreChip. */
  scoreVariant: FoodVariant | null;
  /** Family IDs saved during the current scan session (guards double-tap). */
  savedBrandFamilyIds: Set<string>;
  /** Mark a family as saved to prevent duplicate userVariant writes. */
  addSavedFamily: (familyId: string) => void;
  /** Reset all lookup state (call before `startScanner` on "scan another"). */
  reset: () => void;
}

export function useProductLookup(
  knownVariants: FoodVariant[],
  activeGoal: ReturnType<typeof normalizeGoal>,
): UseProductLookupReturn {
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [matchResult, setMatchResult] = useState<FamilyMatchResult | null>(null);
  const [useSeedMacros, setUseSeedMacros] = useState(false);
  const [savedBrandFamilyIds, setSavedBrandFamilyIds] = useState<Set<string>>(
    () => new Set(),
  );

  // Keep knownVariants stable in the lookup callback without re-memoizing.
  const knownVariantsRef = useRef(knownVariants);
  useEffect(() => { knownVariantsRef.current = knownVariants; });

  const lookup = useCallback(async (barcode: string) => {
    setStatus('looking-up');
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_es,product_name_en,brands,nutriments,serving_size,serving_quantity,product_quantity,image_front_small_url,image_url`,
      );
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        const servingSizes = parseOFFServings({
          serving_size: p.serving_size,
          serving_quantity: p.serving_quantity,
          product_quantity: p.product_quantity,
        });
        const result: ScannedProduct = {
          name:
            p.product_name ||
            p.product_name_es ||
            p.product_name_en ||
            'Producto desconocido',
          brand: p.brands || '',
          calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein: Math.round((n.proteins_100g || n.proteins || 0) * 10) / 10,
          carbs:
            Math.round((n.carbohydrates_100g || n.carbohydrates || 0) * 10) / 10,
          fats: Math.round((n.fat_100g || n.fat || 0) * 10) / 10,
          fiber: n.fiber_100g
            ? Math.round(n.fiber_100g * 10) / 10
            : undefined,
          sugar: n.sugars_100g
            ? Math.round(n.sugars_100g * 10) / 10
            : undefined,
          saturatedFat: n['saturated-fat_100g']
            ? Math.round(n['saturated-fat_100g'] * 10) / 10
            : undefined,
          barcode,
          image: p.image_front_small_url || p.image_url,
          servingSizes,
        };
        setProduct(result);
        setStatus('found');

        // P5 — compute family match; P16: auto-prefer seed macros on known-barcode.
        const variants = knownVariantsRef.current;
        if (variants.length > 0) {
          const mr = matchFamilyForScan(
            barcode,
            p.brands || '',
            result.name,
            variants,
          );
          setMatchResult(mr);
          setUseSeedMacros(mr.type === 'known-barcode');
        } else {
          setUseSeedMacros(false);
        }
      } else {
        setStatus('not-found');
      }
    } catch (error) {
      logger.warn('BarcodeScanner OFF lookup failed', { barcode, error });
      setStatus('not-found');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProduct(null);
    setMatchResult(null);
    setUseSeedMacros(false);
  }, []);

  const addSavedFamily = useCallback((familyId: string) => {
    setSavedBrandFamilyIds(prev => new Set([...prev, familyId]));
  }, []);

  // P16 [1.5.74] — effective ingredient source for PortionSelector.
  const pseudoIngredient = useMemo<Ingredient | null>(() => {
    if (!product) return null;
    const canUseSeed =
      useSeedMacros &&
      (matchResult?.type === 'known-barcode' || matchResult?.type === 'seed-match') &&
      matchResult?.variant;
    if (canUseSeed && matchResult?.variant) {
      const seedIngredient = variantToIngredient(matchResult.variant);
      return {
        ...seedIngredient,
        id: `scan_${product.barcode ?? Date.now()}`,
        name: product.name,
        nameEn: product.name,
      };
    }
    return scannedProductToIngredient(product);
  }, [product, useSeedMacros, matchResult]);

  // P15 [1.5.73] — score-ready FoodVariant for ContextualScoreChip.
  const scoreVariant = useMemo<FoodVariant | null>(() => {
    if (!activeGoal || !product) return null;
    if (
      matchResult?.type === 'known-barcode' ||
      matchResult?.type === 'seed-match'
    ) {
      return matchResult.variant;
    }
    return {
      id: `scan_${product.barcode ?? Date.now()}`,
      familyId: 'fam_scan_result',
      name: product.name,
      nameEn: product.name,
      variantType: 'brand',
      baseAmount: 100,
      baseUnit: 'g',
      servingSizes: [],
      macros: {
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fats: product.fats,
        saturatedFat: product.saturatedFat,
        sugar: product.sugar,
      },
      micros: { vitamins: {}, minerals: {}, others: {} },
      allergens: [],
      source: 'off',
    };
  }, [activeGoal, product, matchResult]);

  return {
    lookup,
    status,
    product,
    matchResult,
    useSeedMacros,
    setUseSeedMacros,
    pseudoIngredient,
    scoreVariant,
    savedBrandFamilyIds,
    addSavedFamily,
    reset,
  };
}
