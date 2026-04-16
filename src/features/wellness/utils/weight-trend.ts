/**
 * Canonical weight-trend derivation — Q13.
 *
 * Consolidates two independent builders that lived in:
 *   - features/home/components/ProgressPreviewCard.tsx (SVG path builder)
 *   - features/wellness/screens/Progress.tsx (lines 67-81, SVG path builder)
 *
 * Returns a neutral data shape; chart rendering is delegated to
 * the shared `<Sparkline>` primitive.
 */
import type { BodySnapshot } from '../../../types/wellness';
import { dateToLocal } from '../../../lib/dates';

const DAY_MS = 86_400_000;

export interface WeightTrend {
  /** All snapshots sorted ascending by date. */
  sorted: BodySnapshot[];
  /** Snapshots within the last 30 days (ascending). */
  last30: BodySnapshot[];
  /** Latest recorded kg (or null if no data). */
  current: number | null;
  /** First recorded kg in the sorted sequence. */
  first: number | null;
  /** Delta in kg across the last 7 days (null when < 2 snapshots). */
  weekDelta: number | null;
  /**
   * Progress toward `targetKg` as a fraction 0..1 from `first` → `targetKg`.
   * Direction-aware: positive progress whether gaining or losing.
   * Null when target or first is missing, or start and target are equal.
   */
  targetProgressPct: number | null;
}

export function calcWeightTrend(
  snapshots: BodySnapshot[] | undefined | null,
  targetKg?: number | null,
  now: Date = new Date(),
): WeightTrend {
  const sorted = [...(snapshots || [])]
    .filter(s => typeof s?.kg === 'number' && s.kg > 0 && typeof s?.date === 'string' && s.date.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return {
      sorted,
      last30: [],
      current: null,
      first: null,
      weekDelta: null,
      targetProgressPct: null,
    };
  }

  const cutoff30 = dateToLocal(new Date(now.getTime() - 30 * DAY_MS));
  const last30 = sorted.filter(s => s.date >= cutoff30);

  const current = sorted[sorted.length - 1].kg;
  const first = sorted[0].kg;

  // Week delta — compare most-recent snapshot to oldest snapshot within last 7 days
  const cutoff7 = dateToLocal(new Date(now.getTime() - 7 * DAY_MS));
  const last7 = sorted.filter(s => s.date >= cutoff7);
  const weekDelta = last7.length >= 2
    ? +(last7[last7.length - 1].kg - last7[0].kg).toFixed(1)
    : null;

  let targetProgressPct: number | null = null;
  if (targetKg != null && targetKg > 0 && first !== null && targetKg !== first) {
    const total = targetKg - first;
    const moved = current - first;
    const pct = moved / total;
    // Clamp [0, 1] so overshoot reads as 100%
    targetProgressPct = Math.max(0, Math.min(1, pct));
  }

  return { sorted, last30, current, first, weekDelta, targetProgressPct };
}
