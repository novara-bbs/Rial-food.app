/**
 * InsightRow — renders a single InsightRecommendation row with a lucide icon.
 *
 * Q13 — replaces emoji glyphs with design-system-aligned lucide icons,
 * matching the iconography in Progress / Wellness screens.
 */
import { Leaf, Drumstick, Droplet, Flame, NotebookPen } from 'lucide-react';
import type { InsightIconKey, InsightRecommendation } from '../../wellness/utils/correlations';

const ICON_MAP: Record<InsightIconKey, typeof Leaf> = {
  variety: Leaf,
  protein: Drumstick,
  hydration: Droplet,
  streak: Flame,
  notebook: NotebookPen,
};

const TONE_CLASS: Record<InsightRecommendation['tone'], string> = {
  positive: 'bg-brand-secondary/5 border-brand-secondary/20',
  warning: 'bg-error/5 border-error/20',
  neutral: 'bg-surface-container-low border-outline-variant/20',
};

const ICON_TONE: Record<InsightRecommendation['tone'], string> = {
  positive: 'text-brand-secondary',
  warning: 'text-error',
  neutral: 'text-primary',
};

interface Props {
  insight: InsightRecommendation;
}

export default function InsightRow({ insight }: Props) {
  const Icon = ICON_MAP[insight.iconKey] ?? NotebookPen;
  return (
    <div className={`p-4 rounded-sm border flex items-start gap-3 ${TONE_CLASS[insight.tone]}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${ICON_TONE[insight.tone]}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-headline text-micro font-bold uppercase tracking-widest text-tertiary">
          {insight.title}
        </p>
        <p className="text-caption text-on-surface-variant mt-0.5 leading-relaxed">
          {insight.detail}
        </p>
      </div>
    </div>
  );
}
