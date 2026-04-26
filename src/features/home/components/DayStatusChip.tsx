import type { DayStatus } from '../utils/dayStatus';
import { useI18n } from '../../../i18n';

const CLASS_BY_STATUS: Record<DayStatus, string> = {
  ahead: 'bg-primary/10 text-primary border-primary/20',
  'on-track': 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
  behind: 'bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20',
  over: 'bg-error/10 text-error border-error/20',
};

export default function DayStatusChip({ status }: { status: DayStatus }) {
  const { t } = useI18n();
  const label = {
    ahead: t.home.dayStatusAhead,
    'on-track': t.home.dayStatusOnTrack,
    behind: t.home.dayStatusBehind,
    over: t.home.dayStatusOver,
  }[status];

  return (
    <span
      className={`inline-flex items-center min-h-11 px-3 rounded-full border font-label text-micro font-semibold uppercase tracking-widest ${CLASS_BY_STATUS[status]}`}
      data-testid={`day-status-chip-${status}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
