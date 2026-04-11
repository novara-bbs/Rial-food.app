import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Clock, Link, BookOpen, ShoppingCart, Flame, ChefHat, Sparkles, Sunrise, Sun, Moon, Cookie } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { calculateMatchScore } from '../utils/matchScore';
import { CREATORS_MAP } from '../../social/data/seed-creators';
import { aggregateShoppingItems, detectCategory, AISLE_CATEGORIES } from '../../planner/utils/grocery';
import Planner from '../../planner/screens/Planner';
import ShoppingList from '../../planner/screens/ShoppingList';
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

  // mealType categories
  const mealCategories = [
    { id: 'all', label: t.discovery.catAll, icon: Sparkles },
    { id: 'breakfast', label: t.discovery.catBreakfast, icon: Sunrise },
    { id: 'lunch', label: t.discovery.catLunch, icon: Sun },
    { id: 'dinner', label: t.discovery.catDinner, icon: Moon },
    { id: 'snack', label: t.discovery.catSnack, icon: Cookie },
  ];

  // Collection pills (fixed "quick" filter)
  const collections = [
    { id: 'all', label: t.recipes.all, count: scoredRecipes.length },
    { id: 'mine', label: t.recipes.myRecipes, count: scoredRecipes.filter(r => r.publishedBy === 'self' && r.tag !== 'IMPORTADA').length },
    { id: 'imported', label: t.recipes.imported, count: scoredRecipes.filter(r => r.tag === 'IMPORTADA').length },
    { id: 'quick', label: t.recipes.quick, count: scoredRecipes.filter(r => r.totalTime > 0 && r.totalTime <= 20).length },
    { id: 'high-protein', label: t.recipes.highProtein, count: scoredRecipes.filter(r => r.pro >= 30).length },
  ];

  // Combined filters: mealType + collection + search
  const filteredRecipes = useMemo(() => {
    let list = scoredRecipes;
    if (activeMealType !== 'all') list = list.filter(r => r.mealType === activeMealType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.title?.toLowerCase().includes(q) || r.tag?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
    }
    if (activeCollection === 'mine') list = list.filter(r => r.publishedBy === 'self' && r.tag !== 'IMPORTADA');
    if (activeCollection === 'imported') list = list.filter(r => r.tag === 'IMPORTADA');
    if (activeCollection === 'quick') list = list.filter(r => r.totalTime > 0 && r.totalTime <= 20);
    if (activeCollection === 'high-protein') list = list.filter(r => r.pro >= 30);
    return list;
  }, [scoredRecipes, activeMealType, searchQuery, activeCollection]);

  const handleDeleteRecipe = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    if (setSavedRecipes) setSavedRecipes((prev: any[]) => prev.filter(r => r.id !== id));
  };

  const handleGenerateList = () => {
    const dayMeals = Object.values(mealPlan as Record<string, any[]>).flat();
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
    { id: 'recipes' as const, label: t.tabs.recipes },
    { id: 'plan' as const, label: t.tabs.plan },
    { id: 'list' as const, label: t.tabs.list },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex border-b border-outline-variant/20 px-6 pt-2 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 font-headline text-xs font-bold tracking-widest uppercase transition-colors border-b-2 ${
              activeTab === tab.id ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-tertiary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <div className="px-6 max-w-5xl mx-auto space-y-4 pb-24">
            {/* Search + actions */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder={t.recipes.search}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary"
                />
              </div>
              <button onClick={onCreateRecipe} className="p-3 bg-primary text-on-primary rounded-sm hover:opacity-90 transition-opacity" title={t.recipes.create}>
                <Plus className="w-5 h-5" />
              </button>
              {onImportUrl && (
                <button onClick={onImportUrl} className="p-3 bg-surface-container-highest text-primary border border-outline-variant/20 rounded-sm hover:bg-primary/10 transition-colors" title={t.recipes.import}>
                  <Link className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* mealType icon row */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6">
              {mealCategories.map(cat => {
                const Icon = cat.icon;
                const isActive = activeMealType === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveMealType(cat.id)}
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

            {/* Collection pills */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6">
              {collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeCollection === col.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {col.label} ({col.count})
                </button>
              ))}
            </div>

            {/* Recipe count */}
            {!isPro && (
              <div className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                {t.recipes.recipeCount.replace('{count}', String(savedRecipes.length))}
              </div>
            )}

            {/* Recipe grid — portrait cards */}
            {filteredRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="w-10 h-10 text-on-surface-variant/40 mb-4" />
                <p className="text-on-surface-variant font-body text-sm">{t.empty.recipesEmpty}</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={onCreateRecipe} className="px-6 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                    {t.recipes.create}
                  </button>
                  {onImportUrl && (
                    <button onClick={onImportUrl} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/20 text-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                      {t.recipes.import}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredRecipes.map((recipe: any) => (
                  <div
                    key={recipe.id}
                    onClick={() => onNavigateToRecipe?.(recipe)}
                    className="relative h-64 rounded-sm overflow-hidden group cursor-pointer"
                  >
                    {/* Cover image */}
                    {recipe.img || recipe.image ? (
                      <img src={recipe.img || recipe.image} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
                        <ChefHat className="w-10 h-10 text-on-surface-variant/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                    {/* Top badges: tag + match% + delete */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        {recipe.tag && (
                          <span className="bg-surface/80 backdrop-blur-md text-primary text-[8px] font-black px-1.5 py-0.5 tracking-widest uppercase rounded-sm">
                            {recipe.tag}
                          </span>
                        )}
                        <span className="bg-primary text-on-primary text-[8px] font-black px-1.5 py-0.5 rounded-sm w-fit uppercase tracking-tighter">
                          {recipe.matchScore}%
                        </span>
                      </div>
                      <button onClick={(e) => handleDeleteRecipe(e, recipe.id)} className="w-6 h-6 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" aria-label="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="font-headline font-bold text-xs text-tertiary leading-tight tracking-tight uppercase mb-1">{recipe.title}</h3>
                      {recipe.publishedBy && recipe.publishedBy !== 'self' && CREATORS_MAP[recipe.publishedBy] && (
                        <span className="font-label text-[7px] text-on-surface-variant/80 tracking-widest uppercase block mb-1">@{CREATORS_MAP[recipe.publishedBy].name}</span>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-0.5 bg-surface-container-highest/80 backdrop-blur-sm px-1 py-0.5 rounded-sm">
                          <Clock className="w-2.5 h-2.5 text-outline" />
                          <span className="text-[8px] font-headline font-bold text-tertiary">{recipe.time}</span>
                        </div>
                        <div className="flex items-center gap-0.5 bg-surface-container-highest/80 backdrop-blur-sm px-1 py-0.5 rounded-sm">
                          <Flame className="w-2.5 h-2.5 text-primary" />
                          <span className="text-[8px] font-headline font-bold text-tertiary">{recipe.cal}</span>
                        </div>
                        {recipe.pro >= 30 && (
                          <span className="bg-primary/20 text-primary text-[7px] font-black px-1 py-0.5 rounded-sm uppercase tracking-tighter">
                            {recipe.pro}g pro
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <>
            <div className="px-6 pb-3">
              <button
                onClick={handleGenerateList}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4" />
                {t.cocina.generateList}
              </button>
            </div>
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
