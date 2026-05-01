/**
 * Defensive helpers for reducing over `dailyLog` entries.
 *
 * Sprint [1.5.175]. Local-storage data can drift from the canonical
 * `DailyLogEntry` shape after onboarding rework, schema migrations, or
 * sync glitches. A single malformed entry (`macros` undefined or non-numeric)
 * was enough to crash the home via `dailyLog.reduce((s, e) => s + e.macros.cal, 0)`
 * → `.toFixed()` on `NaN`. These helpers coerce to safe numbers and skip
 * non-finite values so the diary totals always render.
 */
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

export type MacroKey = 'cal' | 'pro' | 'carbs' | 'fats';

interface MacroSum {
  cal: number;
  pro: number;
  carbs: number;
  fats: number;
}

/** Read a single macro value as a finite number, defaulting to 0. */
export function safeMacroValue(entry: Pick<DailyLogEntry, 'macros'> | null | undefined, key: MacroKey): number {
  const raw = entry?.macros?.[key];
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Sum macros across entries with NaN/undefined coercion. */
export function safeSumMacros(entries: readonly DailyLogEntry[] | null | undefined): MacroSum {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { cal: 0, pro: 0, carbs: 0, fats: 0 };
  }
  return entries.reduce<MacroSum>(
    (sum, e) => ({
      cal: sum.cal + safeMacroValue(e, 'cal'),
      pro: sum.pro + safeMacroValue(e, 'pro'),
      carbs: sum.carbs + safeMacroValue(e, 'carbs'),
      fats: sum.fats + safeMacroValue(e, 'fats'),
    }),
    { cal: 0, pro: 0, carbs: 0, fats: 0 },
  );
}
