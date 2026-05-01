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

  // Narrow optional shapes via destructuring — avoids non-null assertions.
  const weight = weightDelta && Number.isFinite(weightDelta.value) ? weightDelta : null;
  const activity = activityToday && activityToday.minutes > 0 ? activityToday : null;
  const hasWeight = weight !== null;
  const hasActivity = activity !== null;
  const hasInsights = insightCount > 0;

  if (!hasWeight && !hasActivity && !hasInsights) return null;

  const WeightIcon = weight && weight.value >= 0 ? TrendingUp : TrendingDown;
  const signed = weight
    ? `${weight.value > 0 ? '+' : ''}${weight.value.toFixed(1)} ${weight.unit}`
    : '';

  return (
    <nav
      aria-label={t.home.quickInsights}
      data-testid="home-quick-stats"
      className="flex flex-nowrap gap-2 overflow-x-auto -mx-6 px-6 snap-x scrollbar-none"
    >
      {weight && (
        <StatusChip
          tone="neutral"
          icon={WeightIcon}
          onClick={() => onNavigate('progress')}
          ariaLabel={`${t.home.quickWeight}: ${signed}`}
        >
          {signed}
        </StatusChip>
      )}
      {activity && (
        <StatusChip
          tone="neutral"
          icon={Activity}
          onClick={() => onNavigate('activity')}
          ariaLabel={`${t.home.quickActivity}: ${activity.minutes} min`}
        >
          {activity.minutes} min
          {activity.isTrainingDay && ` · ${t.home.quickTraining}`}
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
