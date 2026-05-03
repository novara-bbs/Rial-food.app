/**
 * QualityMetricRow — single metric row inside `<FoodQualityCard>`.
 *
 * Sprint G layout (PDF reference — 2-col grid in the parent):
 *   ┌─────────────────────────────────────────────────────┐
 *   │ • Fibra              22g  [Bueno]                   │
 *   └─────────────────────────────────────────────────────┘
 *
 * - Leading dot (1.5×1.5 px) coloured per badge — replaces the previous icon.
 * - No mini progress bar (the StatusChip carries the semantic state).
 * - Token-pure: no hex, no `dark:` prefix.
 */
import { cn } from '@/lib/utils';
import StatusChip from '../../../components/ui/StatusChip';
import type { StatusChipTone } from '../../../components/ui/StatusChip';
import type { QualityBadge } from '../utils/daily-quality';

export interface QualityMetricRowProps {
  metricKey: string;
  label: string;
  valueLabel: string;
  badge: QualityBadge;
  badgeLabel: string;
  partial: boolean;
  className?: string;
}

const BADGE_TO_TONE: Record<QualityBadge, StatusChipTone> = {
  good: 'success',
  'in-progress': 'primary',
  low: 'warning',
  moderate: 'warning',
  high: 'danger',
  'partial-data': 'neutral',
};

/** Returns the Tailwind class for the leading dot fill. */
function dotColorClass(badge: QualityBadge): string {
  switch (badge) {
    case 'good':         return 'bg-primary';
    case 'in-progress':  return 'bg-primary/60';
    case 'low':          return 'bg-on-surface-variant/50';
    case 'moderate':     return 'bg-tertiary';
    case 'high':         return 'bg-error';
    case 'partial-data':
    default:             return 'bg-on-surface-variant/30';
  }
}

export default function QualityMetricRow({
  metricKey,
  label,
  valueLabel,
  badge,
  badgeLabel,
  partial: _partial,
  className,
}: QualityMetricRowProps) {
  const tone = BADGE_TO_TONE[badge];
  const dotClass = dotColorClass(badge);

  return (
    <div
      className={cn('flex items-center gap-2 min-w-0', className)}
      data-testid={`quality-row-${metricKey}`}
    >
      {/* Leading dot — colour-codes the badge severity */}
      <span
        className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClass)}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="font-body text-body-sm font-medium text-on-surface truncate flex-1 min-w-0">
        {label}
      </span>

      {/* Value (e.g. "22g", "32%", "4.8 por.") */}
      <span className="font-label text-micro tabular-nums text-on-surface-variant shrink-0">
        {valueLabel}
      </span>

      {/* Status chip — semantic carrier (Bueno / Alto / Bajo / etc.) */}
      <StatusChip tone={tone} className="shrink-0">
        {badgeLabel}
      </StatusChip>
    </div>
  );
}
