/**
 * Tests for unit conversion utilities.
 */
import { describe, it, expect } from 'vitest';
import {
  formatWeight,
  getWeightUnit,
  toGrams,
  fromGrams,
  getQuickWeights,
  getWeightStep,
  formatBodyWeight,
  bodyWeightToKg,
  bodyWeightFromKg,
  heightToCm,
  heightFromCm,
  getBodyWeightUnit,
  getHeightUnit,
} from './units';

// ─── formatWeight ────────────────────────────────────────────────────────────

describe('formatWeight', () => {
  it('metric gram: returns value with g suffix', () => {
    expect(formatWeight(100, 'metric')).toBe('100g');
  });

  it('metric ml: returns value with ml suffix', () => {
    expect(formatWeight(250, 'metric', 'ml')).toBe('250ml');
  });

  it('imperial gram → oz (small)', () => {
    // 28.3495 g/oz → 56.699 g ≈ 2 oz
    const result = formatWeight(56.699, 'imperial');
    expect(result).toMatch(/oz$/);
    expect(result).toContain('2');
  });

  it('imperial gram → lb (≥16 oz)', () => {
    // 16 oz = 453.592 g → 1 lb
    const result = formatWeight(453.592, 'imperial');
    expect(result).toMatch(/lb$/);
    expect(result).toContain('1');
  });

  it('imperial ml → fl oz', () => {
    // 29.5735 ml/fl oz → 295.735 ml = 10 fl oz
    const result = formatWeight(295.735, 'imperial', 'ml');
    expect(result).toMatch(/fl oz$/);
  });

  it('rounds large oz values', () => {
    // 283.495 g = exactly 10 oz → should be rounded
    const result = formatWeight(283.495, 'imperial');
    expect(result).toBe('10 oz');
  });

  it('rounds large lb values', () => {
    // 10 lb = 4535.92 g → should be rounded
    const result = formatWeight(4535.92, 'imperial');
    expect(result).toBe('10 lb');
  });
});

// ─── getWeightUnit ───────────────────────────────────────────────────────────

describe('getWeightUnit', () => {
  it('metric default → g', () => {
    expect(getWeightUnit('metric')).toBe('g');
  });

  it('metric ml → ml', () => {
    expect(getWeightUnit('metric', 'ml')).toBe('ml');
  });

  it('imperial default → oz', () => {
    expect(getWeightUnit('imperial')).toBe('oz');
  });

  it('imperial ml → fl oz', () => {
    expect(getWeightUnit('imperial', 'ml')).toBe('fl oz');
  });
});

// ─── toGrams ─────────────────────────────────────────────────────────────────

describe('toGrams', () => {
  it('metric: returns value unchanged', () => {
    expect(toGrams(100, 'metric')).toBe(100);
  });

  it('imperial oz → grams', () => {
    // 1 oz = 28.3495 g
    expect(toGrams(1, 'imperial')).toBeCloseTo(28.3, 0);
  });

  it('imperial fl oz → ml/grams', () => {
    // 1 fl oz = 29.5735 ml
    expect(toGrams(1, 'imperial', 'ml')).toBeCloseTo(29.6, 0);
  });

  it('imperial 0 → 0', () => {
    expect(toGrams(0, 'imperial')).toBe(0);
  });
});

// ─── fromGrams ───────────────────────────────────────────────────────────────

describe('fromGrams', () => {
  it('metric: returns value unchanged', () => {
    expect(fromGrams(100, 'metric')).toBe(100);
  });

  it('imperial grams → oz', () => {
    // 28.3495 g = 1 oz
    expect(fromGrams(28.3495, 'imperial')).toBeCloseTo(1.0, 1);
  });

  it('imperial ml → fl oz', () => {
    // 29.5735 ml = 1 fl oz
    expect(fromGrams(29.5735, 'imperial', 'ml')).toBeCloseTo(1.0, 1);
  });

  it('toGrams and fromGrams are inverse operations (metric)', () => {
    const val = 175;
    expect(fromGrams(toGrams(val, 'metric'), 'metric')).toBe(val);
  });

  it('toGrams and fromGrams are inverse operations (imperial)', () => {
    const oz = 4;
    const grams = toGrams(oz, 'imperial');
    expect(fromGrams(grams, 'imperial')).toBeCloseTo(oz, 0);
  });
});

// ─── getQuickWeights ─────────────────────────────────────────────────────────

describe('getQuickWeights', () => {
  it('metric: returns gram presets', () => {
    expect(getQuickWeights('metric')).toEqual([50, 100, 150, 200, 250]);
  });

  it('imperial default: returns oz presets', () => {
    const result = getQuickWeights('imperial');
    expect(result).toEqual([1, 2, 4, 6, 8]);
  });

  it('imperial ml: returns fl oz presets', () => {
    const result = getQuickWeights('imperial', 'ml');
    expect(result).toEqual([2, 4, 8, 12, 16]);
  });

  it('returns 5 presets', () => {
    expect(getQuickWeights('metric')).toHaveLength(5);
    expect(getQuickWeights('imperial')).toHaveLength(5);
  });
});

// ─── getWeightStep ───────────────────────────────────────────────────────────

describe('getWeightStep', () => {
  it('metric: step is 10g', () => {
    expect(getWeightStep('metric')).toBe(10);
  });

  it('imperial: step is 1oz', () => {
    expect(getWeightStep('imperial')).toBe(1);
  });
});

// ─── formatBodyWeight ────────────────────────────────────────────────────────

describe('formatBodyWeight', () => {
  it('metric: formats kg with one decimal', () => {
    expect(formatBodyWeight(72.5, 'metric')).toBe('72.5 kg');
  });

  it('imperial: converts to lb', () => {
    // 1 kg = 2.20462 lb
    const result = formatBodyWeight(1, 'imperial');
    expect(result).toMatch(/lb$/);
    expect(parseFloat(result)).toBeCloseTo(2.2, 0);
  });

  it('metric whole kg strips trailing zero', () => {
    expect(formatBodyWeight(80, 'metric')).toBe('80 kg');
  });
});

// ─── bodyWeightToKg / bodyWeightFromKg ───────────────────────────────────────

describe('bodyWeightToKg', () => {
  it('metric: returns value unchanged', () => {
    expect(bodyWeightToKg(70, 'metric')).toBe(70);
  });

  it('imperial lb → kg', () => {
    // 1 lb = 0.453592 kg
    expect(bodyWeightToKg(1, 'imperial')).toBeCloseTo(0.45, 1);
  });

  it('roundtrip: toKg then fromKg', () => {
    const lb = 150;
    const kg = bodyWeightToKg(lb, 'imperial');
    expect(bodyWeightFromKg(kg, 'imperial')).toBeCloseTo(lb, 0);
  });
});

describe('bodyWeightFromKg', () => {
  it('metric: returns value unchanged', () => {
    expect(bodyWeightFromKg(70, 'metric')).toBe(70);
  });

  it('imperial: converts kg to lb', () => {
    expect(bodyWeightFromKg(1, 'imperial')).toBeCloseTo(2.2, 0);
  });
});

// ─── heightToCm / heightFromCm ───────────────────────────────────────────────

describe('heightToCm', () => {
  it('metric: returns value unchanged', () => {
    expect(heightToCm(175, 'metric')).toBe(175);
  });

  it('imperial inches → cm', () => {
    // 1 inch = 2.54 cm
    expect(heightToCm(1, 'imperial')).toBeCloseTo(2.54, 1);
  });

  it('roundtrip: toCm then fromCm', () => {
    const inches = 70;
    const cm = heightToCm(inches, 'imperial');
    expect(heightFromCm(cm, 'imperial')).toBeCloseTo(inches, 0);
  });
});

describe('heightFromCm', () => {
  it('metric: returns value unchanged', () => {
    expect(heightFromCm(175, 'metric')).toBe(175);
  });

  it('imperial: converts cm to inches', () => {
    // 2.54 cm = 1 inch
    expect(heightFromCm(2.54, 'imperial')).toBeCloseTo(1.0, 1);
  });
});

// ─── Unit label helpers ───────────────────────────────────────────────────────

describe('getBodyWeightUnit', () => {
  it('metric → kg', () => expect(getBodyWeightUnit('metric')).toBe('kg'));
  it('imperial → lb', () => expect(getBodyWeightUnit('imperial')).toBe('lb'));
});

describe('getHeightUnit', () => {
  it('metric → cm', () => expect(getHeightUnit('metric')).toBe('cm'));
  it('imperial → in', () => expect(getHeightUnit('imperial')).toBe('in'));
});
