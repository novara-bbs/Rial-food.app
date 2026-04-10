import { Repeat } from 'lucide-react';
import { useI18n } from '../../../i18n';

export default function QuickActions({ yesterdayKcal, yesterdayCount, onRepeatYesterday }: {
  yesterdayKcal: number;
  yesterdayCount: number;
  onRepeatYesterday: () => void;
}) {
  const { t } = useI18n();
  if (yesterdayKcal === 0) return null;

  return (
    <button
      onClick={onRepeatYesterday}
      className="bg-surface-container-low border border-outline-variant/20 p-3 rounded-sm flex items-center gap-3 w-full hover:border-primary/30 transition-colors"
    >
      <div className="w-9 h-9 bg-tertiary/10 rounded-full flex items-center justify-center shrink-0">
        <Repeat className="w-4 h-4 text-tertiary" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <span className="text-xs font-bold text-tertiary uppercase tracking-widest">{t.home.repeatYesterday}</span>
        <span className="text-[10px] text-on-surface-variant font-bold block">
          {(t.home.yesterdayMeals as string)?.replace('{kcal}', String(yesterdayKcal)).replace('{count}', String(yesterdayCount))}
        </span>
      </div>
    </button>
  );
}
