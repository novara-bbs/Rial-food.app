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
import { Lightbulb, ChefHat, Apple, ChevronRight } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import RecipeImage from '@/components/ui/RecipeImage';
import { Heading } from '@/components/ui/Typography';
import { useI18n } from '../../../i18n';
import type { FoodVariant } from '../../../types/food-family';
import type { Recipe } from '../../../types/recipe';
import type { Allergen } from '../../../types/food';
import type { UserProfile } from '../../../types/user';
import type { DailyLogEntry, FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import {
  computeMealGaps,
  biggestDeficit,
  type ConsumedTarget,
  type MacroKey,
} from '../utils/meal-gaps';
import { rankFoodsForGap } from '../utils/suggest-foods';
import { rankRecipesForGap } from '../utils/suggest-recipes';
import { projectedConsumed } from '../utils/projected-gap';
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
  /** Today's daily log — used to dedupe meals already logged. */
  dailyLog?: readonly DailyLogEntry[];
  /** Last 7 days of nutritionHistory archives — feeds weekly-fatigue scorer. */
  weeklyArchive?: readonly DailyArchive[];
  /** Cross-day food history for ingredient affinity scoring. */
  foodHistory?: FoodHistoryEntry[];
  /** Profile — feeds preferences scorer (likes/dislikes, dietary, intolerances). */
  userProfile?: UserProfile | null;
  /** Creator IDs the user follows — feeds social scorer. */
  followedCreators?: readonly string[];
  /** Optional user goal string (free-form). Filters grade-E foods in the food ranker. */
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
  weeklyArchive,
  foodHistory,
  userProfile,
  followedCreators,
  userGoal,
  excludeAllergens,
  onLogFood,
  onNavigateToRecipe,
}: Props) {
  const { t, locale } = useI18n();

  // Sprint C [1.5.185] — projected gap. Adds planned-but-not-yet-logged
  // macros to the consumed side so we don't over-suggest when the plan
  // already covers the deficit.
  const projectedMacros = useMemo(
    () => projectedConsumed(dailyMacros, mealPlanToday ?? [], dailyLog ?? []),
    [dailyMacros, mealPlanToday, dailyLog],
  );

  const deficit = useMemo(() => {
    const gaps = computeMealGaps(projectedMacros);
    return biggestDeficit(gaps);
  }, [projectedMacros]);

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
      weeklyArchive,
      savedRecipes,
      foodHistory,
      userProfile,
      followedCreators,
      intolerances: excludeAllergens,
      limit: 3,
    });
  }, [
    deficit,
    savedRecipes,
    mealPlanToday,
    dailyLog,
    weeklyArchive,
    foodHistory,
    userProfile,
    followedCreators,
    excludeAllergens,
  ]);

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
    <section className="space-y-3" data-meal-gap-suggestion>
      {/* Header — outside SectionCard, identical pattern to <TodaysMeals> h2. */}
      <div className="px-1">
        <Heading level="h2" className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" aria-hidden="true" />
          {mealGap.title}
        </Heading>
        <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">
          {deficitCopy}
        </span>
      </div>

      <SectionCard padding="none" spacing="none" className="overflow-hidden">
        {/* Recipes band — stacked rows, identical pattern to <TodaysMeals> planned/logged. */}
        {recipeSuggestions.length > 0 && onNavigateToRecipe && (
          <div className="border-b border-outline-variant/15 last:border-b-0" data-meal-gap-recipes>
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
              <ChefHat className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
                {mealGap.recipesTitle}
              </span>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {recipeSuggestions.map(({ recipe, reason }) => {
                const calLabel = recipe.macros.calories
                  ? `${Math.round(recipe.macros.calories)} ${t.common.kcal}`
                  : '';
                const proLabel = (recipe.macros.protein ?? 0) > 0
                  ? `${Math.round(recipe.macros.protein)}g pro`
                  : '';
                const reasonLabel = reasonLabels[reason] ?? '';
                const metaParts = [calLabel, proLabel, reasonLabel].filter(Boolean);
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => onNavigateToRecipe(recipe)}
                    data-suggestion-reason={reason}
                    aria-label={`${t.postCard.viewRecipe}: ${recipe.title}`}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-highest/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <RecipeImage
                      src={recipe.image ?? null}
                      alt={recipe.title}
                      variant="thumbnail"
                      fallbackEmoji="🍽️"
                      className="w-10 h-10 rounded-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-headline text-body-sm font-bold text-on-surface truncate block">
                        {recipe.title}
                      </span>
                      <span className="text-micro font-label tracking-widest uppercase text-on-surface-variant truncate block">
                        {metaParts.join(' · ')}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Foods band — same row format as recipes. */}
        {foodSuggestions.length > 0 && (
          <div data-meal-gap-foods>
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
              <Apple className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
                {mealGap.foodsTitle}
              </span>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {foodSuggestions.map(({ variant, reason }) => {
                const emoji = getFamilyImage(variant.familyId);
                const name = locale === 'es' ? variant.name : variant.nameEn;
                const macros = variant.macros;
                const reasonLabel = reasonLabels[reason] ?? '';
                const metaParts = [`${macros.calories} ${t.common.kcal}`, reasonLabel].filter(Boolean);
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => onLogFood(variant)}
                    data-suggestion-reason={reason}
                    aria-label={`${mealGap.logCta}: ${name}`}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-highest/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <span aria-hidden="true" className="w-10 h-10 text-2xl leading-none shrink-0 select-none flex items-center justify-center bg-surface-container-highest rounded-sm">
                      {emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-headline text-body-sm font-bold text-on-surface truncate block">
                        {name}
                      </span>
                      <span className="text-micro font-label tracking-widest uppercase text-on-surface-variant truncate block">
                        {metaParts.join(' · ')}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </SectionCard>
    </section>
  );
}
