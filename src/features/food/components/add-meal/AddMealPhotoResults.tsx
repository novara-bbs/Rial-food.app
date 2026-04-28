import { Sparkles, X, Trash2, Camera } from 'lucide-react';
import { Heading } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../../i18n';
import type { DetectedFood } from '../../api/photo-recognition';

interface AddMealPhotoResultsProps {
  photoResults: DetectedFood[];
  onRemove: (idx: number) => void;
  onLogAll: () => void;
}

/**
 * AI photo-recognition result review panel.
 * Shown after a successful photo analysis. Lets the user inspect detected
 * foods, remove false-positives, and log the remaining selection in one tap.
 */
export default function AddMealPhotoResults({
  photoResults, onRemove, onLogAll,
}: AddMealPhotoResultsProps) {
  const { t } = useI18n();

  const count = photoResults.length;
  const totalCal = photoResults.reduce((s, f) => s + f.macros.cal, 0);
  const totalPro = photoResults.reduce((s, f) => s + f.macros.pro, 0);
  const label = t.addMealScreen?.aiDetected?.replace('{count}', String(count)) ?? `IA detectó ${count} alimentos`;

  return (
    <section className="bg-surface-container-low border-2 border-primary/30 rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <Heading level="h3">{label}</Heading>
        </div>
        <button
          type="button"
          onClick={() => { for (let i = count - 1; i >= 0; i--) onRemove(i); }}
          className="text-on-surface-variant hover:text-tertiary"
          aria-label={t.common.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {photoResults.map((food, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-surface-container-high p-3 rounded-sm border border-outline-variant/20"
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            food.confidence === 'high' ? 'bg-green-500'
            : food.confidence === 'medium' ? 'bg-yellow-500'
            : 'bg-orange-500'
          }`} />
          <div className="flex-1 min-w-0">
            <span className="font-headline text-micro uppercase text-tertiary block truncate">
              {food.nameEs || food.name}
            </span>
            <span className="text-micro font-label tracking-widest text-on-surface-variant uppercase">
              ~{food.estimatedGrams}g · {food.macros.cal} {t.common.kcal} · {food.macros.pro}g P
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-on-surface-variant hover:text-error transition-colors shrink-0"
            aria-label={t.common.delete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between text-micro font-label tracking-widest uppercase text-on-surface-variant pt-1">
        <span>Total: {totalCal} {t.common.kcal} · {totalPro.toFixed(0)}g P</span>
      </div>

      <Button
        variant="default"
        onClick={onLogAll}
        className="w-full font-headline text-micro uppercase tracking-widest gap-2"
      >
        <Camera className="w-4 h-4" />
        {t.addMealScreen?.logDetected ?? `Registrar ${count} alimentos`}
      </Button>
    </section>
  );
}
