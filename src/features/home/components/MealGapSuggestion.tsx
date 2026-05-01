/**
 * P11 `[1.5.69]` — «Qué me falta hoy» dynamic Home card.
 * Sprint 50 `[1.5.164]` — extended to surface Recipes that close the gap, not
 * just raw FoodVariants. Recipes are first (more actionable: cook → log →
 * full nutrition); ingredients are kept as the «fast fix» fallback below.
 *
 * Shows up to 3 recipes + up to 3 food suggestions based on the user's macro
 * gap. Recipe tap opens the recipe detail (no auto-log — user picks portions).
 * Food tap logs ~1 standard serving (100 g) directly. Nothing renders when:
 *   - the user has no meaningful deficit (all macros within thresholds)
 *   - the user hasn't finished onboarding (no targets set)
 *   - neither recipes nor variants produce positive density for the deficit macro
 *
 * Owner directive 2026-04-21 — el diferenciador de RIAL es recomendar
 * personalizadamente. Owner directive 2026-04-30 — la sección debe sugerir
 * RECETAS con alto contenido del macro deficitario (no solo proteína de suero
 * pura), priorizando las planeadas hoy o las que aún no se han comido.
 *
 * Wiring: mounted in Home.tsx after TodaysMeals. Degrada silenciosamente
 * cuando no hay suggestions.
 */
import { useMemo } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import RecipeCard from '../../../components/patterns/RecipeCard';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Typography';
import { useI18n } from '../../../i18n';
import type { FoodVariant } from '../../../types/food-family';
import type { Recipe } from '../../../types/recipe';
import type { Allergen } from '../../../types/food';
import type { DailyLogEntry, FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import {
  computeMealGaps,
  biggestDeficit,
  type ConsumedTarget,
  type MacroKey,
} from '../utils/meal-gaps';
import { rankFoodsForGap } from '../utils/suggest-foods';
import { rankRecipesForGap } from '../utils/suggest-recipes';
import { getFamilyImage } from '../../food/data/family-images';

interface Props {
  /** Same shape as `AppStateContext.dailyMacros` (consumed + target). */
  dailyMacros: ConsumedTarget;
  /** Seed + userVariants merged — pass `mergedVariants` from AppStateContext. */
  mergedVariants: readonly FoodVariant[];
  /** User vault — used to surface high-macro recipes. */
  savedRecipes?: readonly Recipe[];
  /** Recipes the user planned for today's slot grid. */
  mealPlanToday?: readonly Recipe[];
  /** Today's daily log — used to penalise repeats. */
  dailyLog?: readonly DailyLogEntry[];
  /** Optional recent-foods signal to boost variants the user already likes. */
  foodHistory?: FoodHistoryEntry[];
  /** Optional user goal string (free-form). Filters grade-E foods. */
  userGoal?: string | null;
  /** Optional intolerance/allergen exclusion list (typed as Allergen[]). */
  excludeAllergens?: readonly Allergen[];
  /** Called when a food suggestion is tapped. Logs 1× 100 g serving. */
  onLogFood: (variant: FoodVariant) => void;
  /** Called when a recipe suggestion is tapped. Opens RecipeDetail. */
  onNavigateToRecipe?: (recipe: Recipe) => void;
}

function macroLabelKey(key: MacroKey): string {
  return key; // maps 1:1 to t.home.mealGap.deficit.<key>
}

export default function MealGapSuggestion({
  dailyMacros,
  mergedVariants,
  savedRecipes,
  mealPlanToday,
  dailyLog,
  foodHistory,
  userGoal,
  excludeAllergens,
  onLogFood,
  onNavigateToRecipe,
}: Props) {
  const { t, locale } = useI18n();

  const deficit = useMemo(() => {
    const gaps = computeMealGaps(dailyMacros);
    return biggestDeficit(gaps);
  }, [dailyMacros]);

  const foodSuggestions = useMemo(() => {
    if (!deficit) return [];
    return rankFoodsForGap(deficit.key, mergedVariants, {
      rawGoal: userGoal ?? null,
      history: foodHistory,
      excludeAllergens: (excludeAllergens ?? []).map(a => a as string),
      limit: 3,
    });
  }, [deficit, mergedVariants, foodHistory, userGoal, excludeAllergens]);

  const recipeSuggestions = useMemo(() => {
    if (!deficit) return [];
    if (!savedRecipes || savedRecipes.length === 0) return [];
    return rankRecipesForGap(deficit.key, savedRecipes, {
      mealPlanToday,
      dailyLog,
      intolerances: excludeAllergens,
      limit: 3,
    });
  }, [deficit, savedRecipes, mealPlanToday, dailyLog, excludeAllergens]);

  if (!deficit) return null;
  if (foodSuggestions.length === 0 && recipeSuggestions.length === 0) return null;

  const mealGap = t.home.mealGap;
  const deficitLabels = mealGap.deficit as Record<string, string>;
  const reasonLabels = mealGap.reason as Record<string, string>;
  const deficitAmount = Math.round(deficit.gap.deficit);
  const deficitCopy = mealGap.deficitCopy
    .replace('{{amount}}', String(deficitAmount))
    .replace('{{macro}}', deficitLabels[macroLabelKey(deficit.key)] ?? deficit.key);

  return (
    <SectionCard data-meal-gap-suggestion>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <Heading level="h3" className="text-body text-on-surface normal-case tracking-normal">
              {mealGap.title}
            </Heading>
            <p className="text-body-sm text-on-surface-variant leading-snug">
              {deficitCopy}
            </p>
          </div>
        </div>

        {/* Recipes sub-block — first because they're more actionable. */}
        {recipeSuggestions.length > 0 && onNavigateToRecipe && (
          <div className="space-y-1.5" data-meal-gap-recipes>
            <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
              {mealGap.recipesTitle}
            </span>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6 snap-x">
              {recipeSuggestions.map(({ recipe, reason }) => (
                <div key={recipe.id} className="basis-[42%] shrink-0 snap-start" data-suggestion-reason={reason}>
                  <RecipeCard
                    variant="compact"
                    recipe={{
                      id: recipe.id,
                      title: recipe.title,
                      // Seeds use legacy `img`; user-saved recipes use canonical `image`.
                      // Fall back so RecipeCard always sees a populated URL.
                      image: recipe.image ?? recipe.img,
                      cal: recipe.macros.calories,
                      pro: recipe.macros.protein,
                      tag: recipe.tag,
                    }}
                    className="w-full"
                    onPress={() => onNavigateToRecipe(recipe)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Foods sub-block — quick-fix ingredients. */}
        {foodSuggestions.length > 0 && (
          <div className="space-y-1.5" data-meal-gap-foods>
            {recipeSuggestions.length > 0 && (
              <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {mealGap.foodsTitle}
              </span>
            )}
            <div className="flex flex-col gap-1.5">
              {foodSuggestions.map(({ variant, reason }) => {
                const emoji = getFamilyImage(variant.familyId);
                const name = locale === 'es' ? variant.name : variant.nameEn;
                const macros = variant.macros;
                return (
                  <Button
                    key={variant.id}
                    variant="ghost"
                    onClick={() => onLogFood(variant)}
                    aria-label={`${mealGap.logCta}: ${name}`}
                    className="w-full h-auto justify-start gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-high font-normal normal-case tracking-normal text-left"
                  >
                    <span aria-hidden="true" className="w-10 h-10 text-2xl leading-none shrink-0 select-none flex items-center justify-center">
                      {emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block font-headline font-bold text-body-sm text-on-surface truncate">
                        {name}
                      </span>
                      <span className="block text-caption text-on-surface-variant">
                        {macros.calories} {t.common.kcal} · P {macros.protein} · C {macros.carbs} · G {macros.fats}
                      </span>
                      <span
                        data-suggestion-reason={reason}
                        className="block mt-0.5 text-caption text-primary"
                      >
                        {reasonLabels[reason] ?? reason}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
