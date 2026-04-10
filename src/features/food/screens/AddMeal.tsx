import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Plus, Camera, Barcode, Loader2, BookOpen, Leaf, Globe, Star, Clock, CheckSquare, Square, X, Sparkles, Trash2 } from 'lucide-react';
import { Ingredient, Recipe, ServingSize } from '../../../types';
import { useI18n } from '../../../i18n';
import { getFoodQuality, FOOD_QUALITY_EMOJI } from '../utils/nutrition';
import { searchOpenFoodFacts, OFFResult } from '../api/open-food-facts';
import { analyzePhotoMeal, fileToBase64, DetectedFood } from '../api/photo-recognition';
import BarcodeScanner from '../components/BarcodeScanner';
import MealSlotSelector, { MealSlot } from '../components/MealSlotSelector';
import PortionSheet from '../components/PortionSheet';
import { PortionResult } from '../components/PortionSelector';
import EmptyState from '../../../components/EmptyState';
import { useAppState } from '../../../contexts/AppStateContext';
import { toast } from 'sonner';

interface AddMealProps {
  onBack: () => void;
  onLogMeal?: (meal: any) => void;
  dailyMacros?: any;
  savedRecipes?: Recipe[];
  dictionary?: Ingredient[];
}

export default function AddMeal({
  onBack,
  onLogMeal,
  dailyMacros,
  savedRecipes = [],
  dictionary = [],
}: AddMealProps) {
  const { t } = useI18n();
  const { userProfile, foodHistory, favoriteIds, toggleFavorite } = useAppState();
  const unitSystem = userProfile.unitSystem ?? 'metric';

  // ─── Local state ───────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients'>('recipes');
  const [browseMode, setBrowseMode] = useState<'recents' | 'favorites' | 'all'>('recents');
  const [mealSlot, setMealSlot] = useState<MealSlot>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [portionTarget, setPortionTarget] = useState<Ingredient | null>(null);
  // Photo AI results
  const [photoResults, setPhotoResults] = useState<DetectedFood[]>([]);
  // Multi-add queue
  const [multiMode, setMultiMode] = useState(false);
  const [multiQueue, setMultiQueue] = useState<{ id: string | number; title: string; cal: number; pro: number; carbs: number; fats: number; grams?: number; portionDescription?: string; servingUsed?: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Macros ────────────────────────────────────────────────
  const macros = dailyMacros ?? {
    consumed: { cal: 840, pro: 45, carbs: 110, fats: 25 },
    target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
  };
  const remainingCal = Math.max(0, macros.target.cal - macros.consumed.cal);
  const calPct = Math.min(100, Math.round((macros.consumed.cal / macros.target.cal) * 100));
  const proPct = Math.min(100, Math.round((macros.consumed.pro / macros.target.pro) * 100));

  // ─── Open Food Facts debounced search ──────────────────────
  useEffect(() => {
    if (activeTab !== 'ingredients' || searchQuery.length < 3) {
      setApiResults([]);
      return;
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setIsSearchingApi(true);
      setApiResults(await searchOpenFoodFacts(searchQuery));
      setIsSearchingApi(false);
    }, 500);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery, activeTab]);

  // ─── Food list ─────────────────────────────────────────────
  const isSearching = searchQuery.trim().length > 0;

  const recentFoods = useMemo(() => {
    // Build displayable items from foodHistory, matching to dictionary/recipes where possible
    return foodHistory.slice(0, 15).map(entry => {
      const dictMatch = dictionary.find(d => String(d.id) === entry.foodId);
      const recipeMatch = savedRecipes.find(r => String(r.id) === entry.foodId);
      if (dictMatch) return { ...dictMatch, _historyEntry: entry };
      if (recipeMatch) return { ...recipeMatch, _historyEntry: entry };
      // Fallback: reconstruct from history
      return {
        id: entry.foodId,
        title: entry.title,
        cal: entry.lastMacros.cal,
        pro: entry.lastMacros.pro,
        carbs: entry.lastMacros.carbs,
        fats: entry.lastMacros.fats,
        _historyEntry: entry,
      };
    });
  }, [foodHistory, dictionary, savedRecipes]);

  const favoriteFoods = useMemo(() => {
    const favSet = new Set(favoriteIds);
    const fromDict = dictionary.filter(d => favSet.has(String(d.id)));
    const fromRecipes = savedRecipes.filter(r => favSet.has(String(r.id)));
    return [...fromDict, ...fromRecipes];
  }, [favoriteIds, dictionary, savedRecipes]);

  const localFoods: any[] = (() => {
    const src: any[] = activeTab === 'recipes' ? savedRecipes : dictionary;
    const q = searchQuery.toLowerCase();
    return q
      ? src.filter(f => ((f.title as string | undefined) ?? (f.name as string | undefined) ?? '').toLowerCase().includes(q))
      : src;
  })();

  const displayFoods: any[] = (() => {
    if (isSearching) {
      return activeTab === 'ingredients' ? [...localFoods, ...apiResults] : localFoods;
    }
    // No search: show browse mode
    if (browseMode === 'recents') return recentFoods;
    if (browseMode === 'favorites') return favoriteFoods;
    return activeTab === 'ingredients' ? [...localFoods, ...apiResults] : localFoods;
  })();

  // ─── Helpers ────────────────────────────────────────────────

  /** Convert an OFF API result to a temporary Ingredient for PortionSheet */
  function apiResultToIngredient(food: OFFResult): Ingredient {
    return {
      id: food.id,
      name: food.title,
      nameEn: food.title,
      description: '',
      descriptionEn: '',
      category: 'prepared',
      baseAmount: 100,
      baseUnit: 'g',
      servingSizes: food.servingSizes,
      macros: {
        calories: food.cal,
        protein: food.pro,
        carbs: food.carbs,
        fats: food.fats,
        fiber: food.fiber,
        sugar: food.sugar,
        saturatedFat: food.saturatedFat,
      },
      micros: { vitamins: {}, minerals: {}, others: {} },
      tags: [],
      allergens: [],
    };
  }

  function logFood(food: any) {
    onLogMeal?.({ ...food, mealSlot, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  }

  function handleTapPlus(food: any) {
    // All food items go through PortionSheet — dictionary, API, and scanned
    if (food.isApiResult) {
      // API results: convert to temp Ingredient with real OFF servings
      setPortionTarget(apiResultToIngredient(food as OFFResult));
    } else if (food.servingSizes?.length > 0) {
      // Dictionary ingredients with serving sizes
      setPortionTarget(food as Ingredient);
    } else {
      // Recipes and other items — log directly or queue
      const item = {
        id: food.id,
        title: food.title || food.name,
        cal: food.cal ?? food.macros?.calories ?? 0,
        pro: food.pro ?? food.macros?.protein ?? 0,
        carbs: food.carbs ?? food.macros?.carbs ?? 0,
        fats: food.fats ?? food.macros?.fats ?? 0,
      };
      if (multiMode) {
        setMultiQueue(prev => [...prev, item]);
        toast.success(t.addMealScreen?.addedToQueue || 'Añadido a la cola');
      } else {
        logFood(food);
      }
    }
  }

  function handlePortionConfirm(result: PortionResult) {
    if (!portionTarget) return;
    const item = {
      id: portionTarget.id,
      title: portionTarget.name,
      cal: result.scaledMacros.calories,
      pro: result.scaledMacros.protein,
      carbs: result.scaledMacros.carbs,
      fats: result.scaledMacros.fats,
      macros: result.scaledMacros,
      grams: result.totalGrams,
      portionDescription: result.portionDescription,
      servingUsed: result.servingId,
    };
    if (multiMode) {
      setMultiQueue(prev => [...prev, item]);
      toast.success(t.addMealScreen?.addedToQueue || 'Añadido a la cola');
    } else {
      logFood(item);
    }
    setPortionTarget(null);
  }

  function logMultiQueue() {
    multiQueue.forEach(item => logFood(item));
    setMultiQueue([]);
    setMultiMode(false);
  }

  function logPhotoResults() {
    photoResults.forEach(food => {
      logFood({
        id: Date.now() + Math.random(),
        title: food.nameEs || food.name,
        cal: food.macros.cal,
        pro: food.macros.pro,
        carbs: food.macros.carbs,
        fats: food.macros.fats,
        grams: food.estimatedGrams,
        portionDescription: `~${food.estimatedGrams}g (AI)`,
        servingUsed: 'ai-vision',
      });
    });
    setPhotoResults([]);
  }

  const multiTotals = useMemo(() => ({
    cal: multiQueue.reduce((s, i) => s + i.cal, 0),
    pro: multiQueue.reduce((s, i) => s + i.pro, 0),
    carbs: multiQueue.reduce((s, i) => s + i.carbs, 0),
    fats: multiQueue.reduce((s, i) => s + i.fats, 0),
  }), [multiQueue]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const results = await analyzePhotoMeal(base64, file.type || 'image/jpeg');
      if (results.length > 0) {
        setPhotoResults(results);
        toast.success(t.addMealScreen?.aiDetected?.replace('{count}', String(results.length)) || `IA detectó ${results.length} alimentos`);
      } else {
        toast.error(t.addMealScreen?.noFoodDetected || 'No se detectaron alimentos');
      }
    } catch (err) {
      console.error('Photo analysis error:', err);
      toast.error(t.addMealScreen?.photoError || 'Error al analizar la foto');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <>
      <div className="px-6 max-w-4xl mx-auto space-y-5 pb-28">

        {/* Header */}
        <header className="flex items-center gap-4 pt-2">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{t.home.registered}</span>
            <h2 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">{t.home.addMeal}</h2>
          </div>
        </header>

        {/* Meal slot selector */}
        <MealSlotSelector value={mealSlot} onChange={setMealSlot} />

        {/* Macro context — compact */}
        <section className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">{t.home.dailyProgress}</p>
              <span className="font-headline text-2xl font-bold text-primary">{remainingCal}</span>
              <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase ml-1">{t.common.kcal} {t.home.remaining}</span>
            </div>
            <div className="text-right">
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{calPct}% {t.home.consumed}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[9px] font-label font-bold tracking-widest uppercase mb-1 text-on-surface-variant">
                <span>{t.portionSelector.protein}</span>
                <span>{Math.max(0, macros.target.pro - macros.consumed.pro)}g</span>
              </div>
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${proPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-label font-bold tracking-widest uppercase mb-1 text-on-surface-variant">
                <span>{t.portionSelector.carbs}</span>
                <span>{Math.max(0, macros.target.carbs - macros.consumed.carbs)}g</span>
              </div>
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-brand-secondary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.round((macros.consumed.carbs / macros.target.carbs) * 100))}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Barcode scanner modal */}
        {showScanner && (
          <BarcodeScanner
            onClose={() => setShowScanner(false)}
            unitSystem={unitSystem}
            onProductFound={(product, portionResult) => {
              setShowScanner(false);
              const m = portionResult?.scaledMacros ?? { calories: product.calories, protein: product.protein, carbs: product.carbs, fats: product.fats };
              logFood({
                id: Date.now(),
                title: `${product.name}${product.brand ? ` (${product.brand})` : ''}`,
                cal: m.calories, pro: m.protein, carbs: m.carbs, fats: m.fats,
                macros: m, grams: portionResult?.totalGrams ?? 100,
              });
            }}
          />
        )}

        {/* Quick capture buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-surface-container-high text-tertiary border border-outline-variant/30 p-4 font-label text-xs font-bold tracking-widest uppercase flex flex-col items-center gap-2.5 rounded-sm hover:bg-surface-container-highest transition-colors group"
          >
            <Barcode className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            {t.fab.scanBarcode}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="bg-surface-container-high text-tertiary border border-outline-variant/30 p-4 font-label text-xs font-bold tracking-widest uppercase flex flex-col items-center gap-2.5 rounded-sm hover:bg-surface-container-highest transition-colors group disabled:opacity-60"
          >
            {isAnalyzing
              ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
              : <Camera className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            }
            {isAnalyzing ? t.common.loading : t.fab.photoAI}
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        {/* Photo AI results review */}
        {photoResults.length > 0 && (
          <section className="bg-surface-container-low border-2 border-primary/30 rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">
                  {t.addMealScreen?.aiDetected?.replace('{count}', String(photoResults.length)) || `IA detectó ${photoResults.length} alimentos`}
                </h3>
              </div>
              <button onClick={() => setPhotoResults([])} className="text-on-surface-variant hover:text-tertiary">
                <X className="w-4 h-4" />
              </button>
            </div>
            {photoResults.map((food, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-container-high p-3 rounded-sm border border-outline-variant/20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${food.confidence === 'high' ? 'bg-green-500' : food.confidence === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-headline font-bold text-xs uppercase text-tertiary block truncate">{food.nameEs || food.name}</span>
                  <span className="text-[9px] font-label tracking-widest text-on-surface-variant uppercase">
                    ~{food.estimatedGrams}g · {food.macros.cal} {t.common.kcal} · {food.macros.pro}g P
                  </span>
                </div>
                <button onClick={() => setPhotoResults(prev => prev.filter((_, j) => j !== i))}
                  className="text-on-surface-variant hover:text-error transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between text-[9px] font-label tracking-widest uppercase text-on-surface-variant pt-1">
              <span>Total: {photoResults.reduce((s, f) => s + f.macros.cal, 0)} {t.common.kcal} · {photoResults.reduce((s, f) => s + f.macros.pro, 0).toFixed(0)}g P</span>
            </div>
            <button onClick={logPhotoResults}
              className="w-full py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              {t.addMealScreen?.logDetected || `Registrar ${photoResults.length} alimentos`}
            </button>
          </section>
        )}

        {/* Search + multi-add toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full bg-surface-container-low border border-outline-variant/30 py-3.5 pl-12 pr-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50"
            />
          </div>
          <button
            onClick={() => { setMultiMode(!multiMode); if (multiMode) setMultiQueue([]); }}
            className={`px-3 rounded-sm border font-label text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 shrink-0 ${
              multiMode ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50'
            }`}
            aria-label={t.addMealScreen?.multiAdd || 'Multi-add'}
          >
            {multiMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            Multi
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/20">
          {(['recipes', 'ingredients'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(''); setApiResults([]); }}
              className={`flex-1 py-3 font-headline text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${
                activeTab === tab ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-tertiary'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab === 'recipes' ? <BookOpen className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
                {tab === 'recipes' ? t.nav.kitchen : t.recipes.ingredients}
              </span>
            </button>
          ))}
        </div>

        {/* Browse mode tabs — shown when not searching */}
        {!isSearching && (
          <div className="flex gap-2">
            {([
              { id: 'recents' as const, label: t.addMealScreen.recents, icon: Clock },
              { id: 'favorites' as const, label: t.addMealScreen.favorites, icon: Star },
              { id: 'all' as const, label: t.addMealScreen.allFoods, icon: null },
            ]).map(mode => (
              <button
                key={mode.id}
                onClick={() => setBrowseMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-label font-bold tracking-widest uppercase transition-colors ${
                  browseMode === mode.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:border-primary/50'
                }`}
              >
                {mode.icon && <mode.icon className="w-3 h-3" />}
                {mode.label}
              </button>
            ))}
          </div>
        )}

        {/* Food list */}
        <div className="space-y-3">
          {isSearchingApi && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label uppercase tracking-widest py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Open Food Facts…
            </div>
          )}

          {/* Empty states */}
          {displayFoods.length === 0 && !isSearchingApi && isSearching && (
            <EmptyState icon="🔍" title={t.common.noResults} description={t.empty.searchEmpty} />
          )}
          {displayFoods.length === 0 && !isSearching && browseMode === 'recents' && (
            <EmptyState icon="🕐" title={t.addMealScreen.noRecents} description={t.addMealScreen.noRecents} />
          )}
          {displayFoods.length === 0 && !isSearching && browseMode === 'favorites' && (
            <EmptyState icon="⭐" title={t.addMealScreen.noFavorites} description={t.addMealScreen.noFavorites} />
          )}

          {displayFoods.map(food => {
            const foodId = String(food.id);
            const isFav = favoriteIds.includes(foodId);
            const historyEntry = food._historyEntry;
            return (
              <div
                key={food.id}
                className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 flex items-center justify-between group hover:border-primary/30 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-headline font-bold text-sm uppercase text-tertiary truncate">{food.title ?? food.name}</h4>
                    {food.isApiResult && (
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                        <Globe className="w-2 h-2" /> OFF
                      </span>
                    )}
                    {food.servingSizes?.length > 0 && (
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">DB</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-label tracking-widest uppercase text-on-surface-variant flex-wrap">
                    <span className="text-primary font-bold">{food.cal ?? food.macros?.calories ?? 0} {t.common.kcal}</span>
                    <span>·</span>
                    <span>{food.pro ?? food.macros?.protein ?? 0}g P</span>
                    <span>·</span>
                    <span>{food.carbs ?? food.macros?.carbs ?? 0}g C</span>
                    {food.macros && <span className="ml-1">{FOOD_QUALITY_EMOJI[getFoodQuality(food.macros, food.micros?.others?.fiber)]}</span>}
                    {food.servingSizes?.length > 0 && (
                      <span className="text-on-surface-variant/50 italic normal-case text-[9px]">{t.addMealScreen.adjustablePortion}</span>
                    )}
                    {historyEntry && (
                      <span className="text-on-surface-variant/50 italic normal-case text-[9px]">
                        {t.addMealScreen.timesLogged.replace('{count}', String(historyEntry.useCount))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      toggleFavorite(foodId);
                      toast.success(isFav ? t.addMealScreen.removedFromFavorites : t.addMealScreen.addedToFavorites);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'text-primary fill-primary' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleTapPlus(food)}
                    className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-add running total banner */}
      {multiMode && multiQueue.length > 0 && (
        <div className="fixed bottom-28 md:bottom-20 left-0 right-0 z-40 px-4">
          <div className="max-w-lg mx-auto bg-surface-container-highest border border-primary/30 rounded-sm p-3 shadow-xl flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary block">
                {multiQueue.length} {multiQueue.length === 1 ? 'item' : 'items'}
              </span>
              <span className="text-[9px] font-label tracking-widest text-on-surface-variant uppercase">
                {multiTotals.cal} {t.common.kcal} · {multiTotals.pro.toFixed(0)}g P · {multiTotals.carbs.toFixed(0)}g C · {multiTotals.fats.toFixed(0)}g F
              </span>
            </div>
            <button onClick={() => setMultiQueue([])}
              className="text-on-surface-variant hover:text-error transition-colors p-1.5">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={logMultiQueue}
              className="bg-primary text-on-primary px-4 py-2.5 rounded-sm font-headline text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
              {t.addMealScreen?.logAll?.replace('{count}', String(multiQueue.length)) || `Registrar (${multiQueue.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Portion sheet — renders outside main scroll container */}
      {portionTarget && (
        <PortionSheet
          ingredient={portionTarget}
          onConfirm={handlePortionConfirm}
          onClose={() => setPortionTarget(null)}
          unitSystem={unitSystem}
        />
      )}
    </>
  );
}
