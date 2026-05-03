import { describe, it, expect } from 'vitest';
import { deriveOutput, previewBreakdown } from './derive-targets';
import { calculateDailyTargets } from '../../food/utils/nutrition';
import { INITIAL_DRAFT, type OnboardingDraft } from '../state/types';

const MUSCLE_MALE: OnboardingDraft = {
  goal: 'muscle',
  name: 'Vicente',
  sex: 'male',
  weight: 75,
  height: 180,
  age: 30,
  activity: 'active',
  trains: true,
  restrictions: [],
};

const CUT_FEMALE: OnboardingDraft = {
  goal: 'cut',
  name: 'Ana',
  sex: 'female',
  weight: 60,
  height: 165,
  age: 28,
  activity: 'light',
  trains: false,
  restrictions: ['vegetarian'],
};

describe('deriveOutput — golden cases', () => {
  it('matches calculateDailyTargets for muscle male', () => {
    const out = deriveOutput(MUSCLE_MALE);
    const expected = calculateDailyTargets(75, 180, 30, 'male', 'active', 'muscle');
    expect(out.targets).toEqual(expected);
  });

  it('matches calculateDailyTargets for cut female', () => {
    const out = deriveOutput(CUT_FEMALE);
    const expected = calculateDailyTargets(60, 165, 28, 'female', 'light', 'cut');
    expect(out.targets).toEqual(expected);
  });
});

describe('deriveOutput — userProfile shape', () => {
  it('maps name, age, height, weight, sex, goal, activity, trains', () => {
    const out = deriveOutput(MUSCLE_MALE);
    expect(out.userProfile).toEqual({
      name: 'Vicente',
      age: 30,
      height: 180,
      weight: 75,
      sex: 'male',
      goal: 'muscle',
      activity: 'active',
      trains: true,
      dietaryPreferences: [],
    });
  });

  it('preserves restrictions[] as dietaryPreferences', () => {
    const out = deriveOutput(CUT_FEMALE);
    expect(out.userProfile.dietaryPreferences).toEqual(['vegetarian']);
  });

  it('preserves empty name (not coerced)', () => {
    const out = deriveOutput({ ...MUSCLE_MALE, name: '' });
    expect(out.userProfile.name).toBe('');
  });
});

describe('deriveOutput — initialWeightKg', () => {
  it('equals draft.weight', () => {
    expect(deriveOutput(MUSCLE_MALE).initialWeightKg).toBe(75);
    expect(deriveOutput(CUT_FEMALE).initialWeightKg).toBe(60);
  });
});

describe('deriveOutput — breakdown', () => {
  it('includes basal + activity + objective + total + macros', () => {
    const out = deriveOutput(MUSCLE_MALE);
    expect(out.breakdown).toMatchObject({
      basal: expect.any(Number),
      activity: expect.any(Number),
      exercise: 0,
      objective: 300, // muscle = +300
      total: expect.any(Number),
      pro: expect.any(Number),
      carbs: expect.any(Number),
      fats: expect.any(Number),
    });
  });

  it('cut goal yields negative objective (-400)', () => {
    expect(deriveOutput(CUT_FEMALE).breakdown.objective).toBe(-400);
  });
});

describe('deriveOutput — error path', () => {
  it('throws on incomplete draft', () => {
    expect(() => deriveOutput(INITIAL_DRAFT)).toThrow();
  });

  it('throws when only goal missing', () => {
    expect(() => deriveOutput({ ...MUSCLE_MALE, goal: '' })).toThrow();
  });
});

describe('previewBreakdown', () => {
  it('returns null for incomplete draft', () => {
    expect(previewBreakdown(INITIAL_DRAFT)).toBeNull();
  });

  it('returns breakdown for complete draft', () => {
    const breakdown = previewBreakdown(MUSCLE_MALE);
    expect(breakdown).not.toBeNull();
    expect(breakdown?.total).toBeGreaterThan(0);
  });

  it('matches deriveOutput.breakdown for complete draft', () => {
    expect(previewBreakdown(MUSCLE_MALE)).toEqual(
      deriveOutput(MUSCLE_MALE).breakdown,
    );
  });
});
