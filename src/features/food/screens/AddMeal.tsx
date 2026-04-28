import React, { useState, useRef, useEffect, useMemo } from 'react';
import PageShell from '../../../components/PageShell';
import SearchInput from '../../../components/patterns/SearchInput';
import { CheckSquare, Square } from 'lucide-react';
import { Ingredient, Recipe } from '../../../types';
import { logger } from '../../../lib/logger';
import { useI18n } from '../../../i18n';
import { unifiedSearch } from '../utils/unified-search';
import { offResultToIngredient } from '../utils/pseudo-ingredient';
import { searchOpenFoodFacts, OFFResult } from '../api/open-food-facts';
import { analyzePhotoMeal, fileToBase64, DetectedFood } from '../api/photo-recognition';
import BarcodeScanner from '../components/BarcodeScanner';
import VariantPickerSheet from '../components/VariantPickerSheet';
import MealSlotSelector, { MealSlot } from '../components/MealSlotSelector';
import { searchFamilies } from '../utils/food-family-resolver';
import type { FoodFamily } from '../../../types/food-family';
import { normalizeGoal } from '../utils/contextual-score';
import { variantFromIngredientLike } from '../utils/variant-from-log';
import PortionSheet from '../components/PortionSheet';
import { PortionResult } from '../components/PortionSelector';
import TabNav from '../../../components/patterns/TabNav';
import PageHeader from '../../../components/patterns/PageHeader';
import ChipRow from '../../../components/patterns/ChipRow';
import { useAppState } from '../../../contexts/AppStateContext';
import { toast } from 'sonner';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';
import type { LoggableMeal } from '../../../types';
import { BookOpen, Leaf, Clock, Star } from 'lucide-react';
import AddMealMacroBar from '../components/add-meal/AddMealMacroBar';
import AddMealQuickCapture from '../components/add-meal/AddMealQuickCapture';
import AddMealPhotoResults from '../components/add-meal/AddMealPhotoResults';
import AddMealFoodList, { type DisplayFood } from '../components/add-meal/AddMealFoodList';
import AddMealMultiBanner from '../components/add-meal/AddMealMultiBanner';

interface AddMealProps {
  onBack: () => void;
  onLogMeal?: (meal: LoggableMeal) => void;
  dailyMacros?: DailyMacros;
  savedRecipes?: Recipe[];
  dictionary?: Ingredient[];
}

/**
 * Add Meal screen — composer.
 *
 * Owns all state, effects, memos, and handlers. Delegates visual sections to:
 *   AddMealMacroBar       — daily progress compact summary
 *   AddMealQuickCapture   — Barcode + Camera buttons + hidden file input
 *   AddMealPhotoResults   — AI-detected foods review panel
 *   AddMealFoodList       — family-first results + flat food rows
 *   AddMealMultiBanner    — floating multi-add total banner
 *
 * [Sprint 35] split from 714 → ~280 lines.
 */
export default function AddMeal({
  onBack,
  onLogMeal,
  dailyMacros,
  savedRecipes = [],
  dictionary = [],
}: AddMealProps) {
  const { t, locale } = useI18n();
  const {
    userProfile, foodHistory, favoriteIds, toggleFavorite,
    openScannerOnAddMeal, setOpenScannerOnAddMeal,
    userVariants, mergedVariants, addUserVariant, addVariantBarcode,
  } = useAppState();
  const unitSystem = userProfile.unitSystem ?? 'metric';

  // P13 [1.5.71] — normalise the user's goal once for contextual chips across search rows.
  const addMealActiveGoal = useMemo(
    () => normalizeGoal((userProfile as { goal?: string } | null)?.goal ?? null),
    [userProfile],
  );

  // ─── Local state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients'>('recipes');
  const [browseMode, setBrowseMode] = useState<'recents' | 'favorites' | 'all'>('recents');
  const [mealSlot, setMealSlot] = useState<MealSlot>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState<OFFResult[]>([]);
  const [pickerFamily, setPickerFamily] = useState<FoodFamily | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [portionTarget, setPortionTarget] = useState<Ingredient | null>(null);
  const [photoResults, setPhotoResults] = useState<DetectedFood[]>([]);
  const [multiMode, setMultiMode] = useState(false);
  const [multiQueue, setMultiQueue] = useState<{
    id: string | number; title: string;
    cal: number; pro: number; carbs: number; fats: number;
    grams?: number; portionDescription?: string; servingUsed?: string;
  }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Derived macros ───────────────────────────────────────────────────────
  const macros = dailyMacros ?? {
    consumed: { cal: 840, pro: 45, carbs: 110, fats: 25 },
    target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
  };
  const remainingCal = Math.max(0, macros.target.cal - macros.consumed.cal);
  const calPct = Math.min(100, Math.round((macros.consumed.cal / macros.target.cal) * 100));
  const proPct = Math.min(100, Math.round((macros.consumed.pro / macros.target.pro) * 100));
  const carbsPct = Math.min(100, Math.round((macros.consumed.carbs / macros.target.carbs) * 100));

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Auto-open scanner when FAB "scan-barcode" requested it (one-shot).
  useEffect(() => {
    if (openScannerOnAddMeal) {
      setShowScanner(true);
      setOpenScannerOnAddMeal(false);
    }
  }, [openScannerOnAddMeal, setOpenScannerOnAddMeal]);

  // Debounced OFF search (fires for query ≥ 3 chars, tab-independent).
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (searchQuery.length < 3) { setApiResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      setIsSearchingApi(true);
      setApiResults(await searchOpenFoodFacts(searchQuery));
      setIsSearchingApi(false);
    }, 500);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // ─── Memos ────────────────────────────────────────────────────────────────
  const isSearching = searchQuery.trim().length > 0;

  const recentFoods = useMemo(() => foodHistory.slice(0, 15).map(entry => {
    const dictMatch = dictionary.find(d => String(d.id) === entry.foodId);
    const recipeMatch = savedRecipes.find(r => String(r.id) === entry.foodId);
    if (dictMatch) return { ...dictMatch, _historyEntry: entry };
    if (recipeMatch) return { ...recipeMatch, _historyEntry: entry };
    return {
      id: entry.foodId, title: entry.title,
      cal: entry.lastMacros.cal, pro: entry.lastMacros.pro,
      carbs: entry.lastMacros.carbs, fats: entry.lastMacros.fats,
      _historyEntry: entry,
    };
  }), [foodHistory, dictionary, savedRecipes]);

  const favoriteFoods = useMemo(() => {
    const favSet = new Set(favoriteIds);
    return [...dictionary.filter(d => favSet.has(String(d.id))), ...savedRecipes.filter(r => favSet.has(String(r.id)))];
  }, [favoriteIds, dictionary, savedRecipes]);

  const unifiedLocalResults = useMemo(
    () => isSearching ? unifiedSearch(searchQuery, { dictionary, savedRecipes }) : [],
    [isSearching, searchQuery, dictionary, savedRecipes],
  );

  const familyResults = useMemo(
    () => searchQuery.length >= 2 ? searchFamilies(searchQuery, mergedVariants, 8) : [],
    [searchQuery, mergedVariants],
  );

  const displayFoods: DisplayFood[] = useMemo(() => {
    if (isSearching) return [...unifiedLocalResults, ...apiResults];
    if (browseMode === 'recents') return recentFoods;
    if (browseMode === 'favorites') return favoriteFoods;
    return activeTab === 'ingredients' ? dictionary : savedRecipes;
  }, [isSearching, unifiedLocalResults, apiResults, browseMode, recentFoods, favoriteFoods, activeTab, dictionary, savedRecipes]);

  const multiTotals = useMemo(() => ({
    cal: multiQueue.reduce((s, i) => s + i.cal, 0),
    pro: multiQueue.reduce((s, i) => s + i.pro, 0),
    carbs: multiQueue.reduce((s, i) => s + i.carbs, 0),
    fats: multiQueue.reduce((s, i) => s + i.fats, 0),
  }), [multiQueue]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  function logFood(food: DisplayFood) {
    onLogMeal?.({ ...(food as LoggableMeal), mealSlot, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  }

  function handleTapPlus(food: DisplayFood) {
    if (food.isApiResult) {
      setPortionTarget(offResultToIngredient(food as OFFResult));
    } else if ((food.servingSizes?.length ?? 0) > 0) {
      setPortionTarget(food as Ingredient);
    } else {
      const item = {
        id: food.id ?? 0, title: food.title ?? food.name ?? '',
        cal: food.cal ?? food.macros?.calories ?? 0,
        pro: food.pro ?? food.macros?.protein ?? 0,
        carbs: food.carbs ?? food.macros?.carbs ?? 0,
        fats: food.fats ?? food.macros?.fats ?? 0,
      };
      if (multiMode) { setMultiQueue(prev => [...prev, item]); toast.success(t.addMealScreen?.addedToQueue || 'Añadido a la cola'); }
      else { logFood(food); }
    }
  }

  function handlePortionConfirm(result: PortionResult) {
    if (!portionTarget) return;
    const item = {
      id: portionTarget.id, title: portionTarget.name,
      cal: result.scaledMacros.calories, pro: result.scaledMacros.protein,
      carbs: result.scaledMacros.carbs, fats: result.scaledMacros.fats,
      macros: result.scaledMacros, grams: result.totalGrams,
      portionDescription: result.portionDescription, servingUsed: result.servingId,
    };
    if (multiMode) { setMultiQueue(prev => [...prev, item]); toast.success(t.addMealScreen?.addedToQueue || 'Añadido a la cola'); }
    else { logFood(item); }
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
        id: Date.now() + Math.random(), title: food.nameEs || food.name,
        cal: food.macros.cal, pro: food.macros.pro, carbs: food.macros.carbs, fats: food.macros.fats,
        grams: food.estimatedGrams, portionDescription: `~${food.estimatedGrams}g (AI)`, servingUsed: 'ai-vision',
      });
    });
    setPhotoResults([]);
  }

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
      logger.error('Photo analysis error', { error: err instanceof Error ? err.message : String(err) });
      toast.error(t.addMealScreen?.photoError || 'Error al analizar la foto');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // P13 [1.5.71] — build a score-ready FoodVariant for a given food row.
  function scoreVariantFor(food: DisplayFood) {
    const foodId = String(food.id);
    return addMealActiveGoal && (food.cal || food.macros?.calories)
      ? variantFromIngredientLike(
          {
            id: foodId,
            name: food.title ?? food.name ?? '',
            nameEn: food.nameEn,
            macros: {
              calories: food.cal ?? food.macros?.calories ?? 0,
              protein: food.pro ?? food.macros?.protein ?? 0,
              carbs: food.carbs ?? food.macros?.carbs ?? 0,
              fats: food.fats ?? food.macros?.fats ?? 0,
            },
          },
          mergedVariants,
        )
      : null;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <PageShell maxWidth="default" spacing="lg">
        <PageHeader onBack={onBack} label={t.home.registered} title={t.home.addMeal} />

        <MealSlotSelector value={mealSlot} onChange={setMealSlot} />

        <AddMealMacroBar
          remainingCal={remainingCal}
          calPct={calPct}
          proPct={proPct}
          carbsPct={carbsPct}
          protein={{ consumed: macros.consumed.pro, target: macros.target.pro }}
          carbs={{ consumed: macros.consumed.carbs, target: macros.target.carbs }}
        />

        {showScanner && (
          <BarcodeScanner
            onClose={() => setShowScanner(false)}
            unitSystem={unitSystem}
            knownVariants={mergedVariants}
            addUserVariant={addUserVariant}
            addVariantBarcode={addVariantBarcode}
            userGoal={(userProfile as { goal?: string } | null)?.goal ?? null}
            onProductFound={(product, portionResult) => {
              setShowScanner(false);
              const m = portionResult?.scaledMacros ?? { calories: product.calories, protein: product.protein, carbs: product.carbs, fats: product.fats };
              logFood({ id: Date.now(), title: `${product.name}${product.brand ? ` (${product.brand})` : ''}`, cal: m.calories, pro: m.protein, carbs: m.carbs, fats: m.fats, macros: m, grams: portionResult?.totalGrams ?? 100 });
            }}
          />
        )}

        <AddMealQuickCapture
          onScanPress={() => setShowScanner(true)}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          isAnalyzing={isAnalyzing}
        />

        {photoResults.length > 0 && (
          <AddMealPhotoResults
            photoResults={photoResults}
            onRemove={idx => setPhotoResults(prev => prev.filter((_, j) => j !== idx))}
            onLogAll={logPhotoResults}
          />
        )}

        <div className="flex gap-2">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder={t.common.search} className="flex-1" />
          <button
            type="button"
            onClick={() => { setMultiMode(!multiMode); if (multiMode) setMultiQueue([]); }}
            className={`px-3 rounded-sm border font-label text-micro font-semibold uppercase tracking-widest transition-colors flex items-center gap-1.5 shrink-0 ${
              multiMode ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50'
            }`}
            aria-label={t.addMealScreen?.multiAdd || 'Multi-add'}
          >
            {multiMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            Multi
          </button>
        </div>

        <TabNav
          tabs={[
            { id: 'recipes', label: t.nav.kitchen, icon: BookOpen },
            { id: 'ingredients', label: t.recipes.ingredients, icon: Leaf },
          ]}
          active={activeTab}
          onChange={(id) => { setActiveTab(id as typeof activeTab); if (!isSearching) setApiResults([]); }}
        />

        {!isSearching && (
          <ChipRow
            mode="single"
            variant="pill"
            options={[
              { id: 'recents', label: t.addMealScreen.recents, icon: Clock },
              { id: 'favorites', label: t.addMealScreen.favorites, icon: Star },
              { id: 'all', label: t.addMealScreen.allFoods },
            ]}
            active={browseMode}
            onChange={(id) => setBrowseMode((id ?? 'all') as typeof browseMode)}
            ariaLabel={t.addMealScreen.allFoods}
          />
        )}

        <AddMealFoodList
          isSearching={isSearching}
          isSearchingApi={isSearchingApi}
          browseMode={browseMode}
          familyResults={familyResults}
          displayFoods={displayFoods}
          favoriteIds={favoriteIds}
          activeGoal={addMealActiveGoal}
          mergedVariants={mergedVariants}
          locale={locale}
          onPickFamily={(family) => { setPickerFamily(family); setPickerOpen(true); }}
          onToggleFavorite={(foodId) => {
            const isFav = favoriteIds.includes(foodId);
            toggleFavorite(foodId);
            toast.success(isFav ? t.addMealScreen.removedFromFavorites : t.addMealScreen.addedToFavorites);
          }}
          onTapPlus={handleTapPlus}
          scoreVariantFor={scoreVariantFor}
        />
      </PageShell>

      {multiMode && multiQueue.length > 0 && (
        <AddMealMultiBanner
          count={multiQueue.length}
          totals={multiTotals}
          onClear={() => setMultiQueue([])}
          onLogAll={logMultiQueue}
        />
      )}

      {portionTarget && (
        <PortionSheet
          ingredient={portionTarget}
          onConfirm={handlePortionConfirm}
          onClose={() => setPortionTarget(null)}
          unitSystem={unitSystem}
        />
      )}

      {pickerFamily && (
        <VariantPickerSheet
          family={pickerFamily}
          allVariants={mergedVariants}
          userVariants={userVariants}
          open={pickerOpen}
          onOpenChange={(open) => { setPickerOpen(open); if (!open) setPickerFamily(null); }}
          onSelect={(variant) => {
            const familyName = locale === 'es' ? pickerFamily.name : pickerFamily.nameEn;
            const brandSuffix = variant.brand?.name ? ` · ${variant.brand.name}` : '';
            const item = {
              id: variant.id, title: `${familyName}${brandSuffix}`, familyId: variant.familyId, variantId: variant.id,
              cal: variant.macros.calories, pro: variant.macros.protein, carbs: variant.macros.carbs, fats: variant.macros.fats,
              macros: variant.macros, grams: 100, portionDescription: '100g', servingUsed: 'base',
            };
            if (multiMode) { setMultiQueue(prev => [...prev, item]); toast.success(t.addMealScreen?.addedToQueue || 'Añadido a la cola'); }
            else { logFood(item); }
          }}
        />
      )}
    </>
  );
}
