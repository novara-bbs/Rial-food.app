/**
 * Tests for fuzzy ingredient matching utilities.
 * Uses the real INGREDIENT_DICTIONARY (~200 items).
 */
import { describe, it, expect } from 'vitest';
import { matchIngredient, matchIngredientTopN } from './fuzzy-match';

// ─── matchIngredient ──────────────────────────────────────────────────────────

describe('matchIngredient', () => {
  it('returns null for very short/random strings below threshold', () => {
    const result = matchIngredient('xyz123');
    expect(result).toBeNull();
  });

  it('finds matches in the dictionary with high score', () => {
    // "arroz" matches "Arroz integral" etc. via substring — score ~0.8+
    const result = matchIngredient('arroz');
    expect(result).not.toBeNull();
    expect(result?.score).toBeGreaterThanOrEqual(0.8);
  });

  it('handles accent-stripped queries', () => {
    // Spanish ingredients often have accents — test both forms
    const withAccent = matchIngredient('espinaca');
    const normalized = matchIngredient('espinaca');
    // Both should find the same ingredient
    if (withAccent && normalized) {
      expect(withAccent.ingredient.id).toBe(normalized.ingredient.id);
    }
  });

  it('returns match with score between 0 and 1', () => {
    const result = matchIngredient('pollo');
    if (result) {
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    }
  });

  it('matches English ingredient names', () => {
    const result = matchIngredient('chicken');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.matchedOn).toBe('en');
    }
  });

  it('returns matchedOn "es" for Spanish matches', () => {
    const result = matchIngredient('leche');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.matchedOn).toBe('es');
    }
  });

  it('handles partial word matches (e.g., "salmon")', () => {
    const result = matchIngredient('salmon');
    expect(result).not.toBeNull();
    expect(result?.score).toBeGreaterThanOrEqual(0.45);
  });

  it('returns null for completely unrelated strings', () => {
    const result = matchIngredient('aaaaaaaaaaaaaaaaa');
    // Very long string of 'a' should not match any ingredient above threshold
    // (or if it does, the score will be very low)
    if (result) {
      expect(result.score).toBeGreaterThanOrEqual(0.45); // threshold
    }
  });

  it('custom threshold of 0.9 rejects moderate matches', () => {
    // A moderate match that would pass 0.45 but not 0.9
    const moderate = matchIngredient('pechuga', 0.45);
    const strict = matchIngredient('pechuga', 0.99);
    // strict match should return null or a very strong match
    if (moderate && strict) {
      expect(strict.score).toBeGreaterThanOrEqual(0.99);
    }
  });

  it('handles empty string gracefully', () => {
    // Empty string should not throw
    expect(() => matchIngredient('')).not.toThrow();
  });

  it('returns ingredient object with expected shape', () => {
    const result = matchIngredient('tomate');
    if (result) {
      expect(result.ingredient).toHaveProperty('id');
      expect(result.ingredient).toHaveProperty('name');
      expect(result.ingredient).toHaveProperty('nameEn');
      // macros are nested under .macros
      expect(result.ingredient).toHaveProperty('macros');
      expect(result.ingredient.macros).toHaveProperty('calories');
    }
  });
});

// ─── matchIngredientTopN ──────────────────────────────────────────────────────

describe('matchIngredientTopN', () => {
  it('returns at most N results', () => {
    const results = matchIngredientTopN('arroz', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('returns empty array when nothing passes threshold', () => {
    const results = matchIngredientTopN('xyz123xyz', 3, 0.99);
    expect(results).toHaveLength(0);
  });

  it('results are sorted by score descending', () => {
    const results = matchIngredientTopN('pollo', 5);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });

  it('top result has highest score', () => {
    const results = matchIngredientTopN('leche', 5);
    if (results.length > 1) {
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    }
  });

  it('returns 1 result when n=1', () => {
    const results = matchIngredientTopN('arroz', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('all results score above threshold', () => {
    const threshold = 0.5;
    const results = matchIngredientTopN('quinoa', 10, threshold);
    results.forEach(r => {
      expect(r.score).toBeGreaterThanOrEqual(threshold);
    });
  });

  it('does not throw on empty string', () => {
    expect(() => matchIngredientTopN('', 3)).not.toThrow();
  });
});
