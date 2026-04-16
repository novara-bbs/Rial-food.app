/**
 * Demo Rial — 30-day timeline seed.
 *
 * Persona: Clara, 29, Cut (ICP #2). 72.4 kg → 69.1 kg over 30 days.
 * Target: 65 kg. Macros: 1850 cal · 150 P · 180 C · 55 F.
 *
 * Produces deterministic output — the noise terms are derived from the
 * day index, not Math.random(), so re-seeding is idempotent and diffable.
 *
 * Emits:
 *  - 30 DailyArchive entries (days -30 … -1)
 *  - 6 BodySnapshot entries across the month
 *  - ~50 realFeelLogs (1–3 per day, irregular)
 *  - 4 WeeklyCheckInEntry (Sundays)
 */
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { BodySnapshot, WeeklyCheckInEntry } from '../../../types/wellness';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

export interface RealFeelLog {
  id: number;
  date: string;
  level: number;      // 1–5
  note?: string;
}

export interface DemoTimeline {
  history: DailyArchive[];
  snapshots: BodySnapshot[];
  realFeelLogs: RealFeelLog[];
  weeklyCheckIns: WeeklyCheckInEntry[];
}

// Clara's targets — kept exported for the today-seed + handlers.
export const CLARA_MACROS_TARGET = { cal: 1850, pro: 150, carbs: 180, fats: 55 };
export const CLARA_START_KG = 72.4;
export const CLARA_END_KG = 69.1;
export const CLARA_TARGET_KG = 65;

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function svgPhotoPlaceholder(hue: number, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="hsl(${hue},55%,65%)"/>
        <stop offset="1" stop-color="hsl(${(hue + 30) % 360},55%,35%)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#g)"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.85)">${label}</text>
  </svg>`;
  const encoded = typeof window !== 'undefined' && window.btoa
    ? window.btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

/** Macro noise by day bucket — encodes the storyline documented in the plan. */
function dayMacros(dayIndex: number): DailyArchive['macros']['consumed'] {
  const t = CLARA_MACROS_TARGET;
  const i = dayIndex;

  // Day 0 (no-log gap), days -30..-24 strict, -23..-17 stable (one low day),
  // -16..-14 cheat weekend, -13..-7 recovery/strict, -6..-1 plateau (one gap day).
  const sin = Math.sin(i * 1.3);
  const cos = Math.cos(i * 0.7);

  // Base calories = target minus a small deficit (≈ -100 cal typical).
  let cal = t.cal - 80 + sin * 60;
  let pro = t.pro + cos * 8;
  let carbs = t.carbs + sin * 15;
  let fats = t.fats + cos * 4;

  // Cheat weekend (days 14–16 back → i = 14,15,16)
  if (i >= 14 && i <= 16) {
    cal += 380 + (i === 15 ? 120 : 0);
    carbs += 60;
    fats += 18;
    if (i === 15) pro -= 25;
  }

  // Low-energy day (i = 20): skipped breakfast, protein low
  if (i === 20) {
    cal -= 320;
    pro -= 35;
  }

  // Plateau "skip day" (i = 3) — mealCount becomes 0; callers zero out macros
  if (i === 3) return { cal: 0, pro: 0, carbs: 0, fats: 0 };

  // First hard week: very tight adherence
  if (i >= 24) {
    cal = t.cal - 50 + sin * 30;
    pro = t.pro + 5 + Math.abs(cos) * 5;
  }

  return {
    cal: Math.round(cal),
    pro: Math.round(pro),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
  };
}

function dayHydration(dayIndex: number): number {
  const base = 8;
  const sin = Math.sin(dayIndex * 0.9);
  // Cheat weekend dips
  const dip = dayIndex >= 14 && dayIndex <= 16 ? -2 : 0;
  // Low-energy day dips more
  const low = dayIndex === 20 ? -3 : 0;
  // Skip day -> 0
  if (dayIndex === 3) return 0;
  return Math.max(0, Math.min(10, Math.round(base + sin + dip + low)));
}

function dayMovement(dayIndex: number): number {
  const base = 38;
  const sin = Math.sin(dayIndex * 1.1);
  const cos = Math.cos(dayIndex * 0.5);
  const extra = dayIndex >= 8 && dayIndex <= 12 ? 20 : 0;  // extra trainings week
  const dip = dayIndex >= 14 && dayIndex <= 16 ? -15 : 0;  // cheat weekend
  const low = dayIndex === 20 ? -25 : 0;
  if (dayIndex === 3) return 0;
  return Math.max(0, Math.round(base + sin * 8 + cos * 4 + extra + dip + low));
}

function dayWeight(dayIndex: number): number {
  // Linear trend 72.4 → 69.1 with plausible daily noise, cheat bump, plateau flat
  const progress = (30 - dayIndex) / 30;
  const linear = CLARA_START_KG - (CLARA_START_KG - CLARA_END_KG) * progress;
  const noise = Math.sin(dayIndex * 1.7) * 0.25 + Math.cos(dayIndex * 0.9) * 0.15;
  const cheatBump = dayIndex >= 14 && dayIndex <= 16 ? 0.6 : 0;
  const plateauFlat = dayIndex >= 1 && dayIndex <= 6 ? -0.2 : 0;
  return +(linear + noise + cheatBump + plateauFlat).toFixed(1);
}

const REAL_FEEL_NOTES = [
  'Buen día, energía alta',
  'Tarde más cansada',
  'Post-entreno, motivada',
  'Mañana pesada',
  'Hambre controlada',
  'Cabeza clara',
  'Plano, pero ok',
  'Baja motivación',
  'Durmí mal',
  'Super recuperada',
];

function dayRealFeelLevel(dayIndex: number): number {
  // Scale 1..5; map storyline
  if (dayIndex === 20) return 2;            // low day
  if (dayIndex >= 14 && dayIndex <= 16) return 3;  // cheat weekend sluggish
  if (dayIndex >= 8 && dayIndex <= 12) return 5;   // strong week
  if (dayIndex <= 5) return 4;                     // plateau stable
  return 4;
}

function buildDailyLog(dayIndex: number, macros: DailyArchive['macros']['consumed']): DailyLogEntry[] {
  if (dayIndex === 3 || macros.cal === 0) return [];
  // Generic 3-meal-day log that roughly matches the macros bucket
  const breakfastCal = Math.round(macros.cal * 0.25);
  const lunchCal = Math.round(macros.cal * 0.4);
  const dinnerCal = macros.cal - breakfastCal - lunchCal;
  return [
    {
      id: Date.now() + dayIndex * 1000 + 1,
      title: 'Avena con fruta',
      portionDescription: '1 bowl',
      mealSlot: 'breakfast',
      time: '08:15',
      macros: {
        cal: breakfastCal,
        pro: Math.round(macros.pro * 0.25),
        carbs: Math.round(macros.carbs * 0.35),
        fats: Math.round(macros.fats * 0.2),
      },
    },
    {
      id: Date.now() + dayIndex * 1000 + 2,
      title: 'Pollo + arroz + verduras',
      portionDescription: '1 plato',
      mealSlot: 'lunch',
      time: '13:45',
      macros: {
        cal: lunchCal,
        pro: Math.round(macros.pro * 0.45),
        carbs: Math.round(macros.carbs * 0.4),
        fats: Math.round(macros.fats * 0.4),
      },
    },
    {
      id: Date.now() + dayIndex * 1000 + 3,
      title: 'Salmón + ensalada',
      portionDescription: '1 filete',
      mealSlot: 'dinner',
      time: '20:30',
      macros: {
        cal: dinnerCal,
        pro: Math.round(macros.pro * 0.3),
        carbs: Math.round(macros.carbs * 0.25),
        fats: Math.round(macros.fats * 0.4),
      },
    },
  ];
}

const SNAPSHOT_DAYS = [30, 21, 14, 7, 3, 0] as const;
const SNAPSHOT_NOTES: Record<number, string> = {
  30: 'Empezando. 72.4 kg — vamos a por ello',
  21: 'Tercera semana. Se nota la ropa más suelta',
  14: 'Post-cheat weekend, retengo líquidos pero ok',
  7: 'Última semana dura, -3 kg acumulados',
  3: 'Plateau, pero estable',
  0: 'Hoy 69.1 kg. 3.3 kg menos. Queda el camino 🙂',
};

function buildWeeklyCheckIns(realFeelLogs: RealFeelLog[], history: DailyArchive[]): WeeklyCheckInEntry[] {
  // Anchor four Sundays across the 30 days: i = 27, 20, 13, 6 (roughly weekly)
  const anchors: Array<{ i: number; workedWell: string; whatWasHard: string; focusNextWeek: string }> = [
    {
      i: 27,
      workedWell: 'Empecé con orden. Cenas ligeras y caminatas largas.',
      whatWasHard: 'Aguantar sin picar a media tarde.',
      focusNextWeek: 'Preparar snacks altos en proteína el domingo.',
    },
    {
      i: 20,
      workedWell: 'Protein hit 5/7 días, entrenos respetados.',
      whatWasHard: 'Un día bajé la guardia con el sueño → menos energía.',
      focusNextWeek: 'Cortar pantallas a las 23h para dormir mejor.',
    },
    {
      i: 13,
      workedWell: 'Recuperé después del finde libre, balance realista.',
      whatWasHard: 'Comer fuera dos veces, difícil controlar aceites.',
      focusNextWeek: 'Pedir salsas aparte siempre.',
    },
    {
      i: 6,
      workedWell: 'Semana más limpia del mes: macros verdes 6/7.',
      whatWasHard: 'Plateau emocional — la báscula no bajó tanto.',
      focusNextWeek: 'Medir cintura en vez de obsesionarme con kg.',
    },
  ];

  return anchors.map((a, idx) => {
    const weekStart = dateNDaysAgo(a.i);
    const weekEnd = dateNDaysAgo(Math.max(0, a.i - 6));
    // avg vitality across the week
    const weekLogs = realFeelLogs.filter(l => l.date >= weekStart && l.date <= weekEnd);
    const avgVitality = weekLogs.length > 0
      ? Math.round((weekLogs.reduce((s, l) => s + l.level, 0) / weekLogs.length) * 20)
      : 75;
    const weekDays = history.filter(h => h.date >= weekStart && h.date <= weekEnd);
    const mealsLogged = weekDays.reduce((s, d) => s + d.mealCount, 0);
    const consistencyDays = weekDays.filter(d => d.mealCount > 0).length;
    return {
      id: 1000 + idx,
      weekStart,
      workedWell: a.workedWell,
      whatWasHard: a.whatWasHard,
      focusNextWeek: a.focusNextWeek,
      avgVitality,
      mealsLogged,
      consistencyDays,
    };
  });
}

export function buildDemoTimeline(): DemoTimeline {
  const history: DailyArchive[] = [];
  const realFeelLogs: RealFeelLog[] = [];
  let logIdSeed = 1;

  for (let i = 30; i >= 1; i--) {
    const date = dateNDaysAgo(i);
    const consumed = dayMacros(i);
    const archive: DailyArchive = {
      date,
      macros: { consumed, target: CLARA_MACROS_TARGET },
      hydration: dayHydration(i),
      movement: dayMovement(i),
      mealCount: consumed.cal === 0 ? 0 : 3,
      dailyLog: buildDailyLog(i, consumed),
    };
    history.push(archive);

    // Real Feel: 1 entry most days, 2 on strong-week days, 0 on skip day
    if (i === 3) continue;
    realFeelLogs.push({
      id: logIdSeed++,
      date: `${date}T18:00:00.000Z`,
      level: dayRealFeelLevel(i),
      note: REAL_FEEL_NOTES[i % REAL_FEEL_NOTES.length],
    });
    if (i >= 8 && i <= 12) {
      realFeelLogs.push({
        id: logIdSeed++,
        date: `${date}T09:15:00.000Z`,
        level: Math.min(5, dayRealFeelLevel(i) - 1),
        note: 'Mañana',
      });
    }
  }

  const snapshots: BodySnapshot[] = SNAPSHOT_DAYS.map((i, idx) => {
    const date = dateNDaysAgo(i);
    const snap: BodySnapshot = { date, kg: dayWeight(i), note: SNAPSHOT_NOTES[i] };

    // Photos on -21, -7, 0; measurements on -30 and 0
    if (i === 21 || i === 7 || i === 0) {
      snap.photoUrl = svgPhotoPlaceholder((idx * 60) % 360, i === 0 ? 'Hoy' : `Día -${i}`);
    }
    if (i === 30) {
      snap.measurements = { chestCm: 94, waistCm: 78, hipsCm: 100, bodyFatPct: 27.5 };
    }
    if (i === 0) {
      snap.measurements = { chestCm: 91.5, waistCm: 73, hipsCm: 97.5, bodyFatPct: 24.8 };
    }
    return snap;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const weeklyCheckIns = buildWeeklyCheckIns(realFeelLogs, history);

  return { history, snapshots, realFeelLogs, weeklyCheckIns };
}
