/**
 * Weekly-insights synthesizer — PR 6a.
 *
 * Consumes canonical helpers (`calcWeekMacros`, `calcWeightTrend`,
 * `calcStreaks`, `calcTopMeals`) and emits a narrative-first payload
 * for `WeeklyInsightsCard`. Zero UI concerns here; all copy is
 * interpolation-ready so the component renders via `t.progress.*`.
 *
 * Market reference: Yazio auto-Sunday insight + Noom in-feed weekly recap.
 * The goal is differentiation vs. `WeeklyScoreCard` (raw stats) — this
 * card is the narrative bridge that surfaces EMA trend + streak next to
 * adherence, in one sentence the user reads first.
 */
import type { WeekMacroStats } from './week-stats';
import type { WeightTrend } from './weight-trend';
import type { StreakPair } from './streaks';
import type { TopMeal } from './top-meals';

export type InsightTone = 'positive' | 'neutral' | 'lowdata';

export interface InsightChip {
  id: 'trend' | 'streak' | 'topMeal';
  label: string;
  value: string;
  /** Direction hint for styling. `'up'` renders as ↑ (gain), `'down'` as ↓ (loss). */
  direction?: 'up' | 'down' | 'flat';
}

export interface WeekInsight {
  tone: InsightTone;
  headline: string;
  chips: InsightChip[];
}

export interface InsightCopy {
  /** "Buena semana, {{name}}. Vas en la dirección correcta." */
  positive?: string;
  /** "Semana constante, {{name}}. Mantén el ritmo." */
  neutral?: string;
  /** "Poca data esta semana. Regístrate unos días para ver tu tendencia." */
  lowData?: string;
  /** "Poca data esta semana, {{name}}. Regístrate unos días…" */
  lowDataWithName?: string;
  trendLabel?: string;   // "TENDENCIA" / "TREND"
  streakLabel?: string;  // "RACHA" / "STREAK"
  topMealLabel?: string; // "COMIDA TOP" / "TOP MEAL"
}

export interface BuildWeekInsightArgs {
  weekStats: WeekMacroStats;
  trend: WeightTrend;
  mealStreak: StreakPair;
  topMeal: TopMeal | null;
  userName?: string;
  /** Optional: `'loss' | 'gain' | 'maintain'` from `userProfile.goalType`. Drives tone mapping. */
  goalType?: 'loss' | 'gain' | 'maintain';
  copy: InsightCopy;
  /**
   * Localized formatter for numbers + unit. Caller passes
   * `(kg, absDelta) => `${absDelta.toFixed(1)} kg`` so the util stays
   * unit-system agnostic.
   */
  formatWeightDelta: (deltaKg: number) => string;
}

const MIN_DAYS_FOR_INSIGHT = 3;
const ADHERENCE_POSITIVE_THRESHOLD = 70;

function interp(template: string | undefined, vars: Record<string, string>): string {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_m, k) => vars[k] ?? '');
}

function truncate(s: string, n: number = 22): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

/**
 * Map (goalType, emaDelta) → whether the trend direction is *desired*.
 * - `loss` + delta < 0   → desired
 * - `gain` + delta > 0   → desired
 * - `maintain` + |delta| < 0.2 → desired
 * - unknown → never (adherence is the only path to `positive` in that branch,
 *   so an ambiguous +0.5 kg/week drift doesn't render as "Good week").
 */
function trendMatchesGoal(deltaKg: number, goalType: BuildWeekInsightArgs['goalType']): boolean {
  if (goalType === 'loss') return deltaKg < 0;
  if (goalType === 'gain') return deltaKg > 0;
  if (goalType === 'maintain') return Math.abs(deltaKg) < 0.2;
  return false;
}

export function buildWeekInsight(args: BuildWeekInsightArgs): WeekInsight {
  const { weekStats, trend, mealStreak, topMeal, userName, goalType, copy, formatWeightDelta } = args;

  // ─── Low-data branch ──────────────────────────────────────────────────────
  if (weekStats.daysLogged < MIN_DAYS_FOR_INSIGHT) {
    const headline = userName && copy.lowDataWithName
      ? interp(copy.lowDataWithName, { name: userName })
      : (copy.lowData || '');
    return { tone: 'lowdata', headline, chips: [] };
  }

  // ─── Tone decision ────────────────────────────────────────────────────────
  const adherencePct = Math.min(
    weekStats.adherence.cal || 0,
    weekStats.adherence.pro || 0,
  );
  const emaDelta = trend.emaWeekDelta;
  const trendAligned = emaDelta !== null && trendMatchesGoal(emaDelta, goalType);
  const adherenceStrong = adherencePct >= ADHERENCE_POSITIVE_THRESHOLD;
  const tone: InsightTone = (trendAligned || adherenceStrong) ? 'positive' : 'neutral';

  const template = tone === 'positive' ? copy.positive : copy.neutral;
  const headline = interp(template || '', { name: userName || '' });

  // ─── Chips ────────────────────────────────────────────────────────────────
  const chips: InsightChip[] = [];

  if (emaDelta !== null) {
    const abs = Math.abs(emaDelta);
    const direction: InsightChip['direction'] =
      emaDelta > 0.05 ? 'up' : emaDelta < -0.05 ? 'down' : 'flat';
    chips.push({
      id: 'trend',
      label: copy.trendLabel || 'TREND',
      value: formatWeightDelta(abs),
      direction,
    });
  }

  const currentStreak = mealStreak?.current ?? 0;
  if (currentStreak > 0) {
    chips.push({
      id: 'streak',
      label: copy.streakLabel || 'STREAK',
      value: String(currentStreak),
    });
  }

  if (topMeal && topMeal.count > 0) {
    chips.push({
      id: 'topMeal',
      label: copy.topMealLabel || 'TOP',
      value: truncate(topMeal.name, 22),
    });
  }

  return { tone, headline, chips };
}
