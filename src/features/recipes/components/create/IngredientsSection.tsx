/**
 * CreateRecipe wizard — Step 2: Ingredients.
 *
 * Manages its own search / expand / paste / variant-picker UI state.
 * Data state (recipeIngredients) is lifted to the CreateRecipe orchestrator.
 */
import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, ArrowUp, ArrowDown, ChevronRight, Layers, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Typography';
import BottomSheet from '../../../../components/ui/bottom-sheet';
import PortionSelector, { scaleMacros } from '../../../food/components/PortionSelector';
import VariantPickerSheet from '../../../food/components/VariantPickerSheet';
import MacroTile from '../../../../components/patterns/MacroTile';
import DashedAddButton from '../../../../components/patterns/DashedAddButton';
import { parseBulkIngredients, toApproxGrams } from '../../utils/ingredient-parser';
import type { ParsedIngredient } from '../../utils/ingredient-parser';
import { searchFamilies, resolveVariant } from '../../../food/utils/food-family-resolver';
import { variantToIngredient } from '../../../food/utils/variant-to-ingredient';
import { useI18n } from '../../../../i18n';
import { swapped } from '../../utils/create-recipe-helpers';
import type { Ingredient, RecipeIngredient } from '../../../../types';
import type { FoodFamily, FoodVariant } from '../../../../types/food-family';

export interface IngredientTotals {
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface PerServing {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface IngredientsSectionProps {
  recipeIngredients: RecipeIngredient[];
  onRecipeIngredientsChange: (updater: (prev: RecipeIngredient[]) => RecipeIngredient[]) => void;
  totals: IngredientTotals;
  perServing: PerServing;
  servings: number;
  dictionary: Ingredient[];
  mergedVariants: FoodVariant[];
  userVariants: FoodVariant[];
  unitSystem: 'metric' | 'imperial';
}

export default function IngredientsSection({
  recipeIngredients,
  onRecipeIngredientsChange,
  totals,
  perServing,
  servings,
  dictionary,
  mergedVariants,
  userVariants,
  unitSystem,
}: IngredientsSectionProps) {
  const { t, locale } = useI18n();

  // ── Local UI state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedIngId, setExpandedIngId] = useState<string | null>(null);
  const [pendingGrams, setPendingGrams] = useState(100);

  // Variant picker
  const [pickerFamily, setPickerFamily] = useState<FoodFamily | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Paste-bulk sheet
  const [pasteSheetOpen, setPasteSheetOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsedLines, setParsedLines] = useState<ParsedIngredient[]>([]);

  // ── Derived ──
  const filteredDictionary = useMemo(() => {
    if (!searchQuery.trim()) return dictionary.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return dictionary
      .filter(i => i.name.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q))
      .slice(0, 20);
  }, [searchQuery, dictionary]);

  const familyResults = useMemo(
    () => searchQuery.trim().length >= 2
      ? searchFamilies(searchQuery, mergedVariants, 6)
      : [],
    [searchQuery, mergedVariants],
  );

  // ── Handlers ──
  const handleAddFromDictionary = (ing: Ingredient, grams: number) => {
    onRecipeIngredientsChange(prev => [...prev, {
      id: Date.now().toString(),
      ingredientId: ing.id,
      amount: grams,
      unit: ing.baseUnit,
      ingredient: ing,
    }]);
    setExpandedIngId(null);
    setSearchQuery('');
    setPendingGrams(100);
  };

  const handleAddFromVariant = (family: FoodFamily, variant: FoodVariant, grams: number) => {
    const isCanonical = variant.id === family.canonicalVariantId;
    onRecipeIngredientsChange(prev => [...prev, {
      id: Date.now().toString(),
      familyId: family.id,
      variantId: isCanonical ? undefined : variant.id,
      ingredientId: variant.id,
      amount: grams,
      unit: variant.baseUnit,
      ingredient: variantToIngredient(variant),
    }]);
    setPickerFamily(null);
    setPickerOpen(false);
    setSearchQuery('');
    setPendingGrams(100);
  };

  const handleRemove = (id: string) =>
    onRecipeIngredientsChange(prev => prev.filter(ri => ri.id !== id));

  const handlePastePreview = (text: string) => {
    setPasteText(text);
    setParsedLines(parseBulkIngredients(text));
  };

  const handlePasteConfirm = () => {
    const toAdd: RecipeIngredient[] = [];
    for (const item of parsedLines) {
      if (item.confidence < 0.6 || !item.name) continue;
      const nameLower = item.name.toLowerCase();
      const ing = dictionary.find(
        d => d.name.toLowerCase().includes(nameLower) || d.nameEn?.toLowerCase().includes(nameLower),
      );
      if (!ing) continue;
      const defaultGrams = ing.servingSizes.find(s => s.isDefault)?.grams ?? 100;
      const grams = toApproxGrams(item.quantity, item.unit, defaultGrams);
      toAdd.push({
        id: `paste-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ingredientId: ing.id,
        amount: Math.max(1, grams),
        unit: ing.baseUnit,
        ingredient: ing,
      });
    }
    if (toAdd.length > 0) onRecipeIngredientsChange(prev => [...prev, ...toAdd]);
    setPasteSheetOpen(false);
    setPasteText('');
    setParsedLines([]);
  };

  const resolveIngredient = (ri: RecipeIngredient): Ingredient | undefined => {
    const fromDict = dictionary.find(i => i.id === ri.ingredientId);
    if (fromDict) return fromDict;
    const variant = ri.familyId
      ? resolveVariant(ri.familyId, ri.variantId ?? undefined)
      : mergedVariants.find(v => v.id === ri.ingredientId);
    return variant ? variantToIngredient(variant) : undefined;
  };

  return (
    <div className="space-y-4">
      {/* Running macro total */}
      <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">
            {t.createRecipe.totalMacros}
          </span>
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
            <MacroTile
              key={m.label}
              size="sm"
              value={m.value}
              label={m.label}
              valueColorClassName={m.color}
            />
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
        const ing = resolveIngredient(ri);
        if (!ing) return null;
        const sm = scaleMacros(ing.macros, ing.baseAmount, ri.amount);
        return (
          <div key={ri.id} className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-3 flex items-center gap-2">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => onRecipeIngredientsChange(prev => swapped(prev, idx, -1))}
                disabled={idx === 0}
                aria-label={locale === 'es' ? 'Subir ingrediente' : 'Move ingredient up'}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRecipeIngredientsChange(prev => swapped(prev, idx, 1))}
                disabled={idx === recipeIngredients.length - 1}
                aria-label={locale === 'es' ? 'Bajar ingrediente' : 'Move ingredient down'}
                className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <Heading level="h4" className="text-body-sm tracking-tight truncate">{ing.name}</Heading>
              <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {ri.amount}g — {sm.calories} kcal · {sm.protein}g P
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(ri.id)}
              className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-sm transition-colors shrink-0"
            >
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
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.createRecipe.searchIngredient}
              className="flex-1 bg-transparent text-sm font-body text-tertiary focus:outline-none placeholder:text-on-surface-variant"
            />
            <button
              type="button"
              onClick={() => { setIsSearching(false); setSearchQuery(''); setExpandedIngId(null); }}
              className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-tertiary"
            >
              {t.common.cancel}
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant/10">
            {/* Family-first rows (P4) */}
            {familyResults.map(({ family, canonical }) => {
              const familyName = locale === 'es' ? family.name : family.nameEn;
              return (
                <button
                  key={`fam-${family.id}`}
                  type="button"
                  onClick={() => { setPickerFamily(family); setPickerOpen(true); }}
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
                <button
                  type="button"
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
                    <Button variant="brand" size="sm" className="w-full" onClick={() => handleAddFromDictionary(ing, pendingGrams)}>
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
            onClick={() => setPasteSheetOpen(true)}
            icon={ClipboardList}
            width="auto"
            hideLabelOnMobile
          />
        </div>
      )}

      {/* Variant picker sheet (P4) */}
      {pickerFamily && (
        <VariantPickerSheet
          family={pickerFamily}
          allVariants={mergedVariants}
          userVariants={userVariants}
          open={pickerOpen}
          onOpenChange={open => {
            setPickerOpen(open);
            if (!open) setPickerFamily(null);
          }}
          onSelect={variant => handleAddFromVariant(pickerFamily, variant, 100)}
        />
      )}

      {/* Paste-bulk ingredient sheet (R7.1) */}
      <BottomSheet
        open={pasteSheetOpen}
        onOpenChange={open => {
          setPasteSheetOpen(open);
          if (!open) { setPasteText(''); setParsedLines([]); }
        }}
        title={t.createRecipe.pasteListTitle}
        headerLayout="cancel-action"
        size="focus"
        actionSlot={
          parsedLines.filter(l => l.confidence >= 0.6).length > 0 ? (
            <button
              type="button"
              onClick={handlePasteConfirm}
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
            onChange={e => handlePastePreview(e.target.value)}
            placeholder={t.createRecipe.pasteListPlaceholder}
            rows={5}
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant resize-none"
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
                      {(!high || !matched) && (
                        <span className={`text-micro font-label uppercase tracking-widest ${high ? 'text-on-surface-variant' : 'text-error/60'}`}>
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
    </div>
  );
}
