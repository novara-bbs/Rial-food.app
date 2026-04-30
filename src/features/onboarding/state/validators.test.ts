import { describe, it, expect } from 'vitest';
import {
  validateStep,
  isDraftComplete,
  WEIGHT_MIN,
  WEIGHT_MAX,
  HEIGHT_MIN,
  HEIGHT_MAX,
  AGE_MIN,
  AGE_MAX,
  NAME_MAX,
} from './validators';
import { INITIAL_DRAFT, type OnboardingDraft } from './types';

const VALID_DRAFT: OnboardingDraft = {
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

describe('validateStep — non-blocking steps', () => {
  it.each(['welcome', 'plan', 'diet', 'done'] as const)(
    '%s is always ok',
    stepId => {
      expect(validateStep(stepId, INITIAL_DRAFT).ok).toBe(true);
      expect(validateStep(stepId, VALID_DRAFT).ok).toBe(true);
    },
  );
});

describe('validateStep — goal', () => {
  it('fails when goal is empty', () => {
    const result = validateStep('goal', INITIAL_DRAFT);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({ goal: 'goalRequired' });
  });

  it('passes when goal is set', () => {
    expect(validateStep('goal', VALID_DRAFT).ok).toBe(true);
  });
});

describe('validateStep — identity', () => {
  it('passes with empty name + sex set (name optional)', () => {
    expect(
      validateStep('identity', { ...VALID_DRAFT, name: '' }).ok,
    ).toBe(true);
  });

  // sex always has a default ('male') — no 'sexRequired' validator.
  it('passes with any truthy sex value', () => {
    expect(validateStep('identity', { ...VALID_DRAFT, sex: 'female' }).ok).toBe(true);
    expect(validateStep('identity', { ...VALID_DRAFT, sex: 'male' }).ok).toBe(true);
  });

  it('fails when name longer than NAME_MAX', () => {
    const longName = 'a'.repeat(NAME_MAX + 1);
    const result = validateStep('identity', { ...VALID_DRAFT, name: longName });
    expect(result.ok).toBe(false);
    expect(result.errors.name).toBe('nameTooLong');
  });

  it('reports name error when name too long', () => {
    const result = validateStep('identity', {
      ...VALID_DRAFT,
      name: 'x'.repeat(NAME_MAX + 5),
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({ name: 'nameTooLong' });
  });
});

describe('validateStep — body', () => {
  it('fails when weight out of range (low)', () => {
    const result = validateStep('body', {
      ...VALID_DRAFT,
      weight: WEIGHT_MIN - 1,
    });
    expect(result.errors.weight).toBe('weightOutOfRange');
  });

  it('fails when weight out of range (high)', () => {
    const result = validateStep('body', {
      ...VALID_DRAFT,
      weight: WEIGHT_MAX + 1,
    });
    expect(result.errors.weight).toBe('weightOutOfRange');
  });

  it('fails when height out of range', () => {
    expect(
      validateStep('body', { ...VALID_DRAFT, height: HEIGHT_MIN - 1 }).errors
        .height,
    ).toBe('heightOutOfRange');
    expect(
      validateStep('body', { ...VALID_DRAFT, height: HEIGHT_MAX + 1 }).errors
        .height,
    ).toBe('heightOutOfRange');
  });

  it('fails when age out of range', () => {
    expect(
      validateStep('body', { ...VALID_DRAFT, age: AGE_MIN - 1 }).errors.age,
    ).toBe('ageOutOfRange');
    expect(
      validateStep('body', { ...VALID_DRAFT, age: AGE_MAX + 1 }).errors.age,
    ).toBe('ageOutOfRange');
  });

  it('fails when numeric fields are null (initial)', () => {
    const result = validateStep('body', INITIAL_DRAFT);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({
      weight: 'weightOutOfRange',
      height: 'heightOutOfRange',
      age: 'ageOutOfRange',
    });
  });

  it('passes with valid body metrics', () => {
    expect(validateStep('body', VALID_DRAFT).ok).toBe(true);
  });
});

describe('validateStep — activity', () => {
  it('fails when activity empty', () => {
    const result = validateStep('activity', { ...VALID_DRAFT, activity: '' });
    expect(result.ok).toBe(false);
    expect(result.errors.activity).toBe('activityRequired');
  });

  it('passes when activity set', () => {
    expect(validateStep('activity', VALID_DRAFT).ok).toBe(true);
  });
});

describe('isDraftComplete', () => {
  it('true for fully populated draft', () => {
    expect(isDraftComplete(VALID_DRAFT)).toBe(true);
  });

  it('false for INITIAL_DRAFT', () => {
    expect(isDraftComplete(INITIAL_DRAFT)).toBe(false);
  });

  it('false when goal missing', () => {
    expect(isDraftComplete({ ...VALID_DRAFT, goal: '' })).toBe(false);
  });

  it('false when activity missing', () => {
    expect(isDraftComplete({ ...VALID_DRAFT, activity: '' })).toBe(false);
  });
});
