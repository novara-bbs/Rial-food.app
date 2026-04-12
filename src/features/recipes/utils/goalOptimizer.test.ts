import { describe, it, expect } from 'vitest';
import { getGoalSuggestions } from './goalOptimizer';
import type { Ingredient } from '../../../types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeIngredient(overrides: Partial<Ingredient> & { id: string }): Ingredient {
  return {
    id: overrides.id,
    name: overrides.name ?? overrides.id,
    nameEn: overrides.nameEn ?? overrides.id,
    description: '',
    descriptionEn: '',
    category: overrides.category ?? 'proteins',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: overrides.servingSizes ?? [{ id: 'serving', name: '1 serving', nameEn: '1 serving', grams: 30 }],
    macros: {
      calories: overrides.macros?.calories ?? 100,
      protein: overrides.macros?.protein ?? 10,
      carbs: overrides.macros?.carbs ?? 5,
      fats: overrides.macros?.fats ?? 5,
    },
    micros: { vitamins: {}, minerals: {}, others: {} },
    tags: overrides.tags ?? [],
    allergens: overrides.allergens ?? [],
  };
}

const oliveOil = makeIngredient({ id: 'olive_oil', name: 'Aceite de oliva', category: 'oils', macros: { calories: 884, protein: 0, carbs: 0, fats: 100 } });
const almonds = makeIngredient({ id: 'almonds', name: 'Almendras', category: 'nuts_seeds', macros: { calories: 579, protein: 21, carbs: 22, fats: 50 } });
const cheese = makeIngredient({ id: 'cheese', name: 'Queso', category: 'dairy', macros: { calories: 400, protein: 25, carbs: 2, fats: 33 } });

const chickenBreast = makeIngredient({ id: 'chicken', name: 'Pollo', category: 'proteins', macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 } });
const chickenThigh = makeIngredient({ id: 'chicken_thigh', name: 'Muslo de pollo', category: 'proteins', macros: { calories: 209, protein: 26, carbs: 0, fats: 13 } });

const dictionary = [oliveOil, almonds, cheese, chickenBreast, chickenThigh];

// ─── getGoalSuggestions ───────────────────────────────────────────────────────

describe('getGoalSuggestions — maintain/health goals', () => {
  it('returns empty array for maintain goal', () => {
    expect(getGoalSuggestions({}, { goal: 'maintain' }, dictionary)).toHaveLength(0);
  });

  it('returns empty array for health goal', () => {
    expect(getGoalSuggestions({}, { goal: 'health' }, dictionary)).toHaveLength(0);
  });

  it('returns empty array for family goal', () => {
    expect(getGoalSuggestions({}, { goal: 'family' }, dictionary)).toHaveLength(0);
  });

  it('returns empty array for performance goal', () => {
    expect(getGoalSuggestions({}, { goal: 'performance' }, dictionary)).toHaveLength(0);
  });

  it('returns empty array when no goal set (defaults to maintain)', () => {
    expect(getGoalSuggestions({}, {}, dictionary)).toHaveLength(0);
  });
});

describe('getGoalSuggestions — gain/muscle goal', () => {
  it('returns add suggestions for gain goal', () => {
    const suggestions = getGoalSuggestions({}, { goal: 'gain' }, dictionary);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every(s => s.type === 'add')).toBe(true);
  });

  it('returns add suggestions for muscle goal', () => {
    const suggestions = getGoalSuggestions({}, { goal: 'muscle' }, dictionary);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('suggestions include an ingredient reference', () => {
    const suggestions = getGoalSuggestions({}, { goal: 'gain' }, dictionary);
    expect(suggestions[0].ingredient).toBeDefined();
  });

  it('suggestions have macroImpact', () => {
    const suggestions = getGoalSuggestions({}, { goal: 'gain' }, dictionary);
    const s = suggestions[0];
    expect(s.macroImpact).toBeDefined();
    expect(typeof s.macroImpact.cal).toBe('number');
    expect(typeof s.macroImpact.pro).toBe('number');
    expect(typeof s.macroImpact.fats).toBe('number');
  });

  it('skips ingredients already in recipe', () => {
    const recipe = {
      recipeIngredients: [{ ingredientId: 'olive_oil', amount: 10, unit: 'g' }],
    };
    const suggestions = getGoalSuggestions(recipe, { goal: 'gain' }, dictionary);
    expect(suggestions.every(s => s.ingredient?.id !== 'olive_oil')).toBe(true);
  });

  it('respects dislikes filter', () => {
    const suggestions = getGoalSuggestions({}, { goal: 'gain', foodDislikes: ['olive_oil', 'almonds', 'cheese'] }, dictionary);
    expect(suggestions).toHaveLength(0);
  });

  it('returns at most 3 suggestions', () => {
    const suggestions = getGoalSuggestions({}, { goal: 'gain' }, dictionary);
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });
});

describe('getGoalSuggestions — lose/cut goal', () => {
  it('returns swap suggestions for lose goal when recipe has high-fat ingredients', () => {
    const recipe = {
      recipeIngredients: [
        { ingredientId: 'chicken_thigh', amount: 150, unit: 'g', ingredient: chickenThigh },
      ],
    };
    const suggestions = getGoalSuggestions(recipe, { goal: 'lose' }, dictionary);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every(s => s.type === 'swap')).toBe(true);
  });

  it('swap suggestion references fromIngredient and toIngredient', () => {
    const recipe = {
      recipeIngredients: [
        { ingredientId: 'chicken_thigh', amount: 150, unit: 'g', ingredient: chickenThigh },
      ],
    };
    const suggestions = getGoalSuggestions(recipe, { goal: 'lose' }, dictionary);
    if (suggestions.length > 0) {
      expect(suggestions[0].fromIngredient).toBeDefined();
      expect(suggestions[0].toIngredient).toBeDefined();
    }
  });

  it('cut goal behaves same as lose', () => {
    const recipe = {
      recipeIngredients: [
        { ingredientId: 'chicken_thigh', amount: 150, unit: 'g', ingredient: chickenThigh },
      ],
    };
    const lose = getGoalSuggestions(recipe, { goal: 'lose' }, dictionary);
    const cut = getGoalSuggestions(recipe, { goal: 'cut' }, dictionary);
    expect(lose.length).toBe(cut.length);
  });

  it('returns empty when recipe has no high-fat ingredients', () => {
    const recipe = {
      recipeIngredients: [
        { ingredientId: 'chicken', amount: 150, unit: 'g', ingredient: chickenBreast },
      ],
    };
    const suggestions = getGoalSuggestions(recipe, { goal: 'lose' }, dictionary);
    expect(suggestions).toHaveLength(0);
  });

  it('returns empty when no recipe ingredients provided', () => {
    const suggestions = getGoalSuggestions({}, { goal: 'lose' }, dictionary);
    expect(suggestions).toHaveLength(0);
  });
});
