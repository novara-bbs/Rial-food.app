/**
 * P9 `[1.5.66]` — compact chip showing a food's contextual grade under the
 * user's current goal. Rendered on FamilyCard collapsed headers and next to
 * VariantRow names as a quick visual signal ("this food is good/bad for YOUR
 * goal, not in the abstract").
 *
 * Larger panel with all 3 goals lives in `ContextualScorePanel.tsx`.
 */
import type { FoodVariant } from '../../../types/food-family';
import {
  computeContextualScore,
  gradeColorClass,
  type Goal,
} from '../utils/contextual-score';
import { useI18n } from '../../../i18n';

interface Props {
  variant: FoodVariant;
  goal: Goal;
  /** Optional size variant. `sm` shows just the letter; `md` adds the goal label. */
  size?: 'sm' | 'md';
}

export default function ContextualScoreChip({ variant, goal, size = 'sm' }: Props) {
  const { t } = useI18n();
  const score = computeContextualScore(variant, goal);
  const colorClass = gradeColorClass(score.grade);
  const goalLabels = t.contextualScore.goalLabels as Record<string, string>;
  const rationales = t.contextualScore.rationales as Record<string, string>;
  const rationaleLabel = rationales[score.rationale] ?? score.rationale;

  const title = `${rationaleLabel} · ${goalLabels[goal]}`;

  return (
    <span
      data-contextual-score={score.grade}
      data-goal={goal}
      title={title}
      className={`inline-flex items-center justify-center gap-1 rounded-sm font-headline font-bold ${colorClass} ${
        size === 'md' ? 'text-caption px-1.5 py-0.5' : 'text-micro w-5 h-5'
      }`}
    >
      <span>{score.grade}</span>
      {size === 'md' && (
        <span className="text-micro font-label uppercase tracking-widest">
          {goalLabels[goal]}
        </span>
      )}
    </span>
  );
}
