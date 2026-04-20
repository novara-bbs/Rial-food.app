/**
 * FoodVariant seed — derived from `INGREDIENT_DICTIONARY` + `VARIANT_MAP`,
 * plus retail brand variants layered on top via `SEED_BRAND_ENTRIES`.
 *
 * Each legacy `Ingredient` projects to a `FoodVariant` by copying its macro /
 * micro / serving payload 1:1 and stamping `{familyId, variantType, source:
 * 'seed'}`. Brand entries from `food-families.ts` piggy-back on the family's
 * canonical variant via {@link brandVariantFrom} — they inherit
 * `servingSizes` / `micros` / `allergens` / `baseAmount` / `baseUnit` /
 * `tags` but override `macros` / `name` / `brand` / `qualityTags`.
 *
 * P2.6 broke the pre-existing `FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length`
 * invariant intentionally: brand variants have no ingredient of their own.
 * `food-families.test.ts` asserts the new invariant
 * `FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length + SEED_BRAND_ENTRIES.length`
 * so silent drift still surfaces.
 */
import type { FoodVariant } from '../../../types/food-family';
import { INGREDIENT_DICTIONARY } from './ingredients';
import {
  SEED_BRAND_ENTRIES,
  VARIANT_ID_TO_FAMILY,
  type SeedBrandEntry,
} from './food-families';

/**
 * Materialize a brand variant from its family's canonical template + overrides.
 * Private to this module — brand entries declare only what differs from the
 * canonical; everything else (servingSizes, micros, allergens) is inherited
 * to keep the seed DRY and ensure a new canonical serving size propagates to
 * every brand of that family automatically.
 */
function brandVariantFrom(canonical: FoodVariant, entry: SeedBrandEntry): FoodVariant {
  return {
    id: entry.id,
    familyId: entry.familyId,
    name: entry.name,
    nameEn: entry.nameEn,
    description: entry.description,
    descriptionEn: entry.descriptionEn,
    variantType: 'brand',
    brand: entry.brand,
    qualityTags: entry.qualityTags,
    baseAmount: canonical.baseAmount,
    baseUnit: canonical.baseUnit,
    servingSizes: canonical.servingSizes,
    macros: entry.macros,
    micros: canonical.micros,
    tags: canonical.tags,
    allergens: canonical.allergens,
    source: 'seed',
  };
}

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

  // Brand variants piggy-back on each family's canonical — look up the
  // canonical we just pushed and derive the brand shape from it.
  const byId = new Map(variants.map(v => [v.id, v]));
  for (const entry of SEED_BRAND_ENTRIES) {
    // Canonical = the variant whose VARIANT_MAP entry says `canonical` for this
    // family. We use `familyId` → find the canonical id directly (first pass
    // already placed every canonical in `variants`).
    const canonical = variants.find(
      v => v.familyId === entry.familyId && v.variantType === 'canonical',
    );
    if (!canonical) {
      throw new Error(
        `food-variants: brand entry ${entry.id} references missing family canonical (${entry.familyId})`,
      );
    }
    if (byId.has(entry.id)) {
      throw new Error(`food-variants: brand entry ${entry.id} collides with an existing variant id`);
    }
    variants.push(brandVariantFrom(canonical, entry));
  }

  return variants;
}

export const FOOD_VARIANTS: readonly FoodVariant[] = Object.freeze(buildVariants());
