import { Flame } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { Heading } from '@/components/ui/Typography';
import StatusChip from '@/components/ui/StatusChip';
import RealScoreBadge from './RealScoreBadge';
import DayStatusChip from './DayStatusChip';
import type { DayStatus } from '../utils/dayStatus';

interface HomeHeaderProps {
  avgVitality: number;
  vitalityTrend: 'up' | 'down' | 'flat';
  isSimpleMode: boolean;
  streakDays: number;
  bestStreakDays: number;
  dayStatus: DayStatus;
  onNavigateToProgress?: () => void;
}

function formatToday(locale: string, now: Date): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    }).format(now);
  } catch {
    return `${now.getDate()}`;
  }
}

export default function HomeHeader({
  avgVitality,
  vitalityTrend,
  isSimpleMode,
  streakDays,
  bestStreakDays,
  dayStatus,
  onNavigateToProgress,
}: HomeHeaderProps) {
  const { t, locale } = useI18n();
  const todayLabel = `${t.home.today} ${formatToday(locale, new Date())}`;
  // Phase 1 rework — bestStreak is an advanced-only affordance. Simple mode
  // sees current streak only so the header stays focused and uncluttered.
  const showBest = !isSimpleMode && streakDays >= 2 && bestStreakDays > streakDays;

  return (
    <section className="pt-6 space-y-3" data-testid="home-header">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading level="h1" className="leading-none">
          {todayLabel}
        </Heading>
        <DayStatusChip status={dayStatus} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!isSimpleMode && avgVitality > 0 && (
          <RealScoreBadge
            avgVitality={avgVitality}
            trend={vitalityTrend}
            onTap={() => onNavigateToProgress?.()}
          />
        )}
        <StatusChip
          tone="secondary"
          icon={Flame}
          onClick={() => onNavigateToProgress?.()}
          ariaLabel={`${t.home.streak}: ${streakDays} ${t.home.days}`}
        >
          {t.home.streak}: {streakDays} {t.home.days}
          {showBest && (
            <span className="opacity-60 ml-1">
              · {t.home.bestStreak.replace('{n}', String(bestStreakDays))}
            </span>
          )}
        </StatusChip>
      </div>
    </section>
  );
}
