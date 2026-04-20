/**
 * P9 `[1.5.66]` — 3-lens contextual score panel.
 *
 * Rendered on `FoodDetail` to show the food's grade under ALL 3 goals side by
 * side (perder / mantener / ganar). Highlights the user's active goal so they
 * see "for me right now" first. Educates by making explicit that the same
 * food is valued differently depending on the objective.
 */
import type { FoodVariant } from '../../../types/food-family';
import {
  GOALS,
  computeContextualScore,
  gradeColorClass,
  type Goal,
} from '../utils/contextual-score';
import { useI18n } from '../../../i18n';

interface Props {
  variant: FoodVariant;
  /** The user's active goal. Highlighted visually. `null` = no highlight. */
  activeGoal: Goal | null;
}

export default function ContextualScorePanel({ variant, activeGoal }: Props) {
  const { t } = useI18n();
  const goalLabels = t.contextualScore.goalLabels as Record<string, string>;
  const rationales = t.contextualScore.rationales as Record<string, string>;
  const caveats = t.contextualScore.caveats as Record<string, string>;

  return (
    <div
      data-contextual-score-panel
      role="group"
      aria-label={t.contextualScore.whichGoalIsBetter}
      className="grid grid-cols-3 gap-2"
    >
      {GOALS.map((goal: Goal) => {
        const score = computeContextualScore(variant, goal);
        const isActive = goal === activeGoal;
        const color = gradeColorClass(score.grade);
        return (
          <div
            key={goal}
            data-goal={goal}
            data-active={isActive}
            className={`flex flex-col items-center gap-1 p-2 rounded-sm border ${
              isActive
                ? 'border-primary/60 ring-1 ring-primary/40 bg-primary/5'
                : 'border-outline-variant/20 bg-surface-container-low'
            }`}
          >
            <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
              {goalLabels[goal]}
            </span>
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-sm font-headline font-bold text-title-sm ${color}`}
            >
              {score.grade}
            </span>
            <span className="text-caption text-on-surface text-center leading-snug">
              {rationales[score.rationale] ?? score.rationale}
            </span>
            {score.caveats.length > 0 && (
              <span className="mt-0.5 flex flex-wrap justify-center gap-1">
                {score.caveats.map(c => (
                  <span
                    key={c}
                    className="text-micro font-label text-on-surface-variant bg-surface-container-high rounded-full px-1.5 py-0.5"
                  >
                    {caveats[c] ?? c}
                  </span>
                ))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
