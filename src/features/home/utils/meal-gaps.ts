/**
 * P11 `[1.5.69]` — «Qué me falta hoy» gap computation.
 *
 * Rationale: the Home screen needs a tight, actionable signal of what the
 * user is **missing today** to hit their target, not just the absolute
 * consumed vs target bar. This util is a pure function over the two shapes
 * already in state (DailyMacros.consumed + DailyMacros.target). Returns a
 * set of gaps per macro + the single biggest deficit — the downstream
 * recommender ranks foods against that deficit.
 *
 * Intentionally ignores any macro whose target is zero or missing (user
 * hasn't finished onboarding yet). Also ignores surpluses — recommending
 * more protein when the user is already over target is counterproductive.
 *
 * Pure function. No side effects. No locale. Fully testable in isolation.
 */

export type MacroKey = 'cal' | 'pro' | 'carbs' | 'fats';

export const MACRO_KEYS: readonly MacroKey[] = ['cal', 'pro', 'carbs', 'fats'] as const;

export interface ConsumedTarget {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

export interface MacroGap {
  /** Negative when in deficit, positive when over target, 0 when on target. */
  delta: number;
  /** Absolute deficit (clamped to 0 when over target). Useful for UI copy. */
  deficit: number;
  /** Fractional progress 0-1. 1 = on target, >1 = over target. */
  progress: number;
  consumed: number;
  target: number;
}

export type MealGaps = Record<MacroKey, MacroGap>;

/**
 * Returns per-macro gaps. Handles zero targets (returns `deficit: 0` and
 * `progress: 0`, never NaN) so the UI can safely render without guards.
 */
export function computeMealGaps(dm: ConsumedTarget): MealGaps {
  const out = {} as MealGaps;
  for (const key of MACRO_KEYS) {
    const consumed = Number(dm.consumed[key]) || 0;
    const target = Number(dm.target[key]) || 0;
    const delta = consumed - target;
    const deficit = delta < 0 ? -delta : 0;
    const progress = target > 0 ? consumed / target : 0;
    out[key] = { delta, deficit, progress, consumed, target };
  }
  return out;
}

/**
 * Picks the single most relevant macro deficit to surface in the UI.
 * Ranking prioritises:
 *   1. Protein deficit (if > 10 % of target) — usually the hardest to hit.
 *   2. Calorie deficit (if > 15 % of target) — most broadly meaningful.
 *   3. Carbs deficit (if > 20 % of target).
 *   4. Fats deficit (rarely a deficit target, but included).
 * Returns `null` when there's no meaningful gap (all macros within 10-20 %
 * of target) — the UI should then render a "all good, keep going" state.
 *
 * The thresholds are intentionally lax for calorie/carb/fat to avoid being
 * noisy in the late afternoon when the user has half the day left to log.
 */
export function biggestDeficit(
  gaps: MealGaps,
): { key: MacroKey; gap: MacroGap } | null {
  const PROTEIN_THRESHOLD = 0.10;
  const CAL_THRESHOLD = 0.15;
  const CARBS_THRESHOLD = 0.20;
  const FATS_THRESHOLD = 0.20;

  const order: Array<{ key: MacroKey; threshold: number }> = [
    { key: 'pro', threshold: PROTEIN_THRESHOLD },
    { key: 'cal', threshold: CAL_THRESHOLD },
    { key: 'carbs', threshold: CARBS_THRESHOLD },
    { key: 'fats', threshold: FATS_THRESHOLD },
  ];

  for (const { key, threshold } of order) {
    const g = gaps[key];
    if (g.target <= 0) continue;
    const relativeDeficit = g.deficit / g.target;
    if (relativeDeficit >= threshold) {
      return { key, gap: g };
    }
  }

  return null;
}

/**
 * Time-of-day hint used by the food ranker to filter `suitableFor[]`.
 * Returns a `MealSlot` matching the app's canonical slots. The breakpoints
 * are intentionally forgiving so a 10:30 snack still suggests breakfast
 * foods, and a 16:30 snack doesn't yet push dinner.
 */
export type MealSlotGuess = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function guessMealSlotForTime(now: Date = new Date()): MealSlotGuess {
  const h = now.getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 19) return 'snack';
  return 'dinner';
}
