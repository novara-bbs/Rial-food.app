import { TrendingUp, TrendingDown, Heart } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import type { CorrelationInsight } from '../utils/correlations';
import type { BienestarSlice } from '../hooks/useProgressData';

const EMOJI_MAP = ['😴', '😕', '😐', '😊', '💪'];

export interface BienestarCardProps {
  bienestar: BienestarSlice;
  title: string;
  topCorrelationsLabel: string;
  viewDiaryLabel: string;
  onViewDiary: () => void;
}

export default function BienestarCard({
  bienestar,
  title,
  topCorrelationsLabel,
  viewDiaryLabel,
  onViewDiary,
}: BienestarCardProps) {
  return (
    <SectionCard
      spacing="lg"
      title={title}
      icon={<Heart className="w-4 h-4 text-brand-secondary" />}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl">{EMOJI_MAP[Math.round(bienestar.rawAvg) - 1] || '😐'}</span>
          <div>
            <span className="font-headline font-black text-title text-primary">{bienestar.rawAvg.toFixed(1)}</span>
            <span className="text-on-surface-variant text-sm ml-0.5">/5</span>
          </div>
        </div>
        {bienestar.sparkData.length >= 3 && (
          <svg viewBox="0 0 100 30" className="flex-1 h-8" aria-hidden="true">
            <polyline
              fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              points={bienestar.sparkData.map((v: number, i: number) => {
                const x = (i / (bienestar.sparkData.length - 1)) * 100;
                const y = 28 - ((v - 1) / 4) * 26;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
        )}
        <div className="shrink-0">
          {bienestar.trend === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
          {bienestar.trend === 'down' && <TrendingDown className="w-4 h-4 text-error" />}
        </div>
      </div>

      {bienestar.correlations.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-outline-variant/10">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
            {topCorrelationsLabel}
          </span>
          {bienestar.correlations.map((cor: CorrelationInsight) => (
            <div key={cor.id} className="flex items-center gap-3 p-2 bg-surface-container rounded-sm">
              <span className="text-lg shrink-0">{cor.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-headline text-micro font-bold uppercase text-tertiary truncate">{cor.title}</p>
                <p className="text-micro text-on-surface-variant truncate">{cor.detail}</p>
              </div>
              <span className={`font-label text-micro font-bold ${cor.confidence >= 0.7 ? 'text-primary' : 'text-on-surface-variant'}`}>
                {Math.round(cor.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onViewDiary}
        className="w-full text-center text-micro font-bold text-primary uppercase tracking-widest hover:underline pt-2 border-t border-outline-variant/10"
      >
        {viewDiaryLabel}
      </button>
    </SectionCard>
  );
}
