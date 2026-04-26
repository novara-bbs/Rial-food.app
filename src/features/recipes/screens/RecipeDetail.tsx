import { ArrowLeft, Clock, Flame, Activity, Minus, CheckCircle2, Circle, Plus, MessageSquare, Bookmark, X, Users, ShoppingCart, ChefHat, UtensilsCrossed, Target, Share2, ExternalLink, Pencil, Trash2, GitFork, Crown, RefreshCw } from 'lucide-react';
import featureFlags from '../../../lib/featureFlags';
import TimeTileComposite from '../components/TimeTileComposite';
import AuthorAttributionCard from '../components/AuthorAttributionCard';
import StickyCookCTA from '../components/StickyCookCTA';
import SearchInput from '../../../components/patterns/SearchInput';
import { useState, useMemo, useEffect, useRef } from 'react';
import CookMode from '../components/CookMode';
import MiseEnPlaceScreen from '../components/MiseEnPlaceScreen';
import HeroGallery from '../components/HeroGallery';
import MediaLightbox from '../components/MediaLightbox';
import VideoSection from '../components/VideoSection';
import PublishRecipeSheet from '../../social/components/PublishRecipeSheet';
import RecipeNutritionBar from '../components/RecipeNutritionBar';
import RecipeSubstitutionPicker from '../components/RecipeSubstitutionPicker';
import RecipeDaySelectorSheet from '../components/RecipeDaySelectorSheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Micronutrients } from '../../../types';
import { toast } from 'sonner';
import { getRecipeSwaps } from '../utils/substitutions';
import { calculateMatchScore } from '../utils/matchScore';
import { getGoalSuggestions } from '../utils/goalOptimizer';
import { defaultSlotFor } from '../utils/meal-slot';
import { trackRecipeView } from '../../social/utils/analytics';
import { CREATORS_MAP } from '../../social/data/seed-creators';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import VariantPickerSheet from '../../food/components/VariantPickerSheet';
import { FOOD_FAMILIES } from '../../food/data/food-families';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { useI18n } from '../../../i18n';
import ConfirmDialog from '../../../components/ConfirmDialog';
import RelatedRecipesCarousel from '../components/RelatedRecipesCarousel';
import { Heading } from '@/components/ui/Typography';

export default function RecipeDetail({ recipe, onBack, onSaveRecipe, isSaved, onAddToPlan, onLogMealNow, onAddToShoppingList, dictionary = [], userProfile }: { recipe: any, onBack: () => void, onSaveRecipe?: (r: any) => void, isSaved?: boolean, onAddToPlan?: (recipe: any, dayIndex: number, slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void, onLogMealNow?: (recipe: any, servings: number) => void, onAddToShoppingList?: (items: any[]) => void, dictionary?: any[], userProfile?: any }) {
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
  const [extraIngredients, setExtraIngredients] = useState<any[]>([]);
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
  const calculatedTotals = useMemo(() => {
    if (!recipe) return { cal: 0, pro: 0, carbs: 0, fats: 0, micros: { vitamins: {}, minerals: {}, others: {} } as Micronutrients };
    const cal = recipe.macros?.calories || 0;
    const pro = recipe.macros?.protein || 0;
    const carbs = recipe.macros?.carbs || 0;
    const fats = recipe.macros?.fats || 0;
    const micros = recipe.micros || { vitamins: {}, minerals: {}, others: {} };

    let extraCal = 0, extraPro = 0, extraCarbs = 0, extraFats = 0;
    const extraMicros: Micronutrients = { vitamins: {}, minerals: {}, others: {} };

    extraIngredients.forEach(ri => {
      const ing = dictionary.find(d => d.id === ri.ingredientId);
      if (ing) {
        const ratio = ri.amount / ing.baseAmount;
        extraCal += ing.macros.calories * ratio;
        extraPro += ing.macros.protein * ratio;
        extraCarbs += ing.macros.carbs * ratio;
        extraFats += ing.macros.fats * ratio;

        if (ing.micros) {
          Object.entries(ing.micros.vitamins).forEach(([key, value]) => {
            extraMicros.vitamins[key as keyof typeof extraMicros.vitamins] = ((extraMicros.vitamins[key as keyof typeof extraMicros.vitamins] || 0) + (value as number) * ratio);
          });
          Object.entries(ing.micros.minerals).forEach(([key, value]) => {
            extraMicros.minerals[key as keyof typeof extraMicros.minerals] = ((extraMicros.minerals[key as keyof typeof extraMicros.minerals] || 0) + (value as number) * ratio);
          });
          Object.entries(ing.micros.others).forEach(([key, value]) => {
            extraMicros.others[key as keyof typeof extraMicros.others] = ((extraMicros.others[key as keyof typeof extraMicros.others] || 0) + (value as number) * ratio);
          });
        }
      }
    });

    const combinedMicros: Micronutrients = {
      vitamins: { ...micros.vitamins },
      minerals: { ...micros.minerals },
      others: { ...micros.others },
    };
    Object.entries(extraMicros.vitamins).forEach(([key, value]) => {
      combinedMicros.vitamins[key as keyof typeof combinedMicros.vitamins] = ((combinedMicros.vitamins[key as keyof typeof combinedMicros.vitamins] || 0) + (value as number));
    });
    Object.entries(extraMicros.minerals).forEach(([key, value]) => {
      combinedMicros.minerals[key as keyof typeof combinedMicros.minerals] = ((combinedMicros.minerals[key as keyof typeof combinedMicros.minerals] || 0) + (value as number));
    });
    Object.entries(extraMicros.others).forEach(([key, value]) => {
      combinedMicros.others[key as keyof typeof combinedMicros.others] = ((combinedMicros.others[key as keyof typeof combinedMicros.others] || 0) + (value as number));
    });

    return {
      cal: Math.round(cal + extraCal),
      pro: Math.round(pro + extraPro),
      carbs: Math.round(carbs + extraCarbs),
      fats: Math.round(fats + extraFats),
      micros: combinedMicros,
    };
  }, [recipe, extraIngredients, dictionary]);

  // ── Smart substitutions (real, based on user prefs) ──
  const swapSuggestions = useMemo(() => {
    if (!recipe?.recipeIngredients?.length) return [];
    return getRecipeSwaps(recipe.recipeIngredients, userProfile || {}, dictionary);
  }, [recipe?.recipeIngredients, userProfile, dictionary]);

  const matchScore = useMemo(() => {
    if (!recipe) return 0;
    // R8.3: derive foodDislikes from foodPreferences
    const foodDislikes = Object.entries(userProfile?.foodPreferences ?? {})
      .filter(([, v]) => v === 'dislike')
      .map(([id]) => id);
    return calculateMatchScore(recipe, {
      goal: userProfile?.goal,
      foodDislikes,
      intolerances: userProfile?.intolerances,
      dailyTarget: userProfile?.dailyTarget,
    }, dictionary);
  }, [recipe, userProfile, dictionary]);

  const goalSuggestions = useMemo(() => {
    if (!recipe) return [];
    return getGoalSuggestions(recipe, userProfile || {}, dictionary);
  }, [recipe, userProfile, dictionary]);

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

  const applySwap = (fromId: string, toIngredient: any) => {
    // Replace in extraIngredients or recipe ingredients state
    const fromRI = data.recipeIngredients?.find((ri: any) => (ri.ingredient?.id || ri.ingredientId) === fromId);
    if (!fromRI) return;
    setExtraIngredients(prev => [
      ...prev.filter(ri => ri.ingredientId !== fromId),
      { id: `swap-${Date.now()}`, ingredientId: toIngredient.id, ingredient: toIngredient, amount: fromRI.amount, unit: fromRI.unit },
    ]);
    toast.success(`${toIngredient.name} ${t.recipeDetail.substitute?.toLowerCase() || 'applied'}`);
  };

  // ── Ingredients list ─────────────────────────
  // `brandName` is populated when a recipe ingredient pins a specific brand variant
  // (new P4 dual-schema shape: `ri.variantId` set → `ri.ingredient.description` = brand name).
  const allIngredientsToDisplay = [
    ...(data.recipeIngredients ? data.recipeIngredients.map((ri: any) => {
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

  const addExtraIngredient = (ing: any) => {
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
        label={(t.recipes as any).cookNow ?? 'Cocinar ahora'}
        onClick={openCookMode}
        targetRef={quickActionsRef}
      />
    )}
    <div>
      {/* ══ Hero Image / Gallery ══ */}
      {/* verified: taller bleed hero (65 vh) — classic: compact card (h-56/h-72) */}
      <div className={`relative w-full overflow-hidden ${isVerified ? 'h-[65vh] max-h-[520px]' : 'h-56 md:h-72'}`}>
        <HeroGallery
          photos={galleryPhotos}
          alt={data.title}
          onTap={galleryPhotos.length > 0 ? (idx) => setLightboxIdx(idx) : undefined}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

        <button type="button" onClick={onBack} aria-label={t.common.back} className="absolute top-4 left-4 w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors z-10">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button type="button" onClick={() => setShowPublishSheet(true)} aria-label={t.recipeDetail.shareToFeed} className="w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (!onSaveRecipe) return;
              if (isSaved) {
                setShowUnsaveConfirm(true);
              } else {
                onSaveRecipe(getModifiedRecipe());
              }
            }}
            aria-label={t.common.save}
            aria-pressed={!!isSaved}
            className="w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-4 left-6 right-6">
          {data.tag && (
            <span className="badge-card bg-surface/90 backdrop-blur-md text-primary uppercase tracking-wide mb-2 inline-flex">
              {data.tag}
            </span>
          )}
          {/*
            Bespoke recipe hero: dual-mode title that swaps to Fraunces serif via
            inline style for verified recipes (ADR-011 § verified-mode override) and
            scales responsively (text-2xl md:text-3xl). The <Heading> primitive
            doesn't expose responsive sizing or per-instance font swaps, so this
            stays raw with both lint rules disabled inline.
          */}
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke recipe hero with verified Fraunces serif inline override + responsive size; cannot use <Heading> primitive */}
          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tighter leading-tight text-tertiary uppercase" style={isVerified ? { fontFamily: 'var(--font-serif)', textTransform: 'none' } : undefined}>
            {data.title}
          </h2>
          {/* Classic time row — hidden for verified (replaced by TimeTileComposite below) */}
          {!isVerified && (
            <div className="flex items-center gap-3 mt-1.5 text-on-surface-variant text-label font-label uppercase tracking-widest">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {data.prepTime} + {data.cookTime}</span>
              <span>•</span>
              <span>{data.difficulty}</span>
            </div>
          )}
        </div>
      </div>

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
              name={data.publishedByName ?? (t.recipes as any).verifiedRial}
              role={(t.recipes as any).verifiedRial ?? 'Equipo RIAL'}
            />
          </div>
        </>
      )}

      {/* ══ Creator attribution ══ */}
      {data.publishedBy && data.publishedBy !== 'self' && (() => {
        const creator = CREATORS_MAP[data.publishedBy];
        if (!creator) return null;
        const isFollowingCreator = followedCreators.includes(creator.id);
        const toggleFollowCreator = () => {
          setFollowedCreators((prev: string[]) =>
            prev.includes(creator.id) ? prev.filter((c: string) => c !== creator.id) : [...prev, creator.id]
          );
        };
        return (
          <div className="px-6 max-w-4xl mx-auto mt-4">
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-sm border border-outline-variant/20">
              <button type="button" onClick={() => { setSelectedCreatorId(data.publishedBy!); navigateTo('creator-profile'); }} className="flex items-center gap-3 flex-1 min-w-0">
                <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-outline-variant/20" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                  <span className="font-headline font-bold text-micro text-tertiary uppercase hover:text-primary transition-colors block truncate">@{creator.name}</span>
                  <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase block">{t.recipeDetail.createdBy}</span>
                </div>
              </button>
              <button type="button"
                onClick={toggleFollowCreator}
                className={`shrink-0 whitespace-nowrap min-h-11 px-3 py-1.5 rounded-sm text-micro font-bold uppercase tracking-widest transition-all ${
                  isFollowingCreator
                    ? 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/30'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                {isFollowingCreator ? t.creatorProfile?.following : t.creatorProfile?.follow}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ══ Your Recipe badge + edit/delete ══ */}
      {data.publishedBy === 'self' && (
        <div className="px-6 max-w-4xl mx-auto mt-4">
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-sm px-4 py-3">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="font-headline font-bold text-micro text-primary uppercase tracking-widest">{t.recipeDetail.yourRecipe || 'Tu Receta'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => { setRecipeToEdit(data); navigateTo('edit-recipe'); }}
                aria-label={t.recipeDetail.edit || 'Editar'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label={t.recipeDetail.delete || 'Eliminar'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Forked from attribution ══ */}
      {data.forkedFrom && (
        <div className="px-6 max-w-4xl mx-auto mt-3">
          <button
            type="button"
            onClick={() => {
              const original = savedRecipes.find((r: any) => String(r.id) === String(data.forkedFrom.recipeId));
              if (original) navToRecipe(original);
            }}
            className="flex items-center gap-2 w-full min-h-11 bg-surface-container-low rounded-sm border border-outline-variant/20 px-4 py-2.5 hover:border-primary/30 transition-colors text-left"
          >
            <GitFork className="w-4 h-4 text-on-surface-variant shrink-0" />
            <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
              {t.recipeDetail.basedOn || 'Basada en'}
            </span>
            <span className="text-micro font-headline font-bold text-primary uppercase tracking-widest truncate">
              @{data.forkedFrom.creatorName} · {data.forkedFrom.title}
            </span>
            <ChefHat className="w-3.5 h-3.5 text-on-surface-variant/50 ml-auto shrink-0" />
          </button>
        </div>
      )}

      {/* ══ Macro summary bar ══ */}
      <div className="px-6 max-w-4xl mx-auto">
        <RecipeNutritionBar
          cal={Math.round(calculatedTotals.cal * s)}
          pro={Math.round(calculatedTotals.pro * s)}
          carbs={Math.round(calculatedTotals.carbs * s)}
          fats={Math.round(calculatedTotals.fats * s)}
          macros={data.macros}
          hasAttribution={hasAttribution}
        />

        {/* ── Video (YouTube inline / TikTok·IG·Vimeo link-out) ── */}
        <VideoSection videoUrl={data.videoUrl} posterFallback={data.img || data.image} />

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

        {/* ── Serving + Family controls ── */}
        <div className="flex items-center justify-between mt-4 bg-surface-container-highest/50 p-3 rounded-sm border border-outline-variant/10">
          <span className="font-headline font-bold text-micro uppercase text-tertiary tracking-tight">{t.recipeDetail.servings}</span>
          <div className="flex items-center gap-3">
            {/* HIG 44×44 tap targets — visual circle kept at 28px via inner span */}
            <button type="button" onClick={() => setServings(Math.max(1, servings - 1))} aria-label="Decrease servings" disabled={servings <= 1} className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-40 disabled:hover:text-on-surface-variant transition-colors">
              <span className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center">
                <Minus className="w-3.5 h-3.5" />
              </span>
            </button>
            <span className="font-headline font-bold text-body-lg text-tertiary w-6 text-center tabular-nums">{servings}</span>
            <button type="button" onClick={() => setServings(servings + 1)} aria-label="Increase servings" className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
              <span className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>

        {familyMembers.length > 0 && (
          <div className="mt-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="font-label text-micro font-bold tracking-widest uppercase text-tertiary">{t.recipeDetail.family}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`min-h-11 px-2.5 py-1 rounded-sm font-label text-micro font-bold tracking-widest uppercase border transition-all ${selectedFamily.length === 0 ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'}`} onClick={() => setSelectedFamily([])}>{t.recipeDetail.onlyMe}</button>
              {familyMembers.map((member: any) => (
                <button type="button" key={member.id} className={`min-h-11 px-2.5 py-1 rounded-sm font-label text-micro font-bold tracking-widest uppercase border transition-all ${selectedFamily.includes(member.id) ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'}`} onClick={() => toggleFamilyMember(member.id)}>+ {member.name}</button>
              ))}
            </div>
            <p className="mt-2 font-label text-micro text-on-surface-variant uppercase tracking-wider">
              {t.recipeDetail.scalingFor} {totalDiners} {totalDiners === 1 ? t.recipeDetail.person : t.recipeDetail.people}
            </p>
          </div>
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
          <TabsContent value="overview" className="space-y-6 pt-4">
            <p className="text-sm text-on-surface-variant leading-relaxed">{data.description}</p>

            {/* Match score */}
            <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <Activity className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <p className="font-headline text-body-sm font-bold text-tertiary uppercase">{t.recipeDetail.matchScore}</p>
                  </div>
                  <span className="text-primary font-headline text-title font-bold">{matchScore}%</span>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {t.recipeDetail.matchDescription.replace('{percent}', String(matchScore)).replace('{goal}', t.recipeDetail.goalMaxPerformance)}
                </p>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${matchScore}%` }} />
                </div>
              </div>
            </div>

            {/* Smart swapper — powered by user preferences */}
            <RecipeSubstitutionPicker
              swapSuggestions={swapSuggestions}
              onApplySwap={applySwap}
              hasPreferences={!!(Object.keys(userProfile?.foodPreferences ?? {}).length || userProfile?.intolerances?.length)}
            />

            {/* Quick actions — primary */}
            <div ref={quickActionsRef} className="flex flex-col sm:flex-row gap-3">
              <Button variant="brand" className="flex-1" onClick={() => onLogMealNow && onLogMealNow(getModifiedRecipe(), servings)}>
                <UtensilsCrossed className="w-4 h-4 mr-2" /> {t.recipeDetail.logMeal}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowDaySelector(true)}>
                {t.recipeDetail.addToPlan}
              </Button>
            </div>

            {/* Mark as Cooked — universal, NYT Cooking pattern (R2.3) */}
            <button
              type="button"
              onClick={() => handleMarkAsCooked(getModifiedRecipe())}
              className="w-full flex items-center justify-between min-h-11 px-4 py-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ChefHat className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="font-headline font-bold text-micro text-tertiary uppercase tracking-widest">
                  {(t.recipes as any).markAsCooked ?? 'Marcar como cocinada'}
                </span>
              </div>
              {cookedCount > 0 && (
                <span className="font-label text-micro uppercase tracking-widest text-primary">
                  {((t.recipes as any).cookedNTimes ?? 'Cocinada {n} veces').replace('{n}', String(cookedCount))}
                </span>
              )}
            </button>

            {/* Versionar — secondary action, Pro-only */}
            {data.publishedBy !== 'self' && (
              <div className="border-t border-outline-variant/10 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isPro) { navigateTo('rial-plus'); return; }
                    setShowDuplicateConfirm(true);
                  }}
                  className="w-full flex items-center justify-between min-h-11 px-4 py-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <GitFork className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                    <div className="text-left">
                      <span className="font-headline font-bold text-micro text-tertiary uppercase tracking-widest block">
                        {t.recipeDetail.createVersion || 'Crear mi versión'}
                      </span>
                      <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase">
                        {t.recipeDetail.versionDesc || 'Duplicar y personalizar esta receta'}
                      </span>
                    </div>
                  </div>
                  {!isPro && <Crown className="w-4 h-4 text-brand-secondary" />}
                </button>
              </div>
            )}

            {showDaySelector && (
              <RecipeDaySelectorSheet
                defaultSlot={defaultSlotFor(data)}
                onSelect={(idx, slot) => { onAddToPlan?.(getModifiedRecipe(), idx, slot); setShowDaySelector(false); }}
                onClose={() => setShowDaySelector(false)}
              />
            )}

            {/* Community notes — from posts that reference this recipe */}
            {(() => {
              const recipeComments = communityPosts
                .filter((p: any) => p.recipe && String(p.recipe.id) === String(data.id) && p.commentsList?.length > 0)
                .flatMap((p: any) => p.commentsList)
                .slice(0, 3);
              if (recipeComments.length === 0) return null;
              return (
                <section className="border-t border-outline-variant/20 pt-4">
                  <Heading level="h4" className="mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> {t.recipeDetail.notes} ({recipeComments.length})
                  </Heading>
                  {recipeComments.map((comment: any) => (
                    <div key={comment.id} className="bg-surface-container-low p-3 rounded-sm border border-outline-variant/10 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {comment.authorImg ? (
                          <img src={comment.authorImg} alt={comment.author} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-micro font-bold text-tertiary">
                            {comment.author?.charAt(0)}
                          </div>
                        )}
                        <span className="font-headline font-bold text-micro uppercase text-tertiary">{comment.author}</span>
                      </div>
                      <p className="text-caption text-on-surface-variant leading-relaxed">"{comment.text}"</p>
                    </div>
                  ))}
                </section>
              );
            })()}
          </TabsContent>

          {/* ── Tab 2: Ingredients ── */}
          <TabsContent value="ingredients" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
                {allIngredientsToDisplay.length} {t.recipeDetail.ingredientsCount}
              </span>
              <div className="flex gap-2">
                {onAddToShoppingList && (
                  <Button variant="outline" size="sm" onClick={handleAddToShoppingList}>
                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> {t.recipeDetail.listBtn}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsAddingIngredient(!isAddingIngredient)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> {t.recipeDetail.extraBtn}
                </Button>
              </div>
            </div>

            {/* Add extra ingredient search */}
            {isAddingIngredient && (
              <div className="bg-surface-container-highest p-3 rounded-sm border border-outline-variant/20">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={t.recipeDetail.searchIngredients}
                  size="sm"
                  className="mb-3"
                />
                {searchQuery && (
                  <div className="max-h-48 overflow-y-auto space-y-1 bg-surface-container-low p-2 rounded-sm border border-outline-variant/10">
                    {filteredDictionary.length > 0 ? filteredDictionary.slice(0, 10).map(ing => (
                      <button type="button" key={ing.id} onClick={() => addExtraIngredient(ing)} className="w-full text-left px-3 py-2 rounded-sm hover:bg-surface-container-highest flex justify-between items-center group">
                        <span className="text-sm text-tertiary">{ing.name}</span>
                        <span className="text-xs text-on-surface-variant group-hover:text-primary">{t.recipeDetail.addExtra}</span>
                      </button>
                    )) : <p className="text-xs text-on-surface-variant text-center py-2">{t.recipeDetail.noResults}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Ingredient list */}
            <div className="space-y-1.5">
              {allIngredientsToDisplay.map(ing => (
                <div key={ing.id} className="flex items-center gap-2">
                  <button type="button" onClick={() => toggleIngredient(ing.id)} className="flex-1 flex items-center gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/10 hover:border-primary/30 transition-colors text-left group">
                    {checkedIngredients.includes(ing.id)
                      ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      : <Circle className="w-4 h-4 text-on-surface-variant shrink-0 group-hover:text-primary/50" />
                    }
                    <span className={`text-sm flex-1 ${checkedIngredients.includes(ing.id) ? 'text-on-surface-variant line-through' : 'text-tertiary'}`}>
                      {ing.isExtra && <span className="text-primary font-bold mr-1">[+]</span>}
                      {ing.amount === 0 ? '' : formatAmount(ing.amount)} {ing.unit} {ing.name}
                      {ing.brandName && (
                        <span className="ml-1.5 inline-flex items-center text-micro font-label uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {ing.brandName}
                        </span>
                      )}
                    </span>
                  </button>

                  {ing.isExtra && (
                    <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-sm border border-outline-variant/10">
                      <input type="number" value={ing.amount} onChange={e => updateExtraIngredientAmount(ing.id, e.target.value)} className="w-14 bg-surface-container-highest border-none rounded-sm py-1 px-2 text-sm text-tertiary text-center focus:outline-none focus:ring-1 focus:ring-primary" />
                      <span className="text-micro text-on-surface-variant">{ing.unit}</span>
                      <button type="button" onClick={() => removeExtraIngredient(ing.id)} aria-label={t.recipes.removeIngredient} className="min-w-11 min-h-11 flex items-center justify-center text-outline hover:text-error"><X className="w-3.5 h-3.5" aria-hidden="true" /></button>
                    </div>
                  )}
                  {/* P7 D1 — swap variant (brand) for this recipe ingredient. Only */}
                  {/* shown when the row has a resolvable family. Transient — does */}
                  {/* not mutate savedRecipes this sprint. */}
                  {!ing.isExtra && ing.familyId && (
                    <button
                      type="button"
                      onClick={() => openSwapPicker(ing.id, ing.familyId!)}
                      aria-label={t.recipeDetail.swapVariant}
                      className="min-w-11 min-h-11 flex items-center justify-center rounded-sm text-on-surface-variant hover:text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 3: Steps ── */}
          <TabsContent value="steps" className="space-y-4 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
                {cookSteps.length} {t.recipeDetail.stepsCount}
              </span>
              <Button variant="brand" size="sm" onClick={openCookMode}>
                <ChefHat className="w-3.5 h-3.5 mr-1.5" /> {t.recipeDetail.cookMode}
              </Button>
            </div>

            <div className="space-y-3">
              {cookSteps.map((step: any, idx: number) => (
                <div key={step.id || idx} className="flex gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/10">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-headline font-bold text-body-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed pt-0.5">{typeof step === 'string' ? step : step.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 4: Nutrition ── */}
          <TabsContent value="nutrition" className="space-y-4 pt-4">
            {/* Detailed macros */}
            <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
              <Heading level="h4" className="mb-3">{t.recipeDetail.nutritionInfo}</Heading>
              <div className="space-y-1.5">
                {[
                  { label: t.recipeDetail.calories, value: `${Math.round(calculatedTotals.cal * s)} kcal`, bold: true },
                  { label: t.recipeDetail.proteinLabel, value: `${Math.round(calculatedTotals.pro * s)}g` },
                  { label: t.recipeDetail.carbsLabel, value: `${Math.round(calculatedTotals.carbs * s)}g` },
                  { label: t.recipeDetail.fatsLabel, value: `${Math.round(calculatedTotals.fats * s)}g` },
                  { label: t.recipeDetail.saturatedFat, value: `${Math.round((data.macros?.saturatedFat || 0) * s)}g` },
                  { label: t.recipeDetail.sugar, value: `${Math.round((data.macros?.sugar || 0) * s)}g` },
                  { label: t.recipeDetail.fiber, value: `${Math.round((data.macros?.fiber || data.micros?.others?.fiber || 0) * s)}g` },
                  { label: t.recipeDetail.cholesterol, value: `${Math.round((data.micros?.others?.cholesterol || 0) * s)}mg` },
                  { label: t.recipeDetail.sodium, value: `${Math.round((data.micros?.minerals?.sodium || 0) * s)}mg` },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between py-1.5 border-b border-outline-variant/10 text-sm ${row.bold ? 'font-bold' : ''}`}>
                    <span className="text-on-surface-variant">{row.label}</span>
                    <span className="text-tertiary font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Micronutrients */}
            {(Object.keys(calculatedTotals.micros.vitamins).length > 0 || Object.keys(calculatedTotals.micros.minerals).length > 0) && (
              <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 space-y-3">
                <Heading level="h4">{t.recipeDetail.micronutrients}</Heading>

                {Object.keys(calculatedTotals.micros.vitamins).length > 0 && (
                  <div>
                    <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">{t.recipeDetail.vitamins}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(calculatedTotals.micros.vitamins).map(([key, value]) => (
                        <div key={key} className="bg-surface-container-highest px-2 py-1 rounded-sm">
                          <span className="font-label text-micro uppercase tracking-wider text-on-surface-variant">{key} </span>
                          <span className="font-mono text-xs text-tertiary">{Math.round((value as number) * s)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(calculatedTotals.micros.minerals).length > 0 && (
                  <div>
                    <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">{t.recipeDetail.minerals}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(calculatedTotals.micros.minerals).map(([key, value]) => (
                        <div key={key} className="bg-surface-container-highest px-2 py-1 rounded-sm">
                          <span className="font-label text-micro uppercase tracking-wider text-on-surface-variant">{key} </span>
                          <span className="font-mono text-xs text-tertiary">{Math.round((value as number) * s)}mg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Goal Optimization */}
            {goalSuggestions.length > 0 && (
              <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <Heading level="h4">{t.recipeDetail.goalOptimize}</Heading>
                  <Badge variant="outline" className="text-primary border-primary/30 ml-auto">
                    {userProfile?.goal === 'gain' || userProfile?.goal === 'muscle' ? (t.recipeDetail.goalBulk || 'Volumen') : (t.recipeDetail.goalCut || 'Definición')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {goalSuggestions.map((gs, i) => (
                    <div key={i} className="bg-surface-container-highest p-3 rounded-sm border border-outline-variant/10 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        {gs.type === 'add' && gs.ingredient && (
                          <>
                            <p className="text-tertiary font-headline font-bold text-micro">+ {gs.ingredient.name}</p>
                            <p className="text-on-surface-variant text-micro mt-0.5">{gs.rationale}</p>
                          </>
                        )}
                        {gs.type === 'swap' && gs.fromIngredient && gs.toIngredient && (
                          <>
                            <p className="text-tertiary font-headline font-bold text-micro">{gs.fromIngredient.name} → {gs.toIngredient.name}</p>
                            <p className="text-on-surface-variant text-micro mt-0.5">{gs.rationale}</p>
                          </>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        if (gs.type === 'add' && gs.ingredient) {
                          const portion = gs.ingredient.servingSizes?.[0]?.grams || 30;
                          setExtraIngredients(prev => [...prev, {
                            id: `goal-${Date.now()}`,
                            ingredientId: gs.ingredient!.id,
                            ingredient: gs.ingredient,
                            amount: portion,
                            unit: gs.ingredient!.baseUnit,
                          }]);
                          toast.success(t.recipeDetail.ingredientAdded?.replace('{name}', gs.ingredient.name) || `${gs.ingredient.name} añadido`);
                        } else if (gs.type === 'swap' && gs.fromIngredient && gs.toIngredient) {
                          applySwap(gs.fromIngredient.id, gs.toIngredient);
                        }
                      }}>
                        {gs.type === 'add' ? (t.recipeDetail.addForGoal?.replace('{cal}', String(gs.macroImpact.cal)) || `+${gs.macroImpact.cal} kcal`) : (t.recipeDetail.substitute)}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ══ Community stats ══ */}
        {(() => {
          const relatedPosts = communityPosts.filter((p: any) => p.recipe && String(p.recipe.id) === String(data.id));
          const totalSaves = savedPosts?.filter?.((id: number) => relatedPosts.some((p: any) => p.id === id)).length || 0;
          const totalLikes = relatedPosts.reduce((sum: number, p: any) => sum + (p.likes || 0), 0);
          if (relatedPosts.length === 0 && !data.publishedToFeed) return null;
          return (
            <div className="mt-6 flex items-center gap-4 p-3 bg-surface-container-highest/30 rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Flame className="w-4 h-4" />
                <span className="font-label text-micro font-bold">{totalLikes}</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <MessageSquare className="w-4 h-4" />
                <span className="font-label text-micro font-bold">{relatedPosts.reduce((sum: number, p: any) => sum + (p.comments || 0), 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Bookmark className="w-4 h-4" />
                <span className="font-label text-micro font-bold">{relatedPosts.reduce((sum: number, p: any) => sum + (p.saves || 0), 0) + totalSaves}</span>
              </div>
              <span className="font-label text-micro tracking-widest text-on-surface-variant uppercase ml-auto">{t.community?.title || 'Community'}</span>
            </div>
          );
        })()}

        {/* ══ More from this creator ══ */}
        {data.publishedBy && data.publishedBy !== 'self' && (() => {
          const creatorRecipes = savedRecipes.filter((r: any) => r.publishedBy === data.publishedBy && r.id !== data.id).slice(0, 3);
          if (creatorRecipes.length === 0) return null;
          return (
            <div className="mt-6">
              <Heading level="h4" variant="overline" className="mb-3">
                {t.postDetail?.moreFromCreator || 'More from this creator'}
              </Heading>
              <div className="space-y-2">
                {creatorRecipes.map((r: any) => (
                  <button type="button"
                    key={r.id}
                    onClick={() => navToRecipe(r)}
                    className="w-full flex items-center gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/50 transition-colors text-left"
                  >
                    {(r.img || r.image) && (
                      <img src={r.img || r.image} alt={r.title} className="w-12 h-12 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-bold text-micro text-tertiary uppercase truncate">{r.title}</p>
                      <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase">
                        {r.macros?.calories || r.cal || 0} kcal · {r.macros?.protein || r.pro || 0}g pro
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ══ Related recipes carousel — R3 ══ */}
        <RelatedRecipesCarousel
          currentRecipe={data}
          allRecipes={savedRecipes}
          onNavigate={(r) => navToRecipe(r)}
          className="-mx-6"
        />
      </div>
    </div>
    {showPublishSheet && (
      <PublishRecipeSheet
        recipe={getModifiedRecipe()}
        onClose={() => setShowPublishSheet(false)}
      />
    )}
    <MediaLightbox
      photos={galleryPhotos}
      startIndex={lightboxIdx ?? 0}
      open={lightboxIdx !== null}
      onOpenChange={(o) => { if (!o) setLightboxIdx(null); }}
      alt={data.title}
    />
    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title={t.confirm.deleteRecipe}
      description={t.confirm.deleteRecipeDesc}
      confirmLabel={t.confirm.yes}
      cancelLabel={t.confirm.cancel}
      variant="destructive"
      onConfirm={() => handleDeleteRecipe(data.id)}
    />
    <ConfirmDialog
      open={showDuplicateConfirm}
      onOpenChange={setShowDuplicateConfirm}
      title={t.recipeDetail.createVersion || 'Crear mi versión'}
      description={`${t.recipeDetail.duplicateConfirmDesc || 'Se creará una copia editable de'} "${data.title}"${data.publishedByName ? ` ${t.recipeDetail.by || 'de'} ${data.publishedByName}` : ''}. ${t.recipeDetail.duplicateConfirmHint || 'Podrás modificarla y hacerla tuya.'}`}
      confirmLabel={t.recipeDetail.duplicate || 'Duplicar'}
      cancelLabel={t.confirm.cancel}
      onConfirm={() => handleDuplicateRecipe(getModifiedRecipe())}
    />
    <ConfirmDialog
      open={showUnsaveConfirm}
      onOpenChange={setShowUnsaveConfirm}
      title={t.confirm.unsaveRecipe || '¿Desguardar esta receta?'}
      description={t.confirm.unsaveRecipeDesc || 'La receta saldrá de tu Bóveda. Podrás volver a guardarla en cualquier momento.'}
      confirmLabel={t.confirm.yes}
      cancelLabel={t.confirm.cancel}
      variant="destructive"
      onConfirm={() => onSaveRecipe && onSaveRecipe(getModifiedRecipe())}
    />
    {swapTarget && (
      <VariantPickerSheet
        family={swapTarget.family}
        allVariants={mergedVariants}
        userVariants={userVariants}
        open={Boolean(swapTarget)}
        onOpenChange={(open) => { if (!open) setSwapTarget(null); }}
        onSelect={applyVariantSwap}
      />
    )}
    </>
  );
}
