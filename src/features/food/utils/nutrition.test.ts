import { describe, it, expect } from 'vitest';
import { calculateBMR, calculateTDEE, calculateDailyTargets, getFoodQuality } from './nutrition';

describe('calculateBMR', () => {
  it('calculates male BMR correctly (Mifflin-St Jeor)', () => {
    // 80kg, 180cm, 30yo male → 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(calculateBMR(80, 180, 30, 'male')).toBe(1780);
  });

  it('calculates female BMR correctly', () => {
    // 60kg, 165cm, 25yo female → 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    expect(calculateBMR(60, 165, 25, 'female')).toBe(1345.25);
  });
});

describe('calculateTDEE', () => {
  it('applies sedentary multiplier', () => {
    expect(calculateTDEE(1780, 'sedentary')).toBe(Math.round(1780 * 1.2));
  });

  it('applies active multiplier', () => {
    expect(calculateTDEE(1780, 'active')).toBe(Math.round(1780 * 1.55));
  });
});

describe('calculateDailyTargets', () => {
  it('returns positive macro values', () => {
    const targets = calculateDailyTargets(80, 180, 30, 'male', 'active', 'muscle');
    expect(targets.cal).toBeGreaterThan(0);
    expect(targets.pro).toBeGreaterThan(0);
    expect(targets.carbs).toBeGreaterThan(0);
    expect(targets.fats).toBeGreaterThan(0);
  });

  it('muscle goal adds 300 kcal surplus', () => {
    const maintain = calculateDailyTargets(80, 180, 30, 'male', 'active', 'maintain');
    const muscle = calculateDailyTargets(80, 180, 30, 'male', 'active', 'muscle');
    expect(muscle.cal - maintain.cal).toBe(300);
  });

  it('cut goal subtracts 400 kcal', () => {
    const maintain = calculateDailyTargets(80, 180, 30, 'male', 'active', 'maintain');
    const cut = calculateDailyTargets(80, 180, 30, 'male', 'active', 'cut');
    expect(maintain.cal - cut.cal).toBe(400);
  });

  it('protein is higher on cut (2.2g/kg) than maintain (1.6g/kg)', () => {
    const maintain = calculateDailyTargets(80, 180, 30, 'male', 'active', 'maintain');
    const cut = calculateDailyTargets(80, 180, 30, 'male', 'active', 'cut');
    expect(cut.pro).toBeGreaterThan(maintain.pro);
  });
});

describe('getFoodQuality', () => {
  it('rates high-protein low-cal food as good', () => {
    expect(getFoodQuality({ calories: 165, protein: 31, carbs: 0, fats: 3.6 })).toBe('good');
  });

  it('rates sugary high-cal food as poor', () => {
    expect(getFoodQuality({ calories: 550, protein: 3, carbs: 70, fats: 28, sugar: 45, saturatedFat: 12 })).toBe('poor');
  });

  it('rates balanced food as neutral', () => {
    expect(getFoodQuality({ calories: 350, protein: 12, carbs: 45, fats: 14 })).toBe('neutral');
  });

  it('returns neutral for zero-calorie input', () => {
    expect(getFoodQuality({ calories: 0, protein: 0, carbs: 0, fats: 0 })).toBe('neutral');
  });
});
