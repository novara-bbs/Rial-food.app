import { ChevronRight, UtensilsCrossed } from 'lucide-react';
import { useI18n } from '../../../i18n';

interface MealSuggestion {
  title: string;
  cal: number;
  pro: number;
  source: 'plan' | 'recipe';
}

export default function NextMealSuggestion({ suggestion, onTap }: {
  suggestion: MealSuggestion | null;
  onTap: () => void;
}) {
  const { t } = useI18n();
  if (!suggestion) return null;

  return (
    <button
      type="button"
      onClick={onTap}
      className="bg-surface-container border border-outline-variant/30 p-3 rounded-sm flex items-center gap-3 w-full min-h-11 hover:border-primary/30 hover:bg-surface-container-high transition-colors group"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
        <UtensilsCrossed className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <span className="text-micro font-semibold uppercase tracking-widest text-primary block">
          {suggestion.source === 'plan' ? t.home.nextUp : t.home.suggestedForYou}
        </span>
        <span className="text-label font-bold text-tertiary uppercase tracking-widest truncate block">{suggestion.title}</span>
        <span className="text-micro text-on-surface-variant font-bold">
          {suggestion.cal} kcal · {suggestion.pro}g pro
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0 group-hover:text-primary transition-colors" />
    </button>
  );
}
