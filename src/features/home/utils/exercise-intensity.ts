/**
 * exercise-intensity — single source of truth for the exercise tier system.
 *
 * Replaces the legacy `isTrainingDay` boolean + `Math.max(200, mins * 5)`
 * heuristic with three explicit tiers chosen by the user via the
 * `<ExerciseLogSheet>` (Sprint J).
 *
 * Bidirectional conversion:
 *   - `intensityToCalories(i)` — returns the kcal contribution of the tier.
 *   - `caloriesToIsTrainingDay(i)` — true when intensity > 'none' (legacy adapter).
 *
 * Putting the constants here (instead of in a component) keeps them
 * importable from tests, future settings panels, and any background sync logic.
 */

export type ExerciseIntensity = 'none' | 'moderate' | 'medium' | 'intense';

/**
 * kcal added to the daily budget for each tier.
 * Numbers chosen by owner spec — represent realistic ranges:
 *   moderate ≈ 30 min light activity (walking, yoga)
 *   medium   ≈ 30-45 min moderate cardio / strength
 *   intense  ≈ 60+ min high-intensity training
 */
export const INTENSITY_KCAL: Readonly<Record<ExerciseIntensity, number>> = {
  none: 0,
  moderate: 150,
  medium: 300,
  intense: 500,
};

/** Ordered tiers (excludes 'none') for picker UIs. */
export const INTENSITY_TIERS: ReadonlyArray<Exclude<ExerciseIntensity, 'none'>> = [
  'moderate',
  'medium',
  'intense',
];

/** Returns the kcal contribution of the tier. */
export function intensityToCalories(intensity: ExerciseIntensity): number {
  return INTENSITY_KCAL[intensity];
}

/** Legacy adapter — `isTrainingDay = true` whenever any tier is selected. */
export function intensityToIsTrainingDay(intensity: ExerciseIntensity): boolean {
  return intensity !== 'none';
}

/** Legacy adapter — when toggling boolean training-day, default to 'medium'. */
export function isTrainingDayToIntensity(isTrainingDay: boolean): ExerciseIntensity {
  return isTrainingDay ? 'medium' : 'none';
}
