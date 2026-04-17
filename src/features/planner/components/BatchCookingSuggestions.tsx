/**
 * Batch Cooking Suggestions — surfaces results of the batch-cooking analysis
 * for the active week's meal plan. Shows collapsible cards for each ingredient
 * that appears in ≥2 meals so users can prep it in one session.
 */
import { useState } from 'react';
import { Clock, ChefHat, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeBatchCooking, BatchSession } from '../utils/batch-cooking';
import { useI18n } from '../../../i18n';

interface BatchCookingSuggestionsProps {
  mealPlan: Record<number, any[]>;
}

function formatDays(indices: number[], dayAbbr: string[]): string {
  return [...new Set(indices)]
    .sort((a, b) => a - b)
    .map(i => dayAbbr[i] ?? `D${i + 1}`)
    .join(', ');
}

export default function BatchCookingSuggestions({ mealPlan }: BatchCookingSuggestionsProps) {
  const { t } = useI18n();
  const tc = t.cocina;
  const [expanded, setExpanded] = useState(false);

  const analysis = analyzeBatchCooking(mealPlan);
  if (!analysis.hasOpportunities) return null;

  return (
    <div className="mx-6 mb-3 bg-brand-secondary/10 border border-brand-secondary/30 rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-brand-secondary/15 transition-colors text-left"
        aria-expanded={expanded}
      >
        <div className="w-8 h-8 bg-brand-secondary/20 rounded-full flex items-center justify-center shrink-0">
          <ChefHat className="w-4 h-4 text-brand-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">
            {tc.batchTitle}
          </p>
          <p className="text-micro text-on-surface-variant mt-0.5 leading-relaxed">
            {tc.batchDesc.replace('{mins}', String(analysis.totalTimeSavedMins))}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-label text-micro font-bold uppercase tracking-widest bg-brand-secondary/20 text-brand-secondary px-2 py-0.5 rounded">
            {analysis.sessions.length}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-on-surface-variant" />
            : <ChevronDown className="w-4 h-4 text-on-surface-variant" />
          }
        </div>
      </button>

      {/* Session list — collapsible */}
      {expanded && (
        <div className="border-t border-brand-secondary/20">
          {analysis.sessions.map((session: BatchSession, i: number) => (
            <div
              key={i}
              className="px-4 py-3 border-b border-brand-secondary/10 last:border-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">
                    {session.baseIngredient}
                  </p>
                  <p className="text-micro text-on-surface-variant mt-0.5 leading-relaxed truncate">
                    {session.recipeNames.slice(0, 3).join(' · ')}
                    {session.recipeNames.length > 3 && ` +${session.recipeNames.length - 3}`}
                  </p>
                  <p className="text-micro text-on-surface-variant/60 mt-0.5">
                    {formatDays(session.dayIndices, tc.dayAbbr)}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-brand-secondary">
                  <Clock className="w-3 h-3" />
                  <span className="font-label text-micro font-bold uppercase tracking-widest">
                    {tc.batchTimeSaved.replace('{mins}', String(session.timeSavedMins))}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Footer tip */}
          <div className="px-4 py-2.5 bg-brand-secondary/5">
            <p className="text-micro text-on-surface-variant font-label uppercase tracking-widest">
              {tc.batchTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
