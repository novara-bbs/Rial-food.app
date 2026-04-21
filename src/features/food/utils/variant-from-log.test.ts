/**
 * P13 `[1.5.71]` — tests for the log-entry → FoodVariant resolver.
 */
import { describe, it, expect } from 'vitest';
import type { FoodVariant } from '../../../types/food-family';
import type { DailyLogEntry } from '../handlers/meal-handlers';
import { variantFromLogEntry, variantFromIngredientLike } from './variant-from-log';

function mkVariant(id: string, macros: FoodVariant['macros']): FoodVariant {
  return {
    id,
    familyId: 'fam_test',
    name: id,
    nameEn: id,
    variantType: 'canonical',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [],
    macros,
    micros: { vitamins: {}, minerals: {}, others: {} },
    allergens: [],
    source: 'seed',
  };
}

function mkLog(overrides: Partial<DailyLogEntry> & { macros: DailyLogEntry['macros'] }): DailyLogEntry {
  return {
    id: 1,
    title: 'Test',
    portionDescription: '100g',
    mealSlot: 'lunch',
    time: '13:00',
    grams: 100,
    ...overrides,
  };
}

const chicken = mkVariant('fam_chicken_breast', { calories: 165, protein: 31, carbs: 0, fats: 3.6 });
const oats = mkVariant('fam_oats', { calories: 389, protein: 17, carbs: 66, fats: 7 });
const POOL = [chicken, oats];

describe('variantFromLogEntry', () => {
  it('resolves from ingredientIds first when an id matches the pool', () => {
    const entry = mkLog({
      macros: { cal: 330, pro: 62, carbs: 0, fats: 7 },
      grams: 200,
      ingredientIds: ['fam_chicken_breast'],
    });
    const v = variantFromLogEntry(entry, POOL);
    expect(v).toBe(chicken); // identity, not copy
  });

  it('tries every id in ingredientIds[] until one matches', () => {
    const entry = mkLog({
      macros: { cal: 330, pro: 62, carbs: 0, fats: 7 },
      grams: 200,
      ingredientIds: ['unknown_id', 'fam_oats'],
    });
    const v = variantFromLogEntry(entry, POOL);
    expect(v?.id).toBe('fam_oats');
  });

  it('falls back to pseudo-variant when no id matches + grams known', () => {
    const entry = mkLog({
      macros: { cal: 200, pro: 15, carbs: 25, fats: 5 },
      grams: 100,
    });
    const v = variantFromLogEntry(entry, POOL);
    expect(v).not.toBeNull();
    expect(v?.id).toBe('log_1');
    expect(v?.macros.calories).toBe(200);
    expect(v?.macros.protein).toBe(15);
    expect(v?.variantType).toBe('user');
  });

  it('normalises pseudo-variant macros to per-100g when entry.grams ≠ 100', () => {
    const entry = mkLog({
      macros: { cal: 400, pro: 40, carbs: 20, fats: 10 },
      grams: 200, // 200g eaten → per-100g is half
    });
    const v = variantFromLogEntry(entry, POOL);
    expect(v?.macros.calories).toBe(200);
    expect(v?.macros.protein).toBe(20);
    expect(v?.macros.carbs).toBe(10);
    expect(v?.macros.fats).toBe(5);
  });

  it('returns null when grams is missing (cannot normalise safely)', () => {
    const entry = mkLog({
      macros: { cal: 200, pro: 15, carbs: 25, fats: 5 },
      grams: undefined,
    });
    expect(variantFromLogEntry(entry, POOL)).toBeNull();
  });

  it('returns null when grams is 0', () => {
    const entry = mkLog({
      macros: { cal: 200, pro: 15, carbs: 25, fats: 5 },
      grams: 0,
    });
    expect(variantFromLogEntry(entry, POOL)).toBeNull();
  });

  it('clamps negative pseudo-macros to 0 defensively', () => {
    // Shouldn't happen in practice, but guard against weird data.
    const entry = mkLog({
      macros: { cal: -50, pro: -10, carbs: 20, fats: 5 },
      grams: 100,
    });
    const v = variantFromLogEntry(entry, POOL);
    expect(v?.macros.calories).toBe(0);
    expect(v?.macros.protein).toBe(0);
  });
});

describe('variantFromIngredientLike', () => {
  it('returns the pool variant directly when id matches', () => {
    const v = variantFromIngredientLike(
      { id: 'fam_chicken_breast', name: 'Pollo', macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 } },
      POOL,
    );
    expect(v).toBe(chicken);
  });

  it('constructs a brand pseudo-variant for OFF API ids (scanned_*)', () => {
    const v = variantFromIngredientLike(
      { id: 'scanned_8480000149664', name: 'Hacendado Crema Cacahuete', macros: { calories: 620, protein: 25, carbs: 12, fats: 55 } },
      POOL,
    );
    expect(v.id).toBe('scanned_8480000149664');
    expect(v.variantType).toBe('brand');
    expect(v.source).toBe('off');
    expect(v.macros.calories).toBe(620);
  });

  it('constructs a user pseudo-variant for non-scanned ids not in pool', () => {
    const v = variantFromIngredientLike(
      { id: 'custom_foo', name: 'Custom', macros: { calories: 100, protein: 5, carbs: 10, fats: 3 } },
      POOL,
    );
    expect(v.variantType).toBe('user');
    expect(v.source).toBe('seed');
  });
});
