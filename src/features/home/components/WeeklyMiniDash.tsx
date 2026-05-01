import { BarChart3, Target, Scale, ChevronRight } from 'lucide-react';
import { useI18n } from '../../../i18n';

export default function WeeklyMiniDash({ calAvg, proteinHitDays, totalDays, weekDelta, onNavigateToProgress }: {
  calAvg: number;
  proteinHitDays: number;
  totalDays: number;
  weekDelta: number | null;
  onNavigateToProgress: () => void;
}) {
  const { t } = useI18n();

  if (totalDays === 0) return null;

  return (
    <button
      type="button"
      onClick={onNavigateToProgress}
      // eslint-disable-next-line no-restricted-syntax -- SectionCard is static <section> with no onClick; this interactive card card replicates the shape intentionally
      className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-sm w-full text-left hover:border-primary/30 hover:bg-surface-container transition-colors group"
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-headline font-black text-body-lg text-tertiary">{calAvg}</span>
          <span className="text-micro font-label font-bold uppercase tracking-widest text-on-surface-variant text-center">{t.home.weeklyCalAvg}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Target className="w-4 h-4 text-brand-secondary" />
          <span className="font-headline font-black text-body-lg text-tertiary">{proteinHitDays}/{totalDays}</span>
          <span className="text-micro font-label font-bold uppercase tracking-widest text-on-surface-variant text-center">{t.home.proteinDaysHit}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Scale className="w-4 h-4 text-on-surface-variant" />
          <span className={`font-headline font-black text-body-lg ${weekDelta !== null ? (weekDelta > 0 ? 'text-brand-secondary' : 'text-primary') : 'text-on-surface-variant'}`}>
            {weekDelta !== null ? `${weekDelta > 0 ? '+' : ''}${weekDelta.toFixed(1)}` : '—'}
          </span>
          <span className="text-micro font-label font-bold uppercase tracking-widest text-on-surface-variant text-center">{t.home.weightDelta}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1 mt-3 pt-2 border-t border-outline-variant/10">
        <span className="text-micro font-semibold uppercase tracking-widest text-primary group-hover:underline">{t.home.viewProgress}</span>
        <ChevronRight className="w-3 h-3 text-primary" />
      </div>
    </button>
  );
}
