import { describe, it, expect } from 'vitest';
import { calcStreaks } from './streaks';
import type { DailyArchive } from '../../../hooks/useDailyReset';

function makeArchive(date: string, mealCount = 1): DailyArchive {
  return {
    date,
    macros: {
      consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
      target: { cal: 0, pro: 0, carbs: 0, fats: 0 },
    },
    hydration: 0,
    movement: 0,
    mealCount,
    dailyLog: [],
  };
}

const NOW = new Date('2026-04-15T12:00:00Z');
const TODAY = '2026-04-15';
const YESTERDAY = '2026-04-14';

describe('calcStreaks', () => {
  it('returns zero streaks when inputs are empty', () => {
    const s = calcStreaks({ history: [], realFeelLogs: [], now: NOW });
    expect(s.mealLog).toEqual({ current: 0, best: 0 });
    expect(s.realFeel).toEqual({ current: 0, best: 0 });
  });

  it('counts consecutive meal-log days ending at yesterday', () => {
    const history = [
      makeArchive('2026-04-12'),
      makeArchive('2026-04-13'),
      makeArchive('2026-04-14'),
    ];
    const s = calcStreaks({ history, realFeelLogs: [], now: NOW });
    expect(s.mealLog.current).toBe(3);
    expect(s.mealLog.best).toBe(3);
  });

  it('resets current meal-log streak when last log is older than yesterday', () => {
    const history = [
      makeArchive('2026-04-10'),
      makeArchive('2026-04-11'),
      makeArchive('2026-04-12'),
    ];
    const s = calcStreaks({ history, realFeelLogs: [], now: NOW });
    expect(s.mealLog.current).toBe(0);
    expect(s.mealLog.best).toBe(3);
  });

  it('extends current streak through today when `todayHasMeals` is set', () => {
    const history = [
      makeArchive(YESTERDAY),
    ];
    const s = calcStreaks({ history, realFeelLogs: [], todayHasMeals: true, now: NOW });
    expect(s.mealLog.current).toBe(2);
    expect(s.mealLog.best).toBe(2);
  });

  it('ignores archive entries whose mealCount is zero', () => {
    const history = [
      makeArchive('2026-04-12', 0),
      makeArchive('2026-04-13', 1),
      makeArchive('2026-04-14', 1),
    ];
    const s = calcStreaks({ history, realFeelLogs: [], now: NOW });
    expect(s.mealLog.current).toBe(2);
    expect(s.mealLog.best).toBe(2);
  });

  it('computes realFeel streak from log dates (ISO or YYYY-MM-DD)', () => {
    const logs = [
      { date: '2026-04-14T20:00:00Z' },
      { date: YESTERDAY }, // dup — should dedupe
      { date: '2026-04-13' },
      { date: '2026-04-10' }, // breaks
    ];
    const s = calcStreaks({ history: [], realFeelLogs: logs, now: NOW });
    expect(s.realFeel.current).toBe(2);
    expect(s.realFeel.best).toBe(2);
  });

  it('handles best streak strictly greater than current', () => {
    const history = [
      // Best run: 3 days
      makeArchive('2026-03-01'),
      makeArchive('2026-03-02'),
      makeArchive('2026-03-03'),
      // gap
      makeArchive(TODAY),
    ];
    const s = calcStreaks({ history, realFeelLogs: [], todayHasMeals: false, now: NOW });
    expect(s.mealLog.best).toBe(3);
    expect(s.mealLog.current).toBe(1);
  });
});
