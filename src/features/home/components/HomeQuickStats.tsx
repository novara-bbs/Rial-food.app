/**
 * Phase 1 rework — HomeQuickStats chip-row.
 *
 * Renders a horizontally-scrollable row of StatusChip pills (advanced mode only).
 * Hydration chip is omitted — the Hydration SectionCard below already covers it,
 * avoiding duplicate data in the same view.
 */
import { TrendingDown, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useI18n } from '../../../i18n';
import StatusChip from '@/components/ui/StatusChip';

export type QuickStatTarget = 'progress' | 'activity' | 'insights';

interface HomeQuickStatsProps {
  mode: 'simple' | 'advanced';
  weightDelta?: { value: number; unit: 'kg' | 'lb'; since: 'week' | 'month' };
  activityToday?: { minutes: number; isTrainingDay: boolean };
  insightCount?: number;
  onNavigate: (target: QuickStatTarget) => void;
}

export default function HomeQuickStats({
  mode,
  weightDelta,
  activityToday,
  insightCount = 0,
  onNavigate,
}: HomeQuickStatsProps) {
  const { t } = useI18n();

  if (mode === 'simple') return null;

  const hasWeight = weightDelta && Number.isFinite(weightDelta.value);
  const hasActivity = activityToday && activityToday.minutes > 0;
  const hasInsights = insightCount > 0;

  if (!hasWeight && !hasActivity && !hasInsights) return null;

  const WeightIcon = hasWeight && weightDelta!.value >= 0 ? TrendingUp : TrendingDown;
  const signed = hasWeight
    ? `${weightDelta!.value > 0 ? '+' : ''}${weightDelta!.value.toFixed(1)} ${weightDelta!.unit}`
    : '';

  return (
    <nav
      aria-label={t.home.quickInsights}
      data-testid="home-quick-stats"
      className="flex flex-nowrap gap-2 overflow-x-auto -mx-6 px-6 snap-x scrollbar-none"
    >
      {hasWeight && (
        <StatusChip
          tone="neutral"
          icon={WeightIcon}
          onClick={() => onNavigate('progress')}
          ariaLabel={`${t.home.quickWeight}: ${signed}`}
        >
          {signed}
        </StatusChip>
      )}
      {hasActivity && (
        <StatusChip
          tone="neutral"
          icon={Activity}
          onClick={() => onNavigate('activity')}
          ariaLabel={`${t.home.quickActivity}: ${activityToday!.minutes} min`}
        >
          {activityToday!.minutes} min
          {activityToday!.isTrainingDay && ` · ${t.home.quickTraining}`}
        </StatusChip>
      )}
      {hasInsights && (
        <StatusChip
          tone="neutral"
          icon={Sparkles}
          onClick={() => onNavigate('insights')}
          ariaLabel={`${insightCount} ${t.home.quickInsights}`}
        >
          {insightCount} {t.home.quickInsights}
        </StatusChip>
      )}
    </nav>
  );
}
