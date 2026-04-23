import React, { useState, useMemo } from 'react';
import { Plus, Link, ShoppingCart, Sparkles, Sunrise, Sun, Moon, Cookie, Zap, ArrowUpDown } from 'lucide-react';
import CollectionsCarousel from '../components/CollectionsCarousel';
import { COLLECTIONS } from '../data/collections';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import SearchInput from '../../../components/patterns/SearchInput';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { calculateMatchScore } from '../utils/matchScore';
import { recipeFitsSlot } from '../utils/meal-slot';
import type { MealSlot } from '../../../types';
import EmptyState from '../../../components/EmptyState';
import PageShell from '../../../components/PageShell';
import RecipeCard from '../../../components/patterns/RecipeCard';
import FilterRow from '../../../components/patterns/FilterRow';
import TabNav from '../../../components/patterns/TabNav';
import { aggregateShoppingItems, detectCategory, AISLE_CATEGORIES } from '../../planner/utils/grocery';
import Planner from '../../planner/screens/Planner';
import ShoppingList from '../../planner/screens/ShoppingList';
import BatchCookingSuggestions from '../../planner/components/BatchCookingSuggestions';
import { toast } from 'sonner';

export default function Cocina({ onAddMeal, onCreateRecipe, onNavigateToRecipe, savedRecipes = [], setSavedRecipes, mealPlan, setMealPlan, shoppingList, setShoppingList, onLogMeal, isPro, onImportUrl }: {
  onAddMeal: (dayIndex: number) => void;
  onCreateRecipe: () => void;
  onNavigateToRecipe?: (recipe: any) => void;
  savedRecipes?: any[];
  setSavedRecipes?: any;
  mealPlan: any;
  setMealPlan?: any;
  shoppingList: any[];
  setShoppingList: any;
  onLogMeal?: (meal: any) => void;
  isPro?: boolean;
  onImportUrl?: () => void;
}) {
  const { t } = useI18n();
  const { userProfile, dictionary, dailyMacros } = useAppState();
  const [activeTab, setActiveTab] = useState<'recipes' | 'plan' | 'list'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollection, setActiveCollection] = useState('all');
  const [activeMealType, setActiveMealType] = useState<string>('all');
  const [sortMode, setSortMode] = useLocalStorageState<'recommended' | 'recent' | 'quick' | 'highProtein' | 'mostCooked'>(
    'cocinaSort', 'recommended',
  );

  const parseMin = (v: any) => typeof v === 'number' ? v : parseInt(String(v)) || 0;

  // Profile slice for match scoring
  const profileSlice = useMemo(() => ({
    goal: userProfile.goal,
    foodDislikes: userProfile.foodDislikes,
    intolerances: userProfile.intolerances,
    dailyTarget: { cal: dailyMacros.target.cal, pro: dailyMacros.target.pro },
  }), [userProfile, dailyMacros.target]);

  // Score and normalize all recipes
  const scoredRecipes = useMemo(() =>
    savedRecipes.map(r => {
      const prep = parseMin(r.prepTime);
      const cook = parseMin(r.cookTime);
      return {
        ...r,
        matchScore: calculateMatchScore(r, profileSlice, dictionary),
        cal: r.macros?.calories || 0,
        pro: r.macros?.protein || 0,
        totalTime: prep + cook,
        time: prep + cook > 0 ? `${prep + cook}M` : '—',
      };
    }),
    [savedRecipes, profileSlice, dictionary],
  );

  // Primary meal-slot filter. Recipes without `suitableFor` are versatile and
  // match every slot (see `recipeFitsSlot`). "Quick" lives in `collections`
  // below — it's a time axis, not a slot, and conflating them in one row
  // confused users (Q19 meal-taxonomy refactor).
  const mealCategories = [
    { id: 'all', label: t.discovery.catAll, icon: Sparkles },
    { id: 'breakfast', label: t.discovery.catBreakfast, icon: Sunrise },
    { id: 'lunch', label: t.discovery.catLunch, icon: Sun },
    { id: 'dinner', label: t.discovery.catDinner, icon: Moon },
    { id: 'snack', label: t.discovery.catSnack, icon: Cookie },
  ];

  const quickCount = scoredRecipes.filter(r => r.totalTime > 0 && r.totalTime <= 20).length;

  const collections = [
    { id: 'all', label: t.recipes.all, count: scoredRecipes.length },
    { id: 'mine', label: t.recipes.myRecipes, count: scoredRecipes.filter(r => r.publishedBy === 'self' && r.tag !== 'IMPORTADA').length },
    { id: 'imported', label: t.recipes.imported, count: scoredRecipes.filter(r => r.tag === 'IMPORTADA').length },
    { id: 'quick', label: t.discovery.catQuick, count: quickCount, icon: Zap },
    { id: 'high-protein', label: t.recipes.highProtein, count: scoredRecipes.filter(r => r.pro >= 30).length },
    // R2.4 — verified tier + cookedAt filters
    { id: 'verified', label: (t.recipes as any).filterVerified ?? 'Verificadas', count: scoredRecipes.filter(r => r.verified != null).length },
    { id: 'cooked', label: (t.recipes as any).filterCooked ?? 'Ya cocinadas', count: scoredRecipes.filter(r => r.cookedAt?.length > 0).length },
  ];

  // Combined filters: slot (primary) + collection (secondary) + search + sort.
  const filteredRecipes = useMemo(() => {
    let list = scoredRecipes;
    if (activeMealType !== 'all') {
      list = list.filter(r => recipeFitsSlot(r, activeMealType as MealSlot));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.title?.toLowerCase().includes(q) || r.tag?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
    }
    if (activeCollection === 'mine') list = list.filter(r => r.publishedBy === 'self' && r.tag !== 'IMPORTADA');
    if (activeCollection === 'imported') list = list.filter(r => r.tag === 'IMPORTADA');
    if (activeCollection === 'quick') list = list.filter(r => r.totalTime > 0 && r.totalTime <= 20);
    if (activeCollection === 'high-protein') list = list.filter(r => r.pro >= 30);
    if (activeCollection === 'verified') list = list.filter(r => r.verified != null);
    if (activeCollection === 'cooked') list = list.filter(r => r.cookedAt?.length > 0);
    // R3 collection predicates (for CollectionsCarousel-driven filters)
    // Falls through for ids not handled above (vegan / lowCarb / batch / highProtein)
    const registryCol = COLLECTIONS.find(c => c.id === activeCollection);
    if (registryCol && !['all', 'mine', 'imported'].includes(activeCollection)) {
      list = list.filter(registryCol.predicate);
    }
    // Sort
    const sorted = [...list];
    if (sortMode === 'recommended') sorted.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    else if (sortMode === 'recent') sorted.sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''));
    else if (sortMode === 'quick') sorted.sort((a, b) => (a.totalTime || 999) - (b.totalTime || 999));
    else if (sortMode === 'highProtein') sorted.sort((a, b) => (b.pro ?? 0) - (a.pro ?? 0));
    else if (sortMode === 'mostCooked') sorted.sort((a, b) => (b.cookedAt?.length ?? 0) - (a.cookedAt?.length ?? 0));
    return sorted;
  }, [scoredRecipes, activeMealType, searchQuery, activeCollection, sortMode]);

  const handleDeleteRecipe = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    if (setSavedRecipes) setSavedRecipes((prev: any[]) => prev.filter(r => r.id !== id));
  };

  const handleGenerateList = () => {
    const dayMeals = Object.values(mealPlan as Record<number, any[]>).flat();
    if (!dayMeals.length) {
      toast.info(t.cocina.addRecipesFirst);
      return;
    }
    let idCounter = Date.now();
    const rawItems: any[] = [];
    dayMeals.forEach(meal => {
      if (meal.recipeIngredients?.length) {
        meal.recipeIngredients.forEach((ri: any) => {
          const name = ri.ingredient?.name || ri.name || meal.title;
          rawItems.push({
            id: idCounter++,
            name,
            category: detectCategory(name),
            checked: false,
            quantity: ri.amount || undefined,
            unit: ri.unit || '',
            source: [meal.title],
          });
        });
      } else {
        rawItems.push({
          id: idCounter++,
          name: meal.title,
          category: AISLE_CATEGORIES.planned,
          checked: false,
          source: [meal.title],
        });
      }
    });
    const aggregated = aggregateShoppingItems(rawItems);
    setShoppingList(aggregated);
    toast.success(t.cocina.listGenerated.replace('{count}', String(aggregated.length)));
    setActiveTab('list');
  };

  const tabs = [
    { id: 'recipes' as const, label: t.tabs.recipeBook },
    { id: 'plan' as const, label: t.tabs.plan },
    { id: 'list' as const, label: t.tabs.list },
  ];

  return (
    <div className="flex flex-col h-full">
      <TabNav tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

      <div className="flex-1 overflow-y-auto pt-4">
        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <PageShell maxWidth="wide" spacing="sm">
            {/* Search + actions */}
            <div className="flex gap-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t.recipes.search}
                className="flex-1"
              />
              <button type="button" onClick={onCreateRecipe} className="p-3 bg-primary text-on-primary rounded-sm hover:opacity-90 transition-opacity" title={t.recipes.create}>
                <Plus className="w-5 h-5" />
              </button>
              {onImportUrl && (
                <button type="button" onClick={onImportUrl} className="p-3 bg-surface-container-highest text-primary border border-outline-variant/20 rounded-sm hover:bg-primary/10 transition-colors" title={t.recipes.import}>
                  <Link className="w-5 h-5" />
                </button>
              )}
            </div>

            <FilterRow options={mealCategories} active={activeMealType} onChange={setActiveMealType} variant="icon" className="-mx-6 px-6" />

            {/* Collections discovery carousel — only visible with no active filter or search */}
            {activeCollection === 'all' && !searchQuery.trim() && (
              <CollectionsCarousel
                recipes={scoredRecipes}
                activeCollection={activeCollection}
                onSelect={setActiveCollection}
                className="mt-1"
              />
            )}

            <FilterRow options={collections} active={activeCollection} onChange={setActiveCollection} variant="pill" className="-mx-6 px-6" />

            {/* Sort row + recipe count */}
            <div className="flex items-center justify-between">
              {!isPro && (
                <div className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                  {t.recipes.recipeCount.replace('{count}', String(savedRecipes.length))}
                </div>
              )}
              <div className={`flex items-center gap-1.5 ml-auto ${isPro ? '' : ''}`}>
                <ArrowUpDown className="w-3.5 h-3.5 text-on-surface-variant" aria-hidden="true" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
                  className="text-xs font-label uppercase tracking-widest bg-transparent text-on-surface-variant border-0 outline-none cursor-pointer hover:text-tertiary transition-colors"
                  aria-label={(t.recipes as any).sortRecommended ?? 'Ordenar'}
                >
                  <option value="recommended">{(t.recipes as any).sortRecommended ?? 'Recomendadas'}</option>
                  <option value="recent">{(t.recipes as any).sortRecent ?? 'Recientes'}</option>
                  <option value="quick">{(t.recipes as any).sortQuick ?? 'Rápidas'}</option>
                  <option value="highProtein">{(t.recipes as any).sortHighProtein ?? 'Alta proteína'}</option>
                  <option value="mostCooked">{(t.recipes as any).sortMostCooked ?? 'Más cocinadas'}</option>
                </select>
              </div>
            </div>

            {/* Recipe grid — portrait cards */}
            {filteredRecipes.length === 0 ? (
              searchQuery.trim() ? (
                <EmptyState icon="🔍" description={(t.recipes as any).emptySearchHint?.replace('{query}', searchQuery) ?? `No hay coincidencias para "${searchQuery}"`}>
                  <button type="button" onClick={() => setSearchQuery('')} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/20 text-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                    {(t.common as any).clear ?? 'Limpiar búsqueda'}
                  </button>
                </EmptyState>
              ) : activeCollection !== 'all' ? (
                <EmptyState icon="📂" description={(t.recipes as any).emptyFilterHint ?? 'Prueba otro filtro o busca por nombre'}>
                  <button type="button" onClick={() => setActiveCollection('all')} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/20 text-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                    {t.recipes.all}
                  </button>
                </EmptyState>
              ) : (
                <EmptyState icon="📖" description={t.empty.recipesEmpty}>
                  <div className="flex gap-3">
                    <button type="button" onClick={onCreateRecipe} className="px-6 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                      {t.recipes.create}
                    </button>
                    {onImportUrl && (
                      <button type="button" onClick={onImportUrl} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/20 text-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                        {t.recipes.import}
                      </button>
                    )}
                  </div>
                </EmptyState>
              )
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredRecipes.map((recipe: any) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    variant="grid"
                    onPress={() => onNavigateToRecipe?.(recipe)}
                    onDelete={(e) => handleDeleteRecipe(e, recipe.id)}
                  />
                ))}
              </div>
            )}
          </PageShell>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <>
            <div className="px-6 pb-3">
              <button type="button"
                onClick={handleGenerateList}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4" />
                {t.cocina.generateList}
              </button>
            </div>
            {/* Batch cooking suggestions — only shown when meal plan has ≥2 meals sharing a base ingredient */}
            <BatchCookingSuggestions mealPlan={mealPlan ?? {}} />
            <Planner onAddMeal={onAddMeal} mealPlan={mealPlan} setMealPlan={setMealPlan} setShoppingList={setShoppingList} onLogMeal={onLogMeal} />
          </>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <ShoppingList shoppingList={shoppingList} setShoppingList={setShoppingList} onNavigateToPlan={() => setActiveTab('plan')} />
        )}
      </div>
    </div>
  );
}
