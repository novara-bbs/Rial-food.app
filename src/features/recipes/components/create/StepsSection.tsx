/**
 * CreateRecipe wizard — Step 3: Instructions.
 *
 * Manages step photo upload (hidden file input, cropTo16x9 pipeline) locally.
 * Instruction data (steps[]) is lifted to the CreateRecipe orchestrator.
 */
import { useRef } from 'react';
import { ArrowUp, ArrowDown, Trash2, Clock, ImagePlus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '../../../../i18n';
import DashedAddButton from '../../../../components/patterns/DashedAddButton';
import { swapped, detectTimers, cropTo16x9 } from '../../utils/create-recipe-helpers';
import type { RecipeStep } from '../../../../types';

export interface StepsSectionProps {
  steps: RecipeStep[];
  onStepsChange: (updater: (prev: RecipeStep[]) => RecipeStep[]) => void;
}

export default function StepsSection({ steps, onStepsChange }: StepsSectionProps) {
  const { t, locale } = useI18n();

  // ── Step photo upload refs ──
  const stepPhotoInputRef = useRef<HTMLInputElement>(null);
  const pendingStepPhotoIdx = useRef(-1);

  const handleStepPhotoClick = (idx: number) => {
    pendingStepPhotoIdx.current = idx;
    stepPhotoInputRef.current?.click();
  };

  const handleStepPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || pendingStepPhotoIdx.current < 0) return;
    try {
      const url = await cropTo16x9(file);
      const idx = pendingStepPhotoIdx.current;
      onStepsChange(prev => prev.map((s, i) => i === idx ? { ...s, photoUrl: url } : s));
    } catch {
      // silent — photo just won't be added
    } finally {
      if (stepPhotoInputRef.current) stepPhotoInputRef.current.value = '';
      pendingStepPhotoIdx.current = -1;
    }
  };

  const updateText = (idx: number, val: string) =>
    onStepsChange(prev => prev.map((s, i) => i === idx ? { ...s, text: val } : s));

  const removePhoto = (idx: number) =>
    onStepsChange(prev => prev.map((s, i) => i === idx ? { ...s, photoUrl: undefined } : s));

  const removeStep = (idx: number) =>
    onStepsChange(prev => prev.filter((_, i) => i !== idx));

  const addStep = () =>
    onStepsChange(prev => [...prev, { text: '' }]);

  return (
    <div className="space-y-4">
      <p className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">
        {steps.filter(s => s.text.trim()).length}{' '}
        {locale === 'es' ? 'pasos' : 'steps'}
      </p>

      {steps.map((s, idx) => {
        const timers = detectTimers(s.text);
        return (
          <div key={idx} className="flex gap-3 items-start">
            {/* Step number bubble */}
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-headline font-bold flex items-center justify-center shrink-0 mt-1 text-body-sm">
              {idx + 1}
            </div>

            <div className="flex-1 space-y-2">
              {/* Step photo preview */}
              {s.photoUrl ? (
                <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-surface-container-highest">
                  <img
                    src={s.photoUrl}
                    alt={`${locale === 'es' ? 'Paso' : 'Step'} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 p-1 bg-neutral-900/70 hover:bg-neutral-900/90 text-white rounded-full transition-colors"
                    aria-label={t.createRecipe.removeStepPhoto}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}

              {/* Step text */}
              <textarea
                value={s.text}
                onChange={e => updateText(idx, e.target.value)}
                placeholder={`${t.createRecipe.stepPlaceholder} ${idx + 1}...`}
                className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant min-h-[80px] resize-none"
              />

              {/* Timer badges + add photo button */}
              <div className="flex items-center gap-2 flex-wrap">
                {timers.map((m, i) => (
                  <Badge key={i} variant="outline" className="text-primary border-primary/30 gap-1">
                    <Clock className="w-2.5 h-2.5" /> {m} min
                  </Badge>
                ))}
                <button
                  type="button"
                  onClick={() => handleStepPhotoClick(idx)}
                  className="inline-flex items-center gap-1 text-micro font-label uppercase tracking-widest text-on-surface-variant/60 hover:text-primary border border-dashed border-outline-variant/20 hover:border-primary/30 rounded-sm px-2 py-1 transition-colors"
                  aria-label={t.createRecipe.addStepPhoto}
                >
                  <ImagePlus className="w-3 h-3" />
                  {t.createRecipe.photo}
                </button>
              </div>
            </div>

            {/* Move up / down / delete controls */}
            <div className="flex flex-col shrink-0 mt-1">
              <button
                type="button"
                onClick={() => onStepsChange(prev => swapped(prev, idx, -1))}
                disabled={idx === 0}
                aria-label={locale === 'es' ? 'Subir paso' : 'Move step up'}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onStepsChange(prev => swapped(prev, idx, 1))}
                disabled={idx === steps.length - 1}
                aria-label={locale === 'es' ? 'Bajar paso' : 'Move step down'}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  aria-label={locale === 'es' ? 'Eliminar paso' : 'Delete step'}
                  className="min-w-11 min-h-11 flex items-center justify-center text-error/60 hover:text-error transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      <DashedAddButton label={t.createRecipe.addStep} onClick={addStep} density="compact" />

      {/* Hidden file input — programmatically triggered per step */}
      <input
        ref={stepPhotoInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleStepPhotoChange}
      />
    </div>
  );
}
