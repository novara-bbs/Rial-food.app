/**
 * Paste-bulk ingredient sheet — lets users paste a recipe ingredient list
 * in free-form text, parses it, and previews matches before adding.
 *
 * Extracted in Sprint 32 [1.5.146] from CreateRecipe.tsx (R7.1 original).
 */
import BottomSheet from '../../../../components/ui/bottom-sheet';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ParsedIngredient } from '../../utils/ingredient-parser';
import type { Ingredient } from '../../../../types';
import type { useI18n } from '../../../../i18n';

type T = ReturnType<typeof useI18n>['t'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pasteText: string;
  parsedLines: ParsedIngredient[];
  onPreview: (text: string) => void;
  onConfirm: () => void;
  dictionary: Ingredient[];
  t: T;
}

export default function CreateRecipePasteBulkSheet({
  open, onOpenChange,
  pasteText, parsedLines,
  onPreview, onConfirm,
  dictionary,
  t,
}: Props) {
  const highConfidenceCount = parsedLines.filter(l => l.confidence >= 0.6).length;

  return (
    <BottomSheet
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
      }}
      title={t.createRecipe.pasteListTitle}
      headerLayout="cancel-action"
      size="focus"
      actionSlot={
        highConfidenceCount > 0 ? (
          <button
            type="button"
            onClick={onConfirm}
            className="font-headline font-bold text-body-sm text-primary uppercase tracking-widest"
          >
            {t.common.add}
          </button>
        ) : null
      }
    >
      <div className="px-4 pt-2 pb-4 space-y-4">
        <textarea
          autoFocus
          value={pasteText}
          onChange={e => onPreview(e.target.value)}
          placeholder={t.createRecipe.pasteListPlaceholder}
          rows={5}
          className="rial-input p-3 resize-none"
        />

        {parsedLines.length > 0 && (
          <div className="space-y-2">
            <p className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">
              {t.createRecipe.parsedNLines.replace('{n}', String(parsedLines.length))}
            </p>
            {parsedLines.map((item, i) => {
              const high = item.confidence >= 0.6;
              const matched = high && !!item.name && dictionary.some(
                d =>
                  d.name.toLowerCase().includes(item.name!.toLowerCase()) ||
                  d.nameEn?.toLowerCase().includes(item.name!.toLowerCase()),
              );
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-sm border text-sm ${
                    matched
                      ? 'bg-primary/5 border-primary/20'
                      : high
                      ? 'bg-surface-container-highest border-outline-variant/20'
                      : 'bg-error/5 border-error/20'
                  }`}
                >
                  {matched ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  ) : high ? (
                    <AlertCircle className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-error/60 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-body text-tertiary truncate block">{item.raw}</span>
                    {!matched && high && (
                      <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                        {t.createRecipe.lowConfidence}
                      </span>
                    )}
                    {!high && (
                      <span className="text-micro font-label uppercase tracking-widest text-error/60">
                        {t.createRecipe.lowConfidence}
                      </span>
                    )}
                  </div>
                  {item.quantity && (
                    <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant shrink-0">
                      {item.quantity}{item.unit ?? ''}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
