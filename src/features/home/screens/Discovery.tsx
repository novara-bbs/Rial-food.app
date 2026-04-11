import { Search, Bookmark, Clock, Flame, Share2, ChefHat, Sunrise, Sun, Moon, Cookie, Zap, Sparkles, ChevronRight } from 'lucide-react';
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
        carbs: r.macros?.carbs || r.carbs || 0,
        fats: r.macros?.fats || r.fats || 0,
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

  // --- Render helpers ---

  const renderCard = (recipe: any) => (
    <div
      key={recipe.id}
      onClick={() => onNavigateToRecipe && onNavigateToRecipe(recipe)}
      className="relative shrink-0 w-52 h-72 rounded-sm overflow-hidden group cursor-pointer"
    >
      {recipe.img || recipe.image ? (
        <img src={recipe.img || recipe.image} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
      ) : (
        <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
          <ChefHat className="w-10 h-10 text-on-surface-variant/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          {recipe.tag && (
            <span className="bg-surface/80 backdrop-blur-md text-primary text-[9px] font-black px-1.5 py-0.5 tracking-widest uppercase rounded-sm">
              {recipe.tag}
            </span>
          )}
          <span className="bg-primary text-on-primary text-[9px] font-black px-1.5 py-0.5 rounded-sm w-fit uppercase tracking-tighter">
            {recipe.matchScore}% {t.discovery.match}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={(e) => shareRecipe(e, recipe)} className="w-7 h-7 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" aria-label="Share">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => toggleSave(e, recipe)} className="w-7 h-7 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" aria-label="Save">
            <Bookmark className={`w-3.5 h-3.5 ${savedRecipes.some(r => r.id === recipe.id) ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bottom info — simplified: time + cal + difficulty */}
      <div className="absolute bottom-3 left-3 right-3">
        <h4 className="font-headline font-bold text-sm text-tertiary leading-tight tracking-tight uppercase mb-1.5">{recipe.title}</h4>
        {recipe.publishedBy && recipe.publishedBy !== 'self' && CREATORS_MAP[recipe.publishedBy] && (
          <span className="font-label text-[8px] text-on-surface-variant/80 tracking-widest uppercase block mb-1">@{CREATORS_MAP[recipe.publishedBy].name}</span>
        )}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
            <Clock className="w-2.5 h-2.5 text-outline" />
            <span className="text-[9px] font-headline font-bold text-tertiary">{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
            <Flame className="w-2.5 h-2.5 text-primary" />
            <span className="text-[9px] font-headline font-bold text-tertiary">{recipe.cal}</span>
          </div>
          {recipe.pro >= 30 && (
            <span className="bg-primary/20 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
              {recipe.pro}g pro
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderSwimlane = (title: string, recipes: any[]) => {
    if (recipes.length === 0) return null;
    return (
      <section className="mb-8">
        <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary mb-3 px-6">{title}</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-6 pb-3">
          {recipes.map(renderCard)}
        </div>
      </section>
    );
  };

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
    <div className="max-w-5xl mx-auto space-y-0 pb-20">
      {/* 1. Search bar */}
      <section className="px-6 pt-2 pb-2">
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
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-sm shrink-0 transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-highest'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-widest uppercase">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Hero compacto — best match */}
      {editorialPick && (
        <section className="px-6 mb-8">
          <div
            onClick={() => onNavigateToRecipe && onNavigateToRecipe(editorialPick)}
            className="relative rounded-sm overflow-hidden aspect-video group cursor-pointer"
          >
            {editorialPick.img || editorialPick.image ? (
              <img src={editorialPick.img || editorialPick.image} alt={editorialPick.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            ) : (
              <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-on-surface-variant/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

            {/* Inline badge top-left */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-primary text-on-primary text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest">
                {t.discovery.bestMatch} · {editorialPick.matchScore}%
              </span>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-tertiary text-xl md:text-3xl font-headline font-black leading-tight tracking-tighter uppercase mb-2">
                {editorialPick.title}
              </h3>
              <div className="flex items-center gap-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-primary" /> {editorialPick.time}</span>
                <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-primary" /> {editorialPick.cal} KCAL</span>
                {editorialPick.pro >= 30 && (
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm text-[9px] font-black">{editorialPick.pro}g PRO</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* No results state */}
      {!hasAnyResults && (
        <div className="px-6 py-12">
          <EmptyState icon="🔍" title={t.common.noResults} description={t.empty.searchEmpty} />
        </div>
      )}

      {/* 4. "Para ti" carousel */}
      {renderSwimlane(t.discovery.forYouTitle, forYou)}

      {/* 5. Collection banner: Meal Prep */}
      <CollectionBanner title={t.discovery.collectionMealPrep} count={batchCount} bg="bg-primary" />

      {/* 6. Quick meals carousel */}
      {renderSwimlane(t.discovery.quickMealsTitle, quickMeals)}

      {/* 7. High protein carousel */}
      {renderSwimlane(t.discovery.highProteinTitle, highProtein)}

      {/* 8. Collection banner: Vegan */}
      <CollectionBanner title={t.discovery.collectionVegan} count={veganCount} bg="bg-tertiary" />

      {/* 9. By time-of-day carousel */}
      {renderSwimlane(mealTimeTitle, mealTimeRecipes)}

      {/* 10. Batch cooking carousel */}
      {renderSwimlane(t.discovery.batchCookingTitle, batchCooking)}
    </div>
  );
}
