/**
 * WorkoutLogEntry — Sprint K-fix7 [1.5.211].
 *
 * A single logged workout (intentional exercise session) for the daily
 * activity diary. Mirrors the shape of `DailyLogEntry` (food log) so the
 * `TodaysWorkouts` component can use the same row pattern as `TodaysMeals`.
 *
 *   ┌──────────────────────────────────────┐
 *   │  WORKOUT REGISTRADO HOY              │
 *   │  Cardio · 18:30 · 45 min · 295 kcal  │
 *   └──────────────────────────────────────┘
 *
 * The shape is intentionally pure data (no methods, no derived fields).
 * Kcal is **stored** (not derived at render time) so that historical entries
 * remain correct even if the user later changes their weight or sex.
 */
import type { ExerciseIntensity } from '../utils/exercise-intensity';

/**
 * Persisted shape of a single logged workout. Intensity is non-`none` because
 * "none" is not a workout — it's the absence of one. The handler factory
 * never accepts `'none'` as a log entry.
 */
export interface WorkoutLogEntry {
  /** Unique id (Date.now() + small randomness, same pattern as DailyLogEntry). */
  id: number;
  /** "HH:MM" 24h string (e.g. "18:30"). Stored pre-formatted to match DailyLogEntry. */
  time: string;
  /** Tier picked by the user. Maps to a MET value in INTENSITY_METS. */
  intensity: Exclude<ExerciseIntensity, 'none'>;
  /** Duration in minutes. */
  minutes: number;
  /**
   * Stored kcal at log time. Computed via `kcalFromExercise(intensity,
   * minutes, profile)` at the moment of logging — frozen so later weight
   * changes don't retroactively alter the day's history.
   */
  kcal: number;
}
