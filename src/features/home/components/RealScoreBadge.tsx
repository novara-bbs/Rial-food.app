import { Heart, TrendingUp, TrendingDown } from 'lucide-react';

export default function RealScoreBadge({ avgVitality, trend, onTap }: {
  avgVitality: number;
  trend: 'up' | 'down' | 'flat';
  onTap: () => void;
}) {
  if (avgVitality === 0) return null;

  return (
    <button
      onClick={onTap}
      className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 shadow-sm hover:bg-primary/15 transition-colors"
      aria-label={`Real Score: ${avgVitality}`}
    >
      <Heart className="w-3.5 h-3.5" />
      <span className="font-bold text-[10px] uppercase tracking-widest">{avgVitality}</span>
      {trend === 'up' && <TrendingUp className="w-3 h-3" />}
      {trend === 'down' && <TrendingDown className="w-3 h-3" />}
    </button>
  );
}
