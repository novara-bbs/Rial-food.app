/**
 * Weight EMA 7d — canonical smoothing contract (PR 5 Body-tab overhaul).
 *
 * Locks the half-life-7 EMA exposed by `calcWeightTrend`. The trend-line
 * rendered in WeightTrendCard consumes `emaSeries` directly; any silent
 * change to alpha or initial condition would rewrite user-visible history.
 */
import { describe, it, expect } from 'vitest';
import {
  calcEmaSeries,
  calcWeightTrend,
  EMA_ALPHA_7D,
} from '../../features/wellness/utils/weight-trend';
import type { BodySnapshot } from '../../types/wellness';

const ymd = (d: Date) => d.toISOString().slice(0, 10);

function snapshotsEndingAt(end: Date, kgs: number[]): BodySnapshot[] {
  const out: BodySnapshot[] = [];
  for (let i = 0; i < kgs.length; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - (kgs.length - 1 - i));
    out.push({ date: ymd(d), kg: kgs[i] });
  }
  return out;
}

describe('calcEmaSeries', () => {
  it('returns an empty series for no input', () => {
    expect(calcEmaSeries([])).toEqual([]);
  });

  it('returns the value itself for a single sample', () => {
    expect(calcEmaSeries([72.4])).toEqual([72.4]);
  });

  it('stays monotonic for a monotonic input', () => {
    const ema = calcEmaSeries([80, 79.8, 79.6, 79.4, 79.2]);
    for (let i = 1; i < ema.length; i++) {
      expect(ema[i]).toBeLessThan(ema[i - 1]);
    }
  });

  it('reduces variance compared with the raw series', () => {
    const raw = [80, 81, 79, 80, 81, 79, 80, 81, 79, 80];
    const ema = calcEmaSeries(raw);
    const variance = (xs: number[]) => {
      const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
      return xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length;
    };
    expect(variance(ema)).toBeLessThan(variance(raw));
  });

  it('reaches the half-life midpoint after 7 samples following a step change', () => {
    const preRun = Array.from({ length: 30 }, () => 70);
    const postRun = Array.from({ length: 7 }, () => 72);
    const ema = calcEmaSeries([...preRun, ...postRun]);
    const after7 = ema[ema.length - 1];
    // Halfway between 70 and 72 ≈ 71. Tolerance ±0.1 for rounding.
    expect(after7).toBeGreaterThan(70.9);
    expect(after7).toBeLessThan(71.1);
  });

  it('exposes an alpha that satisfies (1 − α)^7 = 0.5', () => {
    expect(Math.pow(1 - EMA_ALPHA_7D, 7)).toBeCloseTo(0.5, 6);
  });
});

describe('calcWeightTrend — EMA fields', () => {
  it('returns empty EMA fields when there are no snapshots', () => {
    const t = calcWeightTrend([]);
    expect(t.emaSeries).toEqual([]);
    expect(t.currentEma).toBeNull();
    expect(t.emaWeekDelta).toBeNull();
  });

  it('anchors the first EMA sample to the raw value', () => {
    const now = new Date('2026-04-15T12:00:00Z');
    const snaps = snapshotsEndingAt(now, [72.0]);
    const t = calcWeightTrend(snaps, null, now);
    expect(t.emaSeries).toHaveLength(1);
    expect(t.currentEma).toBe(72.0);
    expect(t.emaWeekDelta).toBeNull();
  });

  it('returns a positive emaWeekDelta for a rising 14-day series', () => {
    const now = new Date('2026-04-15T12:00:00Z');
    const kgs = Array.from({ length: 14 }, (_, i) => 70 + i * 0.1);
    const snaps = snapshotsEndingAt(now, kgs);
    const t = calcWeightTrend(snaps, null, now);
    expect(t.emaWeekDelta).not.toBeNull();
    expect(t.emaWeekDelta!).toBeGreaterThan(0);
  });
});
