/**
 * Onboarding reducer — pure state machine for the redesigned flow.
 *
 * The reducer is intentionally framework-agnostic: it owns step navigation,
 * draft mutation, and rehydration semantics. Side-effects (persistence,
 * i18n, derivation) live outside.
 *
 * Step transitions:
 *  - `NEXT` only advances when `validateStep(current, draft).ok` — so a
 *    component can dispatch `NEXT` blindly and trust the gate.
 *  - `BACK` clamps at `welcome` (no underflow).
 *  - `GOTO` jumps unconditionally — used by `HYDRATE` to land on a saved step.
 */

import {
  FIELD_TO_STEP,
  INITIAL_DRAFT,
  INITIAL_STATE,
  STEP_INDEX_MAP,
  STEP_ORDER,
  type OnboardingAction,
  type OnboardingDraft,
  type OnboardingState,
  type StepId,
  type SubmitAttemptedMap,
} from './types';
import { validateStep } from './validators';

function indexOf(stepId: StepId): number {
  const i = STEP_INDEX_MAP[stepId];
  // Guard against a corrupted draft: fall back to welcome.
  return typeof i === 'number' ? i : 0;
}

/** Returns a new map with `step` removed (immutable clear). */
function clearAttempt(
  map: SubmitAttemptedMap,
  step: StepId,
): SubmitAttemptedMap {
  if (!map[step]) return map;
  const next = { ...map };
  delete next[step];
  return next;
}

function applyField(
  draft: OnboardingDraft,
  field: keyof OnboardingDraft,
  value: OnboardingDraft[keyof OnboardingDraft],
): OnboardingDraft {
  // Each field gets a typed assignment to keep the union narrowed.
  switch (field) {
    case 'goal':
      return { ...draft, goal: value as OnboardingDraft['goal'] };
    case 'name':
      return { ...draft, name: value as OnboardingDraft['name'] };
    case 'sex':
      return { ...draft, sex: value as OnboardingDraft['sex'] };
    case 'weight':
      return { ...draft, weight: value as OnboardingDraft['weight'] };
    case 'height':
      return { ...draft, height: value as OnboardingDraft['height'] };
    case 'age':
      return { ...draft, age: value as OnboardingDraft['age'] };
    case 'activity':
      return { ...draft, activity: value as OnboardingDraft['activity'] };
    case 'trains':
      return { ...draft, trains: value as OnboardingDraft['trains'] };
    case 'restrictions':
      return {
        ...draft,
        restrictions: value as OnboardingDraft['restrictions'],
      };
  }
}

function toggleRestriction(
  restrictions: readonly string[],
  id: string,
): string[] {
  return restrictions.includes(id)
    ? restrictions.filter(r => r !== id)
    : [...restrictions, id];
}

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'SET_FIELD': {
      // Editing a field of a step auto-clears its "submit attempted" flag —
      // the rojo signal disappears as soon as the user acts on it.
      const ownerStep = FIELD_TO_STEP[action.field];
      return {
        ...state,
        draft: applyField(state.draft, action.field, action.value),
        dirty: true,
        submitAttemptedFor: clearAttempt(state.submitAttemptedFor, ownerStep),
      };
    }

    case 'TOGGLE_RESTRICTION':
      return {
        ...state,
        draft: {
          ...state.draft,
          restrictions: toggleRestriction(state.draft.restrictions, action.id),
        },
        dirty: true,
        submitAttemptedFor: clearAttempt(state.submitAttemptedFor, 'diet'),
      };

    case 'NEXT': {
      if (!validateStep(state.stepId, state.draft).ok) {
        // Failed gate → mark this step as "user attempted, please show errors".
        return {
          ...state,
          submitAttemptedFor: {
            ...state.submitAttemptedFor,
            [state.stepId]: true,
          },
        };
      }
      const idx = indexOf(state.stepId);
      const nextIdx = Math.min(idx + 1, STEP_ORDER.length - 1);
      if (nextIdx === idx) return state;
      return { ...state, stepId: STEP_ORDER[nextIdx], dirty: true };
    }

    case 'BACK': {
      const idx = indexOf(state.stepId);
      if (idx === 0) return state;
      const prevStep = STEP_ORDER[idx - 1];
      // Leaving a step also clears its own "attempted" flag — coming back to
      // it should feel like a fresh visit, not a punished one.
      return {
        ...state,
        stepId: prevStep,
        submitAttemptedFor: clearAttempt(state.submitAttemptedFor, state.stepId),
      };
    }

    case 'GOTO':
      if (action.stepId === state.stepId) return state;
      return { ...state, stepId: action.stepId };

    case 'HYDRATE':
      return action.state;

    case 'RESET':
      return { ...INITIAL_STATE, draft: { ...INITIAL_DRAFT } };
  }
}

export { INITIAL_STATE } from './types';
