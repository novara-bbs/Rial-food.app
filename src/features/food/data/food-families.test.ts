/**
 * Integrity tests for the FoodFamily + FoodVariant seed projection.
 *
 * The projection is derived at module-load from `INGREDIENT_DICTIONARY` +
 * `VARIANT_MAP`. These tests lock the invariants that make the derivation
 * safe for the resolver + dictionary UI:
 *   - every legacy ingredient maps to a family
 *   - every family has exactly one canonical variant
 *   - variant back-links are consistent
 *   - compat re-export length matches the source
 */
import { describe, it, expect } from 'vitest';
import { FOOD_FAMILIES, VARIANT_ID_TO_FAMILY } from './food-families';
import { FOOD_VARIANTS } from './food-variants';
import { INGREDIENT_DICTIONARY } from './ingredients';
import {
  getFamily,
  getVariant,
  getCanonicalVariant,
  getVariantsOfFamily,
  resolveVariant,
  ingredientIdToFamilyVariant,
  computeMacroDelta,
} from '../utils/food-family-resolver';

describe('VARIANT_MAP coverage', () => {
  it('maps every INGREDIENT_DICTIONARY id', () => {
    const missing = INGREDIENT_DICTIONARY
      .filter(ing => !VARIANT_ID_TO_FAMILY[ing.id])
      .map(ing => ing.id);
    expect(missing).toEqual([]);
  });

  it('has FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length', () => {
    expect(FOOD_VARIANTS.length).toBe(INGREDIENT_DICTIONARY.length);
  });
});

describe('FOOD_FAMILIES integrity', () => {
  it('every family has exactly one canonical variant', () => {
    for (const family of FOOD_FAMILIES) {
      const canonicals = family.variantIds
        .map(id => FOOD_VARIANTS.find(v => v.id === id))
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
        .filter(v => v.variantType === 'canonical');
      expect(canonicals).toHaveLength(1);
      expect(canonicals[0].id).toBe(family.canonicalVariantId);
    }
  });

  it('every canonicalVariantId exists in FOOD_VARIANTS', () => {
    const ids = new Set(FOOD_VARIANTS.map(v => v.id));
    for (const family of FOOD_FAMILIES) {
      expect(ids.has(family.canonicalVariantId)).toBe(true);
    }
  });

  it('every variantIds entry exists and backlinks to the family', () => {
    const byId = new Map(FOOD_VARIANTS.map(v => [v.id, v]));
    for (const family of FOOD_FAMILIES) {
      for (const vid of family.variantIds) {
        const variant = byId.get(vid);
        expect(variant, `missing variant ${vid} in family ${family.id}`).toBeDefined();
        expect(variant!.familyId).toBe(family.id);
      }
    }
  });

  it('canonicalVariantId is first in variantIds', () => {
    for (const family of FOOD_FAMILIES) {
      expect(family.variantIds[0]).toBe(family.canonicalVariantId);
    }
  });

  it('exposes multi-variant chicken family with expected members', () => {
    const chicken = getFamily('fam_chicken');
    expect(chicken).toBeDefined();
    expect(chicken!.canonicalVariantId).toBe('pro_chicken_breast_raw');
    expect(chicken!.variantIds).toContain('pro_chicken_breast_cooked');
    expect(chicken!.name).toBe('Pollo');
    expect(chicken!.nameEn).toBe('Chicken');
  });
});

describe('resolver helpers', () => {
  it('getVariant returns undefined for unknown ids', () => {
    expect(getVariant('nope_not_a_real_id')).toBeUndefined();
  });

  it('getCanonicalVariant returns the USDA reference', () => {
    const v = getCanonicalVariant('fam_chicken');
    expect(v?.id).toBe('pro_chicken_breast_raw');
    expect(v?.variantType).toBe('canonical');
  });

  it('getVariantsOfFamily returns canonical first', () => {
    const variants = getVariantsOfFamily('fam_chicken');
    expect(variants[0].id).toBe('pro_chicken_breast_raw');
    expect(variants.length).toBeGreaterThanOrEqual(2);
  });

  it('resolveVariant honors pinnedVariantId when it belongs to the family', () => {
    const v = resolveVariant('fam_chicken', 'pro_chicken_breast_cooked');
    expect(v?.id).toBe('pro_chicken_breast_cooked');
  });

  it('resolveVariant falls back to canonical when pinnedVariantId is for another family', () => {
    const v = resolveVariant('fam_chicken', 'pro_beef_steak');
    expect(v?.id).toBe('pro_chicken_breast_raw');
  });

  it('resolveVariant falls back to canonical when pinnedVariantId is undefined', () => {
    const v = resolveVariant('fam_chicken');
    expect(v?.id).toBe('pro_chicken_breast_raw');
  });

  it('ingredientIdToFamilyVariant returns null for unknown legacy ids', () => {
    expect(ingredientIdToFamilyVariant('scanned_9999999999999')).toBeNull();
  });

  it('ingredientIdToFamilyVariant maps a seed id to {familyId, variantId}', () => {
    expect(ingredientIdToFamilyVariant('pro_chicken_breast_cooked')).toEqual({
      familyId: 'fam_chicken',
      variantId: 'pro_chicken_breast_cooked',
    });
  });

  it('computeMacroDelta returns null for the canonical variant itself', () => {
    const canonical = getCanonicalVariant('fam_chicken')!;
    expect(computeMacroDelta(canonical)).toBeNull();
  });

  it('computeMacroDelta returns signed delta for a non-canonical variant', () => {
    const cooked = getVariant('pro_chicken_breast_cooked')!;
    const delta = computeMacroDelta(cooked);
    expect(delta).not.toBeNull();
    // cooked breast is denser: 165 kcal vs 120 kcal raw → +45
    expect(delta!.calories).toBeGreaterThan(0);
    expect(delta!.protein).toBeGreaterThan(0);
  });
});

describe('legacy INGREDIENT_DICTIONARY compat', () => {
  it('remains the same length post-migration (138 seed entries)', () => {
    expect(INGREDIENT_DICTIONARY).toHaveLength(138);
  });
});
