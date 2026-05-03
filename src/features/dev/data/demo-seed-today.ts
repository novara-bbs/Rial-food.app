import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import { safeSumMacros } from '../../home/utils/safe-macros';
import { CLARA_MACROS_TARGET } from './demo-seed-timeline';

/**
 * Today-in-progress state for Clara. Coherent with the 30-day timeline:
 * breakfast + snack done (~1100 cal), still owes lunch + dinner to hit target.
 * Hydration 5/10, movement mid-day.
 */
export interface DemoToday {
  dailyLog: DailyLogEntry[];
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
  hydration: { consumed: number; target: number };
  movement: { steps: number; target: number; activeMinutes: number; activeTarget: number; workoutMinutes: number };
  dailyGoal: string;
}

export function buildDemoToday(): DemoToday {
  const now = new Date();
  const base = now.getTime();

  const dailyLog: DailyLogEntry[] = [
    {
      id: base + 1,
      title: 'Avena con plátano y mantequilla de almendras',
      portionDescription: '1 bowl (80 g avena)',
      mealSlot: 'breakfast',
      time: '08:10',
      macros: { cal: 420, pro: 15, carbs: 60, fats: 14 },
    },
    {
      id: base + 2,
      title: 'Yogur griego + arándanos',
      portionDescription: '200 g',
      mealSlot: 'snack',
      time: '11:30',
      macros: { cal: 180, pro: 18, carbs: 18, fats: 3 },
    },
    {
      id: base + 3,
      title: 'Pollo a la plancha con quinoa y espinacas',
      portionDescription: '1 plato',
      mealSlot: 'lunch',
      time: '14:00',
      macros: { cal: 520, pro: 45, carbs: 50, fats: 14 },
    },
  ];

  const consumed = safeSumMacros(dailyLog);

  return {
    dailyLog,
    consumed,
    target: CLARA_MACROS_TARGET,
    hydration: { consumed: 5, target: 10 },
    movement: { steps: 6400, target: 10000, activeMinutes: 22, activeTarget: 45, workoutMinutes: 0 },
    dailyGoal: 'Cerrar cena con proteína alta',
  };
}
