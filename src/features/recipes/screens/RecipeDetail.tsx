import { ArrowLeft, Clock, Flame, Droplet, Activity, CheckCircle2, Circle, Minus, Plus, MessageSquare, Bookmark, X, Users, ShoppingCart, ChefHat, UtensilsCrossed, ThumbsUp, AlertTriangle, Target, Share2, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import SearchInput from '../../../components/patterns/SearchInput';
import { useState, useMemo, useEffect } from 'react';
import CookMode from '../components/CookMode';
import PublishRecipeSheet from '../../social/components/PublishRecipeSheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Micronutrients } from '../../../types';
import { toast } from 'sonner';
import { getFoodQuality } from '../../food/utils/nutrition';
import { getRecipeSwaps } from '../utils/substitutions';
import { calculateMatchScore } from '../utils/matchScore';
import { getGoalSuggestions, type GoalSuggestion } from '../utils/goalOptimizer';
import { trackRecipeView } from '../../social/utils/analytics';
import { CREATORS_MAP } from '../../social/data/seed-creators';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { useI18n } from '../../../i18n';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function RecipeDetail({ recipe, onBack, onSaveRecipe, isSaved, onAddToPlan, onLogMealNow, onAddToShoppingList, dictionary = [], userProfile }: { recipe: any, onBack: () => void, onSaveRecipe?: (r: any) => void, isSaved?: boolean, onAddToPlan?: (recipe: any, dayIndex: number) => void, onLogMealNow?: (recipe: any, servings: number) => void, onAddToShoppingList?: (items: any[]) => void, dictionary?: any[], userProfile?: any }) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { setSelectedCreatorId, communityPosts, savedRecipes, savedPosts, navigateToRecipe: navToRecipe, handleDeleteRecipe, setRecipeToEdit, handleCreateRecipeSubmit } = useAppState();
  const [followedCreators, setFollowedCreators] = useLocalStorageState<string[]>('followedCreators', []);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(1);
  const [cookModeActive, setCookModeActive] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [extraIngredients, setExtraIngredients] = useState<any[]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublishSheet, setShowPublishSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // ── Early return if no recipe ────────────────
  if (!recipe) {
    return (
      <div className="px-6 max-w-2xl mx-auto pt-8 space-y-4">
        <button type="button" onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors" aria-label={t.common?.back || 'Back'}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center py-12">
          <ChefHat className="w-10 h-10 mx-auto text-on-surface-variant/40 mb-4" />
          <h2 className="font-headline text-lg font-bold uppercase text-tertiary mb-2">{t.recipeDetail.recipeNotFound}</h2>
          <p className="text-sm text-on-surface-variant">{t.recipeDetail.recipeNotFoundDesc}</p>
        </div>
      </div>
    );
  }
  const data = recipe;

  const instructions = recipe?.instructions || [];

  // ── Calculated totals ────────────────────────
  const calculatedTotals = useMemo(() => {
    let cal = data.macros?.calories || 0;
    let pro = data.macros?.protein || 0;
    let carbs = data.macros?.carbs || 0;
    let fats = data.macros?.fats || 0;
    let micros = data.micros || { vitamins: {}, minerals: {}, others: {} };

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
  }, [data, extraIngredients, dictionary]);

  // ── Smart substitutions (real, based on user prefs) ──
  const swapSuggestions = useMemo(() => {
    if (!data.recipeIngredients?.length) return [];
    return getRecipeSwaps(data.recipeIngredients, userProfile || {}, dictionary);
  }, [data.recipeIngredients, userProfile, dictionary]);

  const matchScore = useMemo(() => {
    return calculateMatchScore(data, {
      goal: userProfile?.goal,
      foodDislikes: userProfile?.foodDislikes,
      intolerances: userProfile?.intolerances,
      dailyTarget: userProfile?.dailyTarget,
    }, dictionary);
  }, [data, userProfile, dictionary]);

  const goalSuggestions = useMemo(() => {
    return getGoalSuggestions(data, userProfile || {}, dictionary);
  }, [data, userProfile, dictionary]);

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
  const allIngredientsToDisplay = [
    ...(data.recipeIngredients ? data.recipeIngredients.map((ri: any) => ({
      id: ri.id, name: ri.ingredient?.name || 'Unknown', amount: ri.amount, unit: ri.unit, isExtra: false,
    })) : (data.ingredients ? data.ingredients.map((ing: string, idx: number) => ({
      id: `old-${idx}`, name: ing, amount: 0, unit: '', isExtra: false,
    })) : [])),
    ...extraIngredients.map(ri => ({
      id: ri.id, name: ri.ingredient?.name || 'Unknown', amount: ri.amount, unit: ri.unit, isExtra: true,
    })),
  ];

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

  const cookIngredients = allIngredientsToDisplay.map(i => ({ name: i.name, amount: Number(i.amount), unit: i.unit }));
  const cookSteps = data.steps?.length ? data.steps : instructions;
  const hasCreator = !!(data.publishedBy && data.publishedBy !== 'self' && CREATORS_MAP[data.publishedBy]);

  return (
    <>
    {cookModeActive && (
      <CookMode
        steps={cookSteps}
        title={data.title}
        ingredients={cookIngredients}
        onClose={() => setCookModeActive(false)}
      />
    )}
    <div className="pb-24">
      {/* ══ Hero Image ══ */}
      <div className="relative h-56 md:h-72 w-full">
        <img src={data.img || data.image} alt={data.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <button type="button" onClick={onBack} aria-label={t.common.back} className="absolute top-4 left-4 w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors z-10">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button type="button" onClick={() => setShowPublishSheet(true)} aria-label={t.recipeDetail.shareToFeed} className="w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => onSaveRecipe && onSaveRecipe(getModifiedRecipe())} aria-label={t.common.save} className="w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors">
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-4 left-6 right-6">
          <Badge className="mb-2">{data.tag}</Badge>
          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tighter uppercase text-tertiary leading-tight">{data.title}</h2>
          <div className="flex items-center gap-3 mt-1.5 text-on-surface-variant text-xs font-label uppercase tracking-widest">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {data.prepTime} + {data.cookTime}</span>
            <span>•</span>
            <span>{data.difficulty}</span>
          </div>
        </div>
      </div>

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
                  <span className="font-headline font-bold text-xs text-tertiary uppercase hover:text-primary transition-colors block truncate">@{creator.name}</span>
                  <span className="font-label text-[9px] text-on-surface-variant tracking-widest uppercase block">{t.recipeDetail.createdBy}</span>
                </div>
              </button>
              <button type="button"
                onClick={toggleFollowCreator}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all ${
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
              <span className="font-headline font-bold text-xs text-primary uppercase tracking-widest">{t.recipeDetail.yourRecipe || 'Tu Receta'}</span>
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

      {/* ══ Macro summary bar ══ */}
      <div className="px-6 max-w-4xl mx-auto">
        <div className={`grid grid-cols-4 gap-2 ${hasCreator ? 'mt-3' : '-mt-4'} relative z-10`}>
          {[
            { label: 'kcal', value: Math.round(calculatedTotals.cal * s), color: 'text-primary', icon: Flame },
            { label: 'pro', value: `${Math.round(calculatedTotals.pro * s)}g`, color: 'text-macro-protein', icon: Activity },
            { label: 'carbs', value: `${Math.round(calculatedTotals.carbs * s)}g`, color: 'text-macro-carbs', icon: Droplet },
            { label: 'fats', value: `${Math.round(calculatedTotals.fats * s)}g`, color: 'text-macro-fats' },
          ].map(m => (
            <div key={m.label} className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
              <span className={`block font-headline font-bold text-lg ${m.color}`}>{m.value}</span>
              <span className="text-[8px] font-label uppercase tracking-widest text-on-surface-variant">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Food quality */}
        {data.macros && (() => {
          const quality = getFoodQuality(data.macros);
          return (
            <div className={`flex items-center gap-3 p-2.5 mt-3 rounded-sm border ${quality === 'good' ? 'bg-primary/10 border-primary/20' : quality === 'neutral' ? 'bg-brand-secondary/10 border-brand-secondary/20' : 'bg-error/10 border-error/20'}`}>
              {quality === 'good' ? <ThumbsUp className="w-5 h-5 text-primary" /> :
               quality === 'poor' ? <AlertTriangle className="w-5 h-5 text-error" /> :
               <Minus className="w-5 h-5 text-brand-secondary" />}
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.recipes.foodQuality[quality]}</span>
            </div>
          );
        })()}

        {/* ── Video embed (YouTube / TikTok) ── */}
        {data.videoUrl && (() => {
          const ytMatch = data.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
          const ttMatch = data.videoUrl.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
          if (ytMatch?.[1]) {
            return (
              <div className="mt-4 rounded-sm overflow-hidden border border-outline-variant/20">
                <div className="aspect-video bg-surface-container-low relative">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytMatch[1]}`}
                    title="Recipe video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            );
          }
          if (ttMatch?.[1]) {
            return (
              <div className="mt-4 rounded-sm overflow-hidden border border-outline-variant/20">
                <div className="aspect-[9/16] max-h-[500px] bg-surface-container-low relative">
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${ttMatch[1]}`}
                    title="Recipe video"
                    allow="encrypted-media"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* ── Source link ── */}
        {data.sourceUrl && (
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 mt-3 bg-surface-container-low p-2.5 rounded-sm border border-outline-variant/20 hover:border-primary/30 transition-colors">
            <ExternalLink className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant truncate flex-1">
              {t.recipeDetail.viewOnPlatform?.replace('{platform}', data.sourceType || 'web') || data.sourceUrl}
            </span>
            <Badge variant="outline" className="text-on-surface-variant border-outline-variant/30 shrink-0 text-[8px]">{data.sourceType || 'source'}</Badge>
          </a>
        )}

        {/* ── Serving + Family controls ── */}
        <div className="flex items-center justify-between mt-4 bg-surface-container-highest/50 p-3 rounded-sm border border-outline-variant/10">
          <span className="font-headline font-bold text-xs uppercase text-tertiary tracking-tight">{t.recipeDetail.servings}</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setServings(Math.max(1, servings - 1))} aria-label="Decrease servings" className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary border border-outline-variant/20">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-headline font-bold text-lg text-tertiary w-4 text-center">{servings}</span>
            <button type="button" onClick={() => setServings(servings + 1)} aria-label="Increase servings" className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary border border-outline-variant/20">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {familyMembers.length > 0 && (
          <div className="mt-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="font-label text-[10px] font-bold tracking-widest uppercase text-tertiary">{t.recipeDetail.family}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`px-2.5 py-1 rounded-sm font-label text-[10px] font-bold tracking-widest uppercase border transition-all ${selectedFamily.length === 0 ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'}`} onClick={() => setSelectedFamily([])}>{t.recipeDetail.onlyMe}</button>
              {familyMembers.map((member: any) => (
                <button type="button" key={member.id} className={`px-2.5 py-1 rounded-sm font-label text-[10px] font-bold tracking-widest uppercase border transition-all ${selectedFamily.includes(member.id) ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'}`} onClick={() => toggleFamilyMember(member.id)}>+ {member.name}</button>
              ))}
            </div>
            <p className="mt-2 font-label text-[9px] text-on-surface-variant uppercase tracking-wider">
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
                    <p className="font-headline text-sm font-bold text-tertiary uppercase">{t.recipeDetail.matchScore}</p>
                  </div>
                  <span className="text-primary font-headline text-2xl font-bold">{matchScore}%</span>
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
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline text-sm font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> {t.recipeDetail.smartSubstitute}
                </h3>
              </div>
              {swapSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {swapSuggestions.map(swap => (
                    <div key={swap.fromIngredient.id} className="bg-surface-container-low p-3 rounded-sm border border-outline-variant/20 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-tertiary font-headline font-bold text-xs">{swap.fromIngredient.name} → {swap.toIngredient.name}</p>
                        <p className="text-on-surface-variant text-[10px] mt-0.5">
                          {swap.reason === 'intolerance' ? `${swap.allergenHit}` : t.recipeDetail.swapReasonDislike || 'No te gusta'}
                          {swap.macroImpact.pro !== 0 && ` · ${swap.macroImpact.pro > 0 ? '+' : ''}${swap.macroImpact.pro}g P`}
                          {swap.macroImpact.cal !== 0 && ` · ${swap.macroImpact.cal > 0 ? '+' : ''}${swap.macroImpact.cal} kcal`}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => applySwap(swap.fromIngredient.id, swap.toIngredient)}>{t.recipeDetail.substitute}</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant py-4 text-center">
                  {(userProfile?.foodDislikes?.length || userProfile?.intolerances?.length)
                    ? (t.recipeDetail.noSwapsNeeded || 'Sin sustituciones para tu perfil.')
                    : (t.recipeDetail.swapConfigNudge || 'Configura tus preferencias en Ajustes para ver sustituciones.')}
                </p>
              )}
            </section>

            {/* Quick actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="brand" className="flex-1" onClick={() => onLogMealNow && onLogMealNow(getModifiedRecipe(), servings)}>
                <UtensilsCrossed className="w-4 h-4 mr-2" /> {t.recipeDetail.logMeal}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowDaySelector(true)}>
                {t.recipeDetail.addToPlan}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                const copy = { ...getModifiedRecipe(), title: `${t.recipeDetail.duplicatePrefix || 'Copia de'} ${data.title}` };
                delete copy.id;
                handleCreateRecipeSubmit(copy);
              }}>
                {t.recipeDetail.duplicate || 'Duplicar'}
              </Button>
            </div>

            {showDaySelector && (
              <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
                <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-3 text-center">{t.recipeDetail.selectDay}</p>
                <div className="flex justify-between gap-2 mb-4">
                  {(t.realFeel.dayAbbr as string[]).map((day, idx) => (
                    <button type="button" key={idx} onClick={() => { onAddToPlan && onAddToPlan(getModifiedRecipe(), idx); setShowDaySelector(false); }} className="w-10 h-10 rounded-sm bg-surface-container-highest text-tertiary font-headline font-bold hover:bg-primary hover:text-on-primary transition-colors">
                      {day}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setShowDaySelector(false)}>{t.common.cancel}</Button>
              </div>
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
                  <h3 className="font-headline text-sm font-bold tracking-tight uppercase text-tertiary mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> {t.recipeDetail.notes} ({recipeComments.length})
                  </h3>
                  {recipeComments.map((comment: any) => (
                    <div key={comment.id} className="bg-surface-container-low p-3 rounded-sm border border-outline-variant/10 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {comment.authorImg ? (
                          <img src={comment.authorImg} alt={comment.author} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-[9px] font-bold text-tertiary">
                            {comment.author?.charAt(0)}
                          </div>
                        )}
                        <span className="font-headline font-bold text-[10px] uppercase text-tertiary">{comment.author}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">"{comment.text}"</p>
                    </div>
                  ))}
                </section>
              );
            })()}
          </TabsContent>

          {/* ── Tab 2: Ingredients ── */}
          <TabsContent value="ingredients" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
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
                    </span>
                  </button>

                  {ing.isExtra && (
                    <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-sm border border-outline-variant/10">
                      <input type="number" value={ing.amount} onChange={e => updateExtraIngredientAmount(ing.id, e.target.value)} className="w-14 bg-surface-container-highest border-none rounded-sm py-1 px-2 text-sm text-tertiary text-center focus:outline-none focus:ring-1 focus:ring-primary" />
                      <span className="text-[10px] text-on-surface-variant">{ing.unit}</span>
                      <button type="button" onClick={() => removeExtraIngredient(ing.id)} className="p-1 text-outline hover:text-error"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 3: Steps ── */}
          <TabsContent value="steps" className="space-y-4 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                {cookSteps.length} {t.recipeDetail.stepsCount}
              </span>
              <Button variant="brand" size="sm" onClick={() => setCookModeActive(true)}>
                <ChefHat className="w-3.5 h-3.5 mr-1.5" /> {t.recipeDetail.cookMode}
              </Button>
            </div>

            <div className="space-y-3">
              {cookSteps.map((step: any, idx: number) => (
                <div key={step.id || idx} className="flex gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/10">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-headline font-bold text-sm flex items-center justify-center shrink-0">
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
              <h4 className="font-headline text-sm font-bold tracking-tight uppercase text-tertiary mb-3">{t.recipeDetail.nutritionInfo}</h4>
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
                <h4 className="font-headline text-sm font-bold tracking-tight uppercase text-tertiary">{t.recipeDetail.micronutrients}</h4>

                {Object.keys(calculatedTotals.micros.vitamins).length > 0 && (
                  <div>
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.recipeDetail.vitamins}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(calculatedTotals.micros.vitamins).map(([key, value]) => (
                        <div key={key} className="bg-surface-container-highest px-2 py-1 rounded-sm">
                          <span className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant">{key} </span>
                          <span className="font-mono text-xs text-tertiary">{Math.round((value as number) * s)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(calculatedTotals.micros.minerals).length > 0 && (
                  <div>
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.recipeDetail.minerals}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(calculatedTotals.micros.minerals).map(([key, value]) => (
                        <div key={key} className="bg-surface-container-highest px-2 py-1 rounded-sm">
                          <span className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant">{key} </span>
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
                  <h4 className="font-headline text-sm font-bold tracking-tight uppercase text-tertiary">{t.recipeDetail.goalOptimize}</h4>
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
                            <p className="text-tertiary font-headline font-bold text-xs">+ {gs.ingredient.name}</p>
                            <p className="text-on-surface-variant text-[10px] mt-0.5">{gs.rationale}</p>
                          </>
                        )}
                        {gs.type === 'swap' && gs.fromIngredient && gs.toIngredient && (
                          <>
                            <p className="text-tertiary font-headline font-bold text-xs">{gs.fromIngredient.name} → {gs.toIngredient.name}</p>
                            <p className="text-on-surface-variant text-[10px] mt-0.5">{gs.rationale}</p>
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
                <span className="font-label text-xs font-bold">{totalLikes}</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <MessageSquare className="w-4 h-4" />
                <span className="font-label text-xs font-bold">{relatedPosts.reduce((sum: number, p: any) => sum + (p.comments || 0), 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Bookmark className="w-4 h-4" />
                <span className="font-label text-xs font-bold">{relatedPosts.reduce((sum: number, p: any) => sum + (p.saves || 0), 0) + totalSaves}</span>
              </div>
              <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase ml-auto">{t.community?.title || 'Community'}</span>
            </div>
          );
        })()}

        {/* ══ More from this creator ══ */}
        {data.publishedBy && data.publishedBy !== 'self' && (() => {
          const creatorRecipes = savedRecipes.filter((r: any) => r.publishedBy === data.publishedBy && r.id !== data.id).slice(0, 3);
          if (creatorRecipes.length === 0) return null;
          const creator = CREATORS_MAP[data.publishedBy];
          return (
            <div className="mt-6">
              <h3 className="font-headline font-bold text-xs uppercase text-tertiary tracking-widest mb-3">
                {t.postDetail?.moreFromCreator || 'More from this creator'}
              </h3>
              <div className="space-y-2">
                {creatorRecipes.map((r: any) => (
                  <button type="button"
                    key={r.id}
                    onClick={() => navToRecipe(r)}
                    className="w-full flex items-center gap-3 p-3 bg-surface-container-low border border-outline-variant/20 rounded-sm hover:border-primary/50 transition-colors text-left"
                  >
                    {(r.img || r.image) && (
                      <img src={r.img || r.image} alt={r.title} className="w-12 h-12 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-bold text-xs text-tertiary uppercase truncate">{r.title}</p>
                      <span className="font-label text-[9px] text-on-surface-variant tracking-widest uppercase">
                        {r.macros?.calories || r.cal || 0} kcal · {r.macros?.protein || r.pro || 0}g pro
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
    {showPublishSheet && (
      <PublishRecipeSheet
        recipe={getModifiedRecipe()}
        onClose={() => setShowPublishSheet(false)}
      />
    )}
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
    </>
  );
}
