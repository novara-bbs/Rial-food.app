import type { BodySnapshot } from '../../../types/wellness';
import { buildDemoTimeline } from '../../dev/data/demo-seed-timeline';

/**
 * Body snapshot seed — now aligned with the Clara (ICP Cut) demo persona.
 * Re-exports the snapshots from the Demo Rial timeline so the fixture is
 * coherent across Progress, Home, Weekly Review, and community posts.
 *
 * Kept as a dedicated module so tests and the "empty-state dev CTA" inside
 * Progress.tsx can still call `seedBodySnapshots()` without pulling in the
 * full demo orchestrator.
 */

/** Lazy singleton — avoid regenerating on every import. */
let _cached: BodySnapshot[] | null = null;

export function generateBodySnapshotSeed(): BodySnapshot[] {
  if (_cached) return _cached;
  _cached = buildDemoTimeline().snapshots;
  return _cached;
}

export const BODY_SNAPSHOT_SEED = generateBodySnapshotSeed();

/**
 * Replace current weightHistory with seed data.
 * Use only when history is empty (dev-only CTA in Progress.tsx).
 */
export function seedBodySnapshots(
  setWeightHistory: (v: BodySnapshot[] | ((prev: BodySnapshot[]) => BodySnapshot[])) => void,
): void {
  setWeightHistory(generateBodySnapshotSeed());
}
