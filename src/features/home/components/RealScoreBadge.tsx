import { Heart, TrendingUp, TrendingDown } from 'lucide-react';
import { useI18n } from '../../../i18n';

export default function RealScoreBadge({ avgVitality, trend, onTap }: {
  avgVitality: number;
  trend: 'up' | 'down' | 'flat';
  onTap: () => void;
}) {
  const { t } = useI18n();
  if (avgVitality === 0) return null;

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 min-h-11 rounded-full border border-primary/20 shadow-elev-1 hover:bg-primary/15 transition-colors"
      aria-label={t.home.vitalityAria.replace('{n}', String(avgVitality))}
    >
      <Heart className="w-3.5 h-3.5" />
      <span className="font-semibold text-micro uppercase tracking-widest">{avgVitality}</span>
      {trend === 'up' && <TrendingUp className="w-3 h-3" />}
      {trend === 'down' && <TrendingDown className="w-3 h-3" />}
    </button>
  );
}
