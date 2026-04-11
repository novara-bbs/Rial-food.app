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
      className="bg-surface-container-low border border-outline-variant/20 p-3 rounded-sm flex items-center gap-3 w-full hover:border-primary/30 transition-colors group"
    >
      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
        <UtensilsCrossed className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-primary block">
          {suggestion.source === 'plan' ? t.home.nextUp : t.home.suggestedForYou}
        </span>
        <span className="text-xs font-bold text-tertiary uppercase tracking-widest truncate block">{suggestion.title}</span>
        <span className="text-[10px] text-on-surface-variant font-bold">
          {suggestion.cal} kcal · {suggestion.pro}g pro
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0 group-hover:text-primary transition-colors" />
    </button>
  );
}
