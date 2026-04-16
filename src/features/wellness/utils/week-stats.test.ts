import { describe, it, expect } from 'vitest';
import { calcWeekMacros } from './week-stats';
import type { DailyArchive } from '../../../hooks/useDailyReset';

function makeArchive(date: string, consumed: { cal?: number; pro?: number; carbs?: number; fats?: number } = {}): DailyArchive {
  return {
    date,
    macros: {
      consumed: { cal: 0, pro: 0, carbs: 0, fats: 0, ...consumed },
      target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
    },
    hydration: 0,
    movement: 0,
    mealCount: 1,
    dailyLog: [],
  };
}

const TARGET = { cal: 2000, pro: 150, carbs: 200, fats: 70 };

// Anchor "now" on Wednesday 2026-04-15 → current week = Sun 2026-04-12 → Sat 2026-04-18
const WED_2026_04_15 = new Date('2026-04-15T12:00:00Z');

describe('calcWeekMacros', () => {
  it('returns zeroed stats when history is empty', () => {
    const res = calcWeekMacros([], TARGET, 0, WED_2026_04_15);
    expect(res.daysLogged).toBe(0);
    expect(res.avg).toEqual({ cal: 0, pro: 0, carbs: 0, fats: 0 });
    expect(res.adherence).toEqual({ cal: 0, pro: 0, carbs: 0, fats: 0 });
    expect(res.hitDays).toEqual({ cal: 0, pro: 0, carbs: 0, fats: 0 });
    expect(res.deltaVsPrev).toEqual({ cal: null, pro: null });
  });

  it('computes avg + adherence + hitDays for a partial current week', () => {
    const history = [
      makeArchive('2026-04-12', { cal: 2000, pro: 150, carbs: 200, fats: 70 }),
      makeArchive('2026-04-13', { cal: 1000, pro: 100, carbs: 150, fats: 50 }),
      makeArchive('2026-04-14', { cal: 3000, pro: 200, carbs: 250, fats: 80 }),
      // Outside window (prev week)
      makeArchive('2026-04-05', { cal: 2000, pro: 150, carbs: 200, fats: 70 }),
    ];
    const res = calcWeekMacros(history, TARGET, 0, WED_2026_04_15);
    expect(res.daysLogged).toBe(3);
    expect(res.avg.cal).toBe(2000); // (2000+1000+3000)/3
    expect(res.avg.pro).toBe(150);
    expect(res.adherence.cal).toBe(100); // avg 2000 / target 2000
    expect(res.adherence.pro).toBe(100);
    // Only days 12 and 14 hit the cal target 2000
    expect(res.hitDays.cal).toBe(2);
    // Only days 12 and 14 hit the pro target 150
    expect(res.hitDays.pro).toBe(2);
    expect(res.weekStart).toBe('2026-04-12');
    expect(res.weekEnd).toBe('2026-04-18');
  });

  it('reports deltaVsPrev when previous week has data', () => {
    const history = [
      // Current week: avg cal 1500
      makeArchive('2026-04-12', { cal: 1000, pro: 100 }),
      makeArchive('2026-04-13', { cal: 2000, pro: 100 }),
      // Previous week: avg cal 1000
      makeArchive('2026-04-05', { cal: 1000, pro: 50 }),
      makeArchive('2026-04-06', { cal: 1000, pro: 50 }),
    ];
    const res = calcWeekMacros(history, TARGET, 0, WED_2026_04_15);
    expect(res.avg.cal).toBe(1500);
    expect(res.deltaVsPrev.cal).toBe(50); // (1500-1000)/1000 = +50%
    expect(res.deltaVsPrev.pro).toBe(100); // (100-50)/50 = +100%
  });

  it('handles 0% adherence gracefully with zero target', () => {
    const history = [makeArchive('2026-04-12', { cal: 1000 })];
    const res = calcWeekMacros(history, { cal: 0, pro: 0, carbs: 0, fats: 0 }, 0, WED_2026_04_15);
    expect(res.adherence.cal).toBe(0);
    expect(res.hitDays.cal).toBe(0);
  });

  it('selects previous week via weekOffset = 1', () => {
    const history = [
      makeArchive('2026-04-05', { cal: 1000 }),
      makeArchive('2026-04-06', { cal: 1000 }),
      // Outside
      makeArchive('2026-04-12', { cal: 9999 }),
    ];
    const res = calcWeekMacros(history, TARGET, 1, WED_2026_04_15);
    expect(res.weekStart).toBe('2026-04-05');
    expect(res.weekEnd).toBe('2026-04-11');
    expect(res.daysLogged).toBe(2);
    expect(res.avg.cal).toBe(1000);
    // deltaVsPrev only computed for current week
    expect(res.deltaVsPrev).toEqual({ cal: null, pro: null });
  });
});
