/**
 * `resolveRecipeIngredient` — dual-schema resolver that returns the canonical
 * `FoodVariant` for a `RecipeIngredient`, following the resolution order:
 *
 *   1. `familyId + variantId` (new shape) → `resolveVariant(familyId, variantId)`
 *   2. `familyId + no variantId` → `resolveVariant(familyId)` (canonical of family)
 *   3. `ingredientId` only (legacy shape) → `ingredientIdToFamilyVariant` lookup,
 *      then `resolveVariant`, then fallback to `allVariants.find(v.id === ingredientId)`
 *   4. Neither → `null`
 *
 * The `allVariants` argument should be `mergedVariants` from `AppStateContext`
 * (= FOOD_VARIANTS seed + userVariants) so user-scanned variants resolve too.
 *
 * This function is pure — no React, no localStorage — and safe to call inside
 * `useMemo` or module-level code.
 */
import type { RecipeIngredient } from '../../../types/food';
import type { FoodVariant } from '../../../types/food-family';
import { resolveVariant, ingredientIdToFamilyVariant } from './food-family-resolver';

export function resolveRecipeIngredient(
  ri: RecipeIngredient,
  allVariants: FoodVariant[],
): FoodVariant | null {
  // ── New dual-schema shape ────────────────────────────────────────────
  if (ri.familyId) {
    const variant = resolveVariant(ri.familyId, ri.variantId ?? undefined);
    return variant ?? null;
  }

  // ── Legacy single-pointer shape ──────────────────────────────────────
  if (ri.ingredientId) {
    // 1. Try VARIANT_MAP (covers the 154 seed variants)
    const mapped = ingredientIdToFamilyVariant(ri.ingredientId);
    if (mapped) {
      const variant = resolveVariant(mapped.familyId, mapped.variantId ?? undefined);
      if (variant) return variant;
    }

    // 2. Direct match in allVariants (user-scanned that aren't in VARIANT_MAP)
    const direct = allVariants.find(v => v.id === ri.ingredientId);
    if (direct) return direct;
  }

  return null;
}
