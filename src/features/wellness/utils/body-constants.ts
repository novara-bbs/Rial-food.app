/**
 * Body constants aggregator — PR 7 (ADR-009 V2 §4.10).
 *
 * Maps `BodySnapshot[]` + `heightCm` to a list of `ConstantTileSpec`s that
 * the `<BodyConstantsGrid>` can render. Pure function, unit-aware.
 *
 * For each biometric we resolve:
 * - Whether the "template" exists (does the user track this dimension at all?).
 * - The latest value, if present.
 * - A trend vs ~14 days ago (stable / up / down) when ≥2 samples exist.
 */
import type { BodySnapshot } from '../../../types/wellness';
import type { ConstantTileState } from '../../../components/ConstantTile';
import type { UnitSystem } from '../../food/utils/units';
import { bodyWeightFromKg, getBodyWeightUnit } from '../../food/utils/units';

export interface ConstantTileSpec {
  id: 'weight' | 'bmi' | 'bodyFat' | 'waist' | 'hips' | 'chest';
  labelKey: string;           // i18n namespace key under `t.progress.constants`
  unit?: string;
  state: ConstantTileState;
  value?: string;
  trendValue?: string;
}

const WINDOW_DAYS = 14;
const DAY_MS = 86_400_000;

type Dimension = 'kg' | 'bodyFat' | 'waist' | 'hips' | 'chest';

function readDimension(snap: BodySnapshot, dim: Dimension): number | undefined {
  if (dim === 'kg') return snap.kg;
  if (dim === 'bodyFat') return snap.measurements?.bodyFatPct;
  if (dim === 'waist') return snap.measurements?.waistCm;
  if (dim === 'hips') return snap.measurements?.hipsCm;
  if (dim === 'chest') return snap.measurements?.chestCm;
  return undefined;
}

/** Nearest-to-target-days sample strictly before the latest one. */
function pickReference(
  sortedAsc: Array<{ date: string; value: number }>,
  latestDate: string,
  targetDays: number,
): { value: number; days: number } | null {
  if (sortedAsc.length < 2) return null;
  const latestMs = new Date(latestDate + 'T12:00:00').getTime();
  let best: { value: number; days: number } | null = null;
  for (const s of sortedAsc) {
    if (s.date === latestDate) continue;
    const days = Math.abs((latestMs - new Date(s.date + 'T12:00:00').getTime()) / DAY_MS);
    if (!best || Math.abs(days - targetDays) < Math.abs(best.days - targetDays)) {
      best = { value: s.value, days };
    }
  }
  return best;
}

function classifyTrend(
  latest: number,
  previous: number | null,
  threshold: number,
): ConstantTileState {
  if (previous == null) return 'value-stable';
  const delta = latest - previous;
  if (Math.abs(delta) < threshold) return 'value-stable';
  return delta > 0 ? 'value-trending-up' : 'value-trending-down';
}

/**
 * Shared computation for a single dimension. Returns state + formatted
 * value + formatted trendValue (or `empty-*` when there is no data).
 */
function resolveDimension(
  snapshots: BodySnapshot[],
  dim: Dimension,
  opts: {
    anyoneTracked: boolean;
    formatValue: (n: number) => string;
    formatDelta: (n: number) => string;
    threshold: number;
  },
): Pick<ConstantTileSpec, 'state' | 'value' | 'trendValue'> {
  if (!opts.anyoneTracked) return { state: 'empty-no-template' };

  const sorted = snapshots
    .filter(s => readDimension(s, dim) != null)
    .map(s => ({ date: s.date, value: readDimension(s, dim) as number }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) return { state: 'empty-no-data' };

  const latest = sorted[sorted.length - 1];
  const reference = pickReference(sorted, latest.date, WINDOW_DAYS);
  const state = classifyTrend(latest.value, reference?.value ?? null, opts.threshold);

  const trendValue = state === 'value-stable' || !reference
    ? undefined
    : opts.formatDelta(latest.value - reference.value);

  return { state, value: opts.formatValue(latest.value), trendValue };
}

export function computeBodyConstants(
  snapshots: BodySnapshot[],
  heightCm: number | undefined,
  unitSystem: UnitSystem,
): ConstantTileSpec[] {
  const weightUnit = getBodyWeightUnit(unitSystem);
  const fmtWeight = (n: number) => String(bodyWeightFromKg(n, unitSystem));
  const fmtWeightDelta = (n: number) => {
    const delta = +bodyWeightFromKg(Math.abs(n), unitSystem);
    const sign = n > 0 ? '+' : '-';
    return `${sign}${delta} ${weightUnit}`;
  };
  const fmtCm = (n: number) => String(Math.round(n));
  const fmtCmDelta = (n: number) => `${n > 0 ? '+' : ''}${Math.round(n)} cm`;
  const fmtPct = (n: number) => n.toFixed(1);
  const fmtPctDelta = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
  const fmtBmi = (n: number) => n.toFixed(1);
  const fmtBmiDelta = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}`;

  const hasAnyWeight = snapshots.some(s => typeof s.kg === 'number');
  const weight = resolveDimension(snapshots, 'kg', {
    anyoneTracked: hasAnyWeight,
    formatValue: fmtWeight,
    formatDelta: fmtWeightDelta,
    threshold: 0.5,
  });

  // BMI: derived from kg + heightCm. Template exists when both are set.
  const hasBmiTemplate = hasAnyWeight && !!heightCm && heightCm > 0;
  let bmiResolved: Pick<ConstantTileSpec, 'state' | 'value' | 'trendValue'>;
  if (!hasBmiTemplate) {
    bmiResolved = { state: 'empty-no-template' };
  } else {
    const heightM = (heightCm as number) / 100;
    const kgToBmi = (k: number) => k / (heightM * heightM);
    const sorted = snapshots
      .filter(s => typeof s.kg === 'number')
      .map(s => ({ date: s.date, value: kgToBmi(s.kg) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) {
      bmiResolved = { state: 'empty-no-data' };
    } else {
      const latest = sorted[sorted.length - 1];
      const reference = pickReference(sorted, latest.date, WINDOW_DAYS);
      const state = classifyTrend(latest.value, reference?.value ?? null, 0.2);
      bmiResolved = {
        state,
        value: fmtBmi(latest.value),
        trendValue: state === 'value-stable' || !reference ? undefined : fmtBmiDelta(latest.value - reference.value),
      };
    }
  }

  const bodyFat = resolveDimension(snapshots, 'bodyFat', {
    anyoneTracked: snapshots.some(s => s.measurements?.bodyFatPct != null),
    formatValue: fmtPct,
    formatDelta: fmtPctDelta,
    threshold: 0.5,
  });

  const waist = resolveDimension(snapshots, 'waist', {
    anyoneTracked: snapshots.some(s => s.measurements?.waistCm != null),
    formatValue: fmtCm,
    formatDelta: fmtCmDelta,
    threshold: 1,
  });

  const hips = resolveDimension(snapshots, 'hips', {
    anyoneTracked: snapshots.some(s => s.measurements?.hipsCm != null),
    formatValue: fmtCm,
    formatDelta: fmtCmDelta,
    threshold: 1,
  });

  const chest = resolveDimension(snapshots, 'chest', {
    anyoneTracked: snapshots.some(s => s.measurements?.chestCm != null),
    formatValue: fmtCm,
    formatDelta: fmtCmDelta,
    threshold: 1,
  });

  return [
    { id: 'weight', labelKey: 'weight', unit: weightUnit, ...weight },
    { id: 'bmi', labelKey: 'bmi', unit: 'kg/m²', ...bmiResolved },
    { id: 'bodyFat', labelKey: 'bodyFat', unit: '%', ...bodyFat },
    { id: 'waist', labelKey: 'waist', unit: 'cm', ...waist },
    { id: 'hips', labelKey: 'hips', unit: 'cm', ...hips },
    { id: 'chest', labelKey: 'chest', unit: 'cm', ...chest },
  ];
}
