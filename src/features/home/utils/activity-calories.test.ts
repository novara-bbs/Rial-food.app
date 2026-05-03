import { describe, it, expect } from 'vitest';
import {
  kcalFromSteps,
  kcalFromExercise,
  sexFactor,
  kcalPerStep,
  KCAL_PER_STEP_PER_KG,
  FEMALE_SEX_FACTOR,
  INTENSITY_METS,
} from './activity-calories';

describe('activity-calories', () => {
  describe('constants', () => {
    it('KCAL_PER_STEP_PER_KG is 0.0005 (3 MET ÷ 100 steps/min ÷ 60)', () => {
      expect(KCAL_PER_STEP_PER_KG).toBe(0.0005);
    });

    it('FEMALE_SEX_FACTOR is 0.95 (5% less than male)', () => {
      expect(FEMALE_SEX_FACTOR).toBe(0.95);
    });

    it('INTENSITY_METS uses Compendium values 3/6/9', () => {
      expect(INTENSITY_METS.moderate).toBe(3.0);
      expect(INTENSITY_METS.medium).toBe(6.0);
      expect(INTENSITY_METS.intense).toBe(9.0);
    });
  });

  describe('sexFactor', () => {
    it('returns 1.0 for male', () => {
      expect(sexFactor('male')).toBe(1.0);
    });

    it('returns 0.95 for female', () => {
      expect(sexFactor('female')).toBe(0.95);
    });

    it('returns 1.0 (male default) for undefined', () => {
      expect(sexFactor(undefined)).toBe(1.0);
    });
  });

  describe('kcalFromSteps', () => {
    it('male 75 kg, 10 000 steps → 375 kcal', () => {
      expect(kcalFromSteps(10000, { weight: 75, sex: 'male' })).toBe(375);
    });

    it('female 60 kg, 8 000 steps → 228 kcal', () => {
      expect(kcalFromSteps(8000, { weight: 60, sex: 'female' })).toBe(228);
    });

    it('uses default 70 kg + male when profile is empty', () => {
      // 10 000 × 0.0005 × 70 × 1 = 350
      expect(kcalFromSteps(10000, {})).toBe(350);
    });

    it('returns 0 for zero steps', () => {
      expect(kcalFromSteps(0, { weight: 75, sex: 'male' })).toBe(0);
    });

    it('clamps negative steps to 0', () => {
      expect(kcalFromSteps(-500, { weight: 75, sex: 'male' })).toBe(0);
    });

    it('clamps NaN to 0', () => {
      expect(kcalFromSteps(NaN, { weight: 75, sex: 'male' })).toBe(0);
    });

    it('female and male of same weight: female ≈ 5% less', () => {
      const male = kcalFromSteps(10000, { weight: 70, sex: 'male' });
      const female = kcalFromSteps(10000, { weight: 70, sex: 'female' });
      expect(male).toBe(350);
      expect(female).toBe(333); // 350 × 0.95 = 332.5 → round 333
    });
  });

  describe('kcalFromExercise', () => {
    it('male 80 kg, 30 min medium → 240 kcal', () => {
      // 6 × 80 × 0.5 × 1 = 240
      expect(kcalFromExercise('medium', 30, { weight: 80, sex: 'male' })).toBe(240);
    });

    it('female 60 kg, 45 min intense → 385 kcal', () => {
      // 9 × 60 × 0.75 × 0.95 = 384.75 → round 385
      expect(kcalFromExercise('intense', 45, { weight: 60, sex: 'female' })).toBe(385);
    });

    it('male 70 kg, 60 min moderate → 210 kcal', () => {
      // 3 × 70 × 1 × 1 = 210
      expect(kcalFromExercise('moderate', 60, { weight: 70, sex: 'male' })).toBe(210);
    });

    it('uses default 70 kg + male when profile is empty', () => {
      // medium 6 × 70 × 0.5 × 1 = 210
      expect(kcalFromExercise('medium', 30, {})).toBe(210);
    });

    it('returns 0 for zero minutes', () => {
      expect(kcalFromExercise('intense', 0, { weight: 75, sex: 'male' })).toBe(0);
    });

    it('clamps negative minutes to 0', () => {
      expect(kcalFromExercise('medium', -10, { weight: 75, sex: 'male' })).toBe(0);
    });

    it('intense > medium > moderate at same weight + minutes', () => {
      const profile = { weight: 75, sex: 'male' as const };
      expect(kcalFromExercise('intense', 30, profile))
        .toBeGreaterThan(kcalFromExercise('medium', 30, profile));
      expect(kcalFromExercise('medium', 30, profile))
        .toBeGreaterThan(kcalFromExercise('moderate', 30, profile));
    });

    it('intense MET (9) is exactly 3× moderate MET (3) at same params', () => {
      const profile = { weight: 75, sex: 'male' as const };
      const moderate = kcalFromExercise('moderate', 60, profile); // 3 × 75 = 225
      const intense = kcalFromExercise('intense', 60, profile);   // 9 × 75 = 675
      expect(intense).toBe(moderate * 3);
    });
  });

  describe('kcalPerStep', () => {
    it('male 75 kg → 0.0375 kcal/paso', () => {
      expect(kcalPerStep({ weight: 75, sex: 'male' })).toBeCloseTo(0.0375, 4);
    });

    it('female 60 kg → 0.0285 kcal/paso', () => {
      // 60 × 0.0005 × 0.95 = 0.0285
      expect(kcalPerStep({ weight: 60, sex: 'female' })).toBeCloseTo(0.0285, 4);
    });

    it('uses defaults when profile is empty', () => {
      // 70 × 0.0005 × 1 = 0.035
      expect(kcalPerStep({})).toBeCloseTo(0.035, 4);
    });
  });
});
