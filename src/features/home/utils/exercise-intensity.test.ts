import { describe, it, expect } from 'vitest';
import {
  INTENSITY_KCAL,
  INTENSITY_TIERS,
  intensityToCalories,
  intensityToIsTrainingDay,
  isTrainingDayToIntensity,
} from './exercise-intensity';

describe('exercise-intensity', () => {
  it('exposes 4 tiers with documented kcal values', () => {
    expect(INTENSITY_KCAL.none).toBe(0);
    expect(INTENSITY_KCAL.moderate).toBe(150);
    expect(INTENSITY_KCAL.medium).toBe(300);
    expect(INTENSITY_KCAL.intense).toBe(500);
  });

  it('lists the 3 picker tiers in ascending order', () => {
    expect(INTENSITY_TIERS).toEqual(['moderate', 'medium', 'intense']);
  });

  it('intensityToCalories returns the kcal of the tier', () => {
    expect(intensityToCalories('none')).toBe(0);
    expect(intensityToCalories('moderate')).toBe(150);
    expect(intensityToCalories('medium')).toBe(300);
    expect(intensityToCalories('intense')).toBe(500);
  });

  it('intensityToIsTrainingDay maps any non-none tier to true', () => {
    expect(intensityToIsTrainingDay('none')).toBe(false);
    expect(intensityToIsTrainingDay('moderate')).toBe(true);
    expect(intensityToIsTrainingDay('medium')).toBe(true);
    expect(intensityToIsTrainingDay('intense')).toBe(true);
  });

  it('isTrainingDayToIntensity defaults to medium when toggled on', () => {
    expect(isTrainingDayToIntensity(true)).toBe('medium');
    expect(isTrainingDayToIntensity(false)).toBe('none');
  });
});
