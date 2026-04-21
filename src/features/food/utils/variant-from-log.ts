/**
 * P13 `[1.5.71]` — DailyLogEntry → FoodVariant resolver for contextual scoring.
 *
 * A log entry is the run-time snapshot of what the user ate: title, macros,
 * grams, mealSlot, maybe ingredientIds. ContextualScoreChip needs a
 * `FoodVariant` to compute the grade, so this bridges the gap.
 *
 * Resolution order:
 *   1. `entry.ingredientIds[0]` — most entries reference a real dictionary id;
 *      look it up in `mergedVariants` (seed + user scans). Returns the canonical
 *      entry, no approximation.
 *   2. Fallback: **pseudo-variant** built from the entry's per-entry macros,
 *      normalised to 100 g. Accurate only when `entry.grams` is set. Returns
 *      null when grams is missing/zero — the caller skips the chip in that case.
 *
 * Pure function. No side effects. Safe to call in render without memoisation
 * (cheap O(n) lookup over the variant pool).
 */
import type { FoodVariant } from '../../../types/food-family';
import type { DailyLogEntry } from '../handlers/meal-handlers';

/**
 * Resolves a log entry to a FoodVariant that can be scored. Returns null
 * when there's not enough info to produce a meaningful grade (no matching
 * id + no grams to normalise).
 */
export function variantFromLogEntry(
  entry: DailyLogEntry,
  mergedVariants: readonly FoodVariant[],
): FoodVariant | null {
  // Path 1 — resolve from ingredientIds.
  if (entry.ingredientIds && entry.ingredientIds.length > 0) {
    for (const id of entry.ingredientIds) {
      const hit = mergedVariants.find(v => v.id === id);
      if (hit) return hit;
    }
  }

  // Path 2 — pseudo-variant from entry macros.
  if (!entry.grams || entry.grams <= 0) return null;
  const scale = 100 / entry.grams;
  return {
    id: `log_${entry.id}`,
    familyId: 'fam_log_entry',
    name: entry.title,
    nameEn: entry.title,
    variantType: 'user',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [],
    macros: {
      calories: Math.max(0, entry.macros.cal * scale),
      protein: Math.max(0, entry.macros.pro * scale),
      carbs: Math.max(0, entry.macros.carbs * scale),
      fats: Math.max(0, entry.macros.fats * scale),
    },
    micros: { vitamins: {}, minerals: {}, others: {} },
    allergens: [],
    source: 'user',
  };
}

/**
 * Convenience helper for AddMeal search-result rows. Takes the flat Ingredient
 * shape (what the dictionary search returns) and produces the matching
 * FoodVariant. Unlike log entries, an Ingredient always has macros normalised
 * to 100 g already, so no scaling needed.
 */
export interface IngredientLike {
  id: string;
  name: string;
  nameEn?: string;
  macros: { calories: number; protein: number; carbs: number; fats: number };
}

export function variantFromIngredientLike(
  ing: IngredientLike,
  mergedVariants: readonly FoodVariant[],
): FoodVariant {
  // If the id is already a known variant, return it directly.
  const hit = mergedVariants.find(v => v.id === ing.id);
  if (hit) return hit;
  // Otherwise construct a minimal pseudo-variant. OFF API results that haven't
  // been saved yet land here.
  return {
    id: ing.id,
    familyId: 'fam_search_result',
    name: ing.name,
    nameEn: ing.nameEn ?? ing.name,
    variantType: ing.id.startsWith('scanned_') || ing.id.startsWith('off_') ? 'brand' : 'user',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [],
    macros: {
      calories: ing.macros.calories,
      protein: ing.macros.protein,
      carbs: ing.macros.carbs,
      fats: ing.macros.fats,
    },
    micros: { vitamins: {}, minerals: {}, others: {} },
    allergens: [],
    source: ing.id.startsWith('scanned_') || ing.id.startsWith('off_') ? 'off' : 'seed',
  };
}
