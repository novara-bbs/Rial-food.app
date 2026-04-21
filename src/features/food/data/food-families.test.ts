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
 *   - P2.5 taxonomy: no 'cut' variantType survives, legacy umbrellas are gone,
 *     subcategories are declared only for existing families
 */
import { describe, it, expect } from 'vitest';
import { FOOD_FAMILIES, SEED_BRAND_ENTRIES, VARIANT_ID_TO_FAMILY } from './food-families';
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

  // P2.6 — `FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length` was the
  // P2.5 invariant but brand variants (SEED_BRAND_ENTRIES) don't have an
  // ingredient counterpart. The new invariant folds them in so the cardinality
  // lock still catches silent drift from either side.
  it('has FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length + SEED_BRAND_ENTRIES.length', () => {
    expect(FOOD_VARIANTS.length).toBe(
      INGREDIENT_DICTIONARY.length + SEED_BRAND_ENTRIES.length,
    );
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

  // P2.5 renamed: `fam_chicken` → `fam_chicken_breast` (only ever held pechuga
  // variants; id now reflects reality. Cortes como muslo/ala serán familias
  // hermanas bajo `subcategory: 'aves'` en P8).
  it('exposes fam_chicken_breast family with expected raw + cooked variants', () => {
    const chicken = getFamily('fam_chicken_breast');
    expect(chicken).toBeDefined();
    expect(chicken!.canonicalVariantId).toBe('pro_chicken_breast_raw');
    expect(chicken!.variantIds).toContain('pro_chicken_breast_cooked');
    expect(chicken!.name).toBe('Pechuga de Pollo');
    expect(chicken!.nameEn).toBe('Chicken Breast');
    expect(chicken!.subcategory).toBe('aves');
  });
});

describe('P2.5 taxonomy locks', () => {
  it('FOOD_FAMILIES has the expected count post-P12', () => {
    // P2.5 baseline: 132. P2.6 +4 chicken cuts = 136. P12 [1.5.70] adds 43
    // Spain-basics (pescados, mariscos, verduras color, frutas, cereales,
    // legumbres, lácteos, frutos secos, condimentos, bebidas) = 179.
    // Brand variants in SEED_BRAND_ENTRIES don't create new families.
    expect(FOOD_FAMILIES.length).toBeGreaterThanOrEqual(170);
    expect(FOOD_FAMILIES.length).toBeLessThanOrEqual(200);
  });

  const REMOVED_UMBRELLAS = ['fam_chicken', 'fam_beef', 'fam_egg', 'fam_rice', 'fam_bread'] as const;
  it.each(REMOVED_UMBRELLAS)('legacy umbrella %s no longer exists', (legacyId) => {
    expect(FOOD_FAMILIES.find(f => f.id === legacyId)).toBeUndefined();
  });

  const NEW_FAMILIES = [
    'fam_chicken_breast', 'fam_beef_ground', 'fam_beef_steak',
    'fam_egg_whole', 'fam_egg_whites',
    'fam_rice_white', 'fam_rice_brown',
    'fam_bread_white', 'fam_bread_wholewheat',
    'fam_almond_butter', 'fam_peanut_butter',
    'fam_yogurt',
  ] as const;
  it.each(NEW_FAMILIES)('new / renamed family %s exists', (newId) => {
    expect(FOOD_FAMILIES.find(f => f.id === newId)).toBeDefined();
  });

  it('no variant carries variantType "cut" (removed in P2.5)', () => {
    // Data-level regression lock: compare against a widened string so TS doesn't
    // reject the literal "cut" against the narrowed VariantType union.
    for (const v of FOOD_VARIANTS) {
      expect(v.variantType as string).not.toBe('cut');
    }
  });

  it('no VARIANT_MAP entry carries variantType "cut"', () => {
    for (const [, entry] of Object.entries(VARIANT_ID_TO_FAMILY)) {
      expect(entry.variantType as string).not.toBe('cut');
    }
  });
});

describe('subcategory integrity', () => {
  it('every family with a subcategory has a non-empty slug', () => {
    for (const family of FOOD_FAMILIES) {
      if (family.subcategory !== undefined) {
        expect(family.subcategory.length).toBeGreaterThan(0);
        // Slugs are kebab-case ASCII — no spaces, no accents, no uppercase.
        expect(family.subcategory).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      }
    }
  });

  it('canonical subcategories cover the expected proteins grouping', () => {
    const aves = FOOD_FAMILIES.filter(f => f.subcategory === 'aves').map(f => f.id);
    // P2.6 — chicken cuts expansion adds 4 sibling families (thigh/drumstick/
    // wing/whole) alongside the pre-existing pechuga + pavo.
    expect(aves).toEqual(expect.arrayContaining([
      'fam_chicken_breast',
      'fam_chicken_thigh',
      'fam_chicken_drumstick',
      'fam_chicken_wing',
      'fam_chicken_whole',
      'fam_turkey_breast',
    ]));
    expect(aves.length).toBe(6);

    const vacuno = FOOD_FAMILIES.filter(f => f.subcategory === 'vacuno').map(f => f.id);
    expect(vacuno).toEqual(expect.arrayContaining(['fam_beef_ground', 'fam_beef_steak']));

    const huevo = FOOD_FAMILIES.filter(f => f.subcategory === 'huevo').map(f => f.id);
    expect(huevo).toEqual(expect.arrayContaining(['fam_egg_whole', 'fam_egg_whites']));
  });

  it('yogur subcategory includes natural + greek + kefir (post-P2.5 §B.0 gap fix)', () => {
    const yogur = FOOD_FAMILIES.filter(f => f.subcategory === 'yogur').map(f => f.id);
    expect(yogur).toEqual(expect.arrayContaining(['fam_yogurt', 'fam_greek_yogurt', 'fam_kefir']));
  });

  it('oils / legumes / supplements families have NO subcategory (render flat)', () => {
    for (const f of FOOD_FAMILIES) {
      if (f.category === 'oils' || f.category === 'legumes' || f.category === 'supplements') {
        expect(f.subcategory).toBeUndefined();
      }
    }
  });
});

describe('resolver helpers', () => {
  it('getVariant returns undefined for unknown ids', () => {
    expect(getVariant('nope_not_a_real_id')).toBeUndefined();
  });

  it('getCanonicalVariant returns the USDA reference for fam_chicken_breast', () => {
    const v = getCanonicalVariant('fam_chicken_breast');
    expect(v?.id).toBe('pro_chicken_breast_raw');
    expect(v?.variantType).toBe('canonical');
  });

  it('getVariantsOfFamily returns canonical first', () => {
    const variants = getVariantsOfFamily('fam_chicken_breast');
    expect(variants[0].id).toBe('pro_chicken_breast_raw');
    expect(variants.length).toBeGreaterThanOrEqual(2);
  });

  it('resolveVariant honors pinnedVariantId when it belongs to the family', () => {
    const v = resolveVariant('fam_chicken_breast', 'pro_chicken_breast_cooked');
    expect(v?.id).toBe('pro_chicken_breast_cooked');
  });

  it('resolveVariant falls back to canonical when pinnedVariantId is for another family', () => {
    const v = resolveVariant('fam_chicken_breast', 'pro_beef_steak');
    expect(v?.id).toBe('pro_chicken_breast_raw');
  });

  it('resolveVariant falls back to canonical when pinnedVariantId is undefined', () => {
    const v = resolveVariant('fam_chicken_breast');
    expect(v?.id).toBe('pro_chicken_breast_raw');
  });

  it('ingredientIdToFamilyVariant returns null for unknown legacy ids', () => {
    expect(ingredientIdToFamilyVariant('scanned_9999999999999')).toBeNull();
  });

  it('ingredientIdToFamilyVariant maps a seed id to {familyId, variantId}', () => {
    expect(ingredientIdToFamilyVariant('pro_chicken_breast_cooked')).toEqual({
      familyId: 'fam_chicken_breast',
      variantId: 'pro_chicken_breast_cooked',
    });
  });

  it('computeMacroDelta returns null for the canonical variant itself', () => {
    const canonical = getCanonicalVariant('fam_chicken_breast')!;
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
  // P2.5: 139. P2.6 +7 chicken cuts = 146. P12 [1.5.70] +43 Spain-basics = 189.
  it('has the expected length post-P12 (189 seed entries after +43 Spain-basics)', () => {
    expect(INGREDIENT_DICTIONARY).toHaveLength(189);
  });
});

describe('P2.6 chicken cuts', () => {
  // Four new sibling families live under `subcategory: 'aves'`. Each has its
  // own canonical (raw or whole_roasted) and a realistic ServingSize set.
  const NEW_CUT_FAMILIES = [
    { id: 'fam_chicken_thigh',     canonical: 'pro_chicken_thigh_raw' },
    { id: 'fam_chicken_drumstick', canonical: 'pro_chicken_drumstick_raw' },
    { id: 'fam_chicken_wing',      canonical: 'pro_chicken_wing_raw' },
    { id: 'fam_chicken_whole',     canonical: 'pro_chicken_whole_roasted' },
  ] as const;

  it.each(NEW_CUT_FAMILIES)('family $id exists with canonical $canonical', ({ id, canonical }) => {
    const family = getFamily(id);
    expect(family).toBeDefined();
    expect(family!.canonicalVariantId).toBe(canonical);
    expect(family!.subcategory).toBe('aves');
  });

  it('thigh family exposes both raw and cooked variants (variantType preparation)', () => {
    const variants = getVariantsOfFamily('fam_chicken_thigh');
    const cookedIds = variants.filter(v => v.variantType === 'preparation').map(v => v.id);
    expect(cookedIds).toContain('pro_chicken_thigh_cooked');
  });

  it('whole chicken has no raw counterpart (canonical = roasted)', () => {
    const variants = getVariantsOfFamily('fam_chicken_whole');
    // only the canonical roasted variant exists — pollo entero rarely consumed raw
    expect(variants).toHaveLength(1);
    expect(variants[0].id).toBe('pro_chicken_whole_roasted');
    expect(variants[0].variantType).toBe('canonical');
  });
});

describe('P2.6 brand variants seed', () => {
  it('has 8 entries spanning 4 distinct families', () => {
    expect(SEED_BRAND_ENTRIES).toHaveLength(8);
    const families = new Set(SEED_BRAND_ENTRIES.map(e => e.familyId));
    expect(families.size).toBe(4);
    expect([...families]).toEqual(expect.arrayContaining([
      'fam_greek_yogurt',
      'fam_yogurt',
      'fam_chicken_breast',
      'fam_peanut_butter',
    ]));
  });

  it.each(['brand_fam_greek_yogurt_hacendado',
    'brand_fam_greek_yogurt_oikos',
    'brand_fam_yogurt_hacendado',
    'brand_fam_yogurt_sveltesse',
    'brand_fam_chicken_breast_bonarea',
    'brand_fam_chicken_breast_carrefour_bio',
    'brand_fam_peanut_butter_hacendado',
    'brand_fam_peanut_butter_mister_choc',
  ])('brand variant %s materializes with variantType="brand" and a brand.name', (id) => {
    const v = getVariant(id);
    expect(v, `brand variant ${id} should materialize in FOOD_VARIANTS`).toBeDefined();
    expect(v!.variantType).toBe('brand');
    expect(v!.brand?.name).toBeTruthy();
    expect(v!.source).toBe('seed');
  });

  it('brand ids follow the deterministic `brand_{familyId}_{slug}` pattern', () => {
    for (const entry of SEED_BRAND_ENTRIES) {
      expect(entry.id.startsWith(`brand_${entry.familyId}_`)).toBe(true);
    }
  });

  it('brand variants are NOT canonical of their family', () => {
    for (const entry of SEED_BRAND_ENTRIES) {
      const canonical = getCanonicalVariant(entry.familyId);
      expect(canonical).toBeDefined();
      expect(canonical!.id).not.toBe(entry.id);
    }
  });

  it('brand variants inherit servingSizes + allergens + micros from canonical', () => {
    // Spot-check Hacendado Greek — should inherit the same servingSize set as
    // dai_greek_yogurt (the canonical). If someone swaps the canonical's
    // serving sizes, every brand variant picks it up automatically.
    const canonical = getCanonicalVariant('fam_greek_yogurt')!;
    const brand = getVariant('brand_fam_greek_yogurt_hacendado')!;
    expect(brand.servingSizes).toEqual(canonical.servingSizes);
    expect(brand.allergens).toEqual(canonical.allergens);
    expect(brand.micros).toEqual(canonical.micros);
    expect(brand.baseAmount).toBe(canonical.baseAmount);
    expect(brand.baseUnit).toBe(canonical.baseUnit);
  });

  it('brand variants override macros (not inherited from canonical)', () => {
    const canonical = getCanonicalVariant('fam_yogurt')!;
    const sveltesse = getVariant('brand_fam_yogurt_sveltesse')!;
    // Sveltesse 0% is ~38 kcal; plain yogurt canonical is ~61 kcal. Δ > 20
    // proves the brand override landed and didn't fall back to canonical.
    expect(Math.abs(sveltesse.macros.calories - canonical.macros.calories)).toBeGreaterThan(20);
  });

  it('qualityTags are optional — some brands carry none, some carry multi-axis', () => {
    const hacendadoGreek = getVariant('brand_fam_greek_yogurt_hacendado')!;
    const carrefourBio = getVariant('brand_fam_chicken_breast_carrefour_bio')!;
    expect(hacendadoGreek.qualityTags).toBeUndefined();
    expect(carrefourBio.qualityTags).toEqual(expect.arrayContaining(['organic', 'free-range']));
  });

  it('brand variants appear in getVariantsOfFamily drill-down (after derived variants)', () => {
    const variants = getVariantsOfFamily('fam_greek_yogurt');
    const brandIds = variants.filter(v => v.variantType === 'brand').map(v => v.id);
    expect(brandIds).toEqual(expect.arrayContaining([
      'brand_fam_greek_yogurt_hacendado',
      'brand_fam_greek_yogurt_oikos',
    ]));
  });

  it('computeMacroDelta returns a signed delta for brand vs canonical', () => {
    const sveltesse = getVariant('brand_fam_yogurt_sveltesse')!;
    const delta = computeMacroDelta(sveltesse);
    expect(delta).not.toBeNull();
    // Sveltesse has less fat than full-fat plain yogurt → negative fats delta
    expect(delta!.fats).toBeLessThan(0);
  });
});
