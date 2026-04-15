/**
 * Tests for the smart ingredient substitution engine.
 * Covers: getRecipeSwaps — dislike + intolerance paths, ranking, edge cases.
 */
import { describe, it, expect } from 'vitest';
import { getRecipeSwaps } from './substitutions';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeIngredient = (overrides: Partial<{
  id: string; name: string; category: string; tags: string[];
  allergens: string[]; macros: { calories: number; protein: number; carbs: number; fats: number };
  baseUnit: string;
}>) => ({
  id: overrides.id ?? 'ing-1',
  name: overrides.name ?? 'Test',
  category: overrides.category ?? 'Proteína',
  tags: overrides.tags ?? [],
  allergens: overrides.allergens ?? [],
  macros: overrides.macros ?? { calories: 100, protein: 20, carbs: 0, fats: 3 },
  baseUnit: overrides.baseUnit ?? 'g',
  servingSizes: [],
  micronutrients: {},
});

const chicken = makeIngredient({ id: 'chicken', name: 'Pollo', category: 'Proteína', tags: ['animal', 'proteína'], allergens: [], macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 } });
const beef = makeIngredient({ id: 'beef', name: 'Ternera', category: 'Proteína', tags: ['animal', 'proteína'], allergens: [], macros: { calories: 215, protein: 26, carbs: 0, fats: 12 } });
const tofu = makeIngredient({ id: 'tofu', name: 'Tofu', category: 'Proteína', tags: ['vegetal', 'proteína'], allergens: ['soja'], macros: { calories: 76, protein: 8, carbs: 1.9, fats: 4.2 } });
const egg = makeIngredient({ id: 'egg', name: 'Huevo', category: 'Proteína', tags: ['animal'], allergens: ['huevo'], macros: { calories: 155, protein: 13, carbs: 1.1, fats: 11 } });
const turkey = makeIngredient({ id: 'turkey', name: 'Pavo', category: 'Proteína', tags: ['animal', 'proteína'], allergens: [], macros: { calories: 135, protein: 30, carbs: 0, fats: 1 } });

const dictionary = [chicken, beef, tofu, egg, turkey] as any[];

let _riCounter = 0;
const makeRI = (ingredient: any, amount = 100, unit = 'g') => ({
  id: `ri-${++_riCounter}`,
  ingredientId: ingredient.id,
  ingredient,
  amount,
  unit,
});

// ─── getRecipeSwaps ───────────────────────────────────────────────────────────

describe('getRecipeSwaps', () => {
  it('returns empty array when no dislikes or intolerances', () => {
    const result = getRecipeSwaps([makeRI(chicken)], { foodDislikes: [], intolerances: [] }, dictionary);
    expect(result).toHaveLength(0);
  });

  it('returns swap for disliked ingredient', () => {
    const result = getRecipeSwaps(
      [makeRI(chicken)],
      { foodDislikes: ['chicken'], intolerances: [] },
      dictionary,
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].fromIngredient.id).toBe('chicken');
    expect(result[0].reason).toBe('dislike');
    expect(result[0].toIngredient.id).not.toBe('chicken');
  });

  it('returns swap for ingredient that triggers intolerance', () => {
    const result = getRecipeSwaps(
      [makeRI(egg)],
      { foodDislikes: [], intolerances: ['huevo' as any] },
      dictionary,
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].fromIngredient.id).toBe('egg');
    expect(result[0].reason).toBe('intolerance');
    expect(result[0].allergenHit).toBe('huevo');
  });

  it('does not suggest a replacement that is also disliked', () => {
    // Dislike both chicken and beef — should not suggest beef as replacement for chicken
    const result = getRecipeSwaps(
      [makeRI(chicken)],
      { foodDislikes: ['chicken', 'beef'], intolerances: [] },
      dictionary,
    );
    if (result.length > 0) {
      expect(result[0].toIngredient.id).not.toBe('beef');
    }
  });

  it('does not suggest a replacement that triggers user intolerance', () => {
    // Intolerant to soja — should not suggest tofu as replacement for chicken
    const result = getRecipeSwaps(
      [makeRI(chicken)],
      { foodDislikes: ['chicken'], intolerances: ['soja' as any] },
      dictionary,
    );
    if (result.length > 0) {
      const suggestedIds = result.map(r => r.toIngredient.id);
      expect(suggestedIds).not.toContain('tofu');
    }
  });

  it('prefers same-category replacement, excludes intolerance ingredients', () => {
    // Tofu is excluded (soja intolerance) — remaining: beef or turkey (both same-category Proteína)
    const result = getRecipeSwaps(
      [makeRI(chicken)],
      { foodDislikes: ['chicken'], intolerances: ['soja' as any] },
      dictionary,
    );
    expect(result.length).toBeGreaterThan(0);
    // Replacement must not be chicken (disliked) or tofu (intolerance)
    expect(result[0].toIngredient.id).not.toBe('chicken');
    expect(result[0].toIngredient.id).not.toBe('tofu');
    // Must be same category
    expect(result[0].toIngredient.category).toBe('Proteína');
  });

  it('returns correct macroImpact calculation', () => {
    const result = getRecipeSwaps(
      [makeRI(chicken)],
      { foodDislikes: ['chicken'], intolerances: [] },
      [chicken, turkey] as any[],
    );
    expect(result.length).toBeGreaterThan(0);
    const swap = result[0];
    const expectedCalDiff = swap.toIngredient.macros.calories - chicken.macros.calories;
    const expectedProDiff = swap.toIngredient.macros.protein - chicken.macros.protein;
    expect(swap.macroImpact.cal).toBe(expectedCalDiff);
    expect(swap.macroImpact.pro).toBe(expectedProDiff);
  });

  it('handles ingredient not found in dictionary gracefully', () => {
    const missingRI = { id: 'ri-missing', ingredientId: 'not-in-dict', ingredient: undefined as any, amount: 100, unit: 'g' };
    const result = getRecipeSwaps(
      [missingRI],
      { foodDislikes: ['not-in-dict'], intolerances: [] },
      dictionary,
    );
    // Should not throw, might return empty since ingredient can't be found
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns one swap per conflicting ingredient', () => {
    // Both chicken and egg are conflicting
    const result = getRecipeSwaps(
      [makeRI(chicken), makeRI(egg)],
      { foodDislikes: ['chicken'], intolerances: ['huevo' as any] },
      dictionary,
    );
    const fromIds = result.map(r => r.fromIngredient.id);
    // Each conflicting ingredient should appear at most once
    expect(new Set(fromIds).size).toBe(fromIds.length);
  });
});
