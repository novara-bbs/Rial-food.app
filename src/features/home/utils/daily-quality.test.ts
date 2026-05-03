import { describe, it, expect } from 'vitest';
import {
  computeDailyQuality,
  DEFAULT_TARGETS,
  FV_PORTION_GRAMS,
  PARTIAL_DATA_THRESHOLD,
  type DailyLogLike,
  type QualityResolution,
} from './daily-quality';

const emptyLog: DailyLogLike[] = [];

const sampleLog: DailyLogLike[] = [
  { cal: 300, sugar: 10, saturatedFat: 4, sodium: 600, grams: 200 },
  { cal: 500, sugar: 8, saturatedFat: 6, sodium: 800, grams: 250 },
  { cal: 200, sugar: 4, saturatedFat: 1, sodium: 200, grams: 150 },
];

describe('computeDailyQuality — empty log', () => {
  it('returns zero-valued metrics with low/partial badges and coverage 50', () => {
    const q = computeDailyQuality({ log: emptyLog, consumedFiber: 0 });

    expect(q.fiber.value).toBe(0);
    expect(q.fiber.badge).toBe('low');                    // encourage at 0% → low
    expect(q.sugar.value).toBe(0);
    expect(q.sugar.badge).toBe('good');                   // limit at 0% of cap → good
    expect(q.ultraProcessed.partial).toBe(false);         // empty log: ratio is 0/0, threshold check skips
    // Coverage with no log: limits good (100), encourage low (0) → average ~50.
    expect(q.coverageScore).toBeGreaterThanOrEqual(40);
    expect(q.coverageScore).toBeLessThanOrEqual(70);
  });
});

describe('computeDailyQuality — fiber', () => {
  it('uses live consumedFiber and the supplied target', () => {
    const q = computeDailyQuality({ log: sampleLog, consumedFiber: 22, targetFiber: 30 });
    expect(q.fiber.value).toBe(22);
    expect(q.fiber.target).toBe(30);
    expect(q.fiber.fillPct).toBeCloseTo((22 / 30) * 100, 1);
    expect(q.fiber.badge).toBe('in-progress');           // 73% of target
  });

  it('falls back to default target when targetFiber is undefined', () => {
    const q = computeDailyQuality({ log: emptyLog, consumedFiber: 30 });
    expect(q.fiber.target).toBe(DEFAULT_TARGETS.fiber);
    expect(q.fiber.badge).toBe('good');                  // 100% → good (≥90%)
  });

  it('clamps negative consumedFiber to 0', () => {
    const q = computeDailyQuality({ log: emptyLog, consumedFiber: -5, targetFiber: 30 });
    expect(q.fiber.value).toBe(0);
  });

  it('caps fillPct at 100 even when consumed > target', () => {
    const q = computeDailyQuality({ log: emptyLog, consumedFiber: 60, targetFiber: 30 });
    expect(q.fiber.fillPct).toBe(100);
    expect(q.fiber.badge).toBe('good');
  });
});

describe('computeDailyQuality — sugar / saturated fat (flat fields)', () => {
  it('sums sugar from flat entry fields and labels limits', () => {
    const q = computeDailyQuality({ log: sampleLog, consumedFiber: 0 });
    expect(q.sugar.value).toBe(22);                       // 10 + 8 + 4
    expect(q.sugar.target).toBe(DEFAULT_TARGETS.sugar);   // 50
    expect(q.sugar.fillPct).toBeCloseTo(44, 1);
    expect(q.sugar.badge).toBe('good');                   // 44% < 60% cap → good
  });

  it('flags sugar.high when over the cap', () => {
    const heavy: DailyLogLike[] = [{ sugar: 60, cal: 800 }];
    const q = computeDailyQuality({ log: heavy, consumedFiber: 0 });
    expect(q.sugar.fillPct).toBe(100);                    // capped
    expect(q.sugar.badge).toBe('high');                   // 60g / 50g cap
  });

  it('flags moderate when between 60% and 100% of the cap', () => {
    const mid: DailyLogLike[] = [{ saturatedFat: 15, cal: 600 }];
    const q = computeDailyQuality({ log: mid, consumedFiber: 0 });
    expect(q.saturatedFat.fillPct).toBeCloseTo(75, 1);
    expect(q.saturatedFat.badge).toBe('moderate');
  });

  it('marks partial when <50% of entries have the flat field', () => {
    const sparse: DailyLogLike[] = [
      { sugar: 10, cal: 300 },
      { cal: 400 },                                       // no sugar
      { cal: 500 },                                       // no sugar
    ];
    const q = computeDailyQuality({ log: sparse, consumedFiber: 0 });
    expect(q.sugar.partial).toBe(true);
    expect(q.sugar.badge).toBe('partial-data');
  });

  it('does NOT mark partial when ≥50% of entries have the flat field', () => {
    const half: DailyLogLike[] = [
      { sugar: 10, cal: 300 },
      { sugar: 12, cal: 400 },
      { cal: 500 },
    ];
    const q = computeDailyQuality({ log: half, consumedFiber: 0 });
    expect(q.sugar.partial).toBe(false);
  });

  it('reads sugar from the recipe-style macros sub-object as fallback', () => {
    const recipeStyle: DailyLogLike[] = [
      { macros: { calories: 300, sugar: 7 } },
      { macros: { calories: 200, sugar: 3 } },
    ];
    const q = computeDailyQuality({ log: recipeStyle, consumedFiber: 0 });
    expect(q.sugar.value).toBe(10);
  });
});

describe('computeDailyQuality — salt (sodium → salt conversion)', () => {
  it('converts mg sodium to g salt with the 2.5× factor', () => {
    // sodium: 600 + 800 + 200 = 1600 mg → salt = 1600 × 2.5 / 1000 = 4 g
    const q = computeDailyQuality({ log: sampleLog, consumedFiber: 0 });
    expect(q.salt.value).toBeCloseTo(4, 5);
    expect(q.salt.target).toBe(5);
    expect(q.salt.unit).toBe('g');
    expect(q.salt.fillPct).toBe(80);
    expect(q.salt.badge).toBe('moderate');
  });

  it('flags high when salt exceeds 5 g (sodium > 2000 mg)', () => {
    const salty: DailyLogLike[] = [{ sodium: 2400, cal: 700 }];
    const q = computeDailyQuality({ log: salty, consumedFiber: 0 });
    expect(q.salt.value).toBe(6);
    expect(q.salt.badge).toBe('high');
  });
});

describe('computeDailyQuality — ultraprocessed (resolver required)', () => {
  it('marks partial when no resolver is provided', () => {
    const q = computeDailyQuality({ log: sampleLog, consumedFiber: 0 });
    expect(q.ultraProcessed.partial).toBe(true);
    expect(q.ultraProcessed.badge).toBe('partial-data');
  });

  it('computes %-of-kcal from NOVA-4 entries when resolver supplies processingLevel', () => {
    const log: DailyLogLike[] = [
      { cal: 400 },
      { cal: 600 },
      { cal: 200 },
    ];
    const resolver = (e: DailyLogLike): QualityResolution | null => {
      // first two whole-foods, last one ultra-processed
      const idx = log.indexOf(e);
      return {
        processingLevel: idx === 2 ? 'ultra-processed' : 'whole',
      };
    };
    const q = computeDailyQuality({ log, consumedFiber: 0, resolver });
    // ultra kcal = 200 / 1200 = 16.67%
    expect(q.ultraProcessed.value).toBeCloseTo(16.667, 1);
    expect(q.ultraProcessed.partial).toBe(false);
    expect(q.ultraProcessed.badge).toBe('good');
  });

  it('flags moderate when ultra share lands between 60% and 100%', () => {
    const log: DailyLogLike[] = [
      { cal: 400 },
      { cal: 600 },
    ];
    const resolver = (): QualityResolution => ({ processingLevel: 'ultra-processed' });
    const q = computeDailyQuality({ log, consumedFiber: 0, resolver });
    expect(q.ultraProcessed.value).toBe(100);
    expect(q.ultraProcessed.badge).toBe('high');
  });
});

describe('computeDailyQuality — fruits & vegetables (resolver required)', () => {
  it('marks partial when no resolver is provided', () => {
    const q = computeDailyQuality({ log: sampleLog, consumedFiber: 0 });
    expect(q.fruitsVegetables.partial).toBe(true);
  });

  it('counts 80 g portions when resolver flags isFruitVegetable=true and uses entry grams', () => {
    const log: DailyLogLike[] = [
      { cal: 50, grams: 240 },                            // 3 portions
      { cal: 150, grams: 100 },                           // not FV
      { cal: 80, grams: 160 },                            // 2 portions
    ];
    const resolver = (e: DailyLogLike): QualityResolution => {
      const isFv = (e.cal ?? 0) <= 100;
      return { isFruitVegetable: isFv };
    };
    const q = computeDailyQuality({ log, consumedFiber: 0, resolver });
    expect(q.fruitsVegetables.value).toBeCloseTo(5, 1);   // 3 + 2 portions
    expect(q.fruitsVegetables.target).toBe(5);
    expect(q.fruitsVegetables.badge).toBe('good');         // 100%
  });

  it('uses an explicit fruitVegetableServings value when supplied (overrides grams)', () => {
    const log: DailyLogLike[] = [{ cal: 100, grams: 80 }];
    const resolver = (): QualityResolution => ({
      isFruitVegetable: true,
      fruitVegetableServings: 2.5,
    });
    const q = computeDailyQuality({ log, consumedFiber: 0, resolver });
    expect(q.fruitsVegetables.value).toBeCloseTo(2.5, 1);
  });

  it('falls back to 100 g when entry grams is missing or zero', () => {
    const log: DailyLogLike[] = [{ cal: 100 }];
    const resolver = (): QualityResolution => ({ isFruitVegetable: true });
    const q = computeDailyQuality({ log, consumedFiber: 0, resolver });
    // 100 g / 80 g = 1.25 portions
    expect(q.fruitsVegetables.value).toBeCloseTo(1.25, 1);
  });
});

describe('computeDailyQuality — coverageScore', () => {
  it('partial-data metrics contribute neutral 50 (neither penalise nor reward)', () => {
    // No resolver → ultra + fv are partial (50 each). Sample log has flat
    // sugar/satFat/sodium populated → not partial. Fiber 0 → low (0). Sample
    // sugar/satFat/sodium under cap → ~good for limits.
    // Computed: fiber 0 + sugar 56 + satFat 45 + salt 20 + ultra 50 + fv 50 = 221/6 ≈ 37.
    const q = computeDailyQuality({ log: sampleLog, consumedFiber: 0 });
    expect(q.coverageScore).toBeGreaterThanOrEqual(30);
    expect(q.coverageScore).toBeLessThanOrEqual(75);
  });

  it('encourage metrics contribute fillPct directly', () => {
    const log: DailyLogLike[] = [
      { cal: 100, grams: 400, sugar: 0, saturatedFat: 0, sodium: 0 },
    ];
    const resolver = (): QualityResolution => ({
      isFruitVegetable: true,
      processingLevel: 'whole',
      sugar: 0,
      saturatedFat: 0,
      sodium: 0,
    });
    const q = computeDailyQuality({ log, consumedFiber: 30, targetFiber: 30, resolver });
    // fiber 100, sugar 100 (0/50 cap → good = 100), satFat 100, salt 100,
    // ultra 100 (0% over cap → good = 100), fv 100 (5 portions). avg = 100.
    expect(q.coverageScore).toBe(100);
  });

  it('limit metrics contribute the inverse of fillPct (over the cap → 0)', () => {
    const log: DailyLogLike[] = [
      { cal: 1000, sugar: 100, saturatedFat: 40, sodium: 4000 },
    ];
    const q = computeDailyQuality({ log, consumedFiber: 0 });
    // fiber 0 → 0; sugar 200% cap (capped to 100% fill) → score 0; satFat 200%
    // cap → 0; salt 200% → 0; ultra partial (no resolver) → 50; fv partial → 50.
    expect(q.coverageScore).toBeLessThanOrEqual(20);
  });
});

describe('PARTIAL_DATA_THRESHOLD + FV_PORTION_GRAMS exports', () => {
  it('has 50% partial threshold', () => {
    expect(PARTIAL_DATA_THRESHOLD).toBe(0.5);
  });

  it('has 80 g fruit-veg portion size', () => {
    expect(FV_PORTION_GRAMS).toBe(80);
  });
});
