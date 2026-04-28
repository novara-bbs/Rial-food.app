/**
 * Step 2 — Ingredient search and list.
 *
 * Shows running macro totals, ingredient list with reorder/remove controls,
 * and a search panel for adding new ingredients (family-first P4 with flat
 * dictionary fallback). Delegates variant picker to parent via callbacks.
 *
 * Extracted in Sprint 32 [1.5.146] from CreateRecipe.tsx.
 */
import { Search, ChevronRight, Layers, ArrowUp, ArrowDown, Trash2, Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Typography';
import MacroTile from '../../../../components/patterns/MacroTile';
import DashedAddButton from '../../../../components/patterns/DashedAddButton';
import PortionSelector, { scaleMacros } from '../../../food/components/PortionSelector';
import { swapped } from '../../utils/create-recipe-utils';
import type { RecipeIngredient, Ingredient } from '../../../../types';
import type { FoodFamily, FoodVariant } from '../../../../types/food-family';
import type { useI18n } from '../../../../i18n';

type T = ReturnType<typeof useI18n>['t'];
type Locale = ReturnType<typeof useI18n>['locale'];

interface FamilyResult { family: FoodFamily; canonical: FoodVariant }

interface Props {
  recipeIngredients: RecipeIngredient[];
  setRecipeIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isSearching: boolean;
  setIsSearching: (v: boolean) => void;
  expandedIngId: string | null;
  setExpandedIngId: (v: string | null) => void;
  pendingGrams: number;
  setPendingGrams: (v: number) => void;
  onPickFamily: (family: FoodFamily) => void;
  onPasteListOpen: () => void;
  familyResults: FamilyResult[];
  filteredDictionary: Ingredient[];
  totals: { macros: { calories: number; protein: number; carbs: number; fats: number } };
  perServing: { calories: number; protein: number; carbs: number; fats: number };
  servings: number;
  locale: Locale;
  dictionary: Ingredient[];
  unitSystem: 'metric' | 'imperial';
  onAddIngredient: (ing: Ingredient, grams: number) => void;
  onRemoveIngredient: (id: string) => void;
  t: T;
}

export default function CreateRecipeStep2Ingredients({
  recipeIngredients, setRecipeIngredients,
  searchQuery, setSearchQuery,
  isSearching, setIsSearching,
  expandedIngId, setExpandedIngId,
  pendingGrams, setPendingGrams,
  onPickFamily, onPasteListOpen,
  familyResults, filteredDictionary,
  totals, perServing, servings,
  locale, dictionary, unitSystem,
  onAddIngredient, onRemoveIngredient,
  t,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Running macro total */}
      <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">{t.createRecipe.totalMacros}</span>
          <span className="font-label text-micro tracking-widest uppercase text-on-surface-variant">
            {recipeIngredients.length} items
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'kcal', value: totals.macros.calories, color: 'text-primary' },
            { label: 'Pro', value: `${totals.macros.protein}g`, color: 'text-macro-protein' },
            { label: 'Carbs', value: `${totals.macros.carbs}g`, color: 'text-macro-carbs' },
            { label: 'Fat', value: `${totals.macros.fats}g`, color: 'text-macro-fats' },
          ].map(m => (
            <MacroTile key={m.label} size="sm" value={m.value} label={m.label} valueColorClassName={m.color} />
          ))}
        </div>
        {servings > 1 && (
          <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant mt-2 text-center">
            {t.createRecipe.perServing}: {perServing.calories} kcal · {perServing.protein}g P · {perServing.carbs}g C · {perServing.fats}g F
          </p>
        )}
      </div>

      {/* Ingredient list */}
      {recipeIngredients.map((ri, idx) => {
        const ing = dictionary.find(i => i.id === ri.ingredientId);
        if (!ing) return null;
        const sm = scaleMacros(ing.macros, ing.baseAmount, ri.amount);
        return (
          <div key={ri.id} className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-3 flex items-center gap-2">
            <div className="flex flex-col">
              <button type="button" onClick={() => setRecipeIngredients(prev => swapped(prev, idx, -1))} disabled={idx === 0}
                aria-label={t.createRecipe.moveIngredientUp}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setRecipeIngredients(prev => swapped(prev, idx, 1))} disabled={idx === recipeIngredients.length - 1}
                aria-label={t.createRecipe.moveIngredientDown}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <Heading level="h4" className="text-body-sm tracking-tight truncate">{ing.name}</Heading>
              <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {ri.amount}g — {sm.calories} kcal · {sm.protein}g P
              </p>
            </div>
            <button type="button" onClick={() => onRemoveIngredient(ri.id)}
              className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-sm transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      {/* Search & add */}
      {isSearching ? (
        <div className="bg-surface-container-highest border border-outline-variant/30 rounded-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20">
            <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
            <input type="text" autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.createRecipe.searchIngredient}
              className="flex-1 bg-transparent text-sm font-body text-tertiary focus:outline-none placeholder:text-on-surface-variant" />
            <button type="button" onClick={() => { setIsSearching(false); setSearchQuery(''); setExpandedIngId(null); }}
              className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-tertiary">{t.common.cancel}</button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant/10">
            {/* P4 — family rows first */}
            {familyResults.map(({ family, canonical }) => {
              const familyName = locale === 'es' ? family.name : family.nameEn;
              return (
                <button
                  key={`fam-${family.id}`}
                  type="button"
                  onClick={() => onPickFamily(family)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex items-center gap-3"
                >
                  <Layers className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-headline font-bold text-body-sm text-tertiary truncate">{familyName}</span>
                    <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
                      {canonical.macros.calories} kcal / 100g · {canonical.macros.protein}g P
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary/60 shrink-0" aria-hidden="true" />
                </button>
              );
            })}
            {/* Flat dictionary rows */}
            {filteredDictionary.map(ing => (
              <div key={ing.id}>
                <button type="button"
                  onClick={() => {
                    setExpandedIngId(expandedIngId === ing.id ? null : ing.id);
                    setPendingGrams(ing.servingSizes.find(s => s.isDefault)?.grams ?? 100);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <span className="block font-headline font-bold text-body-sm text-tertiary truncate">{ing.name}</span>
                    <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
                      {ing.macros.calories} kcal / {ing.baseAmount}{ing.baseUnit} · {ing.macros.protein}g P
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-on-surface-variant transition-transform ${expandedIngId === ing.id ? 'rotate-90' : ''}`} />
                </button>
                {expandedIngId === ing.id && (
                  <div className="px-4 pb-4 space-y-3">
                    <PortionSelector ingredient={ing} onChange={r => setPendingGrams(r.totalGrams)} unitSystem={unitSystem} />
                    <Button variant="brand" size="sm" className="w-full" onClick={() => onAddIngredient(ing, pendingGrams)}>
                      <Plus className="w-3.5 h-3.5" /> {t.createRecipe.addIngredient}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredDictionary.length === 0 && familyResults.length === 0 && (
              <div className="p-6 text-center text-sm text-on-surface-variant">{t.common.noResults}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <DashedAddButton
            label={t.createRecipe.addIngredient}
            onClick={() => setIsSearching(true)}
            className="flex-1"
          />
          <DashedAddButton
            label={t.createRecipe.pasteList}
            ariaLabel={t.createRecipe.pasteListTitle}
            onClick={onPasteListOpen}
            icon={ClipboardList}
            width="auto"
            hideLabelOnMobile
          />
        </div>
      )}
    </div>
  );
}
