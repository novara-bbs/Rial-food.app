/**
 * Step 3 — Recipe instructions editor.
 *
 * Renders per-step textarea with optional 16:9 photo, timer badge detection,
 * reorder arrows, and delete button. Delegates photo capture to the parent's
 * hidden file input via `onStepPhotoClick(idx)`.
 *
 * Extracted in Sprint 32 [1.5.146] from CreateRecipe.tsx.
 */
import { ArrowUp, ArrowDown, Trash2, X, ImagePlus, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DashedAddButton from '../../../../components/patterns/DashedAddButton';
import { detectTimers, swapped } from '../../utils/create-recipe-utils';
import type { RecipeStep } from '../../../../types';
import type { useI18n } from '../../../../i18n';

type T = ReturnType<typeof useI18n>['t'];

interface Props {
  steps: RecipeStep[];
  setSteps: React.Dispatch<React.SetStateAction<RecipeStep[]>>;
  onStepPhotoClick: (idx: number) => void;
  onUpdateStepText: (idx: number, val: string) => void;
  onUpdateStepPhoto: (idx: number, photoUrl: string | null) => void;
  onRemoveStep: (idx: number) => void;
  onAddStep: () => void;
  t: T;
}

export default function CreateRecipeStep3Instructions({
  steps,
  setSteps,
  onStepPhotoClick,
  onUpdateStepText,
  onUpdateStepPhoto,
  onRemoveStep,
  onAddStep,
  t,
}: Props) {
  const completedCount = steps.filter(s => s.text.trim()).length;

  return (
    <div className="space-y-4">
      <p className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">
        {completedCount} {t.recipeDetail.stepsCount}
      </p>

      {steps.map((s, idx) => {
        const timers = detectTimers(s.text);
        return (
          <div key={idx} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-headline font-bold flex items-center justify-center shrink-0 mt-1 text-body-sm">
              {idx + 1}
            </div>
            <div className="flex-1 space-y-2">
              {/* Step photo preview — 16:9 crop stored on upload */}
              {s.photoUrl ? (
                <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-surface-container-highest">
                  <img
                    src={s.photoUrl}
                    alt={t.createRecipe.stepPhotoAlt.replace('{n}', String(idx + 1))}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateStepPhoto(idx, null)}
                    className="absolute top-2 right-2 p-1 bg-neutral-900/70 hover:bg-neutral-900/90 text-white rounded-full transition-colors"
                    aria-label={t.createRecipe.removeStepPhoto}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
              <textarea
                value={s.text}
                onChange={e => onUpdateStepText(idx, e.target.value)}
                placeholder={`${t.createRecipe.stepPlaceholder} ${idx + 1}...`}
                className="rial-input p-3 min-h-[80px] resize-none"
              />
              <div className="flex items-center gap-2 flex-wrap">
                {timers.length > 0 && timers.map((m, i) => (
                  <Badge key={i} variant="outline" className="text-primary border-primary/30 gap-1">
                    <Clock className="w-2.5 h-2.5" /> {m} min
                  </Badge>
                ))}
                {/* Per-step photo upload */}
                <button
                  type="button"
                  onClick={() => onStepPhotoClick(idx)}
                  className="inline-flex items-center gap-1 text-micro font-label uppercase tracking-widest text-on-surface-variant/60 hover:text-primary border border-dashed border-outline-variant/20 hover:border-primary/30 rounded-sm px-2 py-1 transition-colors"
                  aria-label={t.createRecipe.addStepPhoto}
                >
                  <ImagePlus className="w-3 h-3" />
                  {t.createRecipe.photo}
                </button>
              </div>
            </div>
            <div className="flex flex-col shrink-0 mt-1">
              <button type="button" onClick={() => setSteps(prev => swapped(prev, idx, -1))} disabled={idx === 0}
                aria-label={t.createRecipe.moveStepUp}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setSteps(prev => swapped(prev, idx, 1))} disabled={idx === steps.length - 1}
                aria-label={t.createRecipe.moveStepDown}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                <ArrowDown className="w-4 h-4" />
              </button>
              {steps.length > 1 && (
                <button type="button" onClick={() => onRemoveStep(idx)}
                  aria-label={t.createRecipe.deleteStep}
                  className="min-w-11 min-h-11 flex items-center justify-center text-error/60 hover:text-error transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      <DashedAddButton
        label={t.createRecipe.addStep}
        onClick={onAddStep}
        density="compact"
      />
    </div>
  );
}
