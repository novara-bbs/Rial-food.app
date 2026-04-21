/**
 * P11 `[1.5.69]` — «Qué me falta hoy» dynamic Home card.
 *
 * Shows 1-3 actionable food suggestions based on the user's macro gap for
 * the current day. 1-tap on a suggestion logs ~1 standard serving (100 g)
 * of that food. Nothing renders when:
 *   - the user has no meaningful deficit (all macros within thresholds)
 *   - the user hasn't finished onboarding (no targets set)
 *   - no variants produce positive density for the deficit macro
 *
 * Owner directive 2026-04-21 — the diferenciador real de RIAL es recomendar
 * personalizadamente, no solo mostrar «seco lo que comiste». Este card es la
 * primera pieza visible de esa capa.
 *
 * Wiring: mounted in Home.tsx after TodaysMeals. Degrada silenciosamente
 * cuando no hay suggestions.
 */
import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import { useI18n } from '../../../i18n';
import type { FoodVariant } from '../../../types/food-family';
import type { FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import {
  computeMealGaps,
  biggestDeficit,
  type ConsumedTarget,
  type MacroKey,
} from '../utils/meal-gaps';
import { rankFoodsForGap } from '../utils/suggest-foods';
import { getFamilyImage } from '../../food/data/family-images';

interface Props {
  /** Same shape as `AppStateContext.dailyMacros` (consumed + target). */
  dailyMacros: ConsumedTarget;
  /** Seed + userVariants merged — pass `mergedVariants` from AppStateContext. */
  mergedVariants: readonly FoodVariant[];
  /** Optional recent-foods signal to boost variants the user already likes. */
  foodHistory?: FoodHistoryEntry[];
  /** Optional user goal string (free-form). Filters grade-E foods. */
  userGoal?: string | null;
  /** Optional intolerance/allergen exclusion list. */
  excludeAllergens?: string[];
  /** Called when a suggestion is tapped. Logs 1× 100 g serving. */
  onLogFood: (variant: FoodVariant) => void;
}

function macroLabelKey(key: MacroKey): string {
  return key; // maps 1:1 to t.home.mealGap.deficit.<key>
}

export default function MealGapSuggestion({
  dailyMacros,
  mergedVariants,
  foodHistory,
  userGoal,
  excludeAllergens,
  onLogFood,
}: Props) {
  const { t, locale } = useI18n();

  const suggestions = useMemo(() => {
    const gaps = computeMealGaps(dailyMacros);
    const biggest = biggestDeficit(gaps);
    if (!biggest) return null;

    const ranked = rankFoodsForGap(biggest.key, mergedVariants, {
      rawGoal: userGoal ?? null,
      history: foodHistory,
      excludeAllergens: excludeAllergens ?? [],
      limit: 3,
    });
    if (ranked.length === 0) return null;

    return {
      key: biggest.key,
      deficit: biggest.gap.deficit,
      options: ranked,
    };
  }, [dailyMacros, mergedVariants, foodHistory, userGoal, excludeAllergens]);

  if (!suggestions) return null;

  const mealGap = t.home.mealGap;
  const deficitLabels = mealGap.deficit as Record<string, string>;
  const reasonLabels = mealGap.reason as Record<string, string>;
  const deficitAmount = Math.round(suggestions.deficit);
  const deficitCopy = mealGap.deficitCopy
    .replace('{{amount}}', String(deficitAmount))
    .replace('{{macro}}', deficitLabels[macroLabelKey(suggestions.key)] ?? suggestions.key);

  return (
    <SectionCard data-meal-gap-suggestion>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <h3 className="font-headline font-bold text-body text-on-surface">
              {mealGap.title}
            </h3>
            <p className="text-body-sm text-on-surface-variant leading-snug">
              {deficitCopy}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {suggestions.options.map(({ variant, reason }) => {
            const emoji = getFamilyImage(variant.familyId);
            const name = locale === 'es' ? variant.name : variant.nameEn;
            const macros = variant.macros;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onLogFood(variant)}
                className="w-full flex items-center gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors text-left"
              >
                <span aria-hidden="true" className="text-3xl leading-none shrink-0 select-none">
                  {emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block font-headline font-bold text-body-sm text-on-surface truncate">
                    {name}
                  </span>
                  <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
                    {macros.calories} {t.common.kcal} · {macros.protein}g P · {macros.carbs}g C · {macros.fats}g G
                  </span>
                  <span
                    data-suggestion-reason={reason}
                    className="block mt-0.5 text-caption text-primary"
                  >
                    {reasonLabels[reason] ?? reason}
                  </span>
                </div>
                <span className="shrink-0 text-micro font-label uppercase tracking-widest text-primary">
                  {mealGap.logCta}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
