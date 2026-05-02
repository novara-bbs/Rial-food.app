/**
 * MacroProgressRow — horizontal progress row for a single macro.
 *
 * Layout (post-1.5.188 owner reference image — Lean AI / Nutrio 2026):
 *   ┌───────────┬──────────────────────────────────┐
 *   │ Label     │                       abs/target │  ← row top
 *   │ %         │ [████████░░░░░░░░░░░░░░░░░░░░░░] │  ← row bottom
 *   └───────────┴──────────────────────────────────┘
 *
 * - Label muted regular (data context, not protagonist).
 * - % bold prominent (the visual hierarchy lead — "how much of my goal").
 * - abs/target right-aligned (reads with the bar end).
 * - Bar fills the right column, full width within it.
 *
 * Used by NutritionHeroRing (Home advanced) and NutritionDetail.
 *
 * Token-pure: macro color comes from `--color-macro-{key}` resolved by
 * the caller via the `colorClassName` prop (`bg-macro-protein`, etc.).
 */
import { Text } from '../../../components/ui/Typography';

export interface MacroProgressRowProps {
  label: string;
  consumed: number;
  target: number;
  /** Tailwind class for the filled bar — e.g. `bg-macro-protein`. */
  colorClassName: string;
  /** Unit suffix for absolute values (default `g`). */
  unit?: string;
  /** Show percentage prefix (default `true`). */
  showPercent?: boolean;
  /** Bar height — `sm` = h-3 (12px) for compact rows, `md` = h-4 (16px) for detail. */
  barHeight?: 'sm' | 'md';
  testId?: string;
}

export default function MacroProgressRow({
  label,
  consumed,
  target,
  colorClassName,
  unit = 'g',
  showPercent = true,
  barHeight = 'sm',
  testId,
}: MacroProgressRowProps) {
  const pct = target > 0 ? Math.round((Math.max(0, consumed) / target) * 100) : 0;
  const fillWidth = Math.min(pct, 100);
  const heightClass = barHeight === 'md' ? 'h-4' : 'h-3';

  return (
    <div className="flex items-stretch gap-4" data-testid={testId}>
      {/* Left column: label (muted) + % (prominent) stacked */}
      <div className="flex flex-col w-16 shrink-0">
        <Text variant="body-sm" className="font-body text-on-surface-variant leading-tight">
          {label}
        </Text>
        {showPercent && (
          <span className="font-headline text-title-sm font-bold text-on-surface tabular-nums leading-tight mt-0.5">
            {pct}%
          </span>
        )}
      </div>
      {/* Right column: abs (top, right-aligned) + bar (bottom, full width) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <Text
          variant="body-sm"
          className="font-body font-medium tabular-nums text-on-surface-variant text-right leading-tight"
        >
          {Math.round(consumed * 10) / 10}/{Math.round(target)}{unit}
        </Text>
        <div className={`${heightClass} bg-surface-container-highest rounded-full overflow-hidden`}>
          <div
            className={`h-full ${colorClassName} rounded-full transition-all duration-700`}
            style={{ width: `${fillWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
