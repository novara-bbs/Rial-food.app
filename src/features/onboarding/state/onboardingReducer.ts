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
  INITIAL_DRAFT,
  INITIAL_STATE,
  STEP_ORDER,
  type OnboardingAction,
  type OnboardingDraft,
  type OnboardingState,
  type StepId,
} from './types';
import { validateStep } from './validators';

function indexOf(stepId: StepId): number {
  const i = STEP_ORDER.indexOf(stepId);
  // Guard against a corrupted draft: fall back to welcome.
  return i < 0 ? 0 : i;
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
    case 'SET_FIELD':
      return {
        ...state,
        draft: applyField(state.draft, action.field, action.value),
        dirty: true,
      };

    case 'TOGGLE_RESTRICTION':
      return {
        ...state,
        draft: {
          ...state.draft,
          restrictions: toggleRestriction(state.draft.restrictions, action.id),
        },
        dirty: true,
      };

    case 'NEXT': {
      if (!validateStep(state.stepId, state.draft).ok) return state;
      const idx = indexOf(state.stepId);
      const nextIdx = Math.min(idx + 1, STEP_ORDER.length - 1);
      if (nextIdx === idx) return state;
      return { ...state, stepId: STEP_ORDER[nextIdx], dirty: true };
    }

    case 'BACK': {
      const idx = indexOf(state.stepId);
      if (idx === 0) return state;
      return { ...state, stepId: STEP_ORDER[idx - 1] };
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
