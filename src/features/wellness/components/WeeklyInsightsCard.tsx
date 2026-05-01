/**
 * WeeklyInsightsCard — auto-generated weekly recap (PR 6a).
 *
 * Rendered above the Progress tabs, below `WeeklyScoreCard`. Narrative
 * headline + up to 3 inline chips (EMA trend / meal-log streak / top meal).
 *
 * Design intent: complements WeeklyScoreCard (raw stats) with a
 * Yazio/Noom-style "how's your week going" sentence. Not a CTA card.
 */
import { Sparkles, TrendingUp, TrendingDown, Minus, Flame, UtensilsCrossed } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import type { WeekInsight, InsightChip } from '../utils/week-insights';

interface WeeklyInsightsCardProps {
  insight: WeekInsight;
  /** Card title (e.g. "Resumen semanal"). */
  title: string;
}

function chipIcon(chip: InsightChip) {
  if (chip.id === 'trend') {
    if (chip.direction === 'up') return <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />;
    if (chip.direction === 'down') return <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />;
    return <Minus className="w-3.5 h-3.5" aria-hidden="true" />;
  }
  if (chip.id === 'streak') return <Flame className="w-3.5 h-3.5" aria-hidden="true" />;
  return <UtensilsCrossed className="w-3.5 h-3.5" aria-hidden="true" />;
}

function chipTone(chip: InsightChip): string {
  if (chip.id === 'trend') {
    if (chip.direction === 'down') return 'text-primary';
    if (chip.direction === 'up') return 'text-brand-secondary';
    return 'text-on-surface-variant';
  }
  return 'text-tertiary';
}

export default function WeeklyInsightsCard({ insight, title }: WeeklyInsightsCardProps) {
  if (!insight.headline && insight.chips.length === 0) return null;

  return (
    <SectionCard
      padding="md"
      spacing="sm"
      title={title}
      icon={<Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />}
    >
      {insight.headline && (
        <p className="text-body-sm text-on-surface leading-snug">
          {insight.headline}
        </p>
      )}

      {insight.chips.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {insight.chips.map(chip => (
            <span
              key={chip.id}
              className={`inline-flex items-center gap-1 min-h-[22px] px-2.5 rounded-full bg-surface-container-high text-pico font-medium normal-case tracking-normal ${chipTone(chip)}`}
            >
              {chipIcon(chip)}
              <span className="text-on-surface-variant">{chip.label}</span>
              <span>{chip.value}</span>
            </span>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
