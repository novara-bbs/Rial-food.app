/**
 * FoodVariant seed — derived from the flat INGREDIENT_DICTIONARY + VARIANT_MAP.
 *
 * Each legacy `Ingredient` projects to a `FoodVariant` by copying its macro/
 * micro/serving payload 1:1 and stamping `{familyId, variantType, source:
 * 'seed'}`. The `length` invariant `FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length`
 * is asserted in `food-families.test.ts` to prevent silent drift if someone
 * adds an ingredient without updating `VARIANT_MAP`.
 *
 * Tags migrate from the legacy ingredient (where they were inheritance-per-row)
 * to the variant level as an override — the family's tag set is the union of
 * its variants' tags, computed in `food-families.ts`.
 */
import type { FoodVariant } from '../../../types/food-family';
import { INGREDIENT_DICTIONARY } from './ingredients';
import { VARIANT_ID_TO_FAMILY } from './food-families';

function buildVariants(): FoodVariant[] {
  const variants: FoodVariant[] = [];
  for (const ing of INGREDIENT_DICTIONARY) {
    const entry = VARIANT_ID_TO_FAMILY[ing.id];
    if (!entry) {
      throw new Error(`food-variants: ingredient ${ing.id} has no VARIANT_MAP entry`);
    }
    variants.push({
      id: ing.id,
      familyId: entry.familyId,
      name: ing.name,
      nameEn: ing.nameEn,
      description: ing.description,
      descriptionEn: ing.descriptionEn,
      variantType: entry.variantType,
      baseAmount: ing.baseAmount,
      baseUnit: ing.baseUnit,
      servingSizes: ing.servingSizes,
      macros: ing.macros,
      micros: ing.micros,
      tags: ing.tags,
      allergens: ing.allergens,
      source: 'seed',
    });
  }
  return variants;
}

export const FOOD_VARIANTS: readonly FoodVariant[] = Object.freeze(buildVariants());
