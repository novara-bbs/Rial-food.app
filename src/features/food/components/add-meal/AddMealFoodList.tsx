import { Loader2, Globe, ChevronRight, Star, Plus } from 'lucide-react';
import { Heading } from '@/components/ui/Typography';
import EmptyState from '../../../../components/EmptyState';
import { useI18n } from '../../../../i18n';
import ContextualScoreChip from '../ContextualScoreChip';
import { getFoodQuality, FOOD_QUALITY_EMOJI } from '../../utils/nutrition';
import type { FoodFamily, FoodVariant } from '../../../../types/food-family';
import type { Goal } from '../../utils/contextual-score';

/** Duck-typed union covering Ingredient, Recipe, OFFResult, and history fallback shapes. */
export type DisplayFood = {
  id?: string | number;
  title?: string;
  name?: string;
  nameEn?: string;
  cal?: number;
  pro?: number;
  carbs?: number;
  fats?: number;
  macros?: { calories?: number; protein?: number; carbs?: number; fats?: number };
  micros?: { others?: { fiber?: number } };
  servingSizes?: unknown[];
  isApiResult?: boolean;
  _historyEntry?: unknown;
  mealSlot?: string;
  time?: string;
  grams?: number;
  portionDescription?: string;
  servingUsed?: string;
  servings?: number;
  steps?: unknown;
  recipeIngredients?: unknown;
};

interface FamilyResult {
  family: FoodFamily;
  canonical: { macros: { calories: number; protein: number; carbs: number } };
}

interface AddMealFoodListProps {
  isSearching: boolean;
  isSearchingApi: boolean;
  browseMode: 'recents' | 'favorites' | 'all';
  familyResults: FamilyResult[];
  displayFoods: DisplayFood[];
  favoriteIds: string[];
  activeGoal: Goal | null;
  mergedVariants: FoodVariant[];
  locale: string;
  onPickFamily: (family: FoodFamily) => void;
  onToggleFavorite: (foodId: string) => void;
  onTapPlus: (food: DisplayFood) => void;
  /** Per-food scoreVariant factory — called once per rendered row. */
  scoreVariantFor: (food: DisplayFood) => FoodVariant | null;
}

/**
 * Food list section: family-first results header + flat food rows.
 *
 * Owns no state — everything flows from AddMeal. Extracted in Sprint 35
 * [1.5.149] to reduce AddMeal.tsx below 600 lines.
 */
export default function AddMealFoodList({
  isSearching,
  isSearchingApi,
  browseMode,
  familyResults,
  displayFoods,
  favoriteIds,
  activeGoal,
  locale,
  onPickFamily,
  onToggleFavorite,
  onTapPlus,
  scoreVariantFor,
}: AddMealFoodListProps) {
  const { t } = useI18n();

  return (
    <>
      {/* P3 — Family-first results (shown above flat results when query ≥ 2 chars) */}
      {isSearching && familyResults.length > 0 && (
        <section className="space-y-2">
          <Heading level="h4" variant="overline">{t.addMealScreen.pickerTitle}</Heading>
          <div className="space-y-1.5">
            {familyResults.map(({ family, canonical }) => {
              const familyName = locale === 'es' ? family.name : family.nameEn;
              return (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => onPickFamily(family)}
                  className="w-full bg-surface-container-low p-3 rounded-sm border border-outline-variant/20 flex items-center justify-between hover:border-primary/30 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <span className="font-headline text-body-sm uppercase text-tertiary block truncate">
                      {familyName}
                    </span>
                    <span className="text-micro font-label tracking-widest uppercase text-on-surface-variant">
                      {canonical.macros.calories} {t.common.kcal} · {canonical.macros.protein}g P · {canonical.macros.carbs}g C
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Food rows */}
      <div className="space-y-3">
        {isSearchingApi && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label uppercase tracking-widest py-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Open Food Facts…
          </div>
        )}

        {/* Empty states */}
        {displayFoods.length === 0 && !isSearchingApi && isSearching && (
          <EmptyState icon="🔍" title={t.common.noResults} description={t.empty.searchEmpty} />
        )}
        {displayFoods.length === 0 && !isSearching && browseMode === 'recents' && (
          <EmptyState icon="🕐" title={t.addMealScreen.noRecents} description={t.addMealScreen.noRecents} />
        )}
        {displayFoods.length === 0 && !isSearching && browseMode === 'favorites' && (
          <EmptyState icon="⭐" title={t.addMealScreen.noFavorites} description={t.addMealScreen.noFavorites} />
        )}

        {displayFoods.map(food => {
          const foodId = String(food.id);
          const isFav = favoriteIds.includes(foodId);
          const historyEntry = food._historyEntry as { useCount?: number } | null | undefined;
          // Prefix key by source to avoid DOM node swaps when search set changes.
          const keyPrefix = food.isApiResult ? 'off' : 'loc';
          const scoreVariant = scoreVariantFor(food);

          return (
            <div
              key={`${keyPrefix}-${foodId}`}
              className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 flex items-center justify-between group hover:border-primary/30 transition-colors"
            >
              <div className="min-w-0 flex-1 mr-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {scoreVariant && activeGoal && (
                    <ContextualScoreChip variant={scoreVariant} goal={activeGoal} size="sm" />
                  )}
                  {/* food item label — span, not heading, since it's a list row */}
                  <span className="font-headline text-body-sm uppercase text-tertiary truncate">
                    {food.title ?? food.name}
                  </span>
                  {food.isApiResult && (
                    <span className="text-micro font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                      <Globe className="w-2 h-2" /> OFF
                    </span>
                  )}
                  {(food.servingSizes?.length ?? 0) > 0 && (
                    <span className="text-micro font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                      DB
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-micro font-label tracking-widest uppercase text-on-surface-variant flex-wrap">
                  <span className="text-primary font-bold">
                    {food.cal ?? food.macros?.calories ?? 0} {t.common.kcal}
                  </span>
                  <span>·</span>
                  <span>{food.pro ?? food.macros?.protein ?? 0}g P</span>
                  <span>·</span>
                  <span>{food.carbs ?? food.macros?.carbs ?? 0}g C</span>
                  {food.macros && (
                    <span className="ml-1">
                      {FOOD_QUALITY_EMOJI[getFoodQuality(
                        {
                          calories: food.macros.calories ?? 0,
                          protein: food.macros.protein ?? 0,
                          carbs: food.macros.carbs ?? 0,
                          fats: food.macros.fats ?? 0,
                        },
                        food.micros?.others?.fiber,
                      )]}
                    </span>
                  )}
                  {(food.servingSizes?.length ?? 0) > 0 && (
                    <span className="text-on-surface-variant/70 italic normal-case text-micro">
                      {t.addMealScreen.adjustablePortion}
                    </span>
                  )}
                  {historyEntry && (
                    <span className="text-on-surface-variant/70 italic normal-case text-micro">
                      {t.addMealScreen.timesLogged.replace('{count}', String(historyEntry.useCount))}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onToggleFavorite(foodId);
                  }}
                  aria-label={isFav ? t.addMealScreen.removedFromFavorites : t.addMealScreen.addedToFavorites}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Star className={`w-4 h-4 ${isFav ? 'text-primary fill-primary' : ''}`} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onTapPlus(food)}
                  aria-label={t.addMealScreen.addToMeal}
                  className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
