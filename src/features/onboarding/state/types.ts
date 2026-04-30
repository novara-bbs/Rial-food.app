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

/**
 * Precomputed `stepId → index` map. Lookup beats `STEP_ORDER.indexOf` on every
 * render of the shell (which reads the index for the progress bar + a11y).
 */
export const STEP_INDEX_MAP: Readonly<Record<StepId, number>> =
  STEP_ORDER.reduce<Record<StepId, number>>((acc, id, idx) => {
    acc[id] = idx;
    return acc;
  }, {} as Record<StepId, number>);

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

/**
 * Per-step "submit attempted" flags. Set when the user taps the disabled
 * primary CTA on a step that fails validation; cleared when they edit any
 * field of that step (auto-rehabilitation) or navigate back to it.
 *
 * The shell reads `submitAttemptedFor[stepId]` to decide whether to show
 * red invalid borders + the inline error hint. Errors stay silent until
 * the user actively asks for the gate to open.
 */
export type SubmitAttemptedMap = Partial<Record<StepId, boolean>>;

export interface OnboardingState {
  stepId: StepId;
  draft: OnboardingDraft;
  /** True once the user has interacted with any field — gates the persist write. */
  dirty: boolean;
  /** Per-step "user tapped CTA on invalid step" flags. */
  submitAttemptedFor: SubmitAttemptedMap;
  /** Schema version stored alongside the draft for migration safety. */
  version: OnboardingDraftVersion;
}

export const INITIAL_STATE: OnboardingState = {
  stepId: 'welcome',
  draft: INITIAL_DRAFT,
  dirty: false,
  submitAttemptedFor: {},
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

/**
 * Maps each draft field to the step that captures it. Used by the reducer to
 * clear `submitAttemptedFor[step]` when the user starts editing a field of
 * that step — keeps the rojo signal honest (it goes away as soon as the user
 * acts on the feedback).
 */
export const FIELD_TO_STEP: Readonly<Record<keyof OnboardingDraft, StepId>> = {
  goal: 'goal',
  name: 'identity',
  sex: 'identity',
  weight: 'body',
  height: 'body',
  age: 'body',
  activity: 'activity',
  trains: 'training',
  restrictions: 'diet',
};
