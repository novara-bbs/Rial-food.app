import { Search, ChefHat, Sunrise, Sun, Moon, Cookie, Zap, Sparkles, ChevronRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import EmptyState from '../../../components/EmptyState';
import RecipeCard from '../../../components/patterns/RecipeCard';
import Swimlane from '../../../components/patterns/Swimlane';
import FilterRow from '../../../components/patterns/FilterRow';
import { useAppState } from '../../../contexts/AppStateContext';
import { calculateMatchScore } from '../../recipes/utils/matchScore';

export default function Discovery({ onNavigateToRecipe, savedRecipes = [], onSaveRecipe }: { onNavigateToRecipe?: (recipe: any) => void, savedRecipes?: any[], onSaveRecipe?: (recipe: any) => void }) {
  const { t } = useI18n();
  const { userProfile, dictionary, dailyMacros } = useAppState();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSave = (e: React.MouseEvent, recipe: any) => {
    e.stopPropagation();
    if (onSaveRecipe) onSaveRecipe(recipe);
  };

  const shareRecipe = (e: React.MouseEvent, _recipe: any) => {
    e.stopPropagation();
    toast.success(t.discovery.sharedSuccess || 'Shared to community!');
  };

  // Categories
  const categories = [
    { id: 'all', label: t.discovery.catAll, icon: Sparkles },
    { id: 'breakfast', label: t.discovery.catBreakfast, icon: Sunrise },
    { id: 'lunch', label: t.discovery.catLunch, icon: Sun },
    { id: 'dinner', label: t.discovery.catDinner, icon: Moon },
    { id: 'snack', label: t.discovery.catSnack, icon: Cookie },
    { id: 'quick', label: t.discovery.catQuick, icon: Zap },
  ];

  // Profile slice for match scoring
  const profileSlice = useMemo(() => ({
    goal: userProfile.goal,
    foodDislikes: userProfile.foodDislikes,
    intolerances: userProfile.intolerances,
    dailyTarget: { cal: dailyMacros.target.cal, pro: dailyMacros.target.pro },
  }), [userProfile, dailyMacros.target]);

  // Score and normalize all recipes
  const scoredRecipes = useMemo(() => {
    const parseMin = (v: any) => typeof v === 'number' ? v : parseInt(String(v)) || 0;
    return savedRecipes.map(r => {
      const prep = parseMin(r.prepTime);
      const cook = parseMin(r.cookTime);
      return {
        ...r,
        matchScore: calculateMatchScore(r, profileSlice, dictionary),
        cal: r.macros?.calories || r.cal || 0,
        pro: r.macros?.protein || r.pro || 0,
        time: prep + cook > 0 ? `${prep + cook}M` : r.time || '—',
        totalTime: prep + cook,
        tag: r.tag || r.tags?.[0]?.toUpperCase() || '',
        mealType: r.mealType || '',
      };
    });
  }, [savedRecipes, profileSlice, dictionary]);

  // Apply category + search filter
  const filteredBase = useMemo(() => {
    let list = scoredRecipes;
    if (activeCategory === 'quick') {
      list = list.filter(r => r.totalTime > 0 && r.totalTime <= 20);
    } else if (activeCategory !== 'all') {
      list = list.filter(r => r.mealType === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.tag?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [scoredRecipes, activeCategory, searchQuery]);

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
    filteredBase.filter(r => r.tag === 'BATCH')
      .sort((a, b) => b.matchScore - a.matchScore).slice(0, 6),
    [filteredBase],
  );

  // Time-of-day meal type section
  const currentHour = new Date().getHours();
  const mealTimeType = currentHour < 11 ? 'breakfast' : currentHour < 16 ? 'lunch' : 'dinner';
  const mealTimeTitle = mealTimeType === 'breakfast' ? t.discovery.breakfastTitle
    : mealTimeType === 'lunch' ? t.discovery.lunchTitle : t.discovery.dinnerTitle;
  const mealTimeRecipes = useMemo(() =>
    filteredBase.filter(r => r.mealType === mealTimeType)
      .sort((a, b) => b.matchScore - a.matchScore).slice(0, 6),
    [filteredBase, mealTimeType],
  );

  // Hero: best match
  const editorialPick = forYou[0] || null;

  // Collection counts
  const batchCount = scoredRecipes.filter(r => r.tag === 'BATCH').length;
  const veganCount = scoredRecipes.filter(r => r.tag === 'VEGANO').length;

  const CollectionBanner = ({ title, count, bg }: { title: string; count: number; bg: string }) => {
    if (count === 0) return null;
    return (
      <div className="px-6 mb-8">
        <button
          onClick={() => toast.success(`${title}: ${count}`)}
          className={`w-full ${bg} p-4 rounded-sm flex items-center gap-4`}
        >
          <div className="w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5 text-on-primary" />
          </div>
          <div className="text-left flex-1">
            <span className="font-headline font-bold text-sm uppercase tracking-widest text-on-primary block">{title}</span>
            <span className="text-[10px] text-on-primary/70 font-bold">
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
      <div className="max-w-5xl mx-auto pb-20 px-6 pt-8">
        <EmptyState
          icon="🍽️"
          title={t.discovery.emptyState}
          description={t.discovery.goExplore}
        />
      </div>
    );
  }

  const hasAnyResults = forYou.length > 0 || quickMeals.length > 0 || highProtein.length > 0 || mealTimeRecipes.length > 0 || batchCooking.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-0 pb-24">
      {/* Title */}
      <div className="px-6 pt-2 pb-3">
        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">RIAL</span>
        <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">{t.discovery.title}</h1>
      </div>

      {/* 1. Search bar */}
      <section className="px-6 pb-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.discovery.searchPlaceholder}
            className="w-full bg-surface-container-low border border-outline-variant/30 py-3 pl-12 pr-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50 transition-all"
          />
        </div>
      </section>

      {/* 2. Category icon row */}
      <section className="px-6 pb-4">
        <FilterRow options={categories} active={activeCategory} onChange={setActiveCategory} variant="icon" />
      </section>

      {/* 3. Hero compacto — best match */}
      {editorialPick && (
        <section className="px-6 mb-8">
          <RecipeCard
            recipe={editorialPick}
            variant="hero"
            onPress={() => onNavigateToRecipe && onNavigateToRecipe(editorialPick)}
          />
        </section>
      )}

      {/* No results state */}
      {!hasAnyResults && (
        <div className="px-6 py-12">
          <EmptyState icon="🔍" title={t.common.noResults} description={t.empty.searchEmpty} />
        </div>
      )}

      {/* 4. "Para ti" carousel */}
      <Swimlane title={t.discovery.forYouTitle}>
        {forYou.map(r => (
          <RecipeCard
            key={r.id}
            recipe={r}
            variant="carousel"
            onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
            onShare={(e) => shareRecipe(e, r)}
            onSave={(e) => toggleSave(e, r)}
            isSaved={savedRecipes.some((s: any) => s.id === r.id)}
          />
        ))}
      </Swimlane>

      {/* 5. Collection banner: Meal Prep */}
      <CollectionBanner title={t.discovery.collectionMealPrep} count={batchCount} bg="bg-primary" />

      {/* 6. Quick meals carousel */}
      <Swimlane title={t.discovery.quickMealsTitle}>
        {quickMeals.map(r => (
          <RecipeCard
            key={r.id}
            recipe={r}
            variant="carousel"
            onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
            onShare={(e) => shareRecipe(e, r)}
            onSave={(e) => toggleSave(e, r)}
            isSaved={savedRecipes.some((s: any) => s.id === r.id)}
          />
        ))}
      </Swimlane>

      {/* 7. High protein carousel */}
      <Swimlane title={t.discovery.highProteinTitle}>
        {highProtein.map(r => (
          <RecipeCard
            key={r.id}
            recipe={r}
            variant="carousel"
            onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
            onShare={(e) => shareRecipe(e, r)}
            onSave={(e) => toggleSave(e, r)}
            isSaved={savedRecipes.some((s: any) => s.id === r.id)}
          />
        ))}
      </Swimlane>

      {/* 8. Collection banner: Vegan */}
      <CollectionBanner title={t.discovery.collectionVegan} count={veganCount} bg="bg-tertiary" />

      {/* 9. By time-of-day carousel */}
      <Swimlane title={mealTimeTitle}>
        {mealTimeRecipes.map(r => (
          <RecipeCard
            key={r.id}
            recipe={r}
            variant="carousel"
            onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
            onShare={(e) => shareRecipe(e, r)}
            onSave={(e) => toggleSave(e, r)}
            isSaved={savedRecipes.some((s: any) => s.id === r.id)}
          />
        ))}
      </Swimlane>

      {/* 10. Batch cooking carousel */}
      <Swimlane title={t.discovery.batchCookingTitle}>
        {batchCooking.map(r => (
          <RecipeCard
            key={r.id}
            recipe={r}
            variant="carousel"
            onPress={() => onNavigateToRecipe && onNavigateToRecipe(r)}
            onShare={(e) => shareRecipe(e, r)}
            onSave={(e) => toggleSave(e, r)}
            isSaved={savedRecipes.some((s: any) => s.id === r.id)}
          />
        ))}
      </Swimlane>
    </div>
  );
}
