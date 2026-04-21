/**
 * P9 `[1.5.66]` — compact chip showing a food's contextual grade under the
 * user's current goal. Rendered on FamilyCard collapsed headers and next to
 * VariantRow names as a quick visual signal ("this food is good/bad for YOUR
 * goal, not in the abstract").
 *
 * Post-P10 audit fix (2026-04-21): converted from a `<span>` with `title`
 * attribute to a real `<button>` with an optional tap-to-explain Dialog,
 * because `title` does NOT render on iOS — mobile users never saw the
 * rationale. The `size="sm"` variant keeps the 20×20 visual footprint but
 * upgrades to a 44×44 actionable tap target (centered inside an invisible
 * wrapper) to meet HIG.
 *
 * Larger panel with all 3 goals lives in `ContextualScorePanel.tsx`.
 */
import { useState } from 'react';
import type { FoodVariant } from '../../../types/food-family';
import {
  computeContextualScore,
  gradeColorClass,
  type Goal,
} from '../utils/contextual-score';
import { useI18n } from '../../../i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  variant: FoodVariant;
  goal: Goal;
  /**
   * Visual footprint. `sm` = compact 20×20 letter (wrapped in 44×44 tap area).
   * `md` = inline letter + goal label.
   */
  size?: 'sm' | 'md';
  /**
   * When `true` (default), tapping the chip opens a small Dialog with the
   * rationale + caveats. Set to `false` when the chip is embedded inside a
   * larger tappable row (e.g. VariantRow) and the row already handles the
   * tap intent — avoids double-nested buttons.
   */
  interactive?: boolean;
}

export default function ContextualScoreChip({
  variant,
  goal,
  size = 'sm',
  interactive = true,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const score = computeContextualScore(variant, goal);
  const colorClass = gradeColorClass(score.grade);
  const goalLabels = t.contextualScore.goalLabels as Record<string, string>;
  const rationales = t.contextualScore.rationales as Record<string, string>;
  const caveats = t.contextualScore.caveats as Record<string, string>;
  const rationaleLabel = rationales[score.rationale] ?? score.rationale;
  const goalLabel = goalLabels[goal];
  const ariaLabel = `${goalLabel}: ${score.grade} — ${rationaleLabel}`;

  const chip = (
    <span
      data-contextual-score={score.grade}
      data-goal={goal}
      className={`inline-flex items-center justify-center gap-1 rounded-sm font-headline font-bold ${colorClass} ${
        size === 'md' ? 'text-caption px-1.5 py-0.5' : 'text-micro w-5 h-5'
      }`}
    >
      <span>{score.grade}</span>
      {size === 'md' && (
        <span className="text-micro font-label uppercase tracking-widest">
          {goalLabel}
        </span>
      )}
    </span>
  );

  if (!interactive) {
    // Read-only badge — tap intent handled by the surrounding row.
    return chip;
  }

  return (
    <>
      <button
        type="button"
        onClick={e => {
          // Don't bubble to a surrounding tappable surface (FamilyCard toggle,
          // FoodDetail row). The chip opens its own detail.
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`${ariaLabel} · ${t.contextualScore.tapForDetails}`}
        className={
          size === 'sm'
            // 44×44 invisible tap area around the 20×20 visual for HIG compliance.
            ? 'inline-flex items-center justify-center w-11 h-11 -m-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            : 'inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        }
      >
        {chip}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {goalLabel} · {score.grade}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-body text-on-surface leading-relaxed">
              {rationaleLabel}
            </p>
            {score.caveats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {score.caveats.map(c => (
                  <span
                    key={c}
                    className="text-caption text-on-surface-variant bg-surface-container-high rounded-full px-2.5 py-1"
                  >
                    {caveats[c] ?? c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
