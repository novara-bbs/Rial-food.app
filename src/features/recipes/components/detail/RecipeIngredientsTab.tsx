/**
 * RecipeDetail "Ingredients" tab — checklist + add-extra search + brand-swap.
 *
 * Extracted from RecipeDetail.tsx (Phase 3.1, ADR-015).
 * Pure presentation; ingredient mutations come in via prop callbacks (the
 * parent owns extraIngredients + checkedIngredients + variantSwaps state).
 */
import { CheckCircle2, Circle, Plus, ShoppingCart, X, RefreshCw } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/patterns/SearchInput';
import { useI18n } from '@/i18n';
import type { Ingredient } from '../../../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DisplayedIngredient = {
  id: string;
  name: string;
  amount: number;
  unit: string;
  isExtra?: boolean;
  brandName?: string;
  familyId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
};

interface RecipeIngredientsTabProps {
  allIngredientsToDisplay: DisplayedIngredient[];
  checkedIngredients: string[];
  toggleIngredient: (id: string) => void;
  formatAmount: (n: number) => string | number;
  /** Extras-search UX state */
  isAddingIngredient: boolean;
  setIsAddingIngredient: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredDictionary: Ingredient[];
  addExtraIngredient: (ing: Ingredient) => void;
  /** Per-row mutation callbacks (only invoked for `isExtra` rows). */
  updateExtraIngredientAmount: (id: string, value: string) => void;
  removeExtraIngredient: (id: string) => void;
  /** Brand-swap picker (P7 D1) — only invoked for rows with `familyId`. */
  openSwapPicker: (rowId: string, familyId: string) => void;
  /** Add to shopping list — optional; button hidden when undefined. */
  handleAddToShoppingList?: () => void;
  onAddToShoppingList?: unknown;
  /** Default 'ingredients' — only override if the parent uses a different tab id. */
  tabValue?: string;
}

export default function RecipeIngredientsTab({
  allIngredientsToDisplay,
  checkedIngredients,
  toggleIngredient,
  formatAmount,
  isAddingIngredient,
  setIsAddingIngredient,
  searchQuery,
  setSearchQuery,
  filteredDictionary,
  addExtraIngredient,
  updateExtraIngredientAmount,
  removeExtraIngredient,
  openSwapPicker,
  handleAddToShoppingList,
  onAddToShoppingList,
  tabValue = 'ingredients',
}: RecipeIngredientsTabProps) {
  const { t } = useI18n();

  return (
    <TabsContent value={tabValue} className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
          {allIngredientsToDisplay.length} {t.recipeDetail.ingredientsCount}
        </span>
        <div className="flex gap-2">
          {Boolean(onAddToShoppingList) && handleAddToShoppingList && (
            <Button variant="outline" size="sm" onClick={handleAddToShoppingList}>
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> {t.recipeDetail.listBtn}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsAddingIngredient(!isAddingIngredient)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> {t.recipeDetail.extraBtn}
          </Button>
        </div>
      </div>

      {/* Add extra ingredient search */}
      {isAddingIngredient && (
        <div className="bg-surface-container-highest p-3 rounded-sm border border-outline-variant/20">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.recipeDetail.searchIngredients}
            size="sm"
            className="mb-3"
          />
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto space-y-1 bg-surface-container-low p-2 rounded-sm border border-outline-variant/10">
              {filteredDictionary.length > 0 ? filteredDictionary.slice(0, 10).map(ing => (
                <button
                  type="button"
                  key={ing.id}
                  onClick={() => addExtraIngredient(ing)}
                  className="w-full text-left px-3 py-2 rounded-sm hover:bg-surface-container-highest flex justify-between items-center group"
                >
                  <span className="text-sm text-tertiary">{ing.name}</span>
                  <span className="text-xs text-on-surface-variant group-hover:text-primary">{t.recipeDetail.addExtra}</span>
                </button>
              )) : <p className="text-xs text-on-surface-variant text-center py-2">{t.recipeDetail.noResults}</p>}
            </div>
          )}
        </div>
      )}

      {/* Ingredient list */}
      <div className="space-y-1.5">
        {allIngredientsToDisplay.map(ing => (
          <div key={ing.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleIngredient(ing.id)}
              className="flex-1 flex items-center gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/10 hover:border-primary/30 transition-colors text-left group"
            >
              {checkedIngredients.includes(ing.id)
                ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                : <Circle className="w-4 h-4 text-on-surface-variant shrink-0 group-hover:text-primary/50" />
              }
              <span className={`text-sm flex-1 ${checkedIngredients.includes(ing.id) ? 'text-on-surface-variant line-through' : 'text-tertiary'}`}>
                {ing.isExtra && <span className="text-primary font-bold mr-1">[+]</span>}
                {ing.amount === 0 ? '' : formatAmount(ing.amount)} {ing.unit} {ing.name}
                {ing.brandName && (
                  <span className="ml-1.5 inline-flex items-center text-micro font-label uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {ing.brandName}
                  </span>
                )}
              </span>
            </button>

            {ing.isExtra && (
              <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-sm border border-outline-variant/10">
                <input
                  type="number"
                  value={ing.amount}
                  onChange={e => updateExtraIngredientAmount(ing.id, e.target.value)}
                  className="w-14 bg-surface-container-highest border-none rounded-sm py-1 px-2 text-sm text-tertiary text-center focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-micro text-on-surface-variant">{ing.unit}</span>
                <button
                  type="button"
                  onClick={() => removeExtraIngredient(ing.id)}
                  aria-label={t.recipes.removeIngredient}
                  className="min-w-11 min-h-11 flex items-center justify-center text-outline hover:text-error"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* P7 D1 — swap variant (brand) for this recipe ingredient. Only
                shown when the row has a resolvable family. Transient — does
                not mutate savedRecipes this sprint. */}
            {!ing.isExtra && ing.familyId && (
              <button
                type="button"
                onClick={() => openSwapPicker(ing.id, ing.familyId!)}
                aria-label={t.recipeDetail.swapVariant}
                className="min-w-11 min-h-11 flex items-center justify-center rounded-sm text-on-surface-variant hover:text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
    </TabsContent>
  );
}
