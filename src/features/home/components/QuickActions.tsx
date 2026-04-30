import { Repeat } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import { useI18n } from '../../../i18n';

export default function QuickActions({ yesterdayKcal, yesterdayCount, onRepeatYesterday }: {
  yesterdayKcal: number;
  yesterdayCount: number;
  onRepeatYesterday: () => void;
}) {
  const { t } = useI18n();
  if (yesterdayKcal === 0) return null;

  return (
    <SectionCard padding="none" spacing="none">
      <button
        type="button"
        onClick={onRepeatYesterday}
        className="p-3 flex items-center gap-3 w-full min-h-11 hover:bg-surface-container transition-colors rounded-sm"
      >
        <div className="w-10 h-10 bg-tertiary/10 rounded-full flex items-center justify-center shrink-0">
          <Repeat className="w-4 h-4 text-tertiary" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <span className="text-label font-bold text-tertiary uppercase tracking-widest">{t.home.repeatYesterday}</span>
          <span className="text-micro text-on-surface-variant font-bold block">
            {(t.home.yesterdayMeals as string)?.replace('{kcal}', String(yesterdayKcal)).replace('{count}', String(yesterdayCount))}
          </span>
        </div>
      </button>
    </SectionCard>
  );
}
