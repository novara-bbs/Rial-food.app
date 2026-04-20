/**
 * P9 `[1.5.66]` — contextual score heuristic tests.
 *
 * The tests encode the owner's example ("aceite de oliva is A for gain but
 * C for lose") and a handful of canonical comparisons so future tweaks to
 * the heuristic don't silently regress behavior.
 */
import { describe, it, expect } from 'vitest';
import type { FoodVariant, VariantType } from '../../../types/food-family';
import {
  computeContextualScore,
  normalizeGoal,
  gradeColorClass,
  GOALS,
  SCORE_GRADES,
} from './contextual-score';

function mkVariant(overrides: {
  id?: string;
  variantType?: VariantType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  qualityTags?: FoodVariant['qualityTags'];
}): FoodVariant {
  return {
    id: overrides.id ?? 'test_variant',
    familyId: 'fam_test',
    name: 'Test',
    nameEn: 'Test',
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
    allergens: [],
    source: 'seed',
    ...(overrides.qualityTags ? { qualityTags: overrides.qualityTags } : {}),
  };
}

describe('normalizeGoal', () => {
  it('maps the common free-form values', () => {
    expect(normalizeGoal('lose')).toBe('lose-weight');
    expect(normalizeGoal('cut')).toBe('lose-weight');
    expect(normalizeGoal('gain')).toBe('gain-weight');
    expect(normalizeGoal('muscle')).toBe('gain-weight');
    expect(normalizeGoal('performance')).toBe('gain-weight');
    expect(normalizeGoal('maintain')).toBe('maintain');
    expect(normalizeGoal('health')).toBe('maintain');
    expect(normalizeGoal('family')).toBe('maintain');
  });

  it('returns null for unknown or empty input', () => {
    expect(normalizeGoal(undefined)).toBeNull();
    expect(normalizeGoal(null)).toBeNull();
    expect(normalizeGoal('')).toBeNull();
    expect(normalizeGoal('foo')).toBeNull();
  });

  it('is case insensitive', () => {
    expect(normalizeGoal('LOSE')).toBe('lose-weight');
    expect(normalizeGoal(' Gain ')).toBe('gain-weight');
  });
});

describe('computeContextualScore — reference foods', () => {
  it('olive oil: A for gain, B for maintain, C or D for lose (owner example)', () => {
    const oliveOil = mkVariant({ calories: 884, protein: 0, carbs: 0, fats: 100 });
    const gain = computeContextualScore(oliveOil, 'gain-weight');
    const maintain = computeContextualScore(oliveOil, 'maintain');
    const lose = computeContextualScore(oliveOil, 'lose-weight');

    expect(gain.grade).toBe('A');
    expect(maintain.grade).toBe('B');
    expect(['C', 'D']).toContain(lose.grade);
    expect(lose.caveats).toContain('watch-portion');
  });

  it('chicken breast: A for lose, A for maintain, B for gain', () => {
    const chicken = mkVariant({ calories: 165, protein: 31, carbs: 0, fats: 3.6 });
    expect(computeContextualScore(chicken, 'lose-weight').grade).toBe('A');
    expect(computeContextualScore(chicken, 'maintain').grade).toBe('A');
    expect(computeContextualScore(chicken, 'gain-weight').grade).toBe('B');
  });

  it('cola (empty calories): E for lose, D for maintain, C for gain', () => {
    const cola = mkVariant({
      calories: 42,
      protein: 0,
      carbs: 10.6,
      fats: 0,
      variantType: 'brand',
      qualityTags: [],
    });
    expect(computeContextualScore(cola, 'lose-weight').grade).toBe('E');
    expect(computeContextualScore(cola, 'maintain').grade).toBe('D');
    // Cola is ultra-processed brand → 'C' for gain per heuristic.
    expect(computeContextualScore(cola, 'gain-weight').grade).toBe('C');
  });

  it('broccoli (mostly water): A for lose, A for maintain-ish, D for gain', () => {
    const broccoli = mkVariant({ calories: 34, protein: 2.8, carbs: 7, fats: 0.4 });
    // Broccoli at 34 kcal is above 10 but below 100 → falls to neutral paths.
    expect(computeContextualScore(broccoli, 'lose-weight').grade).toBe('B');
    // Gain-wise broccoli is too light.
    expect(computeContextualScore(broccoli, 'gain-weight').grade).toBe('C');
  });

  it('water/very-low-kcal: A for lose, A for maintain, D for gain', () => {
    const water = mkVariant({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    expect(computeContextualScore(water, 'lose-weight').grade).toBe('A');
    expect(computeContextualScore(water, 'maintain').grade).toBe('A');
    expect(computeContextualScore(water, 'gain-weight').grade).toBe('D');
  });

  it('whole egg: B/A for all 3 goals (whole food, balanced)', () => {
    const egg = mkVariant({ calories: 155, protein: 13, carbs: 1.1, fats: 11 });
    // For lose: 13g protein is below the 20 threshold → grade B not A.
    const lose = computeContextualScore(egg, 'lose-weight');
    const maintain = computeContextualScore(egg, 'maintain');
    const gain = computeContextualScore(egg, 'gain-weight');
    expect(['A', 'B']).toContain(lose.grade);
    expect(maintain.grade).toBe('A');
    expect(['A', 'B']).toContain(gain.grade);
  });

  it('oats (dry): reasonable for all 3 goals — carb-rich', () => {
    const oats = mkVariant({ calories: 389, protein: 17, carbs: 66, fats: 7 });
    // Oats dense → lose gets D (high cal density, low pPerK at 0.17).
    // For maintain: dense + not ultra-processed → B.
    // For gain: carb-rich → A.
    const lose = computeContextualScore(oats, 'lose-weight');
    expect(['C', 'D']).toContain(lose.grade);
    const maintain = computeContextualScore(oats, 'maintain');
    expect(['A', 'B']).toContain(maintain.grade);
    const gain = computeContextualScore(oats, 'gain-weight');
    expect(gain.grade).toBe('A');
  });
});

describe('computeContextualScore — output shape', () => {
  it('returns a closed-set grade for all 3 goals', () => {
    const v = mkVariant({ calories: 200, protein: 10, carbs: 25, fats: 5 });
    for (const goal of GOALS) {
      const score = computeContextualScore(v, goal);
      expect(SCORE_GRADES).toContain(score.grade);
      expect(typeof score.rationale).toBe('string');
      expect(Array.isArray(score.caveats)).toBe(true);
    }
  });

  it('caveats are always 0-3 slugs', () => {
    const v = mkVariant({ calories: 600, protein: 2, carbs: 70, fats: 35 });
    for (const goal of GOALS) {
      const score = computeContextualScore(v, goal);
      expect(score.caveats.length).toBeLessThanOrEqual(3);
    }
  });

  it('brand + no "no-additives" tag receives ultra-processed caveat somewhere', () => {
    const processed = mkVariant({
      calories: 250,
      protein: 5,
      carbs: 30,
      fats: 12,
      variantType: 'brand',
      qualityTags: [],
    });
    // At least one of the 3 goals should surface the ultra-processed caveat.
    const caveats = GOALS.flatMap(g => computeContextualScore(processed, g).caveats);
    expect(caveats).toContain('ultra-processed');
  });
});

describe('gradeColorClass', () => {
  it('returns a non-empty class for every grade', () => {
    for (const g of SCORE_GRADES) {
      expect(gradeColorClass(g)).toBeTruthy();
      expect(gradeColorClass(g).length).toBeGreaterThan(3);
    }
  });
});
