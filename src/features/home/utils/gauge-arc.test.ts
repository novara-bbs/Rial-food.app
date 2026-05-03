import { describe, it, expect } from 'vitest';
import {
  GAUGE_START_DEG,
  GAUGE_SPAN_DEG,
  GAUGE_END_DEG,
  describeGaugeTrack,
  describeGaugeProgress,
  gaugeNeedlePoint,
  gaugeProgress,
} from './gauge-arc';

describe('gauge-arc constants', () => {
  it('starts at 270° (9 o\'clock from 12)', () => {
    expect(GAUGE_START_DEG).toBe(270);
  });

  it('spans exactly 180°', () => {
    expect(GAUGE_SPAN_DEG).toBe(180);
  });

  it('ends at 450° (= 90° = 3 o\'clock)', () => {
    expect(GAUGE_END_DEG).toBe(450);
  });
});

describe('describeGaugeTrack', () => {
  it('emits an SVG A (elliptical-arc) command with equal rx and ry', () => {
    const path = describeGaugeTrack(100, 100, 80);
    expect(path).toMatch(/^M /);
    expect(path).toContain('A 80 80 0 0 1');
  });

  it('starts at 9 o\'clock relative to center (cx=100, cy=100, r=80 → x=20, y=100)', () => {
    const path = describeGaugeTrack(100, 100, 80);
    const tokens = path.split(' ');
    const startX = parseFloat(tokens[1]);
    const startY = parseFloat(tokens[2]);
    expect(startX).toBeCloseTo(20, 1);
    expect(startY).toBeCloseTo(100, 1);
  });

  it('ends at 3 o\'clock relative to center (cx=100, cy=100, r=80 → x=180, y=100)', () => {
    const path = describeGaugeTrack(100, 100, 80);
    const tokens = path.split(' ');
    const endX = parseFloat(tokens[tokens.length - 2]);
    const endY = parseFloat(tokens[tokens.length - 1]);
    expect(endX).toBeCloseTo(180, 1);
    expect(endY).toBeCloseTo(100, 1);
  });
});

describe('describeGaugeProgress', () => {
  it('returns null when progress is 0 or negative (nothing to draw)', () => {
    expect(describeGaugeProgress(100, 100, 80, 0)).toBeNull();
    expect(describeGaugeProgress(100, 100, 80, -0.5)).toBeNull();
  });

  it('caps at progress = 1 (no overflow)', () => {
    const full = describeGaugeProgress(100, 100, 80, 1);
    const over = describeGaugeProgress(100, 100, 80, 2.7);
    expect(full).toBe(over);
  });

  it('a full sweep ends at 3 o\'clock — same as the track end', () => {
    const fullProgress = describeGaugeProgress(100, 100, 80, 1)!;
    const tokens = fullProgress.split(' ');
    const endX = parseFloat(tokens[tokens.length - 2]);
    const endY = parseFloat(tokens[tokens.length - 1]);
    expect(endX).toBeCloseTo(180, 1);
    expect(endY).toBeCloseTo(100, 1);
  });

  it('a half sweep ends at 12 o\'clock (top of the gauge)', () => {
    // 50% of 180° = 90° from 270° = 360° = 0° (12 o'clock).
    // Point: (cx + r·sin(0), cy − r·cos(0)) = (100, 100 − 80) = (100, 20)
    const halfProgress = describeGaugeProgress(100, 100, 80, 0.5)!;
    const tokens = halfProgress.split(' ');
    const endX = parseFloat(tokens[tokens.length - 2]);
    const endY = parseFloat(tokens[tokens.length - 1]);
    expect(endX).toBeCloseTo(100, 1);
    expect(endY).toBeCloseTo(20, 1);
  });

  it('always uses large-arc-flag=0 (gauge max is exactly 180°, never larger)', () => {
    // Sample several progresses and confirm flag stays 0.
    [0.1, 0.5, 0.99, 1].forEach((p) => {
      const path = describeGaugeProgress(100, 100, 80, p)!;
      // Path tokens: M x y A r r 0 large sweep ex ey
      const largeFlag = path.split(' ')[7];
      expect(largeFlag).toBe('0');
    });
  });
});

describe('gaugeNeedlePoint', () => {
  it('returns null for progress ≤ 0 (gauge at rest, no dot)', () => {
    expect(gaugeNeedlePoint(100, 100, 80, 0)).toBeNull();
    expect(gaugeNeedlePoint(100, 100, 80, -1)).toBeNull();
  });

  it('caps at progress = 1 (dot lands at 3 o\'clock)', () => {
    const overrun = gaugeNeedlePoint(100, 100, 80, 1.6);
    expect(overrun).not.toBeNull();
    expect(overrun!.x).toBeCloseTo(180, 1);
    expect(overrun!.y).toBeCloseTo(100, 1);
  });

  it('lands at 12 o\'clock at 50% progress', () => {
    const midpoint = gaugeNeedlePoint(100, 100, 80, 0.5);
    expect(midpoint).not.toBeNull();
    expect(midpoint!.x).toBeCloseTo(100, 1);
    expect(midpoint!.y).toBeCloseTo(20, 1);
  });
});

describe('gaugeProgress', () => {
  it('clamps to [0, 1]', () => {
    expect(gaugeProgress(0, 100)).toBe(0);
    expect(gaugeProgress(100, 100)).toBe(1);
    expect(gaugeProgress(150, 100)).toBe(1);
    expect(gaugeProgress(-50, 100)).toBe(0);
  });

  it('returns 0 when target is 0 or negative (avoids Infinity)', () => {
    expect(gaugeProgress(500, 0)).toBe(0);
    expect(gaugeProgress(500, -100)).toBe(0);
  });

  it('returns the simple ratio for valid mid-range inputs', () => {
    expect(gaugeProgress(50, 100)).toBeCloseTo(0.5, 5);
    expect(gaugeProgress(75, 100)).toBeCloseTo(0.75, 5);
  });
});
