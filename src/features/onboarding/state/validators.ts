/**
 * Pure per-step validators.
 *
 * Validators return error keys (i18n key paths under `t.onboarding.errors.*`)
 * rather than localized strings. The shell resolves them at render time so
 * validation logic stays unit-testable without an i18n harness.
 */

import type { OnboardingDraft, StepId } from './types';

export const WEIGHT_MIN = 30;
export const WEIGHT_MAX = 300;
export const HEIGHT_MIN = 100;
export const HEIGHT_MAX = 230;
export const AGE_MIN = 13;
export const AGE_MAX = 100;
export const NAME_MAX = 40;

export interface ValidationResult {
  ok: boolean;
  /**
   * Map of `field → error key` (e.g. `weight: 'weightOutOfRange'`).
   * Empty when `ok === true`.
   */
  errors: Record<string, string>;
}

const OK: ValidationResult = { ok: true, errors: {} };

function fail(errors: Record<string, string>): ValidationResult {
  return { ok: false, errors };
}

export function validateStep(
  stepId: StepId,
  draft: OnboardingDraft,
): ValidationResult {
  switch (stepId) {
    case 'welcome':
    case 'plan':
    case 'diet':
    case 'done':
      return OK;

    case 'goal':
      return draft.goal === '' ? fail({ goal: 'goalRequired' }) : OK;

    case 'identity': {
      const errors: Record<string, string> = {};
      if (draft.name.length > NAME_MAX) errors.name = 'nameTooLong';
      // sex always has a default ('male') — no required check needed.
      return Object.keys(errors).length > 0 ? fail(errors) : OK;
    }

    case 'body': {
      const errors: Record<string, string> = {};
      if (
        draft.weight === null ||
        draft.weight < WEIGHT_MIN ||
        draft.weight > WEIGHT_MAX
      ) {
        errors.weight = 'weightOutOfRange';
      }
      if (
        draft.height === null ||
        draft.height < HEIGHT_MIN ||
        draft.height > HEIGHT_MAX
      ) {
        errors.height = 'heightOutOfRange';
      }
      if (draft.age === null || draft.age < AGE_MIN || draft.age > AGE_MAX) {
        errors.age = 'ageOutOfRange';
      }
      return Object.keys(errors).length > 0 ? fail(errors) : OK;
    }

    case 'activity':
      return draft.activity === ''
        ? fail({ activity: 'activityRequired' })
        : OK;
  }
}

/** True when the entire draft passes every step's validator. */
export function isDraftComplete(draft: OnboardingDraft): boolean {
  return (
    validateStep('goal', draft).ok &&
    validateStep('identity', draft).ok &&
    validateStep('body', draft).ok &&
    validateStep('activity', draft).ok
  );
}
