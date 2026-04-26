import React, { useState, useMemo } from 'react';
import { Plus, Link, ShoppingCart } from 'lucide-react';
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
import ChipRow from '../../../components/patterns/ChipRow';
import SortControl from '../../../components/patterns/SortControl';
import TabNav from '../../../components/patterns/TabNav';
import FilterButton from '../../../components/patterns/FilterButton';
import FilterSheet, { type FilterSection } from '../../../components/patterns/FilterSheet';
import ActiveFilterStrip, { type ActiveFilterChip } from '../../../components/patterns/ActiveFilterStrip';
import {
  matchesFilters,
  countActive,
  DIETARY_TAGS,
  TIME_BUCKETS,
  DIFFICULTIES,
  type FilterValues,
} from '../utils/facets';
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
  const [sortMode, setSortMode] = useLocalStorageState<'recommended' | 'recent' | 'quick' | 'highProtein' | 'mostCooked' | 'caloriesAsc'>(
    'cocinaSort', 'recommended',
  );
  // Advanced filter values (FilterSheet — Source/Diet/Time/Difficulty).
  // Persisted so the user's last applied filter set survives navigation.
  const [filterValues, setFilterValues] = useLocalStorageState<FilterValues>(
    'cocinaFilters', {},
  );
  const [filterOpen, setFilterOpen] = useState(false);

  const parseMin = (v: any) => typeof v === 'number' ? v : parseInt(String(v)) || 0;

  // Profile slice for match scoring
  // Derive foodDislikes from foodPreferences (R8.3 migration)
  const profileSlice = useMemo(() => ({
    goal: userProfile.goal,
    foodDislikes: Object.entries(userProfile.foodPreferences ?? {})
      .filter(([, v]) => v === 'dislike')
      .map(([id]) => id),
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
  // Icons removed: Sunrise/Sun/Moon/Cookie don't add semantic value over the
  // labels; pill+wrap layout fits all 5 chips in two compact rows on mobile.
  const mealCategories = [
    { id: 'all', label: t.discovery.catAll },
    { id: 'breakfast', label: t.discovery.catBreakfast },
    { id: 'lunch', label: t.discovery.catLunch },
    { id: 'dinner', label: t.discovery.catDinner },
    { id: 'snack', label: t.discovery.catSnack },
  ];

  // FilterSheet sections (ADR-014). "Source" lives here now (was an inline
  // ChipRow pre-[1.5.93] — moved into the sheet to reduce header saturation).
  // Cocina intentionally omits "Cuisine" — vocabulario cerrado del usuario.
  const filterSections: FilterSection[] = useMemo(() => [
    {
      id: 'source',
      title: t.filters.sections.source,
      mode: 'single',
      defaultExpanded: true,
      options: [
        { id: 'all', label: t.filters.source.all },
        { id: 'mine', label: t.filters.source.mine },
        { id: 'imported', label: t.filters.source.imported },
        { id: 'cooked', label: t.filters.source.cooked },
      ],
    },
    {
      id: 'diet',
      title: t.filters.sections.diet,
      mode: 'multi',
      options: DIETARY_TAGS.map(d => ({ id: d, label: t.filters.diet[d] })),
    },
    {
      id: 'time',
      title: t.filters.sections.time,
      mode: 'single',
      options: TIME_BUCKETS.map(tb => ({ id: tb, label: t.filters.time[tb] })),
    },
    {
      id: 'difficulty',
      title: t.filters.sections.difficulty,
      mode: 'single',
      options: DIFFICULTIES.map(d => ({ id: d, label: t.filters.difficulty[d] })),
    },
  ], [t]);

  const activeFilterCount = useMemo(() => countActive(filterValues), [filterValues]);

  // Resolve a filter section id + value id → display label via i18n.
  const getFilterLabel = (sectionId: string, valueId: string): string => {
    const section = (t.filters as Record<string, unknown>)[sectionId];
    if (section && typeof section === 'object') {
      return (section as Record<string, string>)[valueId] ?? valueId;
    }
    return valueId;
  };

  // Per-facet emoji used in the ActiveFilterStrip — semantic shortcut so the
  // user can scan WHICH facet a chip belongs to without reading the label.
  // Picked carefully (delivery-app convention): only when emoji ↔ concept is
  // unambiguous. 🍽️ = origen/source · 🌱 = dieta/diet · ⏱️ = tiempo/time ·
  // ⭐ = dificultad/difficulty. Keep aligned with PRIMITIVES.md docs.
  const FACET_EMOJI: Record<string, string> = {
    source: '🍽️',
    diet: '🌱',
    time: '⏱️',
    difficulty: '⭐',
  };

  // Flat list of currently active filter chips for the ActiveFilterStrip.
  // Each entry carries `key = "sectionId:valueId"` so onDismiss can dispatch
  // back to the right facet via `handleDismissByKey`.
  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];
    // Source (single — skip 'all' which is the neutral default)
    if (filterValues.source && filterValues.source !== 'all') {
      const v = filterValues.source as string;
      chips.push({ key: `source:${v}`, label: getFilterLabel('source', v), emoji: FACET_EMOJI.source });
    }
    // Diet (multi)
    for (const d of (filterValues.diet as string[] | undefined) ?? []) {
      chips.push({ key: `diet:${d}`, label: getFilterLabel('diet', d), emoji: FACET_EMOJI.diet });
    }
    // Time (single)
    if (filterValues.time) {
      const v = filterValues.time as string;
      chips.push({ key: `time:${v}`, label: getFilterLabel('time', v), emoji: FACET_EMOJI.time });
    }
    // Difficulty (single)
    if (filterValues.difficulty) {
      const v = filterValues.difficulty as string;
      chips.push({ key: `difficulty:${v}`, label: getFilterLabel('difficulty', v), emoji: FACET_EMOJI.difficulty });
    }
    return chips;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, t]);

  // Dismiss a single filter chip — receives the composite key from the strip
  // (`"sectionId:valueId"`) and routes the removal to the right facet field.
  const handleDismissByKey = (key: string) => {
    const sepIdx = key.indexOf(':');
    if (sepIdx < 0) return;
    const sectionId = key.slice(0, sepIdx);
    const valueId = key.slice(sepIdx + 1);
    const next = { ...filterValues };
    if (Array.isArray(next[sectionId])) {
      const arr = (next[sectionId] as string[]).filter(v => v !== valueId);
      next[sectionId] = arr.length > 0 ? arr : null;
    } else {
      next[sectionId] = null;
    }
    setFilterValues(next);
  };

  // Combined filters: slot (primary) + carousel collection + sheet facets +
  // search + sort. Source axis lives in `filterValues.source` (moved out of
  // the legacy chip-row); CollectionsCarousel still owns the curated tile
  // selections (verified/quick/highProtein/vegan/lowCarb/batch/cooked) via
  // `activeCollection`.
  const filteredRecipes = useMemo(() => {
    let list = scoredRecipes;
    if (activeMealType !== 'all') {
      list = list.filter(r => recipeFitsSlot(r, activeMealType as MealSlot));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.title?.toLowerCase().includes(q) || r.tag?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
    }
    // Curated collection (carousel) — verified, quick, highProtein, vegan,
    // lowCarb, batch, cooked. ADR-013 dedup: these live only in COLLECTIONS.
    if (activeCollection !== 'all') {
      const registryCol = COLLECTIONS.find(c => c.id === activeCollection);
      if (registryCol) list = list.filter(registryCol.predicate);
    }
    // Advanced facets (FilterSheet — ADR-014). Source predicate evaluated via
    // sourceContext computed per recipe (mine = self-published, not imported;
    // imported = legacy `tag === 'IMPORTADA'`; cooked = has cookedAt entries).
    if (activeFilterCount > 0) {
      list = list.filter(r =>
        matchesFilters(r, filterValues, {
          sourceContext: {
            isMine: r.publishedBy === 'self' && r.tag !== 'IMPORTADA',
            isImported: r.tag === 'IMPORTADA',
            isCooked: (r.cookedAt?.length ?? 0) > 0,
          },
        }),
      );
    }
    // Sort
    const sorted = [...list];
    if (sortMode === 'recommended') sorted.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    else if (sortMode === 'recent') sorted.sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''));
    else if (sortMode === 'quick') sorted.sort((a, b) => (a.totalTime || 999) - (b.totalTime || 999));
    else if (sortMode === 'highProtein') sorted.sort((a, b) => (b.pro ?? 0) - (a.pro ?? 0));
    else if (sortMode === 'mostCooked') sorted.sort((a, b) => (b.cookedAt?.length ?? 0) - (a.cookedAt?.length ?? 0));
    else if (sortMode === 'caloriesAsc') sorted.sort((a, b) => (a.cal ?? 9999) - (b.cal ?? 9999));
    return sorted;
  }, [scoredRecipes, activeMealType, searchQuery, activeCollection, activeFilterCount, filterValues, sortMode]);

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
            {/* Search + sort + create/import actions. Search grows, sort is
                fixed-width, actions on the right. One flex row = one mental
                unit: "what am I looking at and how is it ordered". */}
            <div className="flex gap-2 items-stretch">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t.recipes.search}
                className="flex-1"
              />
              <FilterButton
                onClick={() => setFilterOpen(true)}
                activeCount={activeFilterCount}
              />
              <SortControl
                options={[
                  { id: 'recommended', label: (t.recipes as any).sortRecommended ?? 'Recomendadas' },
                  { id: 'recent', label: (t.recipes as any).sortRecent ?? 'Recientes' },
                  { id: 'quick', label: (t.recipes as any).sortQuick ?? 'Rápidas' },
                  { id: 'highProtein', label: (t.recipes as any).sortHighProtein ?? 'Alta proteína' },
                  { id: 'mostCooked', label: (t.recipes as any).sortMostCooked ?? 'Más cocinadas' },
                  { id: 'caloriesAsc', label: (t.recipes as any).sortCaloriesAsc ?? 'Menos calorías' },
                ]}
                active={sortMode}
                onChange={(id) => setSortMode(id as typeof sortMode)}
                ariaLabel={(t.recipes as any).sortRecommended ?? 'Ordenar'}
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

            {/* Active filters strip — canonical primitive (ADR-014).
                Renders nothing when chips array is empty (ActiveFilterStrip
                gates internally). Padding aligned with ChipRow pill canonical. */}
            <ActiveFilterStrip
              chips={activeFilterChips}
              onDismiss={handleDismissByKey}
              onReset={() => setFilterValues({})}
            />

            {/* Meal-type slot — pill chips, single-select, single-row scrollable.
                Icons removed: Sunrise/Sun/Moon/Cookie don't add semantic value
                over the text labels and made each tile tall (icon-above text-below).
                Single-row carousel (no wrap) — Uber Eats / Glovo convention,
                delivers clean horizontal scroll on mobile [1.5.98]. */}
            <ChipRow
              mode="single"
              variant="pill"
              options={mealCategories}
              active={activeMealType}
              onChange={(id) => setActiveMealType(id ?? 'all')}
              ariaLabel={t.discovery.catAll}
            />

            {/* Curated collections rail (R3) — editorial tiles with counts.
                Only surfaced in the idle state: no carousel selection, no
                search, no advanced filters. The rail competes for vertical
                space with the FilterSheet pill state, so we hide it the
                moment the user signals an explicit query intent. */}
            {activeCollection === 'all' && !searchQuery.trim() && activeFilterCount === 0 && (
              <CollectionsCarousel
                recipes={scoredRecipes}
                activeCollection={activeCollection}
                onSelect={setActiveCollection}
                className="mt-1"
              />
            )}

            {/* Recipe count label (if not Pro) */}
            {!isPro && (
              <div className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                {t.recipes.recipeCount.replace('{count}', String(savedRecipes.length))}
              </div>
            )}

            {/* Recipe grid — portrait cards */}
            {filteredRecipes.length === 0 ? (
              searchQuery.trim() ? (
                <EmptyState icon="🔍" description={(t.recipes as any).emptySearchHint?.replace('{query}', searchQuery) ?? `No hay coincidencias para "${searchQuery}"`}>
                  <button type="button" onClick={() => setSearchQuery('')} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/20 text-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                    {(t.common as any).clear ?? 'Limpiar búsqueda'}
                  </button>
                </EmptyState>
              ) : activeCollection !== 'all' || activeFilterCount > 0 ? (
                <EmptyState icon="📂" description={(t.recipes as any).emptyFilterHint ?? 'Prueba otro filtro o busca por nombre'}>
                  <button type="button" onClick={() => { setActiveCollection('all'); setFilterValues({}); }} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/20 text-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
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

            {/* Advanced filter panel — Source/Diet/Time/Difficulty (ADR-014). */}
            <FilterSheet
              open={filterOpen}
              onOpenChange={setFilterOpen}
              sections={filterSections}
              values={filterValues}
              onApply={setFilterValues}
              activeCount={activeFilterCount}
            />
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
