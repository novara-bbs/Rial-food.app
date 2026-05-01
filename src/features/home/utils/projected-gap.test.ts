import { describe, it, expect } from 'vitest';
import type { Recipe } from '../../../types/recipe';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import { projectedConsumed } from './projected-gap';
import { computeMealGaps, biggestDeficit, type ConsumedTarget } from './meal-gaps';

const baseTarget = { cal: 2000, pro: 140, carbs: 220, fats: 65 };

const mkRecipe = (over: Partial<Recipe> = {}): Recipe => ({
  id: 'r-1',
  title: 'Pollo al Limón',
  description: '',
  image: '',
  prepTime: '10 min',
  cookTime: '15 min',
  difficulty: 'Fácil',
  macros: { calories: 500, protein: 45, carbs: 30, fats: 15 },
  tags: [],
  ...over,
});

const mkLog = (title: string): DailyLogEntry => ({
  id: 1,
  title,
  portionDescription: '1 ración',
  mealSlot: 'lunch',
  time: '13:00',
  macros: { cal: 500, pro: 45, carbs: 30, fats: 15 },
});

describe('projectedConsumed', () => {
  it('returns the same ConsumedTarget when there is no meal plan', () => {
    const dm: ConsumedTarget = { consumed: { cal: 800, pro: 50, carbs: 90, fats: 25 }, target: baseTarget };
    expect(projectedConsumed(dm, [], [])).toEqual(dm);
  });

  it('adds planned-but-not-logged macros to consumed', () => {
    const dm: ConsumedTarget = { consumed: { cal: 800, pro: 50, carbs: 90, fats: 25 }, target: baseTarget };
    const plan = [mkRecipe()];
    const projected = projectedConsumed(dm, plan, []);
    expect(projected.consumed).toEqual({
      cal: 800 + 500,
      pro: 50 + 45,
      carbs: 90 + 30,
      fats: 25 + 15,
    });
    expect(projected.target).toBe(baseTarget);
  });

  it('dedupes plan items already logged today (case-insensitive, trimmed)', () => {
    const dm: ConsumedTarget = { consumed: { cal: 500, pro: 45, carbs: 30, fats: 15 }, target: baseTarget };
    const plan = [mkRecipe()];
    const log = [mkLog('  POLLO AL LIMÓN  ')];
    // Already logged → should NOT add the plan macros again.
    const projected = projectedConsumed(dm, plan, log);
    expect(projected.consumed).toEqual(dm.consumed);
  });

  it('reads legacy planner shape (flat cal/pro/carbs/fats fields)', () => {
    const dm: ConsumedTarget = { consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 }, target: baseTarget };
    const legacyPlanItem = {
      title: 'Bol de Avena',
      cal: 450, pro: 30, carbs: 50, fats: 12,
    } as unknown as Recipe;
    const projected = projectedConsumed(dm, [legacyPlanItem], []);
    expect(projected.consumed).toEqual({ cal: 450, pro: 30, carbs: 50, fats: 12 });
  });
});

describe('projectedConsumed × biggestDeficit (integration)', () => {
  it('suppresses the suggestion when plan coverage closes the deficit below threshold', () => {
    // Naive view: consumed 50g pro, target 140g → 90g deficit → suggestion fires.
    // With plan: 3 high-protein recipes (45g each) remaining → projected 50+135=185g.
    // Projected over target → no deficit → biggestDeficit returns null.
    const dm: ConsumedTarget = { consumed: { cal: 800, pro: 50, carbs: 90, fats: 25 }, target: baseTarget };
    const plan = [
      mkRecipe({ id: 'r-1', title: 'Pollo' }),
      mkRecipe({ id: 'r-2', title: 'Salmón' }),
      mkRecipe({ id: 'r-3', title: 'Tofu' }),
    ];
    const naiveDeficit = biggestDeficit(computeMealGaps(dm));
    expect(naiveDeficit?.key).toBe('pro');

    const projected = projectedConsumed(dm, plan, []);
    const projectedDeficit = biggestDeficit(computeMealGaps(projected));
    expect(projectedDeficit).toBeNull();
  });

  it('reduces but does not zero the deficit when plan only partially covers', () => {
    const dm: ConsumedTarget = { consumed: { cal: 500, pro: 30, carbs: 50, fats: 15 }, target: baseTarget };
    const plan = [mkRecipe({ macros: { calories: 400, protein: 25, carbs: 40, fats: 12 } })];
    const naive = biggestDeficit(computeMealGaps(dm));
    const projected = biggestDeficit(computeMealGaps(projectedConsumed(dm, plan, [])));
    // Both report a protein deficit, but the projected one is smaller.
    expect(naive?.key).toBe('pro');
    expect(projected?.key).toBe('pro');
    expect(projected!.gap.deficit).toBeLessThan(naive!.gap.deficit);
  });
});
