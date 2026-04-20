/**
 * FoodFamily + FoodVariant types — P0 contract.
 *
 * Locks the enum literals (`VariantType`, `FoodSource`) and the required-field
 * shape of the family/variant interfaces. Silent removal of a literal or of
 * `familyId` / `canonicalVariantId` would cascade into the seed migration and
 * the dictionary drill-down — regression-check it here.
 */
import { describe, it, expect } from 'vitest';
import {
  FOOD_SOURCES,
  QUALITY_TAG_SLUGS,
  VARIANT_TYPES,
  type FoodFamily,
  type FoodSource,
  type FoodVariant,
  type QualityTagSlug,
  type VariantType,
} from '../../types/food-family';
import { RecipeSchema } from '../../lib/schemas';

describe('VARIANT_TYPES', () => {
  it('exposes exactly the 6 canonical variant types (P2.5 drops "cut")', () => {
    expect(VARIANT_TYPES).toEqual([
      'canonical',
      'preparation',
      'quality',
      'regional',
      'brand',
      'user',
    ]);
  });

  it('locks each literal as a TypeScript member of VariantType', () => {
    const members: VariantType[] = [
      'canonical',
      'preparation',
      'quality',
      'regional',
      'brand',
      'user',
    ];
    expect(members).toHaveLength(6);
  });

  it('no longer includes "cut" — cuts are families, not variants', () => {
    expect(VARIANT_TYPES).not.toContain('cut' as VariantType);
  });
});

describe('QUALITY_TAG_SLUGS', () => {
  it('exposes exactly the 9 canonical quality tag slugs', () => {
    expect(QUALITY_TAG_SLUGS).toEqual([
      'organic',
      'free-range',
      'grass-fed',
      'light',
      'sugar-free',
      'lactose-free',
      'gluten-free',
      'high-protein',
      'no-additives',
    ]);
  });

  it('locks each literal as a TypeScript member of QualityTagSlug', () => {
    const members: QualityTagSlug[] = [
      'organic',
      'free-range',
      'grass-fed',
      'light',
      'sugar-free',
      'lactose-free',
      'gluten-free',
      'high-protein',
      'no-additives',
    ];
    expect(members).toHaveLength(9);
  });
});

describe('FOOD_SOURCES', () => {
  it('exposes exactly the 4 canonical sources', () => {
    expect(FOOD_SOURCES).toEqual(['seed', 'user', 'off', 'edamam']);
  });

  it('locks each literal as a TypeScript member of FoodSource', () => {
    const members: FoodSource[] = ['seed', 'user', 'off', 'edamam'];
    expect(members).toHaveLength(4);
  });
});

describe('FoodFamily shape', () => {
  it('requires id, name, canonicalVariantId and variantIds', () => {
    const fam: FoodFamily = {
      id: 'fam_chicken_breast',
      name: 'Pechuga de Pollo',
      nameEn: 'Chicken Breast',
      description: 'Pechuga de pollo, corte estándar.',
      descriptionEn: 'Boneless skinless chicken breast.',
      category: 'proteins',
      canonicalVariantId: 'var_chicken_breast_raw',
      variantIds: ['var_chicken_breast_raw'],
      tags: ['high-protein'],
    };
    expect(fam.canonicalVariantId).toBe('var_chicken_breast_raw');
    expect(fam.variantIds).toContain(fam.canonicalVariantId);
  });

  it('accepts an optional subcategory slug (P2.5)', () => {
    const fam: Pick<FoodFamily, 'subcategory'> = { subcategory: 'aves' };
    expect(fam.subcategory).toBe('aves');

    const noSub: Pick<FoodFamily, 'subcategory'> = {};
    expect(noSub.subcategory).toBeUndefined();
  });
});

describe('FoodVariant shape', () => {
  it('requires familyId, variantType, source and macros', () => {
    const v: FoodVariant = {
      id: 'var_chicken_breast_raw',
      familyId: 'fam_chicken',
      name: 'Pechuga cruda',
      nameEn: 'Raw breast',
      variantType: 'canonical',
      baseAmount: 100,
      baseUnit: 'g',
      servingSizes: [],
      macros: { calories: 120, protein: 22.5, carbs: 0, fats: 2.6 },
      micros: { vitamins: {}, minerals: {}, others: {} },
      allergens: [],
      source: 'seed',
    };
    expect(v.familyId).toBe('fam_chicken');
    expect(v.variantType).toBe('canonical');
    expect(v.source).toBe('seed');
  });

  it('allows brand metadata for variantType brand', () => {
    const v: FoodVariant = {
      id: 'var_yogurt_hacendado',
      familyId: 'fam_greek_yogurt',
      name: 'Yogur griego Hacendado',
      nameEn: 'Hacendado Greek yogurt',
      variantType: 'brand',
      brand: { name: 'Hacendado', barcode: '8410032002002', scanned: true },
      baseAmount: 100,
      baseUnit: 'g',
      servingSizes: [],
      macros: { calories: 120, protein: 8, carbs: 4, fats: 8 },
      micros: { vitamins: {}, minerals: {}, others: {} },
      allergens: ['dairy'],
      source: 'off',
      sourceId: '8410032002002',
    };
    expect(v.brand?.barcode).toBe('8410032002002');
    expect(v.source).toBe('off');
  });

  it('accepts multi-axis qualityTags orthogonal to variantType (P2.5)', () => {
    const v: FoodVariant = {
      id: 'var_chicken_breast_lidl',
      familyId: 'fam_chicken_breast',
      name: 'Pechuga de pollo (Lidl)',
      nameEn: 'Chicken breast (Lidl)',
      variantType: 'brand',
      brand: { name: 'Lidl', barcode: '8480000123456', scanned: true },
      qualityTags: ['free-range', 'organic'],
      baseAmount: 100,
      baseUnit: 'g',
      servingSizes: [],
      macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
      micros: { vitamins: {}, minerals: {}, others: {} },
      allergens: [],
      source: 'off',
      sourceId: '8480000123456',
    };
    expect(v.variantType).toBe('brand');
    expect(v.qualityTags).toEqual(['free-range', 'organic']);
  });

  it('treats qualityTags as optional (absent is valid)', () => {
    const v: Pick<FoodVariant, 'qualityTags'> = {};
    expect(v.qualityTags).toBeUndefined();
  });
});

describe('RecipeSchema — dual-shape RecipeIngredient', () => {
  it('accepts legacy payload with ingredientId only', () => {
    const legacy = {
      id: 'r1',
      title: 'Test',
      recipeIngredients: [{ id: 'i1', ingredientId: 'pro_chicken_breast_raw', amount: 150, unit: 'g' }],
    };
    const parsed = RecipeSchema.safeParse(legacy);
    expect(parsed.success).toBe(true);
  });

  it('accepts new payload with familyId + variantId', () => {
    const next = {
      id: 'r1',
      title: 'Test',
      recipeIngredients: [{
        id: 'i1',
        familyId: 'fam_chicken_breast',
        variantId: 'var_chicken_breast_cooked',
        amount: 150,
        unit: 'g',
      }],
    };
    const parsed = RecipeSchema.safeParse(next);
    expect(parsed.success).toBe(true);
  });

  it('accepts new payload with familyId only (canonical fallback)', () => {
    const canonicalOnly = {
      id: 'r1',
      title: 'Test',
      recipeIngredients: [{ id: 'i1', familyId: 'fam_chicken_breast', amount: 150, unit: 'g' }],
    };
    const parsed = RecipeSchema.safeParse(canonicalOnly);
    expect(parsed.success).toBe(true);
  });

  it('rejects a recipe ingredient missing both familyId and ingredientId', () => {
    const empty = {
      id: 'r1',
      title: 'Test',
      recipeIngredients: [{ id: 'i1', amount: 150, unit: 'g' }],
    };
    const parsed = RecipeSchema.safeParse(empty);
    expect(parsed.success).toBe(false);
  });
});
