/**
 * daily-quality — pure aggregator that turns the day's `dailyLog` into the
 * 6 quality metrics rendered by `<FoodQualityCard>` on Home (Sprint D) and
 * the "Calidad" tab on `<NutritionDetail>` (Sprint E).
 *
 * The 6 metrics:
 *   1. Fibra              (encourage, target 30 g)
 *   2. Azúcares           (limit, target 50 g)              — WHO/EFSA free-sugars cap
 *   3. Saturadas          (limit, target 20 g)              — WHO ~10% of 2000 kcal
 *   4. Sal                (limit, target 5 g salt = 2 g Na) — WHO upper limit
 *   5. Ultraprocesados    (limit, target 0% — green ≤20%)   — % kcal NOVA-4
 *   6. Fruta y verdura    (encourage, target 5 portions)    — WHO 400 g = 5 × 80 g
 *
 * Inputs:
 *   - `consumedFiber` / `targetFiber` from the live `DailyMacros` slice
 *     (we already aggregate fiber there — no need to recompute).
 *   - `log` — the day's `DailyLogEntry[]`. Each entry carries flat macros
 *     and may optionally carry `sugar` / `saturatedFat` / `sodium` if the
 *     food source provided them (Open Food Facts brand entries do).
 *   - `resolver` — optional `(entry) => QualityResolution | null`. Lets the
 *     caller plug in per-variant data (processingLevel, category, sugar /
 *     satFat / sodium override) without coupling this util to the food-family
 *     tables. When absent (or `null` for a given entry), the metric depending
 *     on resolver-only data is flagged `partial: true`.
 *
 * Pure: no React, no i18n, no Sentry — just numbers in, metrics out.
 *
 * Badges follow a per-metric zone map (see `BADGE_ZONES` below). Limit
 * metrics invert the colour direction of encourage metrics: "good" for a
 * limit means "well under the cap"; "good" for an encourage means "at or
 * over the target".
 */
import type { ProcessingLevel } from '../../../types/food-family';

// ─── Public types ──────────────────────────────────────────────────────────

export type QualityBadge =
  | 'good'           // encourage: at/over target · limit: well under cap
  | 'moderate'       // amber zone in either direction
  | 'high'           // limit only: over the cap
  | 'low'            // encourage only: well under target
  | 'in-progress'   // encourage: between low and good
  | 'partial-data';  // resolver returned null for ≥50% of entries

export type QualityMetricKey =
  | 'fiber'
  | 'sugar'
  | 'saturatedFat'
  | 'salt'
  | 'ultraProcessed'
  | 'fruitsVegetables';

export type QualityMetricUnit = 'g' | 'mg' | 'svg' | '%';

export interface QualityMetric {
  key: QualityMetricKey;
  /** Numeric value (g for sugar/satFat/fiber, g salt for salt, % kcal for ultra, portions for fv). */
  value: number;
  /** Reference daily target (limit cap or encourage goal). */
  target: number;
  unit: QualityMetricUnit;
  /** 0..100 capped — drives the mini bar. For encourage metrics: value/target. For limit: also value/target (so 100 = at the cap). */
  fillPct: number;
  badge: QualityBadge;
  /** True when the resolver couldn't classify ≥50% of entries — UI shows a "Parciales" badge. */
  partial: boolean;
  /** Direction of the bar — limit metrics flip the colour ramp. */
  direction: 'encourage' | 'limit';
}

export interface DailyQuality {
  fiber: QualityMetric;
  sugar: QualityMetric;
  saturatedFat: QualityMetric;
  salt: QualityMetric;
  ultraProcessed: QualityMetric;
  fruitsVegetables: QualityMetric;
  /** 0..100 average of the 6 metric scores (limit metrics contribute the inverse of fillPct). */
  coverageScore: number;
}

export interface QualityResolution {
  /** g of free sugars in the consumed serving. */
  sugar?: number;
  /** g of saturated fat in the consumed serving. */
  saturatedFat?: number;
  /** mg of sodium in the consumed serving. */
  sodium?: number;
  /** NOVA-style processing level for the food. */
  processingLevel?: ProcessingLevel;
  /** True when this food contributes towards the fruits-and-vegetables count. */
  isFruitVegetable?: boolean;
  /** Servings (80g portions) this entry represents — defaults to grams/80 when omitted. */
  fruitVegetableServings?: number;
  /** Energy (kcal) of the consumed serving — used to weight ultra-processed share. Falls back to entry.cal. */
  kcal?: number;
}

export type QualityResolver = (entry: DailyLogLike) => QualityResolution | null;

/**
 * Loose duck-typed shape for the log entry — accepts the legacy flat fields
 * (`cal`, `sugar`, `saturatedFat`, `sodium`) and the recipe-style sub-object
 * (`macros.calories`, `macros.sugar`, etc.). Keeps the util decoupled from
 * the canonical `DailyLogEntry` shape so tests and callers can pass minimal
 * fixtures.
 */
export interface DailyLogLike {
  cal?: number;
  sugar?: number;
  saturatedFat?: number;
  sodium?: number;
  grams?: number;
  servings?: number;
  /**
   * Optional macros sub-object — fields optional, combined with a broad index signature
   * so DailyLogEntry shapes (which use `cal` not `calories`) are structurally assignable.
   */
  macros?: { calories?: number; sugar?: number; saturatedFat?: number; sodium?: number } & Record<string, unknown>;
}

export interface ComputeDailyQualityInputs {
  log: DailyLogLike[];
  /** Live `DailyMacros.consumed.fiber` — already aggregated upstream. */
  consumedFiber: number;
  /** Live `DailyMacros.target.fiber` — defaults to 30 g when undefined. */
  targetFiber?: number;
  /** Optional per-entry resolver (variant lookup, processingLevel, FV category). */
  resolver?: QualityResolver;
  /** Override default targets for sugar/satFat/salt/ultra/fv. */
  targets?: Partial<Record<Exclude<QualityMetricKey, 'fiber'>, number>>;
}

// ─── Defaults ──────────────────────────────────────────────────────────────

export const DEFAULT_TARGETS: Record<QualityMetricKey, number> = {
  fiber: 30,
  sugar: 50,
  saturatedFat: 20,
  salt: 5,
  ultraProcessed: 0,   // ideal floor for the metric — used as the "good" anchor
  fruitsVegetables: 5,
};

/** 1 standard portion of fruits/vegetables = 80 g (WHO 400 g/day = 5 × 80 g). */
export const FV_PORTION_GRAMS = 80;

/**
 * Threshold below which a metric is reported as `partial: true` — i.e. the
 * fraction of log entries that have data (either flat or via resolver) is
 * below this floor. 0.5 means "if more than half the foods are unknown for
 * this property, mark as partial".
 */
export const PARTIAL_DATA_THRESHOLD = 0.5;

// ─── Internal helpers ──────────────────────────────────────────────────────

interface ExtractResult {
  sum: number;
  /** Number of entries that contributed data (≠ undefined). */
  knownCount: number;
}

function entryEnergy(e: DailyLogLike): number {
  return Number.isFinite(e.cal) ? Number(e.cal) : Number(e.macros?.calories ?? 0);
}

function entryGrams(e: DailyLogLike): number {
  if (Number.isFinite(e.grams) && Number(e.grams) > 0) return Number(e.grams);
  // Recipes don't always carry grams — fall back to a 100 g unit so the
  // FV portion math still produces a defensible default.
  return 100;
}

function makeMetric(args: {
  key: QualityMetricKey;
  value: number;
  target: number;
  unit: QualityMetricUnit;
  direction: 'encourage' | 'limit';
  partial: boolean;
}): QualityMetric {
  const { key, value, target, unit, direction, partial } = args;
  const safeTarget = target > 0 ? target : 1;
  const fillPct = Math.max(0, Math.min(100, (value / safeTarget) * 100));
  const badge = computeBadge({ direction, fillPct, partial });
  return { key, value, target, unit, fillPct, badge, partial, direction };
}

function computeBadge(args: {
  direction: 'encourage' | 'limit';
  fillPct: number;
  partial: boolean;
}): QualityBadge {
  if (args.partial) return 'partial-data';
  const { direction, fillPct } = args;
  if (direction === 'encourage') {
    if (fillPct >= 90) return 'good';
    if (fillPct >= 50) return 'in-progress';
    return 'low';
  }
  // limit
  if (fillPct >= 100) return 'high';
  if (fillPct >= 60) return 'moderate';
  return 'good';
}

/**
 * Per-metric contribution to the overall coverageScore. Encourage metrics
 * contribute their fillPct directly. Limit metrics contribute the *inverse*
 * (so being well under the cap counts as a high score). Partial-data
 * metrics contribute 50 (neutral) so they neither penalise nor reward.
 */
function metricScore(m: QualityMetric): number {
  if (m.partial) return 50;
  if (m.direction === 'encourage') return Math.min(100, m.fillPct);
  // limit: 0% of cap = 100 score, 100% of cap = 0 score.
  return Math.max(0, 100 - Math.min(100, m.fillPct));
}

// ─── Main entry point ─────────────────────────────────────────────────────

export function computeDailyQuality(input: ComputeDailyQualityInputs): DailyQuality {
  const {
    log,
    consumedFiber,
    targetFiber = DEFAULT_TARGETS.fiber,
    resolver,
    targets,
  } = input;

  const total = log.length;

  // ── Fiber — already aggregated upstream into DailyMacros.consumed.fiber.
  // Treat as fully-known: we trust the live counter even if some entries
  // lack a per-food fibre attribution (the live total may underestimate
  // when foods don't carry it, which is acceptable for the home metric).
  const fiber = makeMetric({
    key: 'fiber',
    value: Math.max(0, consumedFiber),
    target: targetFiber > 0 ? targetFiber : DEFAULT_TARGETS.fiber,
    unit: 'g',
    direction: 'encourage',
    partial: false,
  });

  // ── Sugar — sum of `entry.macros.sugar` ?? `entry.sugar` for entries that
  // have it; resolver override wins.
  const sugarExtract = extractCombined(log, resolver, (r) => r?.sugar, (e) => e.sugar ?? e.macros?.sugar);
  const sugar = makeMetric({
    key: 'sugar',
    value: sugarExtract.sum,
    target: targets?.sugar ?? DEFAULT_TARGETS.sugar,
    unit: 'g',
    direction: 'limit',
    partial: total > 0 && sugarExtract.knownCount / total < PARTIAL_DATA_THRESHOLD,
  });

  // ── Saturated fat — same shape as sugar.
  const satFatExtract = extractCombined(
    log,
    resolver,
    (r) => r?.saturatedFat,
    (e) => e.saturatedFat ?? e.macros?.saturatedFat,
  );
  const saturatedFat = makeMetric({
    key: 'saturatedFat',
    value: satFatExtract.sum,
    target: targets?.saturatedFat ?? DEFAULT_TARGETS.saturatedFat,
    unit: 'g',
    direction: 'limit',
    partial: total > 0 && satFatExtract.knownCount / total < PARTIAL_DATA_THRESHOLD,
  });

  // ── Salt — convert sodium (mg) to salt (g) via 2.5× factor; we report in g.
  const sodiumExtract = extractCombined(
    log,
    resolver,
    (r) => r?.sodium,
    (e) => e.sodium ?? e.macros?.sodium,
  );
  const saltGrams = (sodiumExtract.sum * 2.5) / 1000;
  const salt = makeMetric({
    key: 'salt',
    value: saltGrams,
    target: targets?.salt ?? DEFAULT_TARGETS.salt,
    unit: 'g',
    direction: 'limit',
    partial: total > 0 && sodiumExtract.knownCount / total < PARTIAL_DATA_THRESHOLD,
  });

  // ── Ultra-processed — % of total daily kcal that came from NOVA-4 foods.
  // Requires a resolver (no flat field on legacy entries). When the resolver
  // is absent or returns no `processingLevel`, we mark partial.
  let ultraKcal = 0;
  let totalKcal = 0;
  let upKnown = 0;
  for (const e of log) {
    const eKcal = entryEnergy(e);
    totalKcal += eKcal;
    const r = resolver?.(e) ?? null;
    if (r?.processingLevel) {
      upKnown += 1;
      if (r.processingLevel === 'ultra-processed') {
        ultraKcal += r.kcal ?? eKcal;
      }
    }
  }
  const ultraPct = totalKcal > 0 ? Math.min(100, (ultraKcal / totalKcal) * 100) : 0;
  const ultraProcessed: QualityMetric = (() => {
    const partial = total > 0 && upKnown / total < PARTIAL_DATA_THRESHOLD;
    // Limit-direction with a target of 0 — surface % directly as both value
    // and "fill" so the bar reads as "how much of the day was ultra".
    const fillPct = Math.max(0, Math.min(100, ultraPct));
    const badge = computeBadge({ direction: 'limit', fillPct, partial });
    return {
      key: 'ultraProcessed',
      value: ultraPct,
      target: targets?.ultraProcessed ?? DEFAULT_TARGETS.ultraProcessed,
      unit: '%',
      fillPct,
      badge,
      partial,
      direction: 'limit',
    };
  })();

  // ── Fruits & vegetables — count 80 g portions.
  let fvServings = 0;
  let fvKnown = 0;
  for (const e of log) {
    const r = resolver?.(e) ?? null;
    if (r) {
      fvKnown += 1;
      if (r.isFruitVegetable) {
        if (typeof r.fruitVegetableServings === 'number' && Number.isFinite(r.fruitVegetableServings)) {
          fvServings += r.fruitVegetableServings;
        } else {
          fvServings += entryGrams(e) / FV_PORTION_GRAMS;
        }
      }
    }
  }
  const fruitsVegetables = makeMetric({
    key: 'fruitsVegetables',
    // Don't pre-round here — UI formats. Pre-rounding leaks rounding bias
    // into fillPct + coverageScore.
    value: fvServings,
    target: targets?.fruitsVegetables ?? DEFAULT_TARGETS.fruitsVegetables,
    unit: 'svg',
    direction: 'encourage',
    partial: total > 0 && fvKnown / total < PARTIAL_DATA_THRESHOLD,
  });

  const metrics = [fiber, sugar, saturatedFat, salt, ultraProcessed, fruitsVegetables];
  const coverageScore = Math.round(
    metrics.reduce((acc, m) => acc + metricScore(m), 0) / metrics.length,
  );

  return { fiber, sugar, saturatedFat, salt, ultraProcessed, fruitsVegetables, coverageScore };
}

/**
 * Combines the resolver-derived value (preferred) with the flat
 * entry-derived value (fallback) for a single property. An entry counts as
 * "known" if either source provided a finite number.
 */
function extractCombined(
  log: DailyLogLike[],
  resolver: QualityResolver | undefined,
  pickResolved: (r: QualityResolution | null) => number | undefined,
  pickFlat: (e: DailyLogLike) => number | undefined,
): ExtractResult {
  let sum = 0;
  let known = 0;
  for (const e of log) {
    const r = resolver?.(e) ?? null;
    const resolved = pickResolved(r);
    const flat = pickFlat(e);
    const v = typeof resolved === 'number' && Number.isFinite(resolved)
      ? resolved
      : (typeof flat === 'number' && Number.isFinite(flat) ? flat : undefined);
    if (typeof v === 'number') {
      sum += v;
      known += 1;
    }
  }
  return { sum, knownCount: known };
}
