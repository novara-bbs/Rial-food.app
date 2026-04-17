import { ThumbsUp, AlertTriangle, Minus } from 'lucide-react';
import { getFoodQuality } from '../../food/utils/nutrition';
import { useI18n } from '../../../i18n';

interface Props {
  cal: number;
  pro: number;
  carbs: number;
  fats: number;
  /** Original macros for food-quality badge; omit to hide the banner */
  macros?: { calories: number; protein: number; carbs: number; fats: number } | null;
  /** Hero image above has attribution cards → tighter top margin */
  hasAttribution?: boolean;
}

/**
 * 4-cell macro grid + food-quality banner.
 * Purely presentational — extracted from RecipeDetail so nutrition rendering
 * can be reused (e.g. in a future Weekly Review or AICoach).
 */
export default function RecipeNutritionBar({ cal, pro, carbs, fats, macros, hasAttribution }: Props) {
  const { t } = useI18n();
  const nutrients = [
    { label: 'kcal', value: String(cal), color: 'text-primary' },
    { label: 'pro', value: `${pro}g`, color: 'text-macro-protein' },
    { label: 'carbs', value: `${carbs}g`, color: 'text-macro-carbs' },
    { label: 'fats', value: `${fats}g`, color: 'text-macro-fats' },
  ] as const;

  const quality = macros ? getFoodQuality(macros) : null;

  return (
    <div className={hasAttribution ? 'mt-3 relative z-10' : 'mt-4 relative z-10'}>
      <div className="grid grid-cols-4 gap-2">
        {nutrients.map((m) => (
          <div
            key={m.label}
            className="bg-surface-container border border-outline-variant/30 rounded-sm p-3 text-center"
          >
            <span className={`block font-headline font-bold text-lg ${m.color}`}>{m.value}</span>
            <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">{m.label}</span>
          </div>
        ))}
      </div>

      {quality && (
        <div
          className={`flex items-center gap-3 p-2.5 mt-3 rounded-sm border ${
            quality === 'good'
              ? 'bg-primary/10 border-primary/20'
              : quality === 'neutral'
                ? 'bg-brand-secondary/10 border-brand-secondary/20'
                : 'bg-error/10 border-error/20'
          }`}
        >
          {quality === 'good' ? (
            <ThumbsUp className="w-5 h-5 text-primary" />
          ) : quality === 'poor' ? (
            <AlertTriangle className="w-5 h-5 text-error" />
          ) : (
            <Minus className="w-5 h-5 text-brand-secondary" />
          )}
          <span className="text-caption font-bold uppercase tracking-widest text-on-surface-variant">
            {t.recipes.foodQuality[quality]}
          </span>
        </div>
      )}
    </div>
  );
}
