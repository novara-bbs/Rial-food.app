/**
 * activity-calories — Sprint K-fix5 [1.5.209].
 *
 * Pure functions to compute kcal burned from steps and exercise, parametrised
 * by user profile (weight + sex). Replaces the flat constants in
 * `movement-calories.ts` and `exercise-intensity.ts`.
 *
 * **Steps formula** (Tudor-Locke & Bassett 2004, Compendium ACSM):
 *   - Walking ≈ 3 MET, cadence ≈ 100 steps/min.
 *   - kcal/step = (3.0 × weight × 1/60) / 100 = 0.0005 × weight.
 *   - Sex factor: female 0.95 (≈5% less than male of same weight, reflecting
 *     lower lean mass; matches Mifflin-St Jeor's BMR offset direction).
 *
 *   `kcal_steps = steps × 0.0005 × weight(kg) × sexFactor`
 *
 * **Exercise formula** (Compendium of Physical Activities, Ainsworth et al. 2011):
 *   - Light  (`moderate`): 3 MET — brisk walk, yoga, light calisthenics.
 *   - Medium (`medium`)  : 6 MET — easy run, cycling, moderate strength.
 *   - Heavy  (`intense`) : 9 MET — HIIT, hard run, heavy strength.
 *
 *   `kcal_exercise = MET × weight(kg) × (minutes/60) × sexFactor`
 *
 * Defaults: 70 kg + sex='male' (mirrors `calculateBMR` defaults).
 *
 * Height is NOT included: longer stride compensates with fewer steps for the
 * same distance, so the effect cancels out in step-count-based formulas.
 */
import type { Sex } from '@/types/user';

export const KCAL_PER_STEP_PER_KG = 0.0005;
export const FEMALE_SEX_FACTOR = 0.95;
export const DEFAULT_WEIGHT_KG = 70;

export const INTENSITY_METS = {
  moderate: 3.0,
  medium: 6.0,
  intense: 9.0,
} as const;

export type SupportedIntensity = keyof typeof INTENSITY_METS;

export interface ActivityProfile {
  weight?: number; // kg
  sex?: Sex;       // 'male' | 'female'
}

/** 1.0 for male/unknown, 0.95 for female (≈5% lower kcal expenditure for same weight). */
export function sexFactor(sex?: Sex): number {
  return sex === 'female' ? FEMALE_SEX_FACTOR : 1.0;
}

/** kcal burned from steps. Clamped at 0 for negative input. */
export function kcalFromSteps(steps: number, profile: ActivityProfile): number {
  const weight = profile.weight ?? DEFAULT_WEIGHT_KG;
  const factor = sexFactor(profile.sex);
  const safeSteps = Math.max(0, Number.isFinite(steps) ? steps : 0);
  return Math.round(safeSteps * KCAL_PER_STEP_PER_KG * weight * factor);
}

/** kcal burned from exercise of given intensity + duration. Clamped at 0 for negative input. */
export function kcalFromExercise(
  intensity: SupportedIntensity,
  minutes: number,
  profile: ActivityProfile,
): number {
  const weight = profile.weight ?? DEFAULT_WEIGHT_KG;
  const factor = sexFactor(profile.sex);
  const met = INTENSITY_METS[intensity];
  const safeMins = Math.max(0, Number.isFinite(minutes) ? minutes : 0);
  return Math.round(met * weight * (safeMins / 60) * factor);
}

/** kcal/step for the given profile — useful for info-popover display. */
export function kcalPerStep(profile: ActivityProfile): number {
  const weight = profile.weight ?? DEFAULT_WEIGHT_KG;
  const factor = sexFactor(profile.sex);
  return KCAL_PER_STEP_PER_KG * weight * factor;
}
