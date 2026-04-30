/**
 * Onboarding state shapes — single source of truth for the redesigned flow.
 *
 * The flow captures the data needed to derive a `UserProfile` and
 * `DailyTargets` (see `derive/derive-targets.ts`). Step IDs are stable
 * strings so they can be persisted in localStorage and rehydrated.
 */

import type { ActivityLevel, Goal, Sex } from '../../food/utils/nutrition';

/** Persisted draft schema version. Bump only on breaking shape changes. */
export const ONBOARDING_DRAFT_VERSION = 1;
export type OnboardingDraftVersion = typeof ONBOARDING_DRAFT_VERSION;

/** Ordered step IDs (welcome → done). Order is enforced by `STEP_ORDER`. */
export type StepId =
  | 'welcome'
  | 'goal'
  | 'identity'
  | 'body'
  | 'activity'
  | 'training'
  | 'plan'
  | 'diet'
  | 'done';

export const STEP_ORDER: readonly StepId[] = [
  'welcome',
  'goal',
  'identity',
  'body',
  'activity',
  'training',
  'plan',
  'diet',
  'done',
] as const;

/** Number of "question" steps shown in the progress bar (welcome excluded). */
export const PROGRESS_TOTAL = STEP_ORDER.length - 1; // 8

/**
 * The mutable input the user is filling. Empty-string sentinels (`''`) and
 * `null` numbers represent "not yet answered" — validators check for these.
 */
export interface OnboardingDraft {
  goal: Goal | '';
  name: string;
  sex: Sex | '';
  weight: number | null;
  height: number | null;
  age: number | null;
  activity: ActivityLevel | '';
  trains: boolean;
  restrictions: string[];
}

export const INITIAL_DRAFT: OnboardingDraft = {
  goal: '',
  name: '',
  // Default to 'male' so SegmentedTabs always has a valid selection and
  // the identity step never blocks the CTA solely due to an unset sex.
  // Users who identify as female simply tap the segment to change it.
  sex: 'male',
  weight: null,
  height: null,
  age: null,
  activity: '',
  trains: false,
  restrictions: [],
};

export interface OnboardingState {
  stepId: StepId;
  draft: OnboardingDraft;
  /** True once the user has interacted with any field — gates the persist write. */
  dirty: boolean;
  /** Schema version stored alongside the draft for migration safety. */
  version: OnboardingDraftVersion;
}

export const INITIAL_STATE: OnboardingState = {
  stepId: 'welcome',
  draft: INITIAL_DRAFT,
  dirty: false,
  version: ONBOARDING_DRAFT_VERSION,
};

/** Discriminated action union for the reducer. */
export type OnboardingAction =
  | {
      type: 'SET_FIELD';
      field: keyof OnboardingDraft;
      value: OnboardingDraft[keyof OnboardingDraft];
    }
  | { type: 'TOGGLE_RESTRICTION'; id: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GOTO'; stepId: StepId }
  | { type: 'HYDRATE'; state: OnboardingState }
  | { type: 'RESET' };

/**
 * Typed helper to build SET_FIELD actions with field/value coupled at the
 * call site. Prefer this over constructing actions inline.
 */
export function setField<K extends keyof OnboardingDraft>(
  field: K,
  value: OnboardingDraft[K],
): OnboardingAction {
  return { type: 'SET_FIELD', field, value };
}

/** Persisted shape — subset of OnboardingState (no `dirty`). */
export interface PersistedDraft {
  stepId: StepId;
  draft: OnboardingDraft;
  version: OnboardingDraftVersion;
}
