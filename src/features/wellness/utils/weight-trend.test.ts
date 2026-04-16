import { describe, it, expect } from 'vitest';
import { calcWeightTrend } from './weight-trend';
import type { BodySnapshot } from '../../../types/wellness';

function snap(date: string, kg: number): BodySnapshot {
  return { date, kg };
}

const NOW = new Date('2026-04-15T12:00:00Z');

describe('calcWeightTrend', () => {
  it('returns nulled shape when there are no snapshots', () => {
    const t = calcWeightTrend([], null, NOW);
    expect(t.current).toBeNull();
    expect(t.first).toBeNull();
    expect(t.weekDelta).toBeNull();
    expect(t.targetProgressPct).toBeNull();
    expect(t.sorted).toEqual([]);
    expect(t.last30).toEqual([]);
  });

  it('sorts ascending and reports current + first', () => {
    const t = calcWeightTrend([
      snap('2026-04-10', 72.0),
      snap('2026-04-01', 74.0),
      snap('2026-04-15', 71.5),
    ], null, NOW);
    expect(t.first).toBe(74.0);
    expect(t.current).toBe(71.5);
    expect(t.sorted.map(s => s.date)).toEqual(['2026-04-01', '2026-04-10', '2026-04-15']);
  });

  it('computes weekDelta across the last 7 days', () => {
    const t = calcWeightTrend([
      snap('2026-04-07', 73.0),   // outside 7-day window (cutoff = 2026-04-08)
      snap('2026-04-10', 72.8),   // oldest in window
      snap('2026-04-15', 71.3),   // newest
    ], null, NOW);
    expect(t.weekDelta).toBeCloseTo(-1.5, 1);
  });

  it('returns weekDelta = null when fewer than 2 snapshots in last 7 days', () => {
    const t = calcWeightTrend([snap('2026-04-14', 70)], null, NOW);
    expect(t.weekDelta).toBeNull();
  });

  it('computes direction-aware targetProgressPct clamped to [0, 1]', () => {
    // Cut goal: 74 → 70 = -4 kg. Current 72 → moved -2 → 50% done.
    const lossing = calcWeightTrend([snap('2026-04-01', 74), snap('2026-04-15', 72)], 70, NOW);
    expect(lossing.targetProgressPct).toBeCloseTo(0.5, 2);

    // Gain goal: 70 → 74 = +4 kg. Current 71 → 25%.
    const gaining = calcWeightTrend([snap('2026-04-01', 70), snap('2026-04-15', 71)], 74, NOW);
    expect(gaining.targetProgressPct).toBeCloseTo(0.25, 2);

    // Overshoot clamps to 1
    const over = calcWeightTrend([snap('2026-04-01', 74), snap('2026-04-15', 68)], 70, NOW);
    expect(over.targetProgressPct).toBe(1);

    // Reverse direction clamps to 0
    const wrong = calcWeightTrend([snap('2026-04-01', 74), snap('2026-04-15', 76)], 70, NOW);
    expect(wrong.targetProgressPct).toBe(0);
  });

  it('ignores invalid entries (non-positive kg or missing date)', () => {
    const t = calcWeightTrend([
      { date: '2026-04-10', kg: 0 },
      { date: '', kg: 72 } as BodySnapshot,
      snap('2026-04-15', 71.3),
    ], null, NOW);
    expect(t.sorted).toHaveLength(1);
    expect(t.current).toBe(71.3);
  });

  it('filters last30 to the 30-day cutoff', () => {
    const t = calcWeightTrend([
      snap('2026-02-15', 80), // ~59 days ago
      snap('2026-03-20', 75), // ~26 days ago
      snap('2026-04-15', 71), // today
    ], null, NOW);
    expect(t.last30.map(s => s.date)).toEqual(['2026-03-20', '2026-04-15']);
  });
});
