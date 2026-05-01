import { useState } from 'react';
import { ChefHat, X } from 'lucide-react';
import { Heading } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { Z_TW } from '../../../lib/z-index';
import IngredientCheckoff, { type CheckoffIngredient } from './IngredientCheckoff';

interface Props {
  recipeTitle: string;
  ingredients: CheckoffIngredient[];
  onStart: () => void;
  onClose: () => void;
  onDisable: () => void;
}

/**
 * Pre-cook mise-en-place screen — R5.3.
 * Shows the full ingredient list with check-off before entering CookMode.
 * "Empezar" CTA enables when all ingredients are checked (or always — user
 * can start without checking everything). Skip link hides this screen forever.
 * Pattern: Kitchen Stories IMG_1150.
 */
export default function MiseEnPlaceScreen({
  recipeTitle,
  ingredients,
  onStart,
  onClose,
  onDisable,
}: Props) {
  const { t } = useI18n();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const allChecked = ingredients.length > 0 && checkedIds.length >= ingredients.length;

  const tt = t.miseEnPlace;

  return (
    <div
      className={`fixed inset-0 ${Z_TW.FULLSCREEN} bg-neutral-950 flex flex-col text-on-overlay`}
      role="dialog"
      aria-modal="true"
      aria-label={tt.title}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-overlay-border shrink-0">
        <div className="flex items-center gap-3">
          <ChefHat className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <span className="font-label text-micro uppercase tracking-widest text-on-overlay/40 block truncate max-w-[200px]">
              {recipeTitle}
            </span>
            <Heading level="h2" className="font-headline text-body-sm font-bold text-on-overlay">
              {tt.title}
            </Heading>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-on-overlay/10 hover:bg-on-overlay/20 transition-colors"
          aria-label={t.common.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="px-6 pt-4 pb-2 text-sm text-on-overlay/60 font-body shrink-0">
        {tt.description}
      </p>

      {/* Ingredient list */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <IngredientCheckoff
          ingredients={ingredients}
          onCheckedChange={setCheckedIds}
        />
        {ingredients.length === 0 && (
          <p className="text-sm text-on-overlay/40 text-center py-8">
            {tt.noIngredients}
          </p>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="px-6 pb-8 pt-4 border-t border-overlay-border space-y-3 shrink-0">
        {/* Primary: Start cooking */}
        <Button
          onClick={onStart}
          className={`w-full min-h-12 text-body-sm transition-colors ${
            allChecked || ingredients.length === 0
              ? ''
              : 'opacity-60 hover:opacity-70'
          }`}
        >
          {tt.startCooking}
        </Button>

        {/* Secondary row: skip without prep + disable */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onStart}
            className="text-xs text-on-overlay/40 hover:text-on-overlay/70 transition-colors font-label underline underline-offset-2"
          >
            {tt.startWithoutPrep}
          </button>
          <button
            type="button"
            onClick={() => { onDisable(); onStart(); }}
            className="text-xs text-on-overlay/30 hover:text-on-overlay/60 transition-colors font-label"
          >
            {tt.dontShowAgain}
          </button>
        </div>
      </div>
    </div>
  );
}
