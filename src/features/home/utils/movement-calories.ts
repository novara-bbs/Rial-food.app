/**
 * movement-calories — kcal contribution from passive movement (steps + active
 * minutes), kept separate from the explicit `ExerciseIntensity` tier picker.
 *
 * Why a dedicated module? The kcal formula was previously inlined in
 * `Home.tsx` (Sprint J: `Math.round(mins * 3)` when intensity = 'none').
 * Sprint K extracts it so:
 *   - `<HealthAndExerciseCard>` can show movement-derived kcal in its header
 *     without re-deriving the constant.
 *   - Tests can lock the formula with explicit cases.
 *   - Future tweaks (e.g. weighting steps separately) live in one place.
 *
 * Contract:
 *   - Active-minute kcal = `Math.round(activeMinutes × KCAL_PER_ACTIVE_MIN)`.
 *   - Steps are NOT counted today (the daily wearable bridge already double-
 *     counts steps inside the `activeMinutes` field on most platforms). The
 *     parameter is accepted for API future-proofing — currently ignored.
 *   - Passive contribution applies ONLY when `intensity === 'none'`. Once the
 *     user picks a workout tier, the explicit kcal supersede the passive
 *     estimate (otherwise we'd double-count light walking inside a workout).
 *
 * Pure: no React, no i18n.
 */

import {
  type ExerciseIntensity,
  intensityToCalories,
} from './exercise-intensity';

/**
 * kcal per active minute of NEAT-style movement (walking, light errands).
 * Owner spec — represents ~3 kcal/min for a 70 kg adult on light activity.
 */
export const KCAL_PER_ACTIVE_MIN = 3;

export interface MovementSnapshot {
  steps: number;
  /** Minutes of moderate-or-higher activity reported by the wearable / manual entry. */
  activeMinutes: number;
}

/**
 * kcal contributed by passive movement alone (no explicit workout tier).
 * Clamps negative inputs to 0 — defensive against malformed wearable data.
 */
export function passiveMovementKcal(activeMinutes: number): number {
  const safeMins = Math.max(0, activeMinutes || 0);
  return Math.round(safeMins * KCAL_PER_ACTIVE_MIN);
}

export interface ExerciseKcalBreakdown {
  /** Movement-only contribution (0 when an intensity tier is selected). */
  passive: number;
  /** Explicit-tier contribution. */
  tier: number;
  /** Sum of both — what you add to the daily target. */
  total: number;
}

/**
 * Combined daily exercise kcal — passive movement (when no tier) + tier kcal.
 * Used by `<HealthAndExerciseCard>` for its header summary AND by `Home.tsx`
 * for the `exerciseCalories` value piped into `<NutritionHero>`.
 */
export function totalExerciseKcal({
  intensity,
  activeMinutes,
}: {
  intensity: ExerciseIntensity;
  activeMinutes: number;
}): ExerciseKcalBreakdown {
  const tier = intensityToCalories(intensity);
  const passive = intensity === 'none' ? passiveMovementKcal(activeMinutes) : 0;
  return { passive, tier, total: passive + tier };
}
