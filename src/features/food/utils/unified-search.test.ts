/**
 * Tests for unified food search utility.
 * Uses minimal fixture data — does NOT depend on the full INGREDIENT_DICTIONARY.
 */
import { describe, it, expect } from 'vitest';
import { unifiedSearch } from './unified-search';
import { Ingredient } from '../../../types';
import { Recipe } from '../../../types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeIngredient(id: string, name: string, nameEn: string): Ingredient {
  return {
    id,
    name,
    nameEn,
    description: '',
    descriptionEn: '',
    category: 'proteins',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [{ id: '100g', name: '100g', nameEn: '100g', grams: 100, isDefault: true }],
    macros: { calories: 100, protein: 20, carbs: 5, fats: 3, fiber: 0, sugar: 0, saturatedFat: 1 },
    micros: { vitamins: {}, minerals: {}, others: {} },
    tags: [],
    allergens: [],
  };
}

function makeRecipe(id: string, title: string): Recipe {
  return {
    id,
    title,
    description: '',
    img: '',
    prepTime: '10M',
    cookTime: '15M',
    servings: 2,
    difficulty: 'Fácil',
    ingredients: [],
    steps: [],
    macros: { calories: 400, protein: 30, carbs: 40, fats: 10 },
    tags: [],
    source: 'user',
  } as unknown as Recipe;
}

const DICT: Ingredient[] = [
  makeIngredient('ing_pollo', 'Pechuga de Pollo (Cruda)', 'Chicken Breast (Raw)'),
  makeIngredient('ing_salmon', 'Salmón', 'Salmon'),
  makeIngredient('ing_arroz', 'Arroz Integral', 'Brown Rice'),
  makeIngredient('ing_leche', 'Leche Entera', 'Whole Milk'),
  makeIngredient('ing_tomate', 'Tomate', 'Tomato'),
  makeIngredient('ing_huevo', 'Huevo Entero', 'Whole Egg'),
];

const RECIPES: Recipe[] = [
  makeRecipe('r1', 'Pollo al Horno con Verduras'),
  makeRecipe('r2', 'Ensalada de Salmón y Aguacate'),
  makeRecipe('r3', 'Arroz con Leche'),
  makeRecipe('r4', 'Tortilla de Patatas'),
];

const SOURCES = { dictionary: DICT, savedRecipes: RECIPES };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('unifiedSearch', () => {
  it('returns empty array for queries shorter than 2 chars', () => {
    expect(unifiedSearch('', SOURCES)).toHaveLength(0);
    expect(unifiedSearch('a', SOURCES)).toHaveLength(0);
  });

  it('finds ingredient by Spanish name', () => {
    const results = unifiedSearch('pollo', SOURCES);
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('ing_pollo');
  });

  it('finds ingredient by English name', () => {
    const results = unifiedSearch('salmon', SOURCES);
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('ing_salmon');
  });

  it('finds recipe by exact title word', () => {
    const results = unifiedSearch('tortilla', SOURCES);
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('r4');
  });

  it('finds recipe by partial title', () => {
    const results = unifiedSearch('arroz', SOURCES);
    const ids = results.map(r => (r as any).id);
    // Should find both "Arroz Integral" (ingredient) and "Arroz con Leche" (recipe)
    expect(ids).toContain('ing_arroz');
    expect(ids).toContain('r3');
  });

  it('deduplicates — no duplicate ids in results', () => {
    const results = unifiedSearch('pollo', SOURCES);
    const ids = results.map(r => (r as any).id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('respects maxResults option', () => {
    // 'ar' >= 2 chars so will return results, capped at maxResults
    const resultsAr = unifiedSearch('ar', SOURCES, { maxResults: 2 });
    expect(resultsAr.length).toBeLessThanOrEqual(2);
  });

  it('returns empty when nothing matches', () => {
    const results = unifiedSearch('xyznothing', SOURCES);
    expect(results).toHaveLength(0);
  });

  it('cross-source: a query matching both ingredient and recipe returns both', () => {
    // "pollo" matches ingredient "Pechuga de Pollo" AND recipe "Pollo al Horno"
    const results = unifiedSearch('pollo', SOURCES);
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('ing_pollo');
    expect(ids).toContain('r1');
  });

  it('works with empty dictionary', () => {
    const results = unifiedSearch('pollo', { dictionary: [], savedRecipes: RECIPES });
    // Should still find recipes
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('r1');
  });

  it('works with empty savedRecipes', () => {
    const results = unifiedSearch('pollo', { dictionary: DICT, savedRecipes: [] });
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('ing_pollo');
  });

  it('works with both empty', () => {
    const results = unifiedSearch('pollo', { dictionary: [], savedRecipes: [] });
    expect(results).toHaveLength(0);
  });

  it('uses fuzzy matching — "leche" finds "Leche Entera"', () => {
    const results = unifiedSearch('leche', SOURCES);
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('ing_leche');
  });

  it('uses fuzzy matching — "huevo" finds "Huevo Entero"', () => {
    const results = unifiedSearch('huevo', SOURCES);
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('ing_huevo');
  });

  it('recipe title: case-insensitive matching', () => {
    const results = unifiedSearch('TORTILLA', SOURCES);
    const ids = results.map(r => (r as any).id);
    expect(ids).toContain('r4');
  });

  it('does not throw on edge case: very long query', () => {
    expect(() =>
      unifiedSearch('a'.repeat(200), SOURCES),
    ).not.toThrow();
  });
});
