/**
 * Tests for `safeSumMacros` / `safeMacroValue` defensive reducers.
 * Sprint [1.5.175] — locks the contract that malformed dailyLog entries
 * never produce NaN totals or crash the home.
 */
import { describe, it, expect } from 'vitest';
import { safeSumMacros, safeMacroValue } from './safe-macros';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

const makeEntry = (macros: Partial<DailyLogEntry['macros']> | null | undefined): DailyLogEntry => ({
  id: 1,
  title: 'x',
  portionDescription: '1',
  mealSlot: 'lunch',
  time: '12:00',
  macros: macros as DailyLogEntry['macros'],
});

describe('safeSumMacros', () => {
  it('returns zeros for empty/null/undefined input', () => {
    expect(safeSumMacros([])).toEqual({ cal: 0, pro: 0, carbs: 0, fats: 0 });
    expect(safeSumMacros(null)).toEqual({ cal: 0, pro: 0, carbs: 0, fats: 0 });
    expect(safeSumMacros(undefined)).toEqual({ cal: 0, pro: 0, carbs: 0, fats: 0 });
  });

  it('sums valid entries normally', () => {
    const result = safeSumMacros([
      makeEntry({ cal: 200, pro: 20, carbs: 10, fats: 5 }),
      makeEntry({ cal: 300, pro: 15, carbs: 30, fats: 10 }),
    ]);
    expect(result).toEqual({ cal: 500, pro: 35, carbs: 40, fats: 15 });
  });

  it('coerces missing macros object to zero', () => {
    const result = safeSumMacros([
      makeEntry(null),
      makeEntry({ cal: 100, pro: 5, carbs: 2, fats: 1 }),
    ]);
    expect(result).toEqual({ cal: 100, pro: 5, carbs: 2, fats: 1 });
  });

  it('skips NaN/Infinity values', () => {
    const result = safeSumMacros([
      makeEntry({ cal: NaN as number, pro: 10, carbs: 5, fats: 3 }),
      makeEntry({ cal: 200, pro: Infinity as number, carbs: 5, fats: 3 }),
    ]);
    expect(result).toEqual({ cal: 200, pro: 10, carbs: 10, fats: 6 });
  });

  it('handles partial macros (missing keys)', () => {
    const result = safeSumMacros([
      makeEntry({ cal: 250 }),
      makeEntry({ pro: 15 }),
    ]);
    expect(result).toEqual({ cal: 250, pro: 15, carbs: 0, fats: 0 });
  });
});

describe('safeMacroValue', () => {
  it('returns 0 for null/undefined entry', () => {
    expect(safeMacroValue(null, 'cal')).toBe(0);
    expect(safeMacroValue(undefined, 'cal')).toBe(0);
  });

  it('returns 0 when value is non-finite', () => {
    expect(safeMacroValue(makeEntry({ cal: NaN as number }), 'cal')).toBe(0);
  });

  it('returns the finite value otherwise', () => {
    expect(safeMacroValue(makeEntry({ pro: 42 }), 'pro')).toBe(42);
  });
});
