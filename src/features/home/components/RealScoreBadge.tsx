import { Heart, TrendingUp, TrendingDown } from 'lucide-react';
import { useI18n } from '../../../i18n';
import StatusChip from '@/components/ui/StatusChip';

export default function RealScoreBadge({ avgVitality, trend, onTap }: {
  avgVitality: number;
  trend: 'up' | 'down' | 'flat';
  onTap: () => void;
}) {
  const { t } = useI18n();
  if (avgVitality === 0) return null;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <StatusChip
      tone="primary"
      icon={Heart}
      trailing={TrendIcon ? <TrendIcon className="w-3 h-3 shrink-0" aria-hidden="true" /> : undefined}
      onClick={onTap}
      ariaLabel={t.home.vitalityAria.replace('{n}', String(avgVitality))}
    >
      {avgVitality}
    </StatusChip>
  );
}
