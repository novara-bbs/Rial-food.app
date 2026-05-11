/**
 * Phase 1 rework — HomeQuickStats chip-row.
 *
 * Renders a horizontally-scrollable row of StatusChip pills (standard/advanced
 * tier only). Hydration chip is omitted — the Hydration SectionCard below
 * already covers it, avoiding duplicate data in the same view.
 *
 * Sprint E [1.5.219]: migrated from legacy `mode: 'simple' | 'advanced'` prop
 * to `tier: DetailTier` so the component reads from the new preferences schema.
 */
import { TrendingDown, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useI18n } from '../../../i18n';
import StatusChip from '@/components/ui/StatusChip';
import type { DetailTier } from '../../../types/preferences';

export type QuickStatTarget = 'progress' | 'activity' | 'insights';

interface HomeQuickStatsProps {
  /** Detail tier for the home.activity section — hides the row when 'simple'. */
  tier: DetailTier;
  weightDelta?: { value: number; unit: 'kg' | 'lb'; since: 'week' | 'month' };
  activityToday?: { minutes: number; isTrainingDay: boolean };
  insightCount?: number;
  onNavigate: (target: QuickStatTarget) => void;
}

export default function HomeQuickStats({
  tier,
  weightDelta,
  activityToday,
  insightCount = 0,
  onNavigate,
}: HomeQuickStatsProps) {
  const { t } = useI18n();

  // Hidden in simple tier — the chip-row adds noise without the richer data context.
  if (tier === 'simple') return null;

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
