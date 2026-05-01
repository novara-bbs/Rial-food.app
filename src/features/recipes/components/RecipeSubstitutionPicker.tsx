import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Typography';
import { useI18n } from '../../../i18n';

interface SwapSuggestion {
  fromIngredient: { id: string; name: string };
  toIngredient: { id: string; name: string };
  reason: 'intolerance' | 'dislike';
  allergenHit?: string;
  macroImpact: { pro: number; cal: number };
}

interface Props {
  swapSuggestions: SwapSuggestion[];
  onApplySwap: (fromId: string, toIngredient: { id: string; name: string }) => void;
  /** True when the user has dislikes or intolerances configured — used to
   *  pick the empty-state message (no swaps vs. configure prefs). */
  hasPreferences: boolean;
}

/**
 * Smart ingredient swap list. Extracted from RecipeDetail so the swap UI
 * stays independent of the big screen's layout.
 */
export default function RecipeSubstitutionPicker({ swapSuggestions, onApplySwap, hasPreferences }: Props) {
  const { t } = useI18n();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <Heading level="h3" className="font-headline text-body-sm font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> {t.recipeDetail.smartSubstitute}
        </Heading>
      </div>

      {swapSuggestions.length > 0 ? (
        <div className="space-y-2">
          {swapSuggestions.map((swap) => (
            <div
              key={swap.fromIngredient.id}
              className="bg-surface-container-low p-3 rounded-sm border border-outline-variant/20 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-tertiary font-headline font-bold text-caption">
                  {swap.fromIngredient.name} → {swap.toIngredient.name}
                </p>
                <p className="text-on-surface-variant text-micro mt-0.5">
                  {swap.reason === 'intolerance'
                    ? swap.allergenHit
                    : t.recipeDetail.swapReasonDislike || 'No te gusta'}
                  {swap.macroImpact.pro !== 0 && ` · ${swap.macroImpact.pro > 0 ? '+' : ''}${swap.macroImpact.pro}g P`}
                  {swap.macroImpact.cal !== 0 && ` · ${swap.macroImpact.cal > 0 ? '+' : ''}${swap.macroImpact.cal} kcal`}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onApplySwap(swap.fromIngredient.id, swap.toIngredient)}>
                {t.recipeDetail.substitute}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-caption text-on-surface-variant py-4 text-center">
          {hasPreferences
            ? t.recipeDetail.noSwapsNeeded || 'Sin sustituciones para tu perfil.'
            : t.recipeDetail.swapConfigNudge || 'Configura tus preferencias en Ajustes para ver sustituciones.'}
        </p>
      )}
    </section>
  );
}
