/**
 * gauge-arc — pure SVG path helpers for the 180° "kcal restantes" gauge
 * used by `<EnergyArcCard>` (Sprint B). Open at the top — i.e. a half-arc
 * shaped like a horseshoe lying on its back, with the needle starting at
 * the 9 o'clock position and sweeping clockwise to 3 o'clock.
 *
 *           225°            315°
 *              ╲          ╱
 *               ╲        ╱
 *                ╲ track ╱
 *      progress ━━━━━━━━━━━━━━━━━━━━ ←  rendered width is 180°
 *
 * Distinct from `describeSemiRingArc` in `NutritionHeroRing.tsx` (which is
 * 270°, open at the bottom): the gauge is the editorial "needle" reading
 * shape — half-arc only, never wraps around. Coordinates use the same
 * convention: clockwise from 12 o'clock, x = cx + r·sin(θ), y = cy − r·cos(θ).
 */

const TO_RAD = Math.PI / 180;

/** Start angle (degrees from 12 o'clock, clockwise). 270 = 9 o'clock. */
export const GAUGE_START_DEG = 270;
/** Total sweep of the gauge track. 180° = horseshoe. */
export const GAUGE_SPAN_DEG = 180;
/** End angle. 270 + 180 = 450 (modular = 90 = 3 o'clock). */
export const GAUGE_END_DEG = GAUGE_START_DEG + GAUGE_SPAN_DEG;

function pointOnCircle(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = angleDeg * TO_RAD;
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
}

/**
 * Builds the SVG path for the 180° muted track. Always rendered, always full
 * width — the consumer overlays the progress arc on top.
 */
export function describeGaugeTrack(cx: number, cy: number, r: number): string {
  const start = pointOnCircle(cx, cy, r, GAUGE_START_DEG);
  const end = pointOnCircle(cx, cy, r, GAUGE_END_DEG);
  // 180° → large-arc-flag must be 0 (exactly half is the boundary case; SVG
  // resolves it deterministically with sweep-flag=1 + small large-arc-flag).
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${r} ${r} 0 0 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

/**
 * Builds the SVG path for the progress arc (0..1 fraction of the gauge).
 * Returns `null` when progress ≤ 0 (nothing to render). Caps at 1.
 *
 * The path always starts at GAUGE_START_DEG and sweeps clockwise. The
 * large-arc-flag flips at >180° but the gauge total is exactly 180°, so the
 * flag stays 0 for any in-range progress (≤180°).
 */
export function describeGaugeProgress(
  cx: number,
  cy: number,
  r: number,
  progress: number,
): string | null {
  if (progress <= 0) return null;
  const capped = Math.min(progress, 1);
  const sweepDeg = capped * GAUGE_SPAN_DEG;
  const start = pointOnCircle(cx, cy, r, GAUGE_START_DEG);
  const end = pointOnCircle(cx, cy, r, GAUGE_START_DEG + sweepDeg);
  // sweepDeg is in [0, 180] — large-arc flag stays 0 by construction.
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${r} ${r} 0 0 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

/**
 * Coordinates of the "needle dot" rendered at the tip of the progress arc.
 * Returns `null` for progress ≤ 0 (no dot when nothing is consumed yet —
 * the gauge stays at rest visually).
 */
export function gaugeNeedlePoint(
  cx: number,
  cy: number,
  r: number,
  progress: number,
): { x: number; y: number } | null {
  if (progress <= 0) return null;
  const capped = Math.min(progress, 1);
  const sweepDeg = capped * GAUGE_SPAN_DEG;
  return pointOnCircle(cx, cy, r, GAUGE_START_DEG + sweepDeg);
}

/**
 * Helper for the 3-column row below the gauge: clamps the consumed/target
 * ratio to [0, 1] (used both for the SVG arc and the percentage display).
 */
export function gaugeProgress(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(1, consumed / target));
}
