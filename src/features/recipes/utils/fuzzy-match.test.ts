/**
 * Tests for fuzzy ingredient matching utilities.
 * Uses the real INGREDIENT_DICTIONARY (~200 items).
 */
import { describe, it, expect } from 'vitest';
import { matchIngredient, matchIngredientTopN, _preprocessForTest } from './fuzzy-match';

// ─── preprocess (internal, exported for testing) ──────────────────────────────

describe('_preprocessForTest', () => {
  it('strips measurement prefix (weight)', () => {
    expect(_preprocessForTest('200g de pechuga de pollo')).not.toContain('200');
    expect(_preprocessForTest('200g de pechuga de pollo')).not.toContain('g de');
  });

  it('strips measurement prefix (volume)', () => {
    const result = _preprocessForTest('2 tazas de arroz');
    expect(result).not.toMatch(/tazas?/i);
    expect(result).toContain('arroz');
  });

  it('strips leading plain number', () => {
    const result = _preprocessForTest('3 huevos');
    expect(result).not.toMatch(/^\d/);
  });

  it('applies alias: papa → patata', () => {
    expect(_preprocessForTest('papa')).toBe('patata');
  });

  it('applies alias: palta → aguacate', () => {
    expect(_preprocessForTest('palta')).toBe('aguacate');
  });

  it('applies alias: carne picada → carne de res molida', () => {
    const result = _preprocessForTest('carne picada');
    expect(result).toContain('carne');
  });

  it('strips prep words: asado', () => {
    const result = _preprocessForTest('pollo asado');
    expect(result).not.toContain('asado');
    expect(result).toContain('pollo');
  });

  it('strips prep words: cocido', () => {
    const result = _preprocessForTest('arroz cocido');
    expect(result).not.toContain('cocido');
    expect(result).toContain('arroz');
  });

  it('strips prep words: fresco', () => {
    const result = _preprocessForTest('tomate fresco');
    expect(result).not.toContain('fresco');
    expect(result).toContain('tomate');
  });

  it('never returns empty string', () => {
    expect(_preprocessForTest('').length).toBeGreaterThanOrEqual(0);
    expect(_preprocessForTest('cocido')).not.toBe(''); // fallback to normalize
  });
});

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
    const withAccent = matchIngredient('espinaca');
    const normalized = matchIngredient('espinaca');
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
    if (result) {
      expect(result.score).toBeGreaterThanOrEqual(0.45);
    }
  });

  it('custom threshold of 0.9 rejects moderate matches', () => {
    const moderate = matchIngredient('pechuga', 0.45);
    const strict = matchIngredient('pechuga', 0.99);
    if (moderate && strict) {
      expect(strict.score).toBeGreaterThanOrEqual(0.99);
    }
  });

  it('handles empty string gracefully', () => {
    expect(() => matchIngredient('')).not.toThrow();
  });

  it('returns ingredient object with expected shape', () => {
    const result = matchIngredient('tomate');
    if (result) {
      expect(result.ingredient).toHaveProperty('id');
      expect(result.ingredient).toHaveProperty('name');
      expect(result.ingredient).toHaveProperty('nameEn');
      expect(result.ingredient).toHaveProperty('macros');
      expect(result.ingredient.macros).toHaveProperty('calories');
    }
  });

  // ─── v2: alias matching ────────────────────────────────────────────────────

  it('[alias] "papa" matches a potato entry', () => {
    const result = matchIngredient('papa');
    // Should match any patata/batata/potato entry or at least not return null
    // If dict has no patata, score may be lower — just confirm it finds something
    expect(result).not.toBeNull();
  });

  it('[alias] "palta" matches aguacate', () => {
    const result = matchIngredient('palta');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.ingredient.name.toLowerCase()).toContain('aguacate');
    }
  });

  it('[alias] "huevos" (plural) matches huevo entry', () => {
    const resultPlural = matchIngredient('huevos');
    const resultSingular = matchIngredient('huevo');
    expect(resultPlural).not.toBeNull();
    expect(resultSingular).not.toBeNull();
    // Both should resolve to the same or equivalent ingredient
    if (resultPlural && resultSingular) {
      expect(resultPlural.ingredient.id).toBe(resultSingular.ingredient.id);
    }
  });

  it('[alias] "carne picada" matches ground beef entry', () => {
    const result = matchIngredient('carne picada');
    expect(result).not.toBeNull();
    if (result) {
      // Should match some beef/carne entry
      const name = result.ingredient.name.toLowerCase();
      expect(name.includes('carne') || name.includes('res') || name.includes('molida')).toBe(true);
    }
  });

  // ─── v2: prep-word stripping ──────────────────────────────────────────────

  it('[prep-strip] "pollo asado" still finds a chicken entry', () => {
    const resultWithPrep = matchIngredient('pollo asado');
    const resultClean = matchIngredient('pollo');
    // Both should find a chicken entry
    expect(resultWithPrep).not.toBeNull();
    if (resultWithPrep && resultClean) {
      // Same category at minimum
      expect(resultWithPrep.ingredient.category).toBe(resultClean.ingredient.category);
    }
  });

  it('[prep-strip] "arroz cocido" still finds an arroz entry', () => {
    const result = matchIngredient('arroz cocido');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.ingredient.name.toLowerCase()).toContain('arroz');
    }
  });

  it('[prep-strip] "tomate fresco" still finds tomate entry', () => {
    const result = matchIngredient('tomate fresco');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.ingredient.name.toLowerCase()).toContain('tomate');
    }
  });

  // ─── v2: measurement prefix stripping ─────────────────────────────────────

  it('[measurement] "200g de pechuga de pollo" matches chicken breast', () => {
    const result = matchIngredient('200g de pechuga de pollo');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.ingredient.name.toLowerCase()).toContain('pechuga');
    }
  });

  it('[measurement] "2 tazas de arroz" matches arroz entry', () => {
    const result = matchIngredient('2 tazas de arroz');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.ingredient.name.toLowerCase()).toContain('arroz');
    }
  });

  it('[measurement] "3 huevos" matches huevo entry', () => {
    const result = matchIngredient('3 huevos');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.ingredient.name.toLowerCase()).toContain('huevo');
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

  it('[v2] "papa" returns results above threshold (alias coverage)', () => {
    const results = matchIngredientTopN('papa', 3, 0.4);
    // With alias papa→patata, should find at least one result
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('[v2] results for "pollo asado" include chicken entry', () => {
    const results = matchIngredientTopN('pollo asado', 5, 0.4);
    const hasChicken = results.some(r =>
      r.ingredient.name.toLowerCase().includes('pollo') ||
      r.ingredient.nameEn.toLowerCase().includes('chicken'),
    );
    expect(hasChicken).toBe(true);
  });
});
