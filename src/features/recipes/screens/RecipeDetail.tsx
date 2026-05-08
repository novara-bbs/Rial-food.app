import { ArrowLeft, ChefHat, ExternalLink } from 'lucide-react';
import featureFlags from '../../../lib/featureFlags';
import TimeTileComposite from '../components/TimeTileComposite';
import AuthorAttributionCard from '../components/AuthorAttributionCard';
import StickyCookCTA from '../components/StickyCookCTA';
import { useState, useEffect, useRef } from 'react';
import CookMode from '../components/CookMode';
import MiseEnPlaceScreen from '../components/MiseEnPlaceScreen';
import type { HeroMediaItem } from '../components/HeroGallery';
import { parseVideoSource, platformLabel } from '../utils/videoEmbed';
import RecipeNutritionPanel from '../components/detail/RecipeNutritionPanel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { Ingredient, LoggableMeal } from '../../../types';
import type { Recipe } from '../../../types';
import type { RecipeIngredient } from '../../../types/food';
import type { UserProfile } from '../../../types/user';
import type { ShoppingItem } from '../../../types/planner';
import { toast } from 'sonner';
import { trackRecipeView } from '../../social/utils/analytics';
import { CREATORS_MAP } from '../../social/data/seed-creators';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import { FOOD_FAMILIES } from '../../food/data/food-families';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { useI18n } from '../../../i18n';
import RelatedRecipesCarousel from '../components/RelatedRecipesCarousel';
import RecipeStepsTab from '../components/detail/RecipeStepsTab';
import RecipeNutritionTab from '../components/detail/RecipeNutritionTab';
import RecipeOverviewTab from '../components/detail/RecipeOverviewTab';
import RecipeIngredientsTab from '../components/detail/RecipeIngredientsTab';
import RecipeHero from '../components/detail/RecipeHero';
import RecipeDetailModals from '../components/detail/RecipeDetailModals';
import RecipeCreatorAttribution from '../components/detail/RecipeCreatorAttribution';
import RecipeCommunityStats from '../components/detail/RecipeCommunityStats';
import { useRecipeCalculations } from '../hooks/useRecipeCalculations';
import { Heading } from '@/components/ui/Typography';

export default function RecipeDetail({ recipe, onBack, onSaveRecipe, isSaved, onAddToPlan, onLogMealNow, onAddToShoppingList, dictionary = [], userProfile }: {
  recipe: Recipe | null;
  onBack: () => void;
  onSaveRecipe?: (r: Recipe) => void;
  isSaved?: boolean;
  onAddToPlan?: (recipe: Recipe, dayIndex: number, slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onLogMealNow?: (recipe: LoggableMeal, servings: number) => void;
  onAddToShoppingList?: (items: ShoppingItem[]) => void;
  dictionary?: Ingredient[];
  userProfile?: UserProfile;
}) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { setSelectedCreatorId, communityPosts, savedRecipes, savedPosts, navigateToRecipe: navToRecipe, handleDeleteRecipe, handleDuplicateRecipe, handleMarkAsCooked, setRecipeToEdit, isPro, mergedVariants, userVariants, miseEnPlaceEnabled, setMiseEnPlaceEnabled } = useAppState();
  // Ref for StickyCookCTA — points at the quick-actions row so the sticky
  // button hides when those buttons enter the viewport.
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const [followedCreators, setFollowedCreators] = useLocalStorageState<string[]>('followedCreators', []);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(1);
  const [cookModeActive, setCookModeActive] = useState(false);
  const [miseEnPlaceActive, setMiseEnPlaceActive] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [extraIngredients, setExtraIngredients] = useState<RecipeIngredient[]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublishSheet, setShowPublishSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [showUnsaveConfirm, setShowUnsaveConfirm] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  // P7 D1 — transient swap per recipe ingredient row. Override map keyed by
  // the ingredient row `id`; persists only for this session. Changing the
  // variant updates the displayed name + brand chip so the owner can preview
  // "same recipe with a different brand" without mutating savedRecipes. Macro
  // totals recalculation against swapped variants is deferred (future sprint).
  const [swapTarget, setSwapTarget] = useState<{ rowId: string; family: FoodFamily } | null>(null);
  const [variantSwaps, setVariantSwaps] = useState<Record<string, FoodVariant>>({});

  // Track recipe view on mount
  useEffect(() => {
    if (recipe?.id) trackRecipeView(String(recipe.id));
  }, [recipe?.id]);

  const familyMembers = userProfile?.family || [];
  const totalDiners = 1 + selectedFamily.length;
  const scaleFactor = totalDiners / (recipe?.servings || 1);

  const toggleFamilyMember = (id: string) => {
    setSelectedFamily(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id],
    );
  };

  // ── Derived memos — declared before any early return (Rules of Hooks) ──────
  const { calculatedTotals, swapSuggestions, matchScore, goalSuggestions } = useRecipeCalculations(
    recipe,
    extraIngredients,
    dictionary,
    userProfile,
  );

  // ── Early return if no recipe ────────────────
  if (!recipe) {
    return (
      <div className="px-6 max-w-4xl mx-auto pt-8 space-y-4">
        <button type="button" onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors" aria-label={t.common?.back || 'Back'}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center py-12">
          <ChefHat className="w-10 h-10 mx-auto text-on-surface-variant/40 mb-4" />
          <Heading level="h2" className="mb-2">{t.recipeDetail.recipeNotFound}</Heading>
          <p className="text-sm text-on-surface-variant">{t.recipeDetail.recipeNotFoundDesc}</p>
        </div>
      </div>
    );
  }
  const data = recipe;

  const instructions = recipe?.instructions || [];

  const applySwap = (fromId: string, toIngredient: { id: string; name?: string }) => {
    // Replace in extraIngredients or recipe ingredients state
    const fromRI = data.recipeIngredients?.find((ri) => (ri.ingredient?.id || ri.ingredientId) === fromId);
    if (!fromRI) return;
    setExtraIngredients(prev => [
      ...prev.filter(ri => ri.ingredientId !== fromId),
      { id: `swap-${Date.now()}`, ingredientId: toIngredient.id, ingredient: toIngredient as Ingredient, amount: fromRI.amount, unit: fromRI.unit },
    ]);
    toast.success(`${toIngredient.name} ${t.recipeDetail.substitute?.toLowerCase() || 'applied'}`);
  };

  // ── Ingredients list ─────────────────────────
  // `brandName` is populated when a recipe ingredient pins a specific brand variant
  // (new P4 dual-schema shape: `ri.variantId` set → `ri.ingredient.description` = brand name).
  const allIngredientsToDisplay = [
    ...(data.recipeIngredients ? data.recipeIngredients.map((ri) => {
      const swap = variantSwaps[ri.id];
      const displayName = swap?.name ?? ri.ingredient?.name ?? 'Unknown';
      const displayBrand = swap?.brand?.name
        ?? (ri.variantId && ri.ingredient?.description ? ri.ingredient.description : undefined);
      return {
        id: ri.id,
        name: displayName,
        amount: ri.amount,
        unit: ri.unit,
        isExtra: false,
        brandName: displayBrand,
        familyId: ri.familyId as string | undefined,
        swapped: Boolean(swap),
      };
    }) : (data.ingredients ? data.ingredients.map((ing: string, idx: number) => ({
      id: `old-${idx}`, name: ing, amount: 0, unit: '', isExtra: false, brandName: undefined, familyId: undefined, swapped: false,
    })) : [])),
    ...extraIngredients.map(ri => ({
      id: ri.id, name: ri.ingredient?.name || 'Unknown', amount: ri.amount, unit: ri.unit, isExtra: true, brandName: undefined, familyId: undefined, swapped: false,
    })),
  ];

  // P7 D1 — open picker sheet scoped to a family for the given row.
  const openSwapPicker = (rowId: string, familyId: string) => {
    const family = FOOD_FAMILIES.find(f => f.id === familyId);
    if (!family) {
      toast.error(t.recipeDetail.swapVariant);
      return;
    }
    setSwapTarget({ rowId, family });
  };

  const applyVariantSwap = (variant: FoodVariant) => {
    if (!swapTarget) return;
    setVariantSwaps(prev => ({ ...prev, [swapTarget.rowId]: variant }));
    setSwapTarget(null);
    const brandSuffix = variant.brand?.name ? ` · ${variant.brand.name}` : '';
    toast.success(`${variant.name}${brandSuffix}`);
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const formatAmount = (amount: number) => {
    if (!amount || amount === 0) return '';
    const total = amount * servings * scaleFactor;
    return total % 1 === 0 ? total : total.toFixed(1);
  };

  const filteredDictionary = dictionary.filter(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addExtraIngredient = (ing: Ingredient) => {
    setExtraIngredients(prev => [...prev, {
      id: `extra-${Date.now()}`, ingredientId: ing.id, amount: ing.baseAmount, unit: ing.baseUnit, ingredient: ing,
    }]);
    setSearchQuery('');
    setIsAddingIngredient(false);
  };

  const updateExtraIngredientAmount = (id: string, amount: string) => {
    setExtraIngredients(prev => prev.map(ri => ri.id === id ? { ...ri, amount: Number(amount) || 0 } : ri));
  };

  const removeExtraIngredient = (id: string) => {
    setExtraIngredients(prev => prev.filter(ri => ri.id !== id));
  };

  const getModifiedRecipe = () => ({
    ...data,
    cal: calculatedTotals.cal, pro: calculatedTotals.pro,
    carbs: calculatedTotals.carbs, fats: calculatedTotals.fats,
    micros: calculatedTotals.micros,
    recipeIngredients: [...(data.recipeIngredients || []), ...extraIngredients],
  });

  const handleAddToShoppingList = () => {
    if (!onAddToShoppingList) return;
    const itemsToAdd = allIngredientsToDisplay
      .filter(ing => !checkedIngredients.includes(ing.id))
      .map(ing => ({
        id: Date.now() + Math.random(),
        name: `${ing.name} ${ing.amount ? `(${formatAmount(ing.amount)} ${ing.unit})` : ''}`.trim(),
        category: 'Otros', checked: false,
      }));
    if (itemsToAdd.length > 0) {
      onAddToShoppingList(itemsToAdd);
      toast.success(t.recipeDetail.ingredientsAddedToList?.replace('{count}', String(itemsToAdd.length)) || `${itemsToAdd.length} ingredientes añadidos`);
    } else {
      toast.info(t.recipeDetail.allIngredientsChecked || 'Todos los ingredientes ya están marcados');
    }
  };

  const s = servings * scaleFactor; // scale multiplier

  const cookIngredients = allIngredientsToDisplay.map(i => ({ id: String(i.id), name: i.name, amount: Number(i.amount), unit: i.unit }));
  const cookSteps = data.steps?.length ? data.steps : instructions;

  /** R5.3: Route through MiseEnPlaceScreen if setting enabled, else go straight to CookMode. */
  const openCookMode = () => {
    if (miseEnPlaceEnabled && cookIngredients.length > 0) {
      setMiseEnPlaceActive(true);
    } else {
      setCookModeActive(true);
    }
  };
  const hasCreator = !!(data.publishedBy && data.publishedBy !== 'self' && CREATORS_MAP[data.publishedBy]);
  const hasAttribution = hasCreator || data.publishedBy === 'self' || !!data.forkedFrom;

  // Consolidated photo list: prefer `photos[]`, fall back to legacy single `img`/`image`.
  const galleryPhotos: string[] = (data.photos && data.photos.length > 0)
    ? data.photos
    : [data.img || data.image].filter(Boolean);

  // Sprint 46 — unified hero media: photos + optional video as a peer slide.
  // YouTube → inline iframe via `embedUrl`; everything else falls through to
  // `openExternalVideo()` inside HeroGallery.
  const parsedVideo = parseVideoSource(data.videoUrl);
  const mediaItems: HeroMediaItem[] = [
    ...galleryPhotos.map((src) => ({ kind: 'photo' as const, src })),
    ...(parsedVideo
      ? [{
          kind: 'video' as const,
          videoUrl: parsedVideo.watchUrl,
          embedUrl: parsedVideo.canEmbed ? parsedVideo.embedUrl : null,
          poster: parsedVideo.posterUrl || data.img || data.image,
          platformLabel: platformLabel(parsedVideo.platform),
        }]
      : []),
  ];

  // R2.3 — editorial tier flags.
  // `isVerified` gates the visual polish branch (hero bleed, serif, primitives).
  // `cookedCount` drives the universal badge — not flag-gated.
  const isVerified = data.verified != null && featureFlags.verifiedRecipePolish;
  const cookedCount: number = data.cookedAt?.length ?? 0;

  return (
    <>
    {miseEnPlaceActive && (
      <MiseEnPlaceScreen
        recipeTitle={data.title}
        ingredients={cookIngredients}
        onStart={() => { setMiseEnPlaceActive(false); setCookModeActive(true); }}
        onClose={() => setMiseEnPlaceActive(false)}
        onDisable={() => setMiseEnPlaceEnabled(false)}
      />
    )}
    {cookModeActive && (
      <CookMode
        steps={cookSteps}
        title={data.title}
        ingredients={cookIngredients}
        onClose={() => setCookModeActive(false)}
      />
    )}
    {/* StickyCookCTA — only on verified recipes (flag-gated), hides when quick-actions visible */}
    {isVerified && (
      <StickyCookCTA
        label={t.recipes.cookNow}
        onClick={openCookMode}
        targetRef={quickActionsRef}
      />
    )}
    <div>
      {/* ══ Hero Image / Gallery ══ */}
      <RecipeHero
        data={data}
        isVerified={isVerified}
        mediaItems={mediaItems}
        onBack={onBack}
        setLightboxIdx={setLightboxIdx}
        onSharePress={() => setShowPublishSheet(true)}
        onBookmarkPress={() => {
          if (!onSaveRecipe) return;
          if (isSaved) {
            setShowUnsaveConfirm(true);
          } else {
            onSaveRecipe(getModifiedRecipe());
          }
        }}
        isSaved={isSaved}
        onSaveRecipe={onSaveRecipe}
      />

      {/* ══ Verified editorial additions (flag-gated) ══ */}
      {isVerified && (
        <>
          {/* Time breakdown tiles (replaces the inline clock row) */}
          <div className="px-6 pt-4 max-w-4xl mx-auto">
            <TimeTileComposite prepTime={data.prepTime} cookTime={data.cookTime} />
          </div>
          {/* AuthorAttributionCard — RIAL Verified or Creator */}
          <div className="px-6 mt-3 max-w-4xl mx-auto">
            <AuthorAttributionCard
              variant={data.verified === 'creator' ? 'creator' : 'card'}
              name={data.publishedByName ?? t.recipes.verifiedRial}
              role={t.recipes.verifiedRial}
            />
          </div>
        </>
      )}

      <RecipeCreatorAttribution
        data={data}
        followedCreators={followedCreators}
        setFollowedCreators={setFollowedCreators}
        setSelectedCreatorId={setSelectedCreatorId}
        navigateTo={navigateTo}
        navToRecipe={navToRecipe}
        savedRecipes={savedRecipes}
        setRecipeToEdit={setRecipeToEdit}
        setShowDeleteConfirm={setShowDeleteConfirm}
        t={t}
      />

      {/* ══ Nutrition + Servings unified panel (Sprint 47) ══
          One card combining macros (scaled by servings), the food-quality
          banner (derived from base macros — independent of portion), and
          the servings stepper (0.5 step). The source link sits outside
          this panel because it's recipe metadata, not nutritional. */}
      <div className="px-6 max-w-4xl mx-auto">
        <RecipeNutritionPanel
          cal={Math.round(calculatedTotals.cal * s)}
          pro={Math.round(calculatedTotals.pro * s)}
          carbs={Math.round(calculatedTotals.carbs * s)}
          fats={Math.round(calculatedTotals.fats * s)}
          macros={data.macros}
          servings={servings}
          setServings={setServings}
          familyMembers={familyMembers}
          selectedFamily={selectedFamily}
          toggleFamilyMember={toggleFamilyMember}
          setSelectedFamily={setSelectedFamily}
          totalDiners={totalDiners}
          hasAttribution={hasAttribution}
        />

        {/* ── Source link ── */}
        {data.sourceUrl && (
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 mt-3 min-h-11 bg-surface-container-low p-2.5 rounded-sm border border-outline-variant/20 hover:border-primary/30 transition-colors">
            <ExternalLink className="w-4 h-4 text-primary shrink-0" />
            <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant truncate flex-1">
              {t.recipeDetail.viewOnPlatform?.replace('{platform}', data.sourceType || 'web') || data.sourceUrl}
            </span>
            <Badge variant="outline" className="text-on-surface-variant border-outline-variant/30 shrink-0 text-micro">{data.sourceType || 'source'}</Badge>
          </a>
        )}
      </div>

      {/* ══════════════════════════════════════════
          TABBED CONTENT
         ══════════════════════════════════════════ */}
      <div className="px-6 max-w-4xl mx-auto mt-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="overview" className="flex-1">{t.recipeDetail.general}</TabsTrigger>
            <TabsTrigger value="ingredients" className="flex-1">{t.recipes.ingredients}</TabsTrigger>
            <TabsTrigger value="steps" className="flex-1">{t.recipes.steps}</TabsTrigger>
            <TabsTrigger value="nutrition" className="flex-1">{t.recipeDetail.nutrition}</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Overview ── */}
          <RecipeOverviewTab
            data={data}
            matchScore={matchScore}
            swapSuggestions={swapSuggestions}
            applySwap={applySwap}
            userProfile={userProfile}
            isPro={isPro}
            cookedCount={cookedCount}
            servings={servings}
            quickActionsRef={quickActionsRef}
            getModifiedRecipe={getModifiedRecipe}
            onLogMealNow={onLogMealNow}
            onAddToPlan={onAddToPlan}
            handleMarkAsCooked={handleMarkAsCooked}
            showDaySelector={showDaySelector}
            setShowDaySelector={setShowDaySelector}
            setShowDuplicateConfirm={setShowDuplicateConfirm}
            navigateTo={navigateTo}
            communityPosts={communityPosts}
          />

          {/* ── Tab 2: Ingredients ── */}
          <RecipeIngredientsTab
            allIngredientsToDisplay={allIngredientsToDisplay}
            checkedIngredients={checkedIngredients}
            toggleIngredient={toggleIngredient}
            formatAmount={formatAmount}
            isAddingIngredient={isAddingIngredient}
            setIsAddingIngredient={setIsAddingIngredient}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredDictionary={filteredDictionary}
            addExtraIngredient={addExtraIngredient}
            updateExtraIngredientAmount={updateExtraIngredientAmount}
            removeExtraIngredient={removeExtraIngredient}
            openSwapPicker={openSwapPicker}
            handleAddToShoppingList={handleAddToShoppingList}
            onAddToShoppingList={onAddToShoppingList}
          />

          {/* ── Tab 3: Steps ── */}
          <RecipeStepsTab cookSteps={cookSteps} openCookMode={openCookMode} />

          {/* ── Tab 4: Nutrition ── */}
          <RecipeNutritionTab
            data={data}
            calculatedTotals={calculatedTotals}
            s={s}
            goalSuggestions={goalSuggestions}
            userProfile={userProfile}
            setExtraIngredients={setExtraIngredients}
            applySwap={applySwap}
          />
        </Tabs>

        <RecipeCommunityStats
          data={data}
          communityPosts={communityPosts}
          savedPosts={savedPosts}
          savedRecipes={savedRecipes}
          navToRecipe={navToRecipe}
          t={t}
        />

        {/* ══ Related recipes carousel — R3 ══ */}
        <RelatedRecipesCarousel
          currentRecipe={data}
          allRecipes={savedRecipes}
          onNavigate={(r) => navToRecipe(r)}
          className="-mx-6"
        />
      </div>
    </div>
    <RecipeDetailModals
      data={data}
      getModifiedRecipe={getModifiedRecipe}
      galleryPhotos={galleryPhotos}
      showPublishSheet={showPublishSheet}
      setShowPublishSheet={setShowPublishSheet}
      lightboxIdx={lightboxIdx}
      setLightboxIdx={setLightboxIdx}
      showDeleteConfirm={showDeleteConfirm}
      setShowDeleteConfirm={setShowDeleteConfirm}
      handleDeleteRecipe={handleDeleteRecipe}
      showDuplicateConfirm={showDuplicateConfirm}
      setShowDuplicateConfirm={setShowDuplicateConfirm}
      handleDuplicateRecipe={handleDuplicateRecipe}
      showUnsaveConfirm={showUnsaveConfirm}
      setShowUnsaveConfirm={setShowUnsaveConfirm}
      onSaveRecipe={onSaveRecipe}
      swapTarget={swapTarget}
      setSwapTarget={setSwapTarget}
      mergedVariants={mergedVariants}
      userVariants={userVariants}
      applyVariantSwap={applyVariantSwap}
    />
    </>
  );
}
