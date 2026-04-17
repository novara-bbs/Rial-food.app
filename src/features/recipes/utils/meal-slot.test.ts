import { describe, it, expect } from 'vitest';
import { getRecipeSlots, recipeFitsSlot, defaultSlotFor } from './meal-slot';

describe('getRecipeSlots', () => {
  it('returns suitableFor as-is when present and non-empty', () => {
    expect(getRecipeSlots({ suitableFor: ['lunch', 'dinner'] } as any)).toEqual(['lunch', 'dinner']);
    expect(getRecipeSlots({ suitableFor: ['breakfast'] } as any)).toEqual(['breakfast']);
  });

  it('falls back to legacy mealType (English keys)', () => {
    expect(getRecipeSlots({ mealType: 'breakfast' } as any)).toEqual(['breakfast']);
    expect(getRecipeSlots({ mealType: 'lunch' } as any)).toEqual(['lunch']);
    expect(getRecipeSlots({ mealType: 'dinner' } as any)).toEqual(['dinner']);
    expect(getRecipeSlots({ mealType: 'snack' } as any)).toEqual(['snack']);
  });

  it('falls back to legacy mealType (Spanish labels used by seed data)', () => {
    expect(getRecipeSlots({ mealType: 'desayuno' } as any)).toEqual(['breakfast']);
    expect(getRecipeSlots({ mealType: 'comida' } as any)).toEqual(['lunch']);
    expect(getRecipeSlots({ mealType: 'almuerzo' } as any)).toEqual(['lunch']);
    expect(getRecipeSlots({ mealType: 'cena' } as any)).toEqual(['dinner']);
    expect(getRecipeSlots({ mealType: 'merienda' } as any)).toEqual(['snack']);
  });

  it('is case-insensitive and trims whitespace on legacy strings', () => {
    expect(getRecipeSlots({ mealType: '  Cena ' } as any)).toEqual(['dinner']);
    expect(getRecipeSlots({ mealType: 'DESAYUNO' } as any)).toEqual(['breakfast']);
  });

  it('returns undefined when empty suitableFor and no legacy mealType', () => {
    expect(getRecipeSlots({} as any)).toBeUndefined();
    expect(getRecipeSlots({ suitableFor: [] } as any)).toBeUndefined();
  });

  it('returns undefined when legacy mealType does not map', () => {
    expect(getRecipeSlots({ mealType: 'brunch' } as any)).toBeUndefined();
    expect(getRecipeSlots({ mealType: '' } as any)).toBeUndefined();
  });

  it('prefers suitableFor over legacy mealType when both are present', () => {
    expect(
      getRecipeSlots({ suitableFor: ['snack'], mealType: 'dinner' } as any),
    ).toEqual(['snack']);
  });
});

describe('recipeFitsSlot', () => {
  it('matches when slot is in suitableFor', () => {
    expect(recipeFitsSlot({ suitableFor: ['lunch', 'dinner'] } as any, 'lunch')).toBe(true);
    expect(recipeFitsSlot({ suitableFor: ['lunch', 'dinner'] } as any, 'dinner')).toBe(true);
  });

  it('rejects when slot is not in suitableFor', () => {
    expect(recipeFitsSlot({ suitableFor: ['lunch'] } as any, 'breakfast')).toBe(false);
    expect(recipeFitsSlot({ suitableFor: ['breakfast'] } as any, 'dinner')).toBe(false);
  });

  it('matches every slot when recipe is versatile (no assignment)', () => {
    expect(recipeFitsSlot({} as any, 'breakfast')).toBe(true);
    expect(recipeFitsSlot({} as any, 'lunch')).toBe(true);
    expect(recipeFitsSlot({} as any, 'dinner')).toBe(true);
    expect(recipeFitsSlot({} as any, 'snack')).toBe(true);
    expect(recipeFitsSlot({ suitableFor: [] } as any, 'lunch')).toBe(true);
  });

  it('honours legacy mealType when suitableFor is absent', () => {
    expect(recipeFitsSlot({ mealType: 'cena' } as any, 'dinner')).toBe(true);
    expect(recipeFitsSlot({ mealType: 'cena' } as any, 'breakfast')).toBe(false);
  });
});

describe('defaultSlotFor', () => {
  it('picks the first entry of suitableFor', () => {
    expect(defaultSlotFor({ suitableFor: ['dinner', 'lunch'] } as any)).toBe('dinner');
    expect(defaultSlotFor({ suitableFor: ['breakfast'] } as any)).toBe('breakfast');
  });

  it('falls back to lunch for versatile recipes', () => {
    expect(defaultSlotFor({} as any)).toBe('lunch');
    expect(defaultSlotFor({ suitableFor: [] } as any)).toBe('lunch');
  });

  it('honours legacy mealType', () => {
    expect(defaultSlotFor({ mealType: 'desayuno' } as any)).toBe('breakfast');
    expect(defaultSlotFor({ mealType: 'snack' } as any)).toBe('snack');
  });
});
