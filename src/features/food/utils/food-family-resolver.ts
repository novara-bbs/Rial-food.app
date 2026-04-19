/**
 * Pure helpers to navigate the FoodFamily + FoodVariant seed. No React, no
 * localStorage — consumers (FoodDictionary P2, AddMeal P3, RecipeDetail P4,
 * BarcodeScanner P5) wrap these behind their own memoisation.
 *
 * Resolution priority for a recipe ingredient:
 *   1. explicit `pinnedVariantId` (user selected a specific variant)
 *   2. user preference (added in P6 — not wired here)
 *   3. `family.canonicalVariantId` (the USDA reference)
 */
import type { FoodFamily, FoodVariant, MacroDelta } from '../../../types/food-family';
import { FOOD_FAMILIES, VARIANT_ID_TO_FAMILY } from '../data/food-families';
import { FOOD_VARIANTS } from '../data/food-variants';

const familyById = new Map<string, FoodFamily>(FOOD_FAMILIES.map(f => [f.id, f]));
const variantById = new Map<string, FoodVariant>(FOOD_VARIANTS.map(v => [v.id, v]));

/** Variants grouped by familyId (ordered as declared in family.variantIds). */
const variantsByFamily = new Map<string, FoodVariant[]>();
for (const family of FOOD_FAMILIES) {
  variantsByFamily.set(
    family.id,
    family.variantIds
      .map(id => variantById.get(id))
      .filter((v): v is FoodVariant => Boolean(v)),
  );
}

export function getFamily(familyId: string): FoodFamily | undefined {
  return familyById.get(familyId);
}

export function getVariant(variantId: string): FoodVariant | undefined {
  return variantById.get(variantId);
}

export function getVariantsOfFamily(familyId: string): FoodVariant[] {
  return variantsByFamily.get(familyId) ?? [];
}

export function getCanonicalVariant(familyId: string): FoodVariant | undefined {
  const family = familyById.get(familyId);
  if (!family) return undefined;
  return variantById.get(family.canonicalVariantId);
}

/**
 * Resolve the variant to render for a given family, preferring an explicit
 * pinned variantId. Returns `undefined` if the family doesn't exist; callers
 * should surface a warning if that happens (it means a stale familyId in user
 * data, typically after a seed id rename).
 */
export function resolveVariant(
  familyId: string,
  pinnedVariantId?: string,
): FoodVariant | undefined {
  if (pinnedVariantId) {
    const pinned = variantById.get(pinnedVariantId);
    if (pinned && pinned.familyId === familyId) return pinned;
  }
  return getCanonicalVariant(familyId);
}

/**
 * Legacy `Ingredient.id` → `{familyId, variantId}`. Used by AppStateContext
 * hydration to map pre-migration `RecipeIngredient.ingredientId` entries into
 * the new dual-shape without rewriting localStorage.
 *
 * Returns `null` when the id is not in the seed (e.g., a scanned product from
 * an old session). Caller decides whether to drop the entry or conserve it.
 */
export function ingredientIdToFamilyVariant(
  legacyId: string,
): { familyId: string; variantId: string } | null {
  const entry = VARIANT_ID_TO_FAMILY[legacyId];
  if (!entry) return null;
  return { familyId: entry.familyId, variantId: legacyId };
}

/**
 * Signed macro delta of a variant against its family's canonical reference.
 * Used by the dictionary drill-down to render "vs principal" chips.
 *
 * Returns `null` when the variant IS the canonical (no delta to show) or
 * when its family has no canonical (shouldn't happen for well-formed seed).
 */
export function computeMacroDelta(variant: FoodVariant): MacroDelta | null {
  const family = familyById.get(variant.familyId);
  if (!family || family.canonicalVariantId === variant.id) return null;
  const canonical = variantById.get(family.canonicalVariantId);
  if (!canonical) return null;
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    calories: round(variant.macros.calories - canonical.macros.calories),
    protein: round(variant.macros.protein - canonical.macros.protein),
    carbs: round(variant.macros.carbs - canonical.macros.carbs),
    fats: round(variant.macros.fats - canonical.macros.fats),
  };
}
