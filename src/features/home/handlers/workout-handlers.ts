/**
 * Workout handlers — Sprint K-fix7 [1.5.211].
 *
 * Append/edit/delete primitives for the daily `workoutLog: WorkoutLogEntry[]`.
 * Mirrors the factory pattern of `meal-handlers.ts` so AppStateContext stays
 * consistent (each feature module owns its handler factory; AppStateContext
 * is the wiring layer only).
 *
 * Why store kcal on the entry instead of recomputing? See `WorkoutLogEntry`
 * docstring — historical correctness when weight/sex change.
 */
import type { WorkoutLogEntry } from '../types/workout-log';
import type { ExerciseIntensity } from '../utils/exercise-intensity';
import {
  kcalFromExercise,
  type ActivityProfile,
} from '../utils/activity-calories';

type Setter<T> = (fn: T | ((prev: T) => T)) => void;

interface WorkoutHandlerDeps {
  setWorkoutLog: Setter<WorkoutLogEntry[]>;
}

/** Format `Date` → "HH:MM" 24h. Mirrors how DailyLogEntry stores `time`. */
function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Create the "log a new workout" handler. Computes kcal at log time using the
 * provided profile and freezes it on the entry.
 *
 * Caller passes the user's current profile snapshot. The handler is otherwise
 * pure — no toast, no navigation, the card decides UX feedback.
 */
export function createHandleLogWorkout({ setWorkoutLog }: WorkoutHandlerDeps) {
  return function handleLogWorkout(
    intensity: Exclude<ExerciseIntensity, 'none'>,
    minutes: number,
    profile: ActivityProfile,
  ): WorkoutLogEntry {
    const safeMinutes = Math.max(1, Math.round(minutes));
    const kcal = kcalFromExercise(intensity, safeMinutes, profile);
    const entry: WorkoutLogEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      time: formatTime(new Date()),
      intensity,
      minutes: safeMinutes,
      kcal,
    };
    setWorkoutLog((prev) => [...prev, entry]);
    return entry;
  };
}

/**
 * Create the "edit existing workout" handler. Replaces by id; recomputes kcal
 * from the new (intensity, minutes, profile). Keeps `time` and `id` stable.
 */
export function createHandleEditWorkout({ setWorkoutLog }: WorkoutHandlerDeps) {
  return function handleEditWorkout(
    id: number,
    intensity: Exclude<ExerciseIntensity, 'none'>,
    minutes: number,
    profile: ActivityProfile,
  ): void {
    const safeMinutes = Math.max(1, Math.round(minutes));
    const kcal = kcalFromExercise(intensity, safeMinutes, profile);
    setWorkoutLog((prev) =>
      prev.map((w) => (w.id === id ? { ...w, intensity, minutes: safeMinutes, kcal } : w)),
    );
  };
}

/** Create the "delete workout" handler. Removes by id. */
export function createHandleDeleteWorkout({ setWorkoutLog }: WorkoutHandlerDeps) {
  return function handleDeleteWorkout(id: number): void {
    setWorkoutLog((prev) => prev.filter((w) => w.id !== id));
  };
}
