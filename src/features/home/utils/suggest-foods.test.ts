/**
 * P11 `[1.5.69]` — food ranking tests.
 *
 * Locks the ranking contract:
 *   - protein deficit → high-protein foods win
 *   - calorie deficit → balanced whole foods (not oils) win
 *   - history affinity boosts the user's recent foods
 *   - allergen exclusion hard-filters
 *   - goal E foods never appear
 */
import { describe, it, expect } from 'vitest';
import type { FoodVariant, VariantType } from '../../../types/food-family';
import type { FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import { rankFoodsForGap } from './suggest-foods';

function mkVariant(overrides: {
  id: string;
  name?: string;
  variantType?: VariantType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  allergens?: FoodVariant['allergens'];
  source?: FoodVariant['source'];
}): FoodVariant {
  return {
    id: overrides.id,
    familyId: 'fam_test',
    name: overrides.name ?? overrides.id,
    nameEn: overrides.name ?? overrides.id,
    variantType: overrides.variantType ?? 'canonical',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [],
    macros: {
      calories: overrides.calories,
      protein: overrides.protein,
      carbs: overrides.carbs,
      fats: overrides.fats,
    },
    micros: { vitamins: {}, minerals: {}, others: {} },
    allergens: overrides.allergens ?? [],
    source: overrides.source ?? 'seed',
  };
}

function mkHistory(foodId: string, useCount = 3): FoodHistoryEntry {
  return {
    foodId,
    title: foodId,
    lastUsed: Date.now(),
    useCount,
    lastMacros: { cal: 100, pro: 10, carbs: 10, fats: 5 },
    lastPortionDescription: '100g',
    source: 'dictionary',
  };
}

const chicken = mkVariant({ id: 'fam_chicken_breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 });
const tuna = mkVariant({ id: 'fam_tuna', calories: 132, protein: 28, carbs: 0, fats: 1 });
const yogurt = mkVariant({ id: 'fam_greek_yogurt', calories: 112, protein: 10, carbs: 4, fats: 6 });
const oliveOil = mkVariant({ id: 'fam_olive_oil', calories: 884, protein: 0, carbs: 0, fats: 100 });
const cola = mkVariant({
  id: 'brand_cola',
  calories: 42,
  protein: 0,
  carbs: 10.6,
  fats: 0,
  variantType: 'brand',
});
const oats = mkVariant({ id: 'fam_oats', calories: 389, protein: 17, carbs: 66, fats: 7 });
const lentils = mkVariant({ id: 'fam_lentils', calories: 116, protein: 9, carbs: 20, fats: 0.4 });
const almonds = mkVariant({
  id: 'fam_almond',
  calories: 579,
  protein: 21,
  carbs: 22,
  fats: 50,
  allergens: ['nuts'],
});

const POOL = [chicken, tuna, yogurt, oliveOil, cola, oats, lentils, almonds];

describe('rankFoodsForGap — protein deficit', () => {
  it('returns high-protein foods first (chicken, tuna, yogurt over oliveOil/cola)', () => {
    const ranked = rankFoodsForGap('pro', POOL, { limit: 3 });
    expect(ranked.length).toBeLessThanOrEqual(3);
    const ids = ranked.map(r => r.variant.id);
    expect(ids[0]).toBe('fam_chicken_breast');
    expect(ids).toContain('fam_tuna');
  });

  it('excludes zero-protein foods (olive oil never surfaces)', () => {
    const ranked = rankFoodsForGap('pro', POOL, { limit: 10 });
    expect(ranked.find(r => r.variant.id === 'fam_olive_oil')).toBeUndefined();
    expect(ranked.find(r => r.variant.id === 'brand_cola')).toBeUndefined();
  });
});

describe('rankFoodsForGap — calorie deficit', () => {
  it('prefers balanced whole foods over pure fat (oats/almonds over oliveOil/cola)', () => {
    const ranked = rankFoodsForGap('cal', POOL, { limit: 3 });
    const ids = ranked.map(r => r.variant.id);
    // Almonds wins by raw sum (21+22+50=93) but let's just assert olive-oil
    // does NOT outrank whole foods despite 100g fat.
    expect(ids).not.toContain('fam_olive_oil');
    // At least one of oats/almonds should be in top 3.
    expect(ids.some(id => id === 'fam_oats' || id === 'fam_almond')).toBe(true);
  });
});

describe('rankFoodsForGap — history affinity', () => {
  it('boosts a variant the user has logged recently', () => {
    const withoutHistory = rankFoodsForGap('pro', POOL, { limit: 5 });
    const yogurtRankWithout = withoutHistory.findIndex(r => r.variant.id === 'fam_greek_yogurt');

    const withHistory = rankFoodsForGap('pro', POOL, {
      limit: 5,
      history: [mkHistory('fam_greek_yogurt', 5)],
    });
    const yogurtRankWith = withHistory.findIndex(r => r.variant.id === 'fam_greek_yogurt');
    // Yogurt's position moves up (or stays same) with history. Never regresses.
    expect(yogurtRankWith).toBeLessThanOrEqual(yogurtRankWithout);
    // History-boosted entries get the 'history' reason.
    expect(withHistory[yogurtRankWith].reason).toBe('history');
  });
});

describe('rankFoodsForGap — allergen exclusion', () => {
  it('hard-filters variants matching excludeAllergens', () => {
    const ranked = rankFoodsForGap('pro', POOL, {
      limit: 10,
      excludeAllergens: ['nuts'],
    });
    expect(ranked.find(r => r.variant.id === 'fam_almond')).toBeUndefined();
  });
});

describe('rankFoodsForGap — goal disqualification', () => {
  it('never surfaces grade-E foods for a lose-weight goal (cola disappears)', () => {
    const ranked = rankFoodsForGap('carbs', POOL, {
      limit: 10,
      rawGoal: 'lose',
    });
    // Cola has variantType='brand' + carbs=10.6 → grade E for lose-weight.
    expect(ranked.find(r => r.variant.id === 'brand_cola')).toBeUndefined();
  });
});

describe('rankFoodsForGap — respects limit', () => {
  it('returns at most `limit` entries', () => {
    const ranked = rankFoodsForGap('pro', POOL, { limit: 2 });
    expect(ranked.length).toBeLessThanOrEqual(2);
  });

  it('defaults to 3 when limit is omitted', () => {
    const ranked = rankFoodsForGap('pro', POOL);
    expect(ranked.length).toBeLessThanOrEqual(3);
  });

  it('returns empty array for a pool with no positive-density variants', () => {
    const oilOnly = [oliveOil];
    const ranked = rankFoodsForGap('pro', oilOnly);
    expect(ranked).toEqual([]);
  });
});
