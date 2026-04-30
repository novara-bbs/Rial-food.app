/**
 * Servings stepper math.
 *
 * Recipe servings step in half increments (1, 1.5, 2, 2.5, …) to match
 * household-scale cooking. The minimum is 1 (you can't cook half a portion
 * of a 1-serving recipe meaningfully) and the maximum guard is 99 to keep
 * UI widths predictable.
 *
 * Pure helpers — no React, no I/O — so they're trivial to unit-test and
 * reuse from CookMode, AddMeal, or any future surface that needs a
 * servings stepper.
 */

export const SERVINGS_STEP = 0.5;
export const SERVINGS_MIN = 1;
export const SERVINGS_MAX = 99;

/** Snap any number into the valid servings domain (multiple of 0.5, within bounds). */
export function clampServings(value: number): number {
  if (Number.isNaN(value)) return SERVINGS_MIN;
  const snapped = Math.round(value * 2) / 2;
  return Math.min(SERVINGS_MAX, Math.max(SERVINGS_MIN, snapped));
}

/** Next valid step up from the current servings count. */
export function incrementServings(value: number): number {
  return clampServings(value + SERVINGS_STEP);
}

/** Next valid step down from the current servings count, never below SERVINGS_MIN. */
export function decrementServings(value: number): number {
  return clampServings(value - SERVINGS_STEP);
}

/** "1" / "1.5" / "2" — integers stay integers, halves render with one decimal. */
export function formatServings(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
