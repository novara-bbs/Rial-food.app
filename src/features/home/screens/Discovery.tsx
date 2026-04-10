import { Search, Filter, Bookmark, Clock, Flame, Share2, Activity, ChefHat } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import EmptyState from '../../../components/EmptyState';
import { useAppState } from '../../../contexts/AppStateContext';
import { calculateMatchScore } from '../../recipes/utils/matchScore';
import { CREATORS_MAP } from '../../social/data/seed-creators';

export default function Discovery({ onNavigateToRecipe, savedRecipes = [], onSaveRecipe }: { onNavigateToRecipe?: (recipe: any) => void, savedRecipes?: any[], onSaveRecipe?: (recipe: any) => void }) {
  const { t } = useI18n();
  const { userProfile, dictionary, dailyMacros } = useAppState();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSave = (e: React.MouseEvent, recipe: any) => {
    e.stopPropagation();
    if (onSaveRecipe) {
      onSaveRecipe(recipe);
    }
  };

  const shareRecipe = (e: React.MouseEvent, recipe: any) => {
    e.stopPropagation();
    toast.success(t.discovery.sharedSuccess || `Shared to community!`);
  };

  // Derive match score for each recipe
  const profileSlice = useMemo(() => ({
    goal: userProfile.goal,
    foodDislikes: userProfile.foodDislikes,
    intolerances: userProfile.intolerances,
    dailyTarget: { cal: dailyMacros.target.cal, pro: dailyMacros.target.pro },
  }), [userProfile, dailyMacros.target]);

  const scoredRecipes = useMemo(() => {
    return savedRecipes.map(r => ({
      ...r,
      matchScore: calculateMatchScore(r, profileSlice, dictionary),
      cal: r.macros?.calories || r.cal || 0,
      pro: r.macros?.protein || r.pro || 0,
      carbs: r.macros?.carbs || r.carbs || 0,
      fats: r.macros?.fats || r.fats || 0,
      time: r.prepTime && r.cookTime ? `${(r.prepTime || 0) + (r.cookTime || 0)}M` : r.time || '—',
      totalTime: (r.prepTime || 0) + (r.cookTime || 0),
      tag: r.tags?.[0]?.toUpperCase() || r.difficulty?.toUpperCase() || r.tag || '',
    }));
  }, [savedRecipes, profileSlice, dictionary]);

  // Top recipes by match score
  const trending = useMemo(() =>
    [...scoredRecipes].sort((a, b) => b.matchScore - a.matchScore).slice(0, 6),
    [scoredRecipes],
  );

  // Quick meals: total time <= 30 min
  const quickMeals = useMemo(() =>
    scoredRecipes
      .filter(r => r.totalTime > 0 && r.totalTime <= 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6),
    [scoredRecipes],
  );

  // Editorial pick: highest match score
  const editorialPick = useMemo(() => trending[0] || null, [trending]);

  const filterRecipes = (recipes: any[]) => {
    let filtered = recipes;
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(r => r.tag === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(query) ||
        r.tag?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const renderSwimlane = (title: string, recipes: any[]) => {
    const filteredRecipes = filterRecipes(recipes);
    if (filteredRecipes.length === 0) return null;

    return (
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4 px-6">
          <h3 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary">{title}</h3>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-6 pb-4">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => onNavigateToRecipe && onNavigateToRecipe(recipe)}
              className="relative shrink-0 w-64 h-80 rounded-sm overflow-hidden group cursor-pointer"
            >
            {recipe.img || recipe.image ? (
              <img src={recipe.img || recipe.image} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            ) : (
              <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-on-surface-variant/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

            {/* Top Actions */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className="flex flex-col gap-1">
                {recipe.tag && (
                  <span className="bg-surface/80 backdrop-blur-md text-primary text-[10px] font-black px-2 py-1 tracking-widest uppercase rounded-sm">
                    {recipe.tag}
                  </span>
                )}
                <span className="bg-primary text-on-primary text-[9px] font-black px-1.5 py-0.5 rounded-sm w-fit uppercase tracking-tighter">
                  {recipe.matchScore}% {t.discovery.match}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => shareRecipe(e, recipe)}
                  className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={`Compartir ${recipe.title}`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => toggleSave(e, recipe)}
                  className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={savedRecipes.some(r => r.id === recipe.id) ? `Eliminar ${recipe.title} de la Bóveda` : `Guardar ${recipe.title} en la Bóveda`}
                >
                  <Bookmark className={`w-4 h-4 ${savedRecipes.some(r => r.id === recipe.id) ? 'fill-primary text-primary' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="font-headline font-bold text-lg text-tertiary leading-tight tracking-tight uppercase">{recipe.title}</h4>
              {recipe.publishedBy && recipe.publishedBy !== 'self' && CREATORS_MAP[recipe.publishedBy] && (
                <span className="font-label text-[9px] text-on-surface-variant/80 tracking-widest uppercase">{t.recipeDetail.createdBy} @{CREATORS_MAP[recipe.publishedBy].name}</span>
              )}
              <div className="h-1.5" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <Flame className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.cal}</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <span className="text-[9px] font-label font-bold text-on-surface-variant tracking-widest">PRO</span>
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.pro}g</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <span className="text-[9px] font-label font-bold text-on-surface-variant tracking-widest">C</span>
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.carbs || 0}g</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <span className="text-[9px] font-label font-bold text-on-surface-variant tracking-widest">G</span>
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.fats || 0}g</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm ml-auto">
                  <Clock className="w-3 h-3 text-outline" />
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
  };

  // Empty state: no saved recipes at all
  if (savedRecipes.length === 0) {
    return (
      <div className="max-w-5xl mx-auto pb-20 px-6 pt-8">
        <div className="mb-8">
          <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{t.discovery.engineTitle}</span>
          <h2 className="font-headline text-3xl font-black tracking-tighter uppercase text-tertiary mt-1">{t.discovery.title}</h2>
        </div>
        <EmptyState
          icon="🍽️"
          title={t.discovery.emptyState}
          description={t.discovery.goExplore}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-2 pb-20">
      <section className="px-6 pt-2">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{t.discovery.engineTitle}</span>
            <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-tertiary mt-1">{t.discovery.title}</h2>
          </div>
          <div className="text-right hidden sm:block">
            <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">{savedRecipes.length} {t.discovery.recipesLoaded}</p>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.discovery.searchPlaceholder}
            className="w-full bg-surface-container-low border border-outline-variant/30 py-4 pl-12 pr-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-6">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm flex items-center gap-2 transition-colors ${activeFilter === 'ALL' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            <Filter className="w-3 h-3" /> {t.discovery.allFilters}
          </button>
          <button
            onClick={() => setActiveFilter(t.discovery.highProteinFilter)}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm transition-colors ${activeFilter === t.discovery.highProteinFilter ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            {t.discovery.highProteinFilter}
          </button>
          <button
            onClick={() => setActiveFilter(t.discovery.lowCarbFilter)}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm transition-colors ${activeFilter === t.discovery.lowCarbFilter ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            {t.discovery.lowCarbFilter}
          </button>
          <button
            onClick={() => setActiveFilter(t.discovery.plantBased)}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm transition-colors ${activeFilter === t.discovery.plantBased ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            {t.discovery.plantBased}
          </button>
        </div>
      </section>

      {/* Editorial Pick Hero — best matching recipe */}
      {editorialPick && (
        <section className="px-6 mb-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-1">{t.discovery.bestMatch}</p>
              <h3 className="font-headline text-2xl font-bold tracking-tight uppercase text-tertiary">{t.discovery.topRecipe}</h3>
            </div>
          </div>

          <div
            onClick={() => onNavigateToRecipe && onNavigateToRecipe(editorialPick)}
            className="relative rounded-sm overflow-hidden aspect-[4/5] md:aspect-video group cursor-pointer shadow-2xl"
          >
            {editorialPick.img || editorialPick.image ? (
              <img src={editorialPick.img || editorialPick.image} alt={editorialPick.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
            ) : (
              <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
                <ChefHat className="w-20 h-20 text-on-surface-variant/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>

            <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md rounded-sm p-2 flex flex-col items-center border border-outline-variant/20">
              <span className="text-[9px] font-black text-on-surface-variant leading-none uppercase tracking-tighter">{t.discovery.match}</span>
              <span className="text-xl font-black text-primary leading-none mt-1">{editorialPick.matchScore}%</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <h3 className="text-tertiary text-4xl md:text-7xl font-headline font-black leading-[0.85] tracking-tighter uppercase mb-6 drop-shadow-2xl">
                {editorialPick.title}
              </h3>
              <div className="flex items-center gap-6 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-primary" /> {editorialPick.time}</span>
                <span className="flex items-center gap-2"><Flame className="w-3 h-3 text-primary" /> {editorialPick.cal} KCAL</span>
                <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-primary" /> {editorialPick.pro}g PRO</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {filterRecipes(trending).length === 0 && filterRecipes(quickMeals).length === 0 && (
        <div className="px-6 py-12">
          <EmptyState
            icon="🔍"
            title={t.common.noResults}
            description={t.empty.searchEmpty}
          />
        </div>
      )}
      {renderSwimlane(t.discovery.trendingTitle, trending)}
      {renderSwimlane(t.discovery.quickMealsTitle, quickMeals)}
    </div>
  );
}
