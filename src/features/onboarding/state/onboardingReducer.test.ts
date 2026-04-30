import { describe, it, expect } from 'vitest';
import { onboardingReducer } from './onboardingReducer';
import {
  INITIAL_DRAFT,
  INITIAL_STATE,
  ONBOARDING_DRAFT_VERSION,
  STEP_ORDER,
  setField,
  type OnboardingDraft,
  type OnboardingState,
} from './types';

const FILLED_DRAFT: OnboardingDraft = {
  goal: 'maintain',
  name: 'Vicente',
  sex: 'male',
  weight: 75,
  height: 180,
  age: 30,
  activity: 'active',
  trains: false,
  restrictions: [],
};

function stateAt(stepId: OnboardingState['stepId'], draft = FILLED_DRAFT): OnboardingState {
  return {
    stepId,
    draft,
    dirty: false,
    version: ONBOARDING_DRAFT_VERSION,
  };
}

describe('onboardingReducer — SET_FIELD', () => {
  it('updates only the targeted field', () => {
    const next = onboardingReducer(INITIAL_STATE, setField('name', 'Ana'));
    expect(next.draft.name).toBe('Ana');
    // All other fields untouched
    expect(next.draft).toEqual({ ...INITIAL_DRAFT, name: 'Ana' });
  });

  it('marks state dirty', () => {
    const next = onboardingReducer(INITIAL_STATE, setField('goal', 'cut'));
    expect(next.dirty).toBe(true);
  });

  it('handles numeric fields without coercion', () => {
    const next = onboardingReducer(INITIAL_STATE, setField('weight', 72.5));
    expect(next.draft.weight).toBe(72.5);
  });

  it('handles array fields', () => {
    const next = onboardingReducer(
      INITIAL_STATE,
      setField('restrictions', ['vegan', 'glutenFree']),
    );
    expect(next.draft.restrictions).toEqual(['vegan', 'glutenFree']);
  });
});

describe('onboardingReducer — TOGGLE_RESTRICTION', () => {
  it('adds restriction when missing', () => {
    const next = onboardingReducer(INITIAL_STATE, {
      type: 'TOGGLE_RESTRICTION',
      id: 'vegan',
    });
    expect(next.draft.restrictions).toEqual(['vegan']);
    expect(next.dirty).toBe(true);
  });

  it('removes restriction when present', () => {
    const seeded: OnboardingState = {
      ...INITIAL_STATE,
      draft: { ...INITIAL_DRAFT, restrictions: ['vegan', 'keto'] },
    };
    const next = onboardingReducer(seeded, {
      type: 'TOGGLE_RESTRICTION',
      id: 'vegan',
    });
    expect(next.draft.restrictions).toEqual(['keto']);
  });
});

describe('onboardingReducer — NEXT', () => {
  it('advances welcome → goal unconditionally (welcome always ok)', () => {
    const next = onboardingReducer(INITIAL_STATE, { type: 'NEXT' });
    expect(next.stepId).toBe('goal');
  });

  it('blocks NEXT from goal when goal is empty', () => {
    const blocked = onboardingReducer(stateAt('goal', INITIAL_DRAFT), {
      type: 'NEXT',
    });
    expect(blocked.stepId).toBe('goal');
  });

  it('advances goal → identity when goal set', () => {
    const next = onboardingReducer(stateAt('goal'), { type: 'NEXT' });
    expect(next.stepId).toBe('identity');
  });

  it('does not advance past done (last step)', () => {
    const last = onboardingReducer(stateAt('done'), { type: 'NEXT' });
    expect(last.stepId).toBe('done');
  });

  it('blocks body NEXT when metrics missing', () => {
    const blocked = onboardingReducer(stateAt('body', INITIAL_DRAFT), {
      type: 'NEXT',
    });
    expect(blocked.stepId).toBe('body');
  });
});

describe('onboardingReducer — BACK', () => {
  it('is no-op on welcome', () => {
    const next = onboardingReducer(INITIAL_STATE, { type: 'BACK' });
    expect(next).toBe(INITIAL_STATE);
  });

  it('returns to previous step', () => {
    const next = onboardingReducer(stateAt('body'), { type: 'BACK' });
    expect(next.stepId).toBe('identity');
  });

  it('preserves draft on BACK', () => {
    const next = onboardingReducer(stateAt('body'), { type: 'BACK' });
    expect(next.draft).toBe(FILLED_DRAFT);
  });
});

describe('onboardingReducer — GOTO', () => {
  it('jumps to arbitrary step', () => {
    const next = onboardingReducer(INITIAL_STATE, {
      type: 'GOTO',
      stepId: 'plan',
    });
    expect(next.stepId).toBe('plan');
  });

  it('is no-op when target equals current', () => {
    const next = onboardingReducer(stateAt('plan'), {
      type: 'GOTO',
      stepId: 'plan',
    });
    expect(next.stepId).toBe('plan');
  });
});

describe('onboardingReducer — HYDRATE', () => {
  it('replaces state entirely', () => {
    const hydrated: OnboardingState = stateAt('activity', FILLED_DRAFT);
    const next = onboardingReducer(INITIAL_STATE, {
      type: 'HYDRATE',
      state: hydrated,
    });
    expect(next).toBe(hydrated);
  });
});

describe('onboardingReducer — RESET', () => {
  it('returns a fresh INITIAL_STATE', () => {
    const dirty: OnboardingState = {
      ...stateAt('plan'),
      dirty: true,
    };
    const next = onboardingReducer(dirty, { type: 'RESET' });
    expect(next.stepId).toBe('welcome');
    expect(next.draft).toEqual(INITIAL_DRAFT);
    expect(next.dirty).toBe(false);
  });
});

describe('STEP_ORDER invariants', () => {
  it('starts at welcome and ends at done', () => {
    expect(STEP_ORDER[0]).toBe('welcome');
    expect(STEP_ORDER[STEP_ORDER.length - 1]).toBe('done');
  });

  it('contains 9 unique steps', () => {
    expect(STEP_ORDER.length).toBe(9);
    expect(new Set(STEP_ORDER).size).toBe(9);
  });
});
