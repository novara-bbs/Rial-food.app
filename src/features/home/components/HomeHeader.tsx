import { Flame, ChevronDown } from 'lucide-react';
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
  /** Phase 3 — make the date label clickable to open the day picker. */
  onTapDate?: () => void;
  /** Phase 3 — selected day in YYYY-MM-DD; defaults to today. Header label reflects this. */
  selectedDate?: string;
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
  onTapDate,
  selectedDate,
}: HomeHeaderProps) {
  const { t, locale } = useI18n();
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const dateLabel = (() => {
    if (!selectedDate || selectedDate === todayISO) {
      return `${t.home.today} ${formatToday(locale, now)}`;
    }
    const sel = new Date(`${selectedDate}T00:00:00`);
    if (selectedDate === yesterdayISO) {
      return `${t.home.dayPicker.yesterday}, ${formatToday(locale, sel)}`;
    }
    const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(sel);
    return `${dayName}, ${formatToday(locale, sel)}`;
  })();
  // Phase 1 rework — bestStreak is an advanced-only affordance. Simple mode
  // sees current streak only so the header stays focused and uncluttered.
  const showBest = !isSimpleMode && streakDays >= 2 && bestStreakDays > streakDays;

  return (
    <section className="pt-6 space-y-3" data-testid="home-header">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {onTapDate ? (
          <button
            type="button"
            onClick={onTapDate}
            aria-label={t.home.dayPicker.ariaLabel}
            className="flex items-center gap-1.5 -ml-1 px-1 py-0.5 rounded-sm hover:bg-surface-container-highest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
            data-testid="home-date-pill"
          >
            <Heading level="h1" className="leading-none">
              {dateLabel}
            </Heading>
            <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
          </button>
        ) : (
          <Heading level="h1" className="leading-none">
            {dateLabel}
          </Heading>
        )}
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
