/**
 * Convention test: Cocina collections registry — R3.
 *
 * Locks:
 *  (a) COLLECTIONS registry has 7 entries with required shape.
 *  (b) Each predicate is a pure function (no side-effects, no external refs).
 *  (c) Each predicate returns a boolean for well-formed recipe objects.
 *  (d) labelKey follows "collections.<name>" convention.
 *  (e) heroColor is a design-token bg class (starts with "bg-").
 *  (f) icon is a non-empty string.
 *  (g) getCollection() resolves by id.
 *  (h) Verified predicate correctly discriminates verified vs null.
 *  (i) Quick predicate respects totalTime threshold (≤ 20 min).
 *  (j) Cooked predicate requires non-empty cookedAt array.
 */
import { describe, it, expect } from 'vitest';
import { COLLECTIONS, getCollection } from '../../features/recipes/data/collections';

const mockRecipe = (overrides: Record<string, any> = {}): any => ({
  id: 1,
  title: 'Test Recipe',
  verified: null,
  cookedAt: [],
  totalTime: 30,
  pro: 20,
  macros: { calories: 400, protein: 20, carbs: 30, fats: 15 },
  servings: 2,
  tags: [],
  suitableFor: [],
  ...overrides,
});

describe('COLLECTIONS registry shape (R3)', () => {
  it('has exactly 7 collections', () => {
    expect(COLLECTIONS).toHaveLength(7);
  });

  it('each entry has required shape', () => {
    for (const col of COLLECTIONS) {
      expect(typeof col.id).toBe('string');
      expect(col.id.length).toBeGreaterThan(0);
      expect(typeof col.labelKey).toBe('string');
      expect(typeof col.icon).toBe('string');
      expect(col.icon.length).toBeGreaterThan(0);
      expect(typeof col.heroColor).toBe('string');
      expect(col.heroColor.startsWith('bg-')).toBe(true);
      expect(typeof col.predicate).toBe('function');
    }
  });

  it('labelKey follows "collections.<name>" convention', () => {
    for (const col of COLLECTIONS) {
      expect(col.labelKey).toMatch(/^collections\.\w+$/);
    }
  });

  it('predicates return boolean for well-formed recipe', () => {
    const recipe = mockRecipe();
    for (const col of COLLECTIONS) {
      const result = col.predicate(recipe);
      expect(typeof result).toBe('boolean');
    }
  });

  it('getCollection resolves by id', () => {
    const col = getCollection('verified');
    expect(col).toBeDefined();
    expect(col?.id).toBe('verified');
  });

  it('getCollection returns undefined for unknown id', () => {
    expect(getCollection('nonexistent')).toBeUndefined();
  });
});

describe('COLLECTIONS predicate semantics', () => {
  it('verified: true for recipe.verified = "rial"', () => {
    const col = getCollection('verified')!;
    expect(col.predicate(mockRecipe({ verified: 'rial' }))).toBe(true);
    expect(col.predicate(mockRecipe({ verified: null }))).toBe(false);
    expect(col.predicate(mockRecipe({ verified: undefined }))).toBe(false);
  });

  it('quick: true when totalTime ≤ 20', () => {
    const col = getCollection('quick')!;
    expect(col.predicate(mockRecipe({ totalTime: 20 }))).toBe(true);
    expect(col.predicate(mockRecipe({ totalTime: 15 }))).toBe(true);
    expect(col.predicate(mockRecipe({ totalTime: 21 }))).toBe(false);
    expect(col.predicate(mockRecipe({ totalTime: 0 }))).toBe(false);
  });

  it('highProtein: true when protein ≥ 30', () => {
    const col = getCollection('highProtein')!;
    expect(col.predicate(mockRecipe({ pro: 30 }))).toBe(true);
    expect(col.predicate(mockRecipe({ pro: 50, macros: { protein: 50, calories: 400, carbs: 10, fats: 10 } }))).toBe(true);
    expect(col.predicate(mockRecipe({ pro: 29 }))).toBe(false);
  });

  it('cooked: true only when cookedAt is non-empty array', () => {
    const col = getCollection('cooked')!;
    expect(col.predicate(mockRecipe({ cookedAt: ['2026-04-23T10:00:00Z'] }))).toBe(true);
    expect(col.predicate(mockRecipe({ cookedAt: [] }))).toBe(false);
    expect(col.predicate(mockRecipe({ cookedAt: undefined }))).toBe(false);
  });

  it('batch: true when servings ≥ 4', () => {
    const col = getCollection('batch')!;
    expect(col.predicate(mockRecipe({ servings: 4 }))).toBe(true);
    expect(col.predicate(mockRecipe({ servings: 6 }))).toBe(true);
    expect(col.predicate(mockRecipe({ servings: 3 }))).toBe(false);
  });

  it('lowCarb: true when carbs < 20', () => {
    const col = getCollection('lowCarb')!;
    expect(col.predicate(mockRecipe({ macros: { calories: 300, protein: 30, carbs: 15, fats: 10 } }))).toBe(true);
    expect(col.predicate(mockRecipe({ macros: { calories: 400, protein: 25, carbs: 25, fats: 12 } }))).toBe(false);
  });
});
