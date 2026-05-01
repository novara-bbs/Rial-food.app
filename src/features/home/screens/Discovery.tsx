import { ChefHat, ChevronRight } from 'lucide-react';
import { Heading } from '@/components/ui/Typography';

const FACET_EMOJI: Record<string, string> = {
  cuisine: '🍽️',
  diet: '🌱',
  time: '⏱️',
  difficulty: '⭐',
  mealSlot: '🥪',
};
import SearchInput from '../../../components/patterns/SearchInput';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import EmptyState from '../../../components/EmptyState';
import PageShell from '../../../components/PageShell';
import RecipeCard from '../../../components/patterns/RecipeCard';
import Swimlane from '../../../components/patterns/Swimlane';
import SortControl from '../../../components/patterns/SortControl';
import FilterButton from '../../../components/patterns/FilterButton';
import FilterSheet, { type FilterSection } from '../../../components/patterns/FilterSheet';
import ActiveFilterStrip, { type ActiveFilterChip } from '../../../components/patterns/ActiveFilterStrip';
import { useAppState } from '../../../contexts/AppStateContext';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { calculateMatchScore } from '../../recipes/utils/matchScore';
import { recipeFitsSlot } from '../../recipes/utils/meal-slot';
import {
  matchesFilters,
  countActive,
  CUISINES,
  DIETARY_TAGS,
  TIME_BUCKETS,
  DIFFICULTIES,
  type FilterValues,
} from '../../recipes/utils/facets';
import { MEAL_SLOTS, type MealSlot } from '../../../types/recipe';
import type { Recipe } from '../../../types';

export default function Discovery({ onNavigateToRecipe, savedRecipes = [], onSaveRecipe }: { onNavigateToRecipe?: (recipe: Recipe) => void, savedRecipes?: Recipe[], onSaveRecipe?: (recipe: Recipe) => void }) {
  const { t } = useI18n();
  const { userProfile, dictionary, dailyMacros } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  // Advanced filter values (FilterSheet — Cuisine/Diet/Time/Difficulty/Meal).
  // Discovery shows ZERO chips visible (asymmetry vs Cocina) — every facet
  // lives behind the FilterButton. Persisted so the user's last filter set
  // survives navigation.
  const [filterValues, setFilterValues] = useLocalStorageState<FilterValues>(
    'discoveryFilters', {},
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useLocalStorageState<'recommended' | 'quick' | 'highProtein'>(
    'discoverySort', 'recommended',
  );

  const toggleSave = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    if (onSaveRecipe) onSaveRecipe(recipe);
  };

  const shareRecipe = (e: React.MouseEvent, _recipe: Recipe) => {
    e.stopPropagation();
    toast.success(t.discovery.sharedSuccess || 'Shared to community!');
  };

  // FilterSheet sections (ADR-014). Discovery prioritizes Cuisine (the most
  // diferenciating axis for discovery) and hides everything — including meal
  // slot — behind the FilterButton. Asymmetry vs Cocina is intentional:
  // discovery is a wide-vocabulary search-and-graze surface.
  const filterSections: FilterSection[] = useMemo(() => [
    {
      id: 'cuisine',
      title: t.filters.sections.cuisine,
      mode: 'multi',
      defaultExpanded: true,
      options: CUISINES.map(c => ({ id: c, label: t.filters.cuisine[c] })),
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
    {
      id: 'mealSlot',
      title: t.filters.sections.mealSlot,
      mode: 'single',
      options: MEAL_SLOTS.map(s => ({ id: s, label: t.filters.mealSlot[s] })),
    },
  ], [t]);

  const activeFilterCount = useMemo(() => countActive(filterValues), [filterValues]);
  // Branch: zero filters → editorial swimlanes (idle/discovery mode).
  // ≥1 filter → flat sorted grid (Yummly-style narrowed search).
  const isFiltered = activeFilterCount > 0;

  // Active filter chips for the ActiveFilterStrip (Invariant G).
  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const getFilterLabel = (sectionId: string, valueId: string): string => {
      const section = (t.filters as Record<string, unknown>)[sectionId];
      if (section && typeof section === 'object') {
        return (section as Record<string, string>)[valueId] ?? valueId;
      }
      return valueId;
    };
    const chips: ActiveFilterChip[] = [];
    for (const c of (filterValues.cuisine as string[] | undefined) ?? []) {
      chips.push({ key: `cuisine:${c}`, label: getFilterLabel('cuisine', c), emoji: FACET_EMOJI.cuisine });
    }
    for (const d of (filterValues.diet as string[] | undefined) ?? []) {
      chips.push({ key: `diet:${d}`, label: getFilterLabel('diet', d), emoji: FACET_EMOJI.diet });
    }
    if (filterValues.time) {
      const v = filterValues.time as string;
      chips.push({ key: `time:${v}`, label: getFilterLabel('time', v), emoji: FACET_EMOJI.time });
    }
    if (filterValues.difficulty) {
      const v = filterValues.difficulty as string;
      chips.push({ key: `difficulty:${v}`, label: getFilterLabel('difficulty', v), emoji: FACET_EMOJI.difficulty });
    }
    if (filterValues.mealSlot) {
      const v = filterValues.mealSlot as string;
      chips.push({ key: `mealSlot:${v}`, label: getFilterLabel('mealSlot', v), emoji: FACET_EMOJI.mealSlot });
    }
    return chips;
  }, [filterValues, t]);

  // Dismiss a single chip — parses the composite key and removes the value.
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

  // Profile slice for match scoring — R8.3: derive foodDislikes from foodPreferences
  const profileSlice = useMemo(() => ({
    goal: userProfile.goal,
    foodDislikes: Object.entries(userProfile.foodPreferences ?? {})
      .filter(([, v]) => v === 'dislike')
      .map(([id]) => id),
    intolerances: userProfile.intolerances,
    dailyTarget: { cal: dailyMacros.target.cal, pro: dailyMacros.target.pro },
  }), [userProfile, dailyMacros.target]);

  // Score and normalize all recipes
  const scoredRecipes = useMemo(() => {
    const parseMin = (v: string | number | null | undefined) => typeof v === 'number' ? v : parseInt(String(v ?? '')) || 0;
    return savedRecipes.map(r => {
      const prep = parseMin(r.prepTime);
      const cook = parseMin(r.cookTime);
      return {
        ...r,
        matchScore: calculateMatchScore(r, profileSlice, dictionary),
        cal: r.macros?.calories || 0,
        pro: r.macros?.protein || 0,
        time: prep + cook > 0 ? `${prep + cook}M` : '—',
        totalTime: prep + cook,
        tag: r.tag,
      };
    });
  }, [savedRecipes, profileSlice, dictionary]);

  // Apply search + advanced filters. Search narrows the base across all
  // surfaces (swimlanes when isFiltered === false, grid when isFiltered).
  // FilterSheet values use the heuristic `matchesFilters` over derived facets.
  const filteredBase = useMemo(() => {
    let list = scoredRecipes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.tag?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }
    if (activeFilterCount > 0) {
      list = list.filter(r => matchesFilters(r, filterValues));
    }
    return list;
  }, [scoredRecipes, searchQuery, activeFilterCount, filterValues]);

  // Sorted grid for filtered mode (Yummly pattern). Reuses same sort
  // semantics as Cocina; "recent" omitted (Discovery shows seed catalog).
  const sortedFilteredGrid = useMemo(() => {
    const out = [...filteredBase];
    if (sortMode === 'recommended') out.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    else if (sortMode === 'quick') out.sort((a, b) => (a.totalTime || 999) - (b.totalTime || 999));
    else if (sortMode === 'highProtein') out.sort((a, b) => (b.pro ?? 0) - (a.pro ?? 0));
    return out;
  }, [filteredBase, sortMode]);

  // Swimlane data
  const forYou = useMemo(() =>
    [...filteredBase].sort((a, b) => b.matchScore - a.matchScore).slice(0, 6),
    [filteredBase],
  );

  const quickMeals = useMemo(() =>
    filteredBase.filter(r => r.totalTime > 0 && r.totalTime <= 20)
      .sort((a, b) => b.matchScore - a.matchScore).slice(0, 6),
    [filteredBase],
  );

  const highProtein = useMemo(() =>
    filteredBase.filter(r => r.pro >= 30)
      .sort((a, b) => b.pro - a.pro).slice(0, 6),
    [filteredBase],
  );

  const batchCooking = useMemo(() =>
    filteredBase.filter(r => r.tag === 'batch')
      .sort((a, b) => b.matchScore - a.matchScore).slice(0, 6),
    [filteredBase],
  );

  // Time-of-day meal type section
  const currentHour = new Date().getHours();
  const mealTimeType = currentHour < 11 ? 'breakfast' : currentHour < 16 ? 'lunch' : 'dinner';
  const mealTimeTitle = mealTimeType === 'breakfast' ? t.discovery.breakfastTitle
    : mealTimeType === 'lunch' ? t.discovery.lunchTitle : t.discovery.dinnerTitle;
  const mealTimeRecipes = useMemo(() =>
    filteredBase.filter(r => recipeFitsSlot(r, mealTimeType as MealSlot))
      .sort((a, b) => b.matchScore - a.matchScore).slice(0, 6),
    [filteredBase, mealTimeType],
  );

  // Hero: best match
  const editorialPick = forYou[0] || null;

  // Collection counts
  const batchCount = scoredRecipes.filter(r => r.tag === 'batch').length;
  const veganCount = scoredRecipes.filter(r => r.tag === 'vegan').length;

  const CollectionBanner = ({ title, count, bg }: { title: string; count: number; bg: string }) => {
    if (count === 0) return null;
    return (
      <div className="px-6 mb-8">
        <button
          type="button"
          onClick={() => toast.success(`${title}: ${count}`)}
          className={`w-full ${bg} p-4 rounded-sm flex items-center gap-4`}
        >
          <div className="w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5 text-on-primary" />
          </div>
          <div className="text-left flex-1">
            <span className="font-headline font-bold text-body-sm uppercase tracking-widest text-on-primary block">{title}</span>
            <span className="text-micro text-on-primary/70 font-bold">
              {(t.discovery.recipesCount as string)?.replace('{count}', String(count))}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-on-primary/70 shrink-0" />
        </button>
      </div>
    );
  };

  // --- Empty state ---
  if (savedRecipes.length === 0) {
    return (
      <PageShell maxWidth="wide" spacing="sm" className="pb-20 pt-8">
        <EmptyState
          icon="🍽️"
          title={t.discovery.emptyState}
          description={t.discovery.goExplore}
        />
      </PageShell>
    );
  }

  const hasAnyResults = forYou.length > 0 || quickMeals.length > 0 || highProtein.length > 0 || mealTimeRecipes.length > 0 || batchCooking.length > 0;

  return (
    <PageShell maxWidth="wide" noPadding className="space-y-0">
      {/* Title */}
      <div className="px-6 pt-2 pb-3">
        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">RIAL</span>
        <Heading level="h1" className="font-headline text-title font-bold tracking-tighter uppercase text-tertiary">{t.discovery.title}</Heading>
      </div>

      {/* 1. Search + Filter + Sort. Asymmetry vs Cocina: Discovery exposes
          ZERO chips visible — every faceta lives behind the FilterButton.
          Sort is new on Discovery (didn't exist pre-[1.5.93]). */}
      <section className="px-6 pb-3">
        <div className="flex gap-2 items-stretch">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.discovery.searchPlaceholder}
            className="flex-1"
          />
          <FilterButton
            onClick={() => setFilterOpen(true)}
            activeCount={activeFilterCount}
          />
          <SortControl
            options={[
              { id: 'recommended', label: t.recipes.sortRecommended },
              { id: 'quick', label: t.recipes.sortQuick },
              { id: 'highProtein', label: t.recipes.sortHighProtein },
            ]}
            active={sortMode}
            onChange={(id) => setSortMode(id as typeof sortMode)}
            ariaLabel={t.recipes.sortRecommended}
          />
        </div>
      </section>

      {/* Branch: filtered → flat sorted grid (Yummly pattern). Idle →
          editorial swimlanes preserved verbatim. */}
      {isFiltered ? (
        <>
          <div className="px-6 pb-3 space-y-2">
            <span className="block font-label text-micro tracking-widest uppercase text-on-surface-variant">
              {t.filters.activeFiltersGrid.replace('{n}', String(sortedFilteredGrid.length))}
            </span>
            {/* ActiveFilterStrip (Invariant G) — dismissible chip per applied
                filter + Reset link. Replaces the prior inline X+Reset button
                in [1.5.97] for canonical chip uniformity. */}
            <ActiveFilterStrip
              chips={activeFilterChips}
              onDismiss={handleDismissByKey}
              onReset={() => setFilterValues({})}
            />
          </div>
          {sortedFilteredGrid.length === 0 ? (
            <div className="px-6 py-12">
              <EmptyState icon="🔍" title={t.common.noResults} description={t.empty.searchEmpty} />
            </div>
          ) : (
            <div className="px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-8">
              {sortedFilteredGrid.map(r => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  variant="grid"
                  onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
                  onSave={(e) => toggleSave(e, r)}
                  onShare={(e) => shareRecipe(e, r)}
                  isSaved={savedRecipes.some((s) => s.id === r.id)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* 2. Hero compacto — best match */}
          {editorialPick && (
            <section className="px-6 mb-8">
              <RecipeCard
                recipe={editorialPick}
                variant="hero"
                onPress={() => onNavigateToRecipe && onNavigateToRecipe(editorialPick)}
              />
            </section>
          )}

          {/* No results state (search but zero hits across all swimlanes) */}
          {!hasAnyResults && (
            <div className="px-6 py-12">
              <EmptyState icon="🔍" title={t.common.noResults} description={t.empty.searchEmpty} />
            </div>
          )}

          {/* 3. "Para ti" carousel */}
          <Swimlane title={t.discovery.forYouTitle}>
            {forYou.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                variant="carousel"
                onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
                onShare={(e) => shareRecipe(e, r)}
                onSave={(e) => toggleSave(e, r)}
                isSaved={savedRecipes.some((s) => s.id === r.id)}
              />
            ))}
          </Swimlane>

          {/* 4. Collection banner: Meal Prep */}
          <CollectionBanner title={t.discovery.collectionMealPrep} count={batchCount} bg="bg-primary" />

          {/* 5. Quick meals carousel */}
          <Swimlane title={t.discovery.quickMealsTitle}>
            {quickMeals.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                variant="carousel"
                onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
                onShare={(e) => shareRecipe(e, r)}
                onSave={(e) => toggleSave(e, r)}
                isSaved={savedRecipes.some((s) => s.id === r.id)}
              />
            ))}
          </Swimlane>

          {/* 6. High protein carousel */}
          <Swimlane title={t.discovery.highProteinTitle}>
            {highProtein.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                variant="carousel"
                onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
                onShare={(e) => shareRecipe(e, r)}
                onSave={(e) => toggleSave(e, r)}
                isSaved={savedRecipes.some((s) => s.id === r.id)}
              />
            ))}
          </Swimlane>

          {/* 7. Collection banner: Vegan */}
          <CollectionBanner title={t.discovery.collectionVegan} count={veganCount} bg="bg-tertiary" />

          {/* 8. By time-of-day carousel */}
          <Swimlane title={mealTimeTitle}>
            {mealTimeRecipes.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                variant="carousel"
                onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
                onShare={(e) => shareRecipe(e, r)}
                onSave={(e) => toggleSave(e, r)}
                isSaved={savedRecipes.some((s) => s.id === r.id)}
              />
            ))}
          </Swimlane>

          {/* 9. Batch cooking carousel */}
          <Swimlane title={t.discovery.batchCookingTitle}>
            {batchCooking.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                variant="carousel"
                onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
                onShare={(e) => shareRecipe(e, r)}
                onSave={(e) => toggleSave(e, r)}
                isSaved={savedRecipes.some((s) => s.id === r.id)}
              />
            ))}
          </Swimlane>
        </>
      )}

      {/* Advanced filter panel — Cuisine/Diet/Time/Difficulty/MealSlot (ADR-014). */}
      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        sections={filterSections}
        values={filterValues}
        onApply={setFilterValues}
        activeCount={activeFilterCount}
      />
    </PageShell>
  );
}
