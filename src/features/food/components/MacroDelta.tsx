/**
 * Renders the signed macro delta of a variant against its family's canonical
 * reference as a compact "+45 kcal · +8.5g pro · ±0 carb · −0.3g fat" string.
 *
 * Rendering rules:
 *   - positive delta prefixed with "+"
 *   - negative delta prefixed with "−" (U+2212 MINUS SIGN, not ASCII hyphen)
 *   - zero delta rendered as "±0" to distinguish from "no data"
 *   - rounded to 1 decimal via the resolver helper (so input is already rounded)
 *
 * The delta direction is neutral at this primitive — callers wrap in their
 * own color if they want to map signs to user-goal semantics (e.g. higher
 * protein = `text-primary` for a muscle-building user). Keeping the primitive
 * purely mechanical prevents goal-taxonomy leakage into the dictionary UI.
 */
import type { MacroDelta as MacroDeltaValue } from '../../../types/food-family';
import { useI18n } from '../../../i18n';

interface Props {
  delta: MacroDeltaValue | null;
  className?: string;
}

function formatDelta(value: number, unit: string): string {
  if (value === 0) return `±0${unit}`;
  if (value > 0) return `+${value}${unit}`;
  // U+2212 for visual parity with `+`, not ASCII "-"
  return `−${Math.abs(value)}${unit}`;
}

export default function MacroDelta({ delta, className }: Props) {
  const { t } = useI18n();
  if (!delta) return null;
  const parts = [
    formatDelta(delta.calories, ` ${t.common.kcal}`),
    formatDelta(delta.protein, `g ${t.portionSelector.protein}`),
    formatDelta(delta.carbs, `g ${t.portionSelector.carbs}`),
    formatDelta(delta.fats, `g ${t.portionSelector.fats}`),
  ];
  return (
    <span
      className={
        'text-micro font-label tracking-wide text-on-surface-variant ' + (className ?? '')
      }
    >
      {parts.join(' · ')}
    </span>
  );
}
