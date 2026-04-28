import { useI18n } from '../../../../i18n';

interface MacroBar {
  consumed: number;
  target: number;
}

interface AddMealMacroBarProps {
  remainingCal: number;
  calPct: number;
  proPct: number;
  carbsPct: number;
  protein: MacroBar;
  carbs: MacroBar;
}

/**
 * Compact daily macro progress summary shown at the top of AddMeal.
 * Displays remaining calories + protein/carb progress bars.
 * Pure display — no callbacks, no side-effects.
 */
export default function AddMealMacroBar({
  remainingCal,
  calPct,
  proPct,
  carbsPct,
  protein,
  carbs,
}: AddMealMacroBarProps) {
  const { t } = useI18n();

  return (
    <section className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="font-label text-micro tracking-widest text-on-surface-variant uppercase">
            {t.home.dailyProgress}
          </p>
          <span className="font-headline text-display text-primary">{remainingCal}</span>
          <span className="font-label text-micro tracking-widest text-on-surface-variant uppercase ml-1">
            {t.common.kcal} {t.home.remaining}
          </span>
        </div>
        <div className="text-right">
          <p className="font-label text-micro text-on-surface-variant uppercase tracking-widest">
            {calPct}% {t.home.consumed}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-micro font-label font-bold tracking-widest uppercase mb-1 text-on-surface-variant">
            <span>{t.portionSelector.protein}</span>
            <span>{Math.max(0, protein.target - protein.consumed)}g</span>
          </div>
          <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${proPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-micro font-label font-bold tracking-widest uppercase mb-1 text-on-surface-variant">
            <span>{t.portionSelector.carbs}</span>
            <span>{Math.max(0, carbs.target - carbs.consumed)}g</span>
          </div>
          <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-brand-secondary rounded-full transition-all duration-700" style={{ width: `${carbsPct}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
