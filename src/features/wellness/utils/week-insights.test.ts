import { describe, it, expect } from 'vitest';
import { buildWeekInsight, type InsightCopy } from './week-insights';
import type { WeekMacroStats } from './week-stats';
import type { WeightTrend } from './weight-trend';
import type { StreakPair } from './streaks';
import type { TopMeal } from './top-meals';

const COPY: InsightCopy = {
  positive: 'Good week, {{name}}. Keep it up.',
  neutral: 'Steady week, {{name}}.',
  lowData: 'Low data this week. Log a few days.',
  lowDataWithName: 'Low data, {{name}}. Log a few days.',
  trendLabel: 'TREND',
  streakLabel: 'STREAK',
  topMealLabel: 'TOP',
};

function makeWeekStats(daysLogged: number, adherenceCal = 0, adherencePro = 0): WeekMacroStats {
  return {
    avg: { cal: 0, pro: 0, carbs: 0, fats: 0 },
    adherence: { cal: adherenceCal, pro: adherencePro, carbs: 0, fats: 0 },
    hitDays: { cal: 0, pro: 0, carbs: 0, fats: 0 },
    daysLogged,
    weekStart: '2026-04-12',
    weekEnd: '2026-04-18',
    deltaVsPrev: { cal: null, pro: null },
  };
}

function makeTrend(emaWeekDelta: number | null): WeightTrend {
  return {
    sorted: [],
    last30: [],
    current: null,
    first: null,
    weekDelta: null,
    targetProgressPct: null,
    emaSeries: [],
    currentEma: null,
    emaWeekDelta,
  };
}

const NO_STREAK: StreakPair = { current: 0, best: 0 };
const fmtKg = (kg: number) => `${kg.toFixed(1)} kg`;

describe('buildWeekInsight', () => {
  it('returns lowdata tone with empty chips when daysLogged < 3', () => {
    const res = buildWeekInsight({
      weekStats: makeWeekStats(2),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: null,
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(res.tone).toBe('lowdata');
    expect(res.chips).toEqual([]);
    expect(res.headline).toBe('Low data this week. Log a few days.');
  });

  it('interpolates name in lowdata branch when lowDataWithName exists', () => {
    const res = buildWeekInsight({
      weekStats: makeWeekStats(1),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: null,
      userName: 'Clara',
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(res.tone).toBe('lowdata');
    expect(res.headline).toBe('Low data, Clara. Log a few days.');
  });

  it('selects positive tone when adherence ≥ 70', () => {
    const res = buildWeekInsight({
      weekStats: makeWeekStats(5, 85, 80),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: null,
      userName: 'Ana',
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(res.tone).toBe('positive');
    expect(res.headline).toBe('Good week, Ana. Keep it up.');
  });

  it('selects neutral tone when adherence < 70 and trend not aligned', () => {
    const res = buildWeekInsight({
      weekStats: makeWeekStats(5, 50, 40),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: null,
      userName: 'Marcos',
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(res.tone).toBe('neutral');
    expect(res.headline).toBe('Steady week, Marcos.');
  });

  it('does NOT upgrade to positive on ambiguous drift when goalType is undefined (A1 fallback)', () => {
    // Previous logic treated any |delta| ≥ 0.1 as "trend aligned" when goalType
    // was missing, which could surface "Good week" on a +0.5 kg drift the user
    // might read as bad. Now the unknown-goal branch requires adherence ≥ 70
    // to reach 'positive'.
    const res = buildWeekInsight({
      weekStats: makeWeekStats(5, 50, 40),
      trend: makeTrend(0.5),
      mealStreak: NO_STREAK,
      topMeal: null,
      userName: 'Sam',
      // goalType intentionally omitted
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(res.tone).toBe('neutral');
  });

  it('aligns tone to goalType: loss + negative emaDelta → positive', () => {
    const res = buildWeekInsight({
      weekStats: makeWeekStats(5, 40, 30),
      trend: makeTrend(-0.5),
      mealStreak: NO_STREAK,
      topMeal: null,
      userName: 'Clara',
      goalType: 'loss',
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(res.tone).toBe('positive');
  });

  it('emits trend chip with direction when emaWeekDelta is present', () => {
    const res = buildWeekInsight({
      weekStats: makeWeekStats(5, 75, 70),
      trend: makeTrend(-0.4),
      mealStreak: NO_STREAK,
      topMeal: null,
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    const trendChip = res.chips.find(c => c.id === 'trend');
    expect(trendChip).toBeDefined();
    expect(trendChip?.direction).toBe('down');
    expect(trendChip?.value).toBe('0.4 kg');
    expect(trendChip?.label).toBe('TREND');
  });

  it('emits streak chip only when current > 0', () => {
    const withStreak = buildWeekInsight({
      weekStats: makeWeekStats(5, 75, 70),
      trend: makeTrend(null),
      mealStreak: { current: 4, best: 10 },
      topMeal: null,
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(withStreak.chips.find(c => c.id === 'streak')?.value).toBe('4');

    const noStreak = buildWeekInsight({
      weekStats: makeWeekStats(5, 75, 70),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: null,
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(noStreak.chips.find(c => c.id === 'streak')).toBeUndefined();
  });

  it('emits topMeal chip with truncated name when > 22 chars', () => {
    const longName: TopMeal = {
      name: 'Ensalada mediterránea con queso feta y aceitunas kalamata',
      count: 3,
      totalCal: 1200,
    };
    const res = buildWeekInsight({
      weekStats: makeWeekStats(5, 75, 70),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: longName,
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    const chip = res.chips.find(c => c.id === 'topMeal');
    expect(chip).toBeDefined();
    expect(chip!.value.length).toBeLessThanOrEqual(22);
    expect(chip!.value.endsWith('…')).toBe(true);
  });

  it('skips topMeal chip when topMeal is null or count is 0', () => {
    const resNull = buildWeekInsight({
      weekStats: makeWeekStats(5, 75, 70),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: null,
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(resNull.chips.find(c => c.id === 'topMeal')).toBeUndefined();

    const resZero = buildWeekInsight({
      weekStats: makeWeekStats(5, 75, 70),
      trend: makeTrend(null),
      mealStreak: NO_STREAK,
      topMeal: { name: 'Avena', count: 0, totalCal: 0 },
      copy: COPY,
      formatWeightDelta: fmtKg,
    });
    expect(resZero.chips.find(c => c.id === 'topMeal')).toBeUndefined();
  });
});
