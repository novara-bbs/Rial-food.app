import type { DayStatus } from '../utils/dayStatus';
import { useI18n } from '../../../i18n';
import StatusChip, { type StatusChipTone } from '@/components/ui/StatusChip';

const TONE_BY_STATUS: Record<DayStatus, StatusChipTone> = {
  ahead: 'primary',
  'on-track': 'secondary',
  behind: 'warning',
  over: 'danger',
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
    <StatusChip
      tone={TONE_BY_STATUS[status]}
      testId={`day-status-chip-${status}`}
    >
      {label}
    </StatusChip>
  );
}
