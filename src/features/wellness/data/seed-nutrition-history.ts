// 30 days of seed nutrition history.
// Anchor: 2026-04-16. Days: 2026-04-15 (day 1) down to 2026-03-17 (day 30).
// Weekday (Mon=1, Fri=5): more consistent. Weekend (Sat=6, Sun=0): more variable.
// Note: DailyArchive.hydration = consumed glasses (number), movement = activeMinutes (number)

// Precomputed date list (2026-04-15 → 2026-03-17) — no runtime Date().
const DATES: string[] = [
  '2026-04-15', '2026-04-14', '2026-04-13', '2026-04-12', '2026-04-11',
  '2026-04-10', '2026-04-09', '2026-04-08', '2026-04-07', '2026-04-06',
  '2026-04-05', '2026-04-04', '2026-04-03', '2026-04-02', '2026-04-01',
  '2026-03-31', '2026-03-30', '2026-03-29', '2026-03-28', '2026-03-27',
  '2026-03-26', '2026-03-25', '2026-03-24', '2026-03-23', '2026-03-22',
  '2026-03-21', '2026-03-20', '2026-03-19', '2026-03-18', '2026-03-17',
];

// Day of week for each date (0=Sun, 1=Mon...6=Sat), precomputed.
// 2026-04-15 is a Wednesday (3).
const DOW: number[] = [3, 2, 1, 0, 6, 5, 4, 3, 2, 1, 0, 6, 5, 4, 3, 2, 1, 0, 6, 5, 4, 3, 2, 1, 0, 6, 5, 4, 3, 2];

const TARGET = { cal: 2400, pro: 180, carbs: 250, fats: 65 };

interface MealEntry {
  id: number;
  title: string;
  time: string;
  mealSlot: string;
  macros: { cal: number; pro: number; carbs: number; fats: number };
  portionDescription: string;
}

// Fixed meal banks for weekdays and weekends
const WEEKDAY_BREAKFASTS: MealEntry[] = [
  { id: 1, title: 'Avena con frutas', time: '07:30', mealSlot: 'breakfast', macros: { cal: 380, pro: 18, carbs: 62, fats: 9 }, portionDescription: '1 taza cocida + plátano' },
  { id: 2, title: 'Huevos revueltos con tostada integral', time: '07:45', mealSlot: 'breakfast', macros: { cal: 420, pro: 28, carbs: 38, fats: 18 }, portionDescription: '3 huevos + 2 rebanadas' },
  { id: 3, title: 'Smoothie proteico de fresas', time: '07:15', mealSlot: 'breakfast', macros: { cal: 340, pro: 32, carbs: 42, fats: 6 }, portionDescription: '1 vaso grande 400 ml' },
  { id: 4, title: 'Yogur griego con granola', time: '08:00', mealSlot: 'breakfast', macros: { cal: 360, pro: 22, carbs: 48, fats: 8 }, portionDescription: '200 g yogur + 40 g granola' },
  { id: 5, title: 'Tostadas con aguacate y huevo', time: '07:30', mealSlot: 'breakfast', macros: { cal: 440, pro: 20, carbs: 44, fats: 22 }, portionDescription: '2 tostadas + ½ aguacate + 2 huevos' },
];

const WEEKDAY_LUNCHES: MealEntry[] = [
  { id: 10, title: 'Pollo con quinoa', time: '13:00', mealSlot: 'lunch', macros: { cal: 540, pro: 52, carbs: 58, fats: 10 }, portionDescription: '180 g pechuga + 80 g quinoa' },
  { id: 11, title: 'Pavo con arroz integral y verduras', time: '13:15', mealSlot: 'lunch', macros: { cal: 580, pro: 48, carbs: 70, fats: 9 }, portionDescription: '160 g pavo + 100 g arroz + mix verduras' },
  { id: 12, title: 'Ensalada de atún con pasta integral', time: '13:00', mealSlot: 'lunch', macros: { cal: 510, pro: 44, carbs: 60, fats: 8 }, portionDescription: '2 latas atún + 90 g pasta' },
  { id: 13, title: 'Bowl de pollo teriyaki con arroz', time: '12:45', mealSlot: 'lunch', macros: { cal: 620, pro: 50, carbs: 76, fats: 11 }, portionDescription: '200 g pollo + 90 g arroz + salsa' },
  { id: 14, title: 'Lentejas con verduras', time: '13:00', mealSlot: 'lunch', macros: { cal: 490, pro: 32, carbs: 72, fats: 7 }, portionDescription: '250 g lentejas cocidas + zanahoria y espinaca' },
];

const WEEKDAY_SNACKS: MealEntry[] = [
  { id: 20, title: 'Manzana con mantequilla de maní', time: '10:30', mealSlot: 'snack', macros: { cal: 250, pro: 8, carbs: 32, fats: 12 }, portionDescription: '1 manzana + 2 cdas mantequilla' },
  { id: 21, title: 'Batido de proteínas', time: '10:00', mealSlot: 'snack', macros: { cal: 220, pro: 26, carbs: 18, fats: 4 }, portionDescription: '1 scoop proteína + agua' },
  { id: 22, title: 'Nueces mixtas y arándanos', time: '10:45', mealSlot: 'snack', macros: { cal: 280, pro: 7, carbs: 26, fats: 18 }, portionDescription: '30 g nueces + 50 g arándanos' },
];

const WEEKDAY_DINNERS: MealEntry[] = [
  { id: 30, title: 'Salmón al horno', time: '20:00', mealSlot: 'dinner', macros: { cal: 480, pro: 46, carbs: 12, fats: 28 }, portionDescription: '200 g filete + espárragos' },
  { id: 31, title: 'Pechuga a la plancha con brócoli', time: '20:15', mealSlot: 'dinner', macros: { cal: 400, pro: 50, carbs: 14, fats: 12 }, portionDescription: '200 g pechuga + 200 g brócoli' },
  { id: 32, title: 'Merluza al vapor con ensalada', time: '20:00', mealSlot: 'dinner', macros: { cal: 350, pro: 42, carbs: 16, fats: 8 }, portionDescription: '200 g merluza + ensalada verde' },
  { id: 33, title: 'Tortilla de espinacas y queso', time: '20:30', mealSlot: 'dinner', macros: { cal: 420, pro: 36, carbs: 8, fats: 26 }, portionDescription: '4 huevos + 100 g espinacas + 40 g queso' },
  { id: 34, title: 'Pollo al curry con coliflor', time: '20:00', mealSlot: 'dinner', macros: { cal: 460, pro: 44, carbs: 22, fats: 18 }, portionDescription: '180 g pollo + 200 g coliflor' },
];

const WEEKEND_BREAKFASTS: MealEntry[] = [
  { id: 40, title: 'Pancakes de avena', time: '09:30', mealSlot: 'breakfast', macros: { cal: 520, pro: 24, carbs: 78, fats: 14 }, portionDescription: '4 pancakes medianos' },
  { id: 41, title: 'Huevos benedictinos', time: '10:00', mealSlot: 'breakfast', macros: { cal: 680, pro: 30, carbs: 48, fats: 38 }, portionDescription: '2 huevos + jamón + salsa holandesa' },
  { id: 42, title: 'Desayuno completo', time: '09:45', mealSlot: 'breakfast', macros: { cal: 740, pro: 36, carbs: 64, fats: 34 }, portionDescription: '2 huevos, tocino, frijoles, tostada' },
  { id: 43, title: 'Crepes con miel y frutas', time: '10:00', mealSlot: 'breakfast', macros: { cal: 580, pro: 16, carbs: 94, fats: 16 }, portionDescription: '3 crepes + 2 cdas miel + fresas' },
];

const WEEKEND_LUNCHES: MealEntry[] = [
  { id: 50, title: 'Hamburguesa artesanal', time: '14:00', mealSlot: 'lunch', macros: { cal: 780, pro: 42, carbs: 68, fats: 36 }, portionDescription: '200 g carne + pan brioche + papas fritas' },
  { id: 51, title: 'Pasta boloñesa', time: '14:30', mealSlot: 'lunch', macros: { cal: 720, pro: 38, carbs: 88, fats: 22 }, portionDescription: '150 g pasta + salsa carne' },
  { id: 52, title: 'Pizza casera integral', time: '14:00', mealSlot: 'lunch', macros: { cal: 640, pro: 32, carbs: 78, fats: 20 }, portionDescription: '3 rebanadas pizza integral' },
  { id: 53, title: 'Tacos de carne asada', time: '14:30', mealSlot: 'lunch', macros: { cal: 700, pro: 40, carbs: 64, fats: 28 }, portionDescription: '3 tacos con guacamole y salsa' },
];

const WEEKEND_DINNERS: MealEntry[] = [
  { id: 60, title: 'Costillas BBQ', time: '21:00', mealSlot: 'dinner', macros: { cal: 680, pro: 52, carbs: 22, fats: 42 }, portionDescription: '300 g costillas + ensalada coleslaw' },
  { id: 61, title: 'Sushi variado', time: '20:30', mealSlot: 'dinner', macros: { cal: 560, pro: 34, carbs: 76, fats: 12 }, portionDescription: '12 piezas surtidas' },
  { id: 62, title: 'Paella de mariscos', time: '21:00', mealSlot: 'dinner', macros: { cal: 620, pro: 44, carbs: 72, fats: 14 }, portionDescription: '1 ración generosa' },
  { id: 63, title: 'Churrasco con papas', time: '21:30', mealSlot: 'dinner', macros: { cal: 740, pro: 58, carbs: 38, fats: 38 }, portionDescription: '250 g chuletón + papas al horno' },
];

// Precomputed daily data (30 entries, index 0 = 2026-04-15)
// Each row: [cal, pro, carbs, fats, hydration, steps, activeMin, mealCount, breakfastIdx, lunchIdx, snackIdx (or -1), dinnerIdx]
// weekday indices reference WEEKDAY_* arrays, weekend indices reference WEEKEND_* arrays
// isWeekend = DOW[i] === 0 || DOW[i] === 6
type DayData = {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  hydration: number;
  steps: number;
  activeMin: number;
  mealCount: number;
  log: MealEntry[];
};

function wd(i: number): DayData {
  // weekday entries — cycle through arrays deterministically
  const bk = WEEKDAY_BREAKFASTS[i % WEEKDAY_BREAKFASTS.length];
  const ln = WEEKDAY_LUNCHES[i % WEEKDAY_LUNCHES.length];
  const sn = WEEKDAY_SNACKS[i % WEEKDAY_SNACKS.length];
  const dn = WEEKDAY_DINNERS[i % WEEKDAY_DINNERS.length];

  const usesSnack = i % 3 !== 0; // skip snack every 3rd weekday entry
  const mealCount = usesSnack ? 4 : 3;
  const log = usesSnack ? [bk, sn, ln, dn] : [bk, ln, dn];

  const calBase = bk.macros.cal + ln.macros.cal + dn.macros.cal + (usesSnack ? sn.macros.cal : 0);
  const proBase = bk.macros.pro + ln.macros.pro + dn.macros.pro + (usesSnack ? sn.macros.pro : 0);
  const carbBase = bk.macros.carbs + ln.macros.carbs + dn.macros.carbs + (usesSnack ? sn.macros.carbs : 0);
  const fatBase = bk.macros.fats + ln.macros.fats + dn.macros.fats + (usesSnack ? sn.macros.fats : 0);

  const hydrationVals = [7, 8, 6, 9, 7, 8, 5, 7, 8, 6, 9, 7, 8, 6, 7, 8, 5, 7, 8, 6, 9, 7];
  const stepVals = [9800, 11200, 8500, 10500, 12000, 7800, 9200, 11000, 8800, 10200, 9500, 11500, 8200, 10800, 9100, 11800, 8600, 10100, 9700, 11300, 8400, 10600];
  const activeVals = [45, 55, 35, 50, 60, 32, 40, 52, 38, 48, 44, 58, 30, 50, 42, 56, 36, 46, 44, 54, 33, 49];

  return {
    consumed: { cal: calBase, pro: proBase, carbs: carbBase, fats: fatBase },
    hydration: hydrationVals[i % hydrationVals.length],
    steps: stepVals[i % stepVals.length],
    activeMin: activeVals[i % activeVals.length],
    mealCount,
    log,
  };
}

function we(i: number): DayData {
  // weekend entries
  const bk = WEEKEND_BREAKFASTS[i % WEEKEND_BREAKFASTS.length];
  const ln = WEEKEND_LUNCHES[i % WEEKEND_LUNCHES.length];
  const dn = WEEKEND_DINNERS[i % WEEKEND_DINNERS.length];

  const calBase = bk.macros.cal + ln.macros.cal + dn.macros.cal;
  const proBase = bk.macros.pro + ln.macros.pro + dn.macros.pro;
  const carbBase = bk.macros.carbs + ln.macros.carbs + dn.macros.carbs;
  const fatBase = bk.macros.fats + ln.macros.fats + dn.macros.fats;

  const hydrationVals = [6, 4, 8, 3, 7, 5, 9, 4, 6];
  const stepVals = [6500, 4200, 9800, 3400, 8200, 5100, 12000, 3800, 7200];
  const activeVals = [30, 0, 60, 0, 45, 15, 75, 0, 35];

  return {
    consumed: { cal: calBase, pro: proBase, carbs: carbBase, fats: fatBase },
    hydration: hydrationVals[i % hydrationVals.length],
    steps: stepVals[i % stepVals.length],
    activeMin: activeVals[i % activeVals.length],
    mealCount: 3,
    log: [bk, ln, dn],
  };
}

// DailyArchive shape from useDailyReset.ts:
//   hydration: number (consumed glasses)
//   movement: number (activeMinutes)
interface SeedDailyArchive {
  date: string;
  macros: { consumed: { cal: number; pro: number; carbs: number; fats: number }; target: { cal: number; pro: number; carbs: number; fats: number } };
  hydration: number;
  movement: number;
  mealCount: number;
  dailyLog: any[];
}

function buildEntry(i: number): SeedDailyArchive {
  const dow = DOW[i];
  const isWeekend = dow === 0 || dow === 6;
  const data = isWeekend ? we(i) : wd(i);

  return {
    date: DATES[i],
    macros: {
      consumed: data.consumed,
      target: TARGET,
    },
    hydration: data.hydration,
    movement: data.activeMin,
    mealCount: data.mealCount,
    dailyLog: data.log.map((m, j) => ({ ...m, id: (i + 1) * 100 + j })),
  };
}

export const SEED_NUTRITION_HISTORY: SeedDailyArchive[] = Array.from({ length: 30 }, (_, i) => buildEntry(i));
