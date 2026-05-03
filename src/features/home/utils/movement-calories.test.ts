import { describe, it, expect } from 'vitest';
import {
  KCAL_PER_ACTIVE_MIN,
  passiveMovementKcal,
  totalExerciseKcal,
} from './movement-calories';

describe('movement-calories', () => {
  it('exposes the documented kcal-per-min constant', () => {
    expect(KCAL_PER_ACTIVE_MIN).toBe(3);
  });

  describe('passiveMovementKcal', () => {
    it('returns 0 for 0 minutes', () => {
      expect(passiveMovementKcal(0)).toBe(0);
    });

    it('multiplies minutes by KCAL_PER_ACTIVE_MIN and rounds', () => {
      expect(passiveMovementKcal(10)).toBe(30);
      expect(passiveMovementKcal(45)).toBe(135);
      expect(passiveMovementKcal(7)).toBe(21);
    });

    it('clamps negative or NaN inputs to 0 (defensive)', () => {
      expect(passiveMovementKcal(-5)).toBe(0);
      expect(passiveMovementKcal(NaN as unknown as number)).toBe(0);
    });
  });

  describe('totalExerciseKcal', () => {
    it('uses passive contribution when intensity is none', () => {
      const result = totalExerciseKcal({ intensity: 'none', activeMinutes: 20 });
      expect(result.passive).toBe(60);
      expect(result.tier).toBe(0);
      expect(result.total).toBe(60);
    });

    it('zeroes the passive contribution when an intensity tier is selected', () => {
      const result = totalExerciseKcal({ intensity: 'medium', activeMinutes: 20 });
      expect(result.passive).toBe(0);
      expect(result.tier).toBe(300);
      expect(result.total).toBe(300);
    });

    it('returns total = tier kcal alone for moderate / intense tiers', () => {
      expect(totalExerciseKcal({ intensity: 'moderate', activeMinutes: 50 }).total).toBe(150);
      expect(totalExerciseKcal({ intensity: 'intense', activeMinutes: 0 }).total).toBe(500);
    });

    it('treats absent active minutes as zero', () => {
      const result = totalExerciseKcal({ intensity: 'none', activeMinutes: 0 });
      expect(result).toEqual({ passive: 0, tier: 0, total: 0 });
    });
  });
});
