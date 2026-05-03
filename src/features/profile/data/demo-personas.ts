/**
 * Demo Personas — 60-day fixture data for testing correlation engine,
 * weight tracking, weekly check-ins, and Real Feel diary.
 *
 * Each persona targets specific detector thresholds:
 *   - Tag correlations: >= 7 total logs, >= 3 per tag, diff >= 0.5
 *   - Signal correlations: >= 5 logs with energy, >= 3 in high group, avg > 3.5
 *   - Consistency trend: >= 14 logs, second-half avg differs from first by >= 0.3
 */

import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { BodySnapshot, WeeklyCheckInEntry } from '../../../types/wellness';

interface RFEntry {
  id: number;
  date: string;
  level: number;
  tags: string[];
  note?: string;
  energy?: 'high' | 'stable' | 'low';
  digestion?: 'clean' | 'sensitive' | 'bloated';
  mindset?: 'calm' | 'balanced' | 'stressed';
}

export interface DemoPersona {
  id: 'clara-cut' | 'marcos-muscle' | 'ana-health';
  name: string;
  icp: 'cut' | 'muscle' | 'health';
  userProfile: {
    name: string;
    age: number;
    height: number;
    weight: number;
    sex: 'male' | 'female';
    goal: string;
    activity: string;
    trains: boolean;
    dietaryPreferences: string[];
    unitSystem: 'metric';
    targetWeight?: number;
  };
  weightHistory: BodySnapshot[];
  nutritionHistory: DailyArchive[];
  realFeelLogs: RFEntry[];
  weeklyCheckIns: WeeklyCheckInEntry[];
  dailyMacros: { target: { cal: number; pro: number; carbs: number; fats: number } };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const TODAY = new Date();

/** Format a Date as YYYY-MM-DD using LOCAL date parts (TZ-safe). */
function formatLocalYMD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Return YYYY-MM-DD for `daysAgo` days before today (local calendar). */
function dateAgo(daysAgo: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - daysAgo);
  return formatLocalYMD(d);
}

/** Return ISO datetime string for `daysAgo` at a given hour */
function datetimeAgo(daysAgo: number, hour: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

/** Simple bounded random integer [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate weight entries with linear trend + jitter */
function buildWeightHistory(
  days: number,
  startKg: number,
  endKg: number,
  jitter: number,
): BodySnapshot[] {
  const entries: BodySnapshot[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const progress = (days - 1 - i) / (days - 1);
    const linearKg = startKg + (endKg - startKg) * progress;
    const noise = (Math.random() - 0.5) * 2 * jitter;
    entries.push({ date: dateAgo(i), kg: Math.round((linearKg + noise) * 10) / 10 });
  }
  return entries;
}

/** Generate nutrition history for N days */
function buildNutritionHistory(
  days: number,
  target: { cal: number; pro: number; carbs: number; fats: number },
  ranges: { cal: [number, number]; pro: [number, number]; carbs: [number, number]; fats: [number, number] },
  mealRange: [number, number],
  hydrationRange: [number, number],
  movementRange: [number, number],
): DailyArchive[] {
  const entries: DailyArchive[] = [];
  for (let i = days - 1; i >= 0; i--) {
    entries.push({
      date: dateAgo(i),
      macros: {
        consumed: {
          cal: randInt(ranges.cal[0], ranges.cal[1]),
          pro: randInt(ranges.pro[0], ranges.pro[1]),
          carbs: randInt(ranges.carbs[0], ranges.carbs[1]),
          fats: randInt(ranges.fats[0], ranges.fats[1]),
        },
        target,
      },
      hydration: randInt(hydrationRange[0], hydrationRange[1]),
      movement: randInt(movementRange[0], movementRange[1]),
      mealCount: randInt(mealRange[0], mealRange[1]),
      dailyLog: [],
    });
  }
  return entries;
}

/** Collect Sunday weekStart dates going backward (local calendar, TZ-safe) */
function sundayWeekStarts(count: number): string[] {
  const sundays: string[] = [];
  const d = new Date(TODAY);
  // Anchor to noon so setDate arithmetic can't cross a DST boundary
  d.setHours(12, 0, 0, 0);
  // Walk backward to find previous Sunday (getDay() is local day-of-week)
  d.setDate(d.getDate() - d.getDay());
  for (let i = 0; i < count; i++) {
    sundays.push(formatLocalYMD(d));
    d.setDate(d.getDate() - 7);
  }
  return sundays.reverse();
}

/** Spread N entries over `totalDays` days (unique day indices, sorted ascending) */
function spreadDays(n: number, totalDays: number): number[] {
  if (n >= totalDays) return Array.from({ length: totalDays }, (_, i) => i);
  const chosen = new Set<number>();
  while (chosen.size < n) {
    chosen.add(randInt(0, totalDays - 1));
  }
  return [...chosen].sort((a, b) => a - b);
}

// ── Clara (Cut / losing fat) ────────────────────────────────────────────────

function buildClara(): DemoPersona {
  const target = { cal: 1700, pro: 140, carbs: 170, fats: 55 };

  // RealFeel logs — 50 entries spread over 60 days
  // Design: first half avg ~3.3, second half avg ~3.9 => trend fires (+0.6)
  const rfDays = spreadDays(50, 60);
  let rfId = 1;
  const rfLogs: RFEntry[] = [];

  // Tag pools with their target counts
  // "proteina alta": 15 entries, level 4-5, energy high
  // "hidratacion baja": 12 entries, level 1-3, energy low
  // "post-entreno": 8 entries, level 3-5
  let protCount = 0;
  let hidCount = 0;
  let postCount = 0;

  for (const dayIdx of rfDays) {
    const isSecondHalf = dayIdx >= 30;
    const baseLevel = isSecondHalf ? randInt(3, 5) : randInt(2, 5);
    const tags: string[] = [];
    let energy: RFEntry['energy'];

    // Assign tags to hit cluster thresholds
    if (protCount < 15 && baseLevel >= 4) {
      tags.push('proteina alta');
      energy = 'high';
      protCount++;
    } else if (hidCount < 12 && baseLevel <= 3) {
      tags.push('hidratacion baja');
      energy = 'low';
      hidCount++;
    } else if (postCount < 8 && baseLevel >= 3) {
      tags.push('post-entreno');
      energy = baseLevel >= 4 ? 'high' : 'stable';
      postCount++;
    } else {
      energy = baseLevel >= 4 ? 'high' : baseLevel <= 2 ? 'low' : 'stable';
    }

    const digestion: RFEntry['digestion'] = baseLevel >= 4 ? 'clean' : baseLevel <= 2 ? 'sensitive' : pick(['clean', 'sensitive']);
    const mindset: RFEntry['mindset'] = baseLevel >= 4 ? 'calm' : baseLevel <= 2 ? 'stressed' : 'balanced';

    rfLogs.push({
      id: rfId++,
      date: datetimeAgo(dayIdx, randInt(7, 21)),
      level: baseLevel,
      tags,
      energy,
      digestion,
      mindset,
    });
  }

  // Ensure minimums: pad remaining tag entries if random distribution fell short
  while (protCount < 15 && rfLogs.length < 55) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(0, 29), 12),
      level: pick([4, 5]), tags: ['proteina alta'], energy: 'high', digestion: 'clean', mindset: 'calm',
    });
    protCount++;
  }
  while (hidCount < 12 && rfLogs.length < 58) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(30, 59), 18),
      level: pick([1, 2, 3]), tags: ['hidratacion baja'], energy: 'low', digestion: 'sensitive', mindset: 'stressed',
    });
    hidCount++;
  }

  // Weekly check-ins — 8 Sundays
  const sundays = sundayWeekStarts(8);
  const checkIns: WeeklyCheckInEntry[] = sundays.map((ws, i) => ({
    id: i + 1,
    weekStart: ws,
    workedWell: pick([
      'Mantuve deficit sin pasar hambre',
      'Buenos entrenos de fuerza, progresion en sentadilla',
      'Cumpli objetivo de proteina 5 de 7 dias',
      'Prepare batch cooking el domingo — me ahorro tiempo',
    ]),
    whatWasHard: pick([
      'Un dia social con exceso de calorias',
      'Poca hidratacion entre semana',
      'Ansiedad por dulce por la noche',
      'Entreno de pierna me dejo agotada',
    ]),
    focusNextWeek: pick([
      'Llevar botella de agua al trabajo',
      'Preparar snacks altos en proteina',
      'Dormir 7h minimo',
      'Probar receta nueva baja en calorias',
    ]),
    avgVitality: randInt(55, 80),
    mealsLogged: randInt(18, 28),
    consistencyDays: randInt(4, 7),
  }));

  return {
    id: 'clara-cut',
    name: 'Clara',
    icp: 'cut',
    userProfile: {
      name: 'Clara',
      age: 28,
      height: 165,
      weight: 68,
      sex: 'female',
      goal: 'cut',
      activity: 'actActive',
      trains: true,
      dietaryPreferences: [],
      unitSystem: 'metric',
      targetWeight: 63,
    },
    weightHistory: buildWeightHistory(60, 68.0, 64.2, 0.3),
    nutritionHistory: buildNutritionHistory(
      60,
      target,
      { cal: [1500, 1900], pro: [120, 155], carbs: [140, 200], fats: [40, 70] },
      [3, 4],
      [5, 8],
      [20, 50],
    ),
    realFeelLogs: rfLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    weeklyCheckIns: checkIns,
    dailyMacros: { target },
  };
}

// ── Marcos (Muscle / lean bulk) ─────────────────────────────────────────────

function buildMarcos(): DemoPersona {
  const target = { cal: 2800, pro: 180, carbs: 320, fats: 80 };

  // RealFeel logs — 45 entries over 60 days
  // "dia de entreno": 20 entries level 4-5 energy high
  // "descanso": 12 entries level 2-3 energy stable
  // "sleep 8h+": 8 entries level 4-5
  const rfDays = spreadDays(45, 60);
  let rfId = 1;
  const rfLogs: RFEntry[] = [];

  let entrenoCount = 0;
  let descansoCount = 0;
  let sleepCount = 0;

  for (const dayIdx of rfDays) {
    const isSecondHalf = dayIdx >= 30;
    const baseLevel = isSecondHalf ? randInt(3, 5) : randInt(2, 5);
    const tags: string[] = [];
    let energy: RFEntry['energy'];

    if (entrenoCount < 20 && baseLevel >= 4) {
      tags.push('dia de entreno');
      energy = 'high';
      entrenoCount++;
    } else if (descansoCount < 12 && baseLevel <= 3) {
      tags.push('descanso');
      energy = 'stable';
      descansoCount++;
    } else if (sleepCount < 8 && baseLevel >= 4) {
      tags.push('sleep 8h+');
      energy = 'high';
      sleepCount++;
    } else {
      energy = baseLevel >= 4 ? 'high' : baseLevel <= 2 ? 'low' : 'stable';
    }

    const digestion: RFEntry['digestion'] = pick(['clean', 'clean', 'sensitive']);
    const mindset: RFEntry['mindset'] = baseLevel >= 4 ? 'calm' : 'balanced';

    rfLogs.push({
      id: rfId++,
      date: datetimeAgo(dayIdx, randInt(6, 22)),
      level: baseLevel,
      tags,
      energy,
      digestion,
      mindset,
    });
  }

  // Pad tag pools if needed
  while (entrenoCount < 20) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(0, 30), 9),
      level: pick([4, 5]), tags: ['dia de entreno'], energy: 'high', digestion: 'clean', mindset: 'calm',
    });
    entrenoCount++;
  }
  while (descansoCount < 12) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(0, 59), 20),
      level: pick([2, 3]), tags: ['descanso'], energy: 'stable', digestion: 'clean', mindset: 'balanced',
    });
    descansoCount++;
  }
  while (sleepCount < 8) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(0, 59), 7),
      level: pick([4, 5]), tags: ['sleep 8h+'], energy: 'high', digestion: 'clean', mindset: 'calm',
    });
    sleepCount++;
  }

  const sundays = sundayWeekStarts(8);
  const checkIns: WeeklyCheckInEntry[] = sundays.map((ws, i) => ({
    id: i + 1,
    weekStart: ws,
    workedWell: pick([
      'PR en press de banca — 95 kg',
      'Superavit controlado, sin exceso de grasa',
      'Cinco entrenos completos esta semana',
      'Cumpli ingesta de proteina todos los dias',
    ]),
    whatWasHard: pick([
      'Comer tanto a veces cuesta',
      'Fatiga acumulada del entreno de pierna',
      'Horarios complicados para el gimnasio',
      'Un dia salte la comida por reunion',
    ]),
    focusNextWeek: pick([
      'Probar nueva rutina de hipertrofia',
      'Mejorar descanso pre-entreno',
      'Sumar 100 calorias extra en desayuno',
      'Mejor calentamiento articular',
    ]),
    avgVitality: randInt(60, 85),
    mealsLogged: randInt(25, 35),
    consistencyDays: randInt(5, 7),
  }));

  return {
    id: 'marcos-muscle',
    name: 'Marcos',
    icp: 'muscle',
    userProfile: {
      name: 'Marcos',
      age: 25,
      height: 180,
      weight: 78,
      sex: 'male',
      goal: 'muscle',
      activity: 'actVeryActive',
      trains: true,
      dietaryPreferences: [],
      unitSystem: 'metric',
      targetWeight: 83,
    },
    weightHistory: buildWeightHistory(60, 78.0, 80.5, 0.4),
    nutritionHistory: buildNutritionHistory(
      60,
      target,
      { cal: [2500, 3100], pro: [160, 200], carbs: [280, 360], fats: [60, 100] },
      [4, 5],
      [6, 10],
      [40, 90],
    ),
    realFeelLogs: rfLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    weeklyCheckIns: checkIns,
    dailyMacros: { target },
  };
}

// ── Ana (Health / maintain) ─────────────────────────────────────────────────

function buildAna(): DemoPersona {
  const target = { cal: 2000, pro: 100, carbs: 250, fats: 70 };

  // RealFeel logs — 60 entries (all 60 days)
  // "variedad alta": 25 entries, level 4-5, energy high
  // "sueno 7h+": 20 entries, level 4-5, energy high, mindset calm
  // "digestion limpia": 15 entries, level 3-5, digestion clean
  // "estres trabajo": 10 entries, level 1-3, mindset stressed
  //
  // Design for signal correlations:
  //   - Many energy='high' entries with level 4-5 => detectSignalCorrelations fires
  //   - Many digestion='clean' entries with level 4-5 => clean-digestion insight fires
  //
  // Consistency trend: first half avg ~3.4, second half avg ~4.1 => +0.7

  let rfId = 1;
  const rfLogs: RFEntry[] = [];

  let variedadCount = 0;
  let suenoCount = 0;
  let digestionCount = 0;
  let estresCount = 0;

  for (let dayIdx = 59; dayIdx >= 0; dayIdx--) {
    const isSecondHalf = dayIdx < 30; // dayIdx 0 = today, so days 0-29 are second half
    let baseLevel: number;
    if (isSecondHalf) {
      // Second half: skewed higher (avg ~4.1)
      baseLevel = pick([3, 4, 4, 4, 5, 5]);
    } else {
      // First half: skewed lower (avg ~3.4)
      baseLevel = pick([2, 3, 3, 3, 4, 4]);
    }

    const tags: string[] = [];
    let energy: RFEntry['energy'];
    let digestion: RFEntry['digestion'];
    let mindset: RFEntry['mindset'];

    // Assign tags — some entries get multiple tags
    if (estresCount < 10 && baseLevel <= 3) {
      tags.push('estres trabajo');
      energy = 'low';
      digestion = pick(['sensitive', 'bloated']);
      mindset = 'stressed';
      estresCount++;
    } else if (variedadCount < 25 && baseLevel >= 4) {
      tags.push('variedad alta');
      energy = 'high';
      digestion = 'clean';
      mindset = pick(['calm', 'balanced']);
      variedadCount++;

      // Co-tag with "sueno 7h+" on some high entries
      if (suenoCount < 20 && Math.random() > 0.3) {
        tags.push('sueno 7h+');
        mindset = 'calm';
        suenoCount++;
      }
    } else if (digestionCount < 15 && baseLevel >= 3) {
      tags.push('digestion limpia');
      energy = baseLevel >= 4 ? 'high' : 'stable';
      digestion = 'clean';
      mindset = baseLevel >= 4 ? 'calm' : 'balanced';
      digestionCount++;
    } else {
      energy = baseLevel >= 4 ? 'high' : baseLevel <= 2 ? 'low' : 'stable';
      digestion = baseLevel >= 4 ? 'clean' : 'sensitive';
      mindset = baseLevel >= 4 ? 'calm' : 'balanced';
    }

    rfLogs.push({
      id: rfId++,
      date: datetimeAgo(dayIdx, randInt(7, 21)),
      level: baseLevel,
      tags,
      energy,
      digestion,
      mindset,
    });
  }

  // Pad remaining tag counts
  while (variedadCount < 25) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(0, 29), 12),
      level: pick([4, 5]), tags: ['variedad alta'], energy: 'high', digestion: 'clean', mindset: 'calm',
    });
    variedadCount++;
  }
  while (suenoCount < 20) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(0, 29), 7),
      level: pick([4, 5]), tags: ['sueno 7h+'], energy: 'high', digestion: 'clean', mindset: 'calm',
    });
    suenoCount++;
  }
  while (digestionCount < 15) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(0, 59), 13),
      level: pick([3, 4, 5]), tags: ['digestion limpia'], energy: 'high', digestion: 'clean', mindset: 'balanced',
    });
    digestionCount++;
  }
  while (estresCount < 10) {
    rfLogs.push({
      id: rfId++, date: datetimeAgo(randInt(30, 59), 19),
      level: pick([1, 2, 3]), tags: ['estres trabajo'], energy: 'low', digestion: 'sensitive', mindset: 'stressed',
    });
    estresCount++;
  }

  const sundays = sundayWeekStarts(10);
  const checkIns: WeeklyCheckInEntry[] = sundays.map((ws, i) => ({
    id: i + 1,
    weekStart: ws,
    workedWell: pick([
      'Comi variado — legumbres, pescado, verduras cada dia',
      'Dormi 7+ horas toda la semana',
      'Mantuve rutina de caminar 30 min diarios',
      'Sin episodios de estres relacionados con comida',
      'Probe 3 recetas nuevas esta semana',
    ]),
    whatWasHard: pick([
      'Estres laboral afecto el sueno dos noches',
      'Un dia solo comi 2 veces por falta de tiempo',
      'Hinchazón despues de la cena del viernes',
      'Poca energia el lunes — posible falta de hierro',
    ]),
    focusNextWeek: pick([
      'Incluir mas legumbres y frutos secos',
      'Respetar horario de cena antes de las 21h',
      'Probar meditacion 5 min antes de dormir',
      'Sumar una porcion extra de verduras al almuerzo',
      'Registrar Real Feel justo al levantarme',
    ]),
    avgVitality: randInt(60, 82),
    mealsLogged: randInt(18, 28),
    consistencyDays: randInt(5, 7),
  }));

  return {
    id: 'ana-health',
    name: 'Ana',
    icp: 'health',
    userProfile: {
      name: 'Ana',
      age: 35,
      height: 168,
      weight: 65,
      sex: 'female',
      goal: 'health',
      activity: 'actActive',
      trains: false,
      dietaryPreferences: [],
      unitSystem: 'metric',
    },
    weightHistory: buildWeightHistory(60, 65.0, 65.0, 0.3),
    nutritionHistory: buildNutritionHistory(
      60,
      target,
      { cal: [1800, 2200], pro: [80, 120], carbs: [220, 280], fats: [55, 85] },
      [3, 4],
      [6, 9],
      [15, 45],
    ),
    realFeelLogs: rfLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    weeklyCheckIns: checkIns,
    dailyMacros: { target },
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export const DEMO_PERSONAS: DemoPersona[] = [
  buildClara(),
  buildMarcos(),
  buildAna(),
];

export { buildClara, buildMarcos, buildAna };
