/**
 * P11 `[1.5.69]` — meal-gaps util tests.
 *
 * Locks the heuristic for biggestDeficit priority (protein > cal > carbs > fats)
 * and the threshold semantics (10 % protein, 15 % cal, 20 % carbs/fats). These
 * numbers feed the Home "Qué me falta hoy" card — tightening them means fewer
 * but more urgent suggestions; loosening means more noise.
 */
import { describe, it, expect } from 'vitest';
import {
  MACRO_KEYS,
  computeMealGaps,
  biggestDeficit,
  guessMealSlotForTime,
} from './meal-gaps';

function dm(consumed: [number, number, number, number], target: [number, number, number, number]) {
  return {
    consumed: { cal: consumed[0], pro: consumed[1], carbs: consumed[2], fats: consumed[3] },
    target: { cal: target[0], pro: target[1], carbs: target[2], fats: target[3] },
  };
}

describe('MACRO_KEYS', () => {
  it('exposes the 4 canonical keys in order', () => {
    expect(MACRO_KEYS).toEqual(['cal', 'pro', 'carbs', 'fats']);
  });
});

describe('computeMealGaps', () => {
  it('returns deficits for under-consumed macros', () => {
    const g = computeMealGaps(dm([1000, 50, 120, 40], [2000, 150, 250, 70]));
    expect(g.cal.deficit).toBe(1000);
    expect(g.pro.deficit).toBe(100);
    expect(g.carbs.deficit).toBe(130);
    expect(g.fats.deficit).toBe(30);
  });

  it('clamps deficit to 0 when over target', () => {
    const g = computeMealGaps(dm([2500, 200, 300, 80], [2000, 150, 250, 70]));
    expect(g.cal.deficit).toBe(0);
    expect(g.cal.delta).toBe(500); // positive delta preserved
    expect(g.pro.deficit).toBe(0);
  });

  it('handles zero target gracefully (no NaN)', () => {
    const g = computeMealGaps(dm([100, 10, 20, 5], [0, 0, 0, 0]));
    expect(g.cal.progress).toBe(0);
    expect(g.cal.deficit).toBe(0);
    expect(Number.isNaN(g.cal.progress)).toBe(false);
  });

  it('coerces non-numeric inputs to 0 defensively', () => {
    const input = dm([NaN as unknown as number, 50, 120, 40], [2000, 150, 250, 70]);
    const g = computeMealGaps(input);
    expect(g.cal.consumed).toBe(0);
    expect(Number.isNaN(g.cal.deficit)).toBe(false);
  });
});

describe('biggestDeficit', () => {
  it('prioritises protein when protein deficit ≥ 10 % even if others are bigger', () => {
    // Protein at -15% of target (50 vs 150 target = 66% of target = 33% below).
    // Calories at -25% of target. Protein should win the priority rule.
    const g = computeMealGaps(dm([1500, 100, 200, 60], [2000, 150, 250, 70]));
    const biggest = biggestDeficit(g);
    expect(biggest?.key).toBe('pro');
  });

  it('falls through to calorie deficit when protein deficit is below 10 %', () => {
    // Protein within 5 % of target, calories deeply below.
    const g = computeMealGaps(dm([1000, 145, 200, 40], [2000, 150, 250, 70]));
    const biggest = biggestDeficit(g);
    expect(biggest?.key).toBe('cal');
  });

  it('returns null when all macros are within their thresholds', () => {
    const g = computeMealGaps(dm([1950, 148, 248, 69], [2000, 150, 250, 70]));
    expect(biggestDeficit(g)).toBeNull();
  });

  it('returns null when user has zero targets (no onboarding)', () => {
    const g = computeMealGaps(dm([500, 30, 60, 20], [0, 0, 0, 0]));
    expect(biggestDeficit(g)).toBeNull();
  });

  it('ignores surplus — returns null when everything is over target', () => {
    const g = computeMealGaps(dm([2500, 200, 300, 80], [2000, 150, 250, 70]));
    expect(biggestDeficit(g)).toBeNull();
  });

  it('falls through to carbs when both protein and cal are fine', () => {
    // Protein + cal within 5 %, carbs 30 % below.
    const g = computeMealGaps(dm([1900, 145, 150, 68], [2000, 150, 250, 70]));
    const biggest = biggestDeficit(g);
    expect(biggest?.key).toBe('carbs');
  });
});

describe('guessMealSlotForTime', () => {
  it('returns breakfast before 11am', () => {
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 8, 0))).toBe('breakfast');
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 10, 30))).toBe('breakfast');
  });

  it('returns lunch between 11 and 16', () => {
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 11, 0))).toBe('lunch');
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 14, 0))).toBe('lunch');
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 15, 59))).toBe('lunch');
  });

  it('returns snack between 16 and 19', () => {
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 16, 0))).toBe('snack');
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 17, 30))).toBe('snack');
  });

  it('returns dinner at 19 and later', () => {
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 19, 0))).toBe('dinner');
    expect(guessMealSlotForTime(new Date(2026, 3, 21, 22, 30))).toBe('dinner');
  });
});
