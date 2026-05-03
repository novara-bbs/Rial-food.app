/**
 * NutritionRow — single row for vitamins and minerals tabs in NutritionDetail.
 *
 * Layout:  [Label]                   [value / target]  [%RDA chip]
 *
 * When `consumed` is null/undefined the row shows "—" in place of the value
 * and a neutral "no data" chip (Sprint G backfill will populate actual values).
 */
import StatusChip from '../../../components/ui/StatusChip';
import type { StatusChipTone } from '../../../components/ui/StatusChip';

export interface NutritionRowProps {
  label: string;
  consumed?: number | null;
  rda?: number | null;
  unit?: string;
  rdaCaption: string;
  noDataLabel: string;
}

function rdaTone(pct: number): StatusChipTone {
  if (pct >= 80) return 'success';
  if (pct >= 40) return 'primary';
  return 'warning';
}

export default function NutritionRow({
  label,
  consumed,
  rda,
  unit = 'mg',
  rdaCaption,
  noDataLabel,
}: NutritionRowProps) {
  const hasData = consumed != null && consumed > 0;
  const rdaPct = hasData && rda ? Math.min(100, Math.round((consumed / rda) * 100)) : null;
  const chipLabel = rdaPct != null
    ? rdaCaption.replace('{pct}', String(rdaPct))
    : noDataLabel;
  const chipTone: StatusChipTone = rdaPct != null ? rdaTone(rdaPct) : 'neutral';

  return (
    <div className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0">
      <span className="flex-1 font-body text-body-sm text-on-surface truncate">
        {label}
      </span>
      <span className="font-label text-micro tabular-nums text-on-surface-variant shrink-0 mr-1">
        {hasData ? `${Math.round(consumed!)} / ${rda ?? '?'}${unit}` : '—'}
      </span>
      <StatusChip tone={chipTone} className="shrink-0">
        {chipLabel}
      </StatusChip>
    </div>
  );
}
