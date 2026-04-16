import { describe, it, expect } from 'vitest';
import {
  normalizeDailyArchive,
  archiveHydrationConsumed,
  archiveActiveMinutes,
  type DailyArchive,
} from './useDailyReset';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeArchive(overrides: Partial<DailyArchive> = {}): DailyArchive {
  return {
    date: '2025-01-15',
    macros: {
      consumed: { cal: 1800, pro: 120, carbs: 200, fats: 60 },
      target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
    },
    hydration: 6,
    movement: 30,
    mealCount: 3,
    dailyLog: [{ id: 1 }],
    ...overrides,
  };
}

// ── normalizeDailyArchive ────────────────────────────────────────────────────

describe('normalizeDailyArchive', () => {
  it('converts numeric hydration to { consumed, target } with default target 10', () => {
    const raw = makeArchive({ hydration: 7 });
    const norm = normalizeDailyArchive(raw);
    expect(norm.hydration).toEqual({ consumed: 7, target: 10 });
  });

  it('converts numeric movement to { activeMinutes, steps } with steps 0', () => {
    const raw = makeArchive({ movement: 45 });
    const norm = normalizeDailyArchive(raw);
    expect(norm.movement).toEqual({ activeMinutes: 45, steps: 0 });
  });

  it('passes through Q15+ object hydration unchanged', () => {
    const raw = makeArchive({ hydration: { consumed: 8, target: 12 } });
    const norm = normalizeDailyArchive(raw);
    expect(norm.hydration).toEqual({ consumed: 8, target: 12 });
  });

  it('passes through Q15+ object movement unchanged', () => {
    const raw = makeArchive({ movement: { activeMinutes: 60, steps: 5000 } });
    const norm = normalizeDailyArchive(raw);
    expect(norm.movement).toEqual({ activeMinutes: 60, steps: 5000 });
  });

  it('sets tracked=true when mealCount > 0 and tracked is missing', () => {
    const raw = makeArchive({ mealCount: 2, tracked: undefined });
    expect(normalizeDailyArchive(raw).tracked).toBe(true);
  });

  it('sets tracked=false when mealCount is 0 and tracked is missing', () => {
    const raw = makeArchive({ mealCount: 0, tracked: undefined });
    expect(normalizeDailyArchive(raw).tracked).toBe(false);
  });

  it('preserves explicit tracked value', () => {
    const raw = makeArchive({ mealCount: 0, tracked: true });
    expect(normalizeDailyArchive(raw).tracked).toBe(true);
  });

  it('handles hydration=0 without treating as falsy', () => {
    const raw = makeArchive({ hydration: 0 });
    const norm = normalizeDailyArchive(raw);
    expect(norm.hydration).toEqual({ consumed: 0, target: 10 });
  });

  it('handles movement=0 without treating as falsy', () => {
    const raw = makeArchive({ movement: 0 });
    const norm = normalizeDailyArchive(raw);
    expect(norm.movement).toEqual({ activeMinutes: 0, steps: 0 });
  });
});

// ── archiveHydrationConsumed ─────────────────────────────────────────────────

describe('archiveHydrationConsumed', () => {
  it('extracts number from old format', () => {
    expect(archiveHydrationConsumed(makeArchive({ hydration: 5 }))).toBe(5);
  });

  it('extracts consumed from new format', () => {
    expect(archiveHydrationConsumed(makeArchive({ hydration: { consumed: 8, target: 12 } }))).toBe(8);
  });
});

// ── archiveActiveMinutes ─────────────────────────────────────────────────────

describe('archiveActiveMinutes', () => {
  it('extracts number from old format', () => {
    expect(archiveActiveMinutes(makeArchive({ movement: 20 }))).toBe(20);
  });

  it('extracts activeMinutes from new format', () => {
    expect(archiveActiveMinutes(makeArchive({ movement: { activeMinutes: 45, steps: 3000 } }))).toBe(45);
  });
});
