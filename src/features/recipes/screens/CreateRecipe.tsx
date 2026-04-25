import { Camera, Plus, Search, Trash2, ArrowUp, ArrowDown, Clock, ChevronRight, Check, Link2, Video, ImagePlus, ThumbsUp, Minus, AlertTriangle, UtensilsCrossed, Layers, X, ClipboardList, CheckCircle2, AlertCircle, BadgeCheck } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState, useMemo, useRef } from 'react';
import type { Ingredient, RecipeIngredient, RecipeStep, Micronutrients, FoodTag, MealSlot } from '../../../types';
import BottomSheet from '../../../components/ui/bottom-sheet';
import { parseBulkIngredients, toApproxGrams } from '../utils/ingredient-parser';
import type { ParsedIngredient } from '../utils/ingredient-parser';
import { useI18n } from '../../../i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortionSelector, { scaleMacros } from '../../food/components/PortionSelector';
import MealSlotMultiSelect from '../../food/components/MealSlotMultiSelect';
import PhotoUploader from '../components/PhotoUploader';
import VariantPickerSheet from '../../food/components/VariantPickerSheet';
import { getRecipeSlots } from '../utils/meal-slot';
import { getFoodQuality } from '../../food/utils/nutrition';
import { searchFamilies, resolveVariant } from '../../food/utils/food-family-resolver';
import { variantToIngredient } from '../../food/utils/variant-to-ingredient';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';
import { useAppState } from '../../../contexts/AppStateContext';
import PageHeader from '../../../components/patterns/PageHeader';
import MacroTile from '../../../components/patterns/MacroTile';
import DashedAddButton from '../../../components/patterns/DashedAddButton';
import { Heading } from '@/components/ui/Typography';

const STEP_COUNT = 4;

/** Detect time references like "15 minutos" or "1h" in instruction text */
function detectTimers(text: string): number[] {
  const pattern = /(\d+)\s*(min(?:uto)?s?|h(?:ora)?s?)/gi;
  const times: number[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const v = parseInt(match[1]);
    times.push(match[2].toLowerCase().startsWith('h') ? v * 60 : v);
  }
  return times;
}

/** Swap two items in an array, returning a new array */
function swapped<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const tgt = idx + dir;
  if (tgt < 0 || tgt >= arr.length) return arr;
  const next = [...arr];
  [next[idx], next[tgt]] = [next[tgt], next[idx]];
  return next;
}

/**
 * Centre-crop an image file to a 16:9 aspect ratio and return a JPEG data URL.
 * Output width is capped at 1280px to keep the data URL small.
 */
function cropTo16x9(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const TARGET_RATIO = 16 / 9;
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const srcRatio = srcW / srcH;

      let sx = 0, sy = 0, sw = srcW, sh = srcH;
      if (srcRatio > TARGET_RATIO) {
        // Wider than 16:9 — crop left/right
        sw = Math.round(srcH * TARGET_RATIO);
        sx = Math.round((srcW - sw) / 2);
      } else if (srcRatio < TARGET_RATIO) {
        // Narrower / portrait — crop top/bottom
        sh = Math.round(srcW / TARGET_RATIO);
        sy = Math.round((srcH - sh) / 2);
      }

      const MAX_W = 1280;
      const outW = Math.min(sw, MAX_W);
      const outH = Math.round(outW / TARGET_RATIO);

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('no 2d context'));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('image load failed'));
    };
    img.src = objectUrl;
  });
}

/** Auto-suggest FoodTags from per-serving macros + ingredient properties */
function suggestTags(
  ps: { protein: number; carbs: number; fats: number; fiber: number },
  ris: RecipeIngredient[],
  dict: Ingredient[],
): FoodTag[] {
  const tags: FoodTag[] = [];
  if (ps.protein >= 30) tags.push('high-protein');
  if (ps.carbs <= 20) tags.push('low-carb');
  if (ps.fiber >= 5) tags.push('high-fiber');
  if (ps.fats <= 5) tags.push('low-fat');
  if (ps.carbs <= 10 && ps.fats >= 15) tags.push('keto-friendly');

  const used = ris.map(r => dict.find(d => d.id === r.ingredientId)).filter(Boolean) as Ingredient[];
  if (used.length > 0) {
    if (used.every(i => i.tags.includes('vegan'))) tags.push('vegan');
    else if (used.every(i => i.tags.includes('vegan') || i.tags.includes('vegetarian'))) tags.push('vegetarian');
    if (used.every(i => !i.allergens.includes('gluten'))) tags.push('gluten-free');
    if (used.every(i => !i.allergens.includes('dairy'))) tags.push('dairy-free');
  }
  return tags;
}

export default function CreateRecipe({
  onBack,
  onCreateRecipe,
  dictionary = [],
  initialRecipe,
}: {
  onBack: () => void;
  onCreateRecipe?: (recipe: any) => void;
  dictionary?: Ingredient[];
  initialRecipe?: any;
}) {
  const { t, locale } = useI18n();
  const { userProfile, mergedVariants, userVariants } = useAppState();
  const unitSystem = userProfile.unitSystem ?? 'metric';
  const [step, setStep] = useState(1);

  const isEditing = !!initialRecipe;

  // ── Step 1: Basics ──
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  // Numeric minutes. Free-form strings like "1h 30min" used to slip through
  // and break `Cocina.parseMin()` (→ 1 minute instead of 90). Store as number,
  // persist as "{n} min" for display continuity with seed data.
  const parseTimeToMinutes = (v: any): number => {
    if (typeof v === 'number') return v;
    const n = parseInt(String(v || ''), 10);
    return Number.isNaN(n) ? 0 : n;
  };
  const [prepTime, setPrepTime] = useState<number>(parseTimeToMinutes(initialRecipe?.prepTime));
  const [cookTime, setCookTime] = useState<number>(parseTimeToMinutes(initialRecipe?.cookTime));
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Medio' | 'Difícil'>(initialRecipe?.difficulty || 'Fácil');
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [sourceUrl, setSourceUrl] = useState(initialRecipe?.sourceUrl || '');
  const [videoUrl, setVideoUrl] = useState(initialRecipe?.videoUrl || '');
  const [photos, setPhotos] = useState<string[]>(initialRecipe?.photos ?? []);
  // Slots this recipe fits well. Empty = versatile (matches every slot filter).
  // See Q19 meal-taxonomy migration rationale.
  const [suitableFor, setSuitableFor] = useState<MealSlot[]>(
    () => (initialRecipe ? getRecipeSlots(initialRecipe) ?? [] : []),
  );

  // ── Step 2: Ingredients ──
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(initialRecipe?.recipeIngredients || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedIngId, setExpandedIngId] = useState<string | null>(null);
  const [pendingGrams, setPendingGrams] = useState(100);
  // P4 — variant picker for family-first ingredient selection
  const [pickerFamily, setPickerFamily] = useState<FoodFamily | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Step 3: Instructions (with optional per-step photo) ──
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialRecipe?.steps?.length ? initialRecipe.steps :
    initialRecipe?.instructions?.length ? initialRecipe.instructions.map((text: string) => ({ text })) :
    [{ text: '' }]
  );

  // ── Step photo upload ──
  const stepPhotoInputRef = useRef<HTMLInputElement>(null);
  const pendingStepPhotoIdx = useRef(-1);

  // ── Paste-bulk sheet ──
  const [pasteSheetOpen, setPasteSheetOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsedLines, setParsedLines] = useState<ParsedIngredient[]>([]);

  // ── Verified-creator publish flag (Step 4) ──
  const [publishAsVerified, setPublishAsVerified] = useState(false);

  // ── Computed totals ──
  const totals = useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0, sat = 0, sug = 0;
    const micros: Micronutrients = { vitamins: {}, minerals: {}, others: {} };

    recipeIngredients.forEach(ri => {
      // Try flat dictionary first (legacy + standard ingredients)
      let ing: Ingredient | undefined = dictionary.find(i => i.id === ri.ingredientId);
      // Fall back to variant resolution (family variants, user-scanned brands)
      if (!ing) {
        const variant = ri.familyId
          ? resolveVariant(ri.familyId, ri.variantId ?? undefined)
          : mergedVariants.find(v => v.id === ri.ingredientId);
        if (variant) ing = variantToIngredient(variant);
      }
      if (!ing) return;
      const r = ri.amount / ing.baseAmount;
      cal += ing.macros.calories * r;
      pro += ing.macros.protein * r;
      carb += ing.macros.carbs * r;
      fat += ing.macros.fats * r;
      fib += (ing.macros.fiber || 0) * r;
      sat += (ing.macros.saturatedFat || 0) * r;
      sug += (ing.macros.sugar || 0) * r;

      if (ing.micros) {
        for (const [k, v] of Object.entries(ing.micros.vitamins))
          micros.vitamins[k as keyof typeof micros.vitamins] = ((micros.vitamins[k as keyof typeof micros.vitamins] || 0) + (v as number) * r);
        for (const [k, v] of Object.entries(ing.micros.minerals))
          micros.minerals[k as keyof typeof micros.minerals] = ((micros.minerals[k as keyof typeof micros.minerals] || 0) + (v as number) * r);
        for (const [k, v] of Object.entries(ing.micros.others))
          micros.others[k as keyof typeof micros.others] = ((micros.others[k as keyof typeof micros.others] || 0) + (v as number) * r);
      }
    });

    return {
      macros: {
        calories: Math.round(cal), protein: Math.round(pro), carbs: Math.round(carb),
        fats: Math.round(fat), fiber: Math.round(fib), saturatedFat: Math.round(sat), sugar: Math.round(sug),
      },
      micros,
    };
  }, [recipeIngredients, dictionary, mergedVariants]);

  const perServing = useMemo(() => ({
    calories: Math.round(totals.macros.calories / servings),
    protein: Math.round(totals.macros.protein / servings),
    carbs: Math.round(totals.macros.carbs / servings),
    fats: Math.round(totals.macros.fats / servings),
    fiber: Math.round((totals.macros.fiber || 0) / servings),
  }), [totals.macros, servings]);

  const autoTags = useMemo(
    () => suggestTags(perServing, recipeIngredients, dictionary),
    [perServing, recipeIngredients, dictionary],
  );

  const quality = useMemo(
    () => getFoodQuality({ ...perServing, calories: perServing.calories }),
    [perServing],
  );

  // ── Handlers ──
  const addIngredient = (ing: Ingredient, grams: number) => {
    setRecipeIngredients(prev => [...prev, {
      id: Date.now().toString(),
      ingredientId: ing.id,
      amount: grams,
      unit: ing.baseUnit,
      ingredient: ing,
    }]);
    setExpandedIngId(null);
    setSearchQuery('');
    setPendingGrams(100);
  };

  /** P4: add a family variant as a recipe ingredient (new dual-schema shape). */
  const addIngredientFromVariant = (family: FoodFamily, variant: FoodVariant, grams: number) => {
    const isCanonical = variant.id === family.canonicalVariantId;
    setRecipeIngredients(prev => [...prev, {
      id: Date.now().toString(),
      familyId: family.id,
      variantId: isCanonical ? undefined : variant.id,
      ingredientId: variant.id,  // legacy retained for hydration
      amount: grams,
      unit: variant.baseUnit,
      ingredient: variantToIngredient(variant),
    }]);
    setPickerFamily(null);
    setPickerOpen(false);
    setSearchQuery('');
    setPendingGrams(100);
  };

  const removeIngredient = (id: string) => setRecipeIngredients(prev => prev.filter(ri => ri.id !== id));

  const addStep = () => setSteps(prev => [...prev, { text: '' }]);
  const updateStepText = (idx: number, val: string) => setSteps(prev => prev.map((s, i) => i === idx ? { ...s, text: val } : s));
  const updateStepPhoto = (idx: number, photoUrl: string | null) =>
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, photoUrl: photoUrl ?? undefined } : s));
  const removeStep = (idx: number) => setSteps(prev => prev.filter((_, i) => i !== idx));

  /** Trigger the hidden file input for a specific step index. */
  const handleStepPhotoClick = (idx: number) => {
    pendingStepPhotoIdx.current = idx;
    stepPhotoInputRef.current?.click();
  };

  /** On file selected: crop to 16:9, store as data URL in the step. */
  const handleStepPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || pendingStepPhotoIdx.current < 0) return;
    try {
      const url = await cropTo16x9(file);
      updateStepPhoto(pendingStepPhotoIdx.current, url);
    } catch {
      // silent — photo just won't be added
    } finally {
      // Reset so the same file can be selected again later
      if (stepPhotoInputRef.current) stepPhotoInputRef.current.value = '';
      pendingStepPhotoIdx.current = -1;
    }
  };

  /** Parse the paste textarea and update parsedLines preview. */
  const handlePastePreview = (text: string) => {
    setPasteText(text);
    setParsedLines(parseBulkIngredients(text));
  };

  /** Confirm paste-bulk: match high-confidence lines against dictionary and add. */
  const handlePasteConfirm = () => {
    const toAdd: RecipeIngredient[] = [];
    for (const item of parsedLines) {
      if (item.confidence < 0.6 || !item.name) continue;
      const nameLower = item.name.toLowerCase();
      const ing = dictionary.find(
        d =>
          d.name.toLowerCase().includes(nameLower) ||
          d.nameEn?.toLowerCase().includes(nameLower),
      );
      if (!ing) continue;
      const defaultGrams = ing.servingSizes.find(s => s.isDefault)?.grams ?? 100;
      const grams = toApproxGrams(item.quantity, item.unit, defaultGrams);
      toAdd.push({
        id: `paste-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ingredientId: ing.id,
        amount: Math.max(1, grams),
        unit: ing.baseUnit,
        ingredient: ing,
      });
    }
    if (toAdd.length > 0) setRecipeIngredients(prev => [...prev, ...toAdd]);
    setPasteSheetOpen(false);
    setPasteText('');
    setParsedLines([]);
  };

  const filteredDictionary = useMemo(() => {
    if (!searchQuery.trim()) return dictionary.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return dictionary.filter(i => i.name.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q)).slice(0, 20);
  }, [searchQuery, dictionary]);

  /** P4 — family-first results. Shown above flat dictionary rows when searching. */
  const familyResults = useMemo(
    () => searchQuery.trim().length >= 2
      ? searchFamilies(searchQuery, mergedVariants, 6)
      : [],
    [searchQuery, mergedVariants],
  );

  /** Detect YouTube video ID for embed */
  const youtubeId = useMemo(() => {
    if (!videoUrl) return null;
    const m = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m?.[1] ?? null;
  }, [videoUrl]);

  /** Detect source type from URL */
  const detectedSourceType = useMemo(() => {
    if (!sourceUrl) return 'original' as const;
    if (/youtube\.com|youtu\.be/i.test(sourceUrl)) return 'youtube' as const;
    if (/tiktok\.com/i.test(sourceUrl)) return 'tiktok' as const;
    if (/instagram\.com/i.test(sourceUrl)) return 'instagram' as const;
    return 'blog' as const;
  }, [sourceUrl]);

  const canSave = title.trim().length > 0 && recipeIngredients.length > 0 && steps.some(s => s.text.trim());

  const handleSave = () => {
    if (!onCreateRecipe || !canSave) return;
    const cleanSteps = steps.filter(s => s.text.trim());
    onCreateRecipe({
      ...(initialRecipe?.id ? { id: initialRecipe.id, tag: initialRecipe.tag, publishedBy: initialRecipe.publishedBy } : {}),
      ...(publishAsVerified ? { verified: 'creator' } : {}),
      title: title.trim(),
      description,
      prepTime: `${prepTime || 15} min`,
      cookTime: `${cookTime || 15} min`,
      difficulty,
      servings,
      macros: totals.macros,
      micros: totals.micros,
      tags: autoTags,
      suitableFor: suitableFor.length > 0 ? suitableFor : undefined,
      img: photos[0] ?? initialRecipe?.img ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      photos: photos.length > 0 ? photos : undefined,
      sourceUrl: sourceUrl || undefined,
      videoUrl: videoUrl || undefined,
      sourceType: sourceUrl ? detectedSourceType : undefined,
      recipeIngredients,
      instructions: cleanSteps.map(s => s.text),
      steps: cleanSteps,
    });
  };

  const sl = t.createRecipe.stepLabels;
  const stepLabels = [sl.information, sl.ingredients, sl.steps, sl.review];

  return (
    <PageShell maxWidth="default" spacing="lg">
      {/* Header */}
      <PageHeader
        onBack={step === 1 ? onBack : () => setStep(s => s - 1)}
        label={isEditing ? (t.createRecipe.editTitle || 'Editar Receta') : t.createRecipe.stepProgress.replace('{step}', String(step)).replace('{total}', String(STEP_COUNT))}
        title={stepLabels[step - 1]}
      />

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-surface-container-highest'}`}
          />
        ))}
      </div>

      {/* ═══════════════════ STEP 1: BASICS ═══════════════════ */}
      {step === 1 && (
        <div className="space-y-5">
          <PhotoUploader photos={photos} onChange={setPhotos} max={6} />

          <div>
            <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.recipeName}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t.createRecipe.namePlaceholder}
              className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant" />
          </div>

          <div>
            <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.description}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t.createRecipe.descPlaceholder} rows={3}
              className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.prepTime}</label>
              <div className="relative">
                <input type="number" inputMode="numeric" min={0} step={5}
                  value={prepTime || ''} onChange={e => setPrepTime(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="15"
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-3 pr-12 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant" />
                <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-label text-micro tracking-widest uppercase text-on-surface-variant">min</span>
              </div>
            </div>
            <div>
              <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.cookTime}</label>
              <div className="relative">
                <input type="number" inputMode="numeric" min={0} step={5}
                  value={cookTime || ''} onChange={e => setCookTime(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="20"
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-3 pr-12 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant" />
                <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-label text-micro tracking-widest uppercase text-on-surface-variant">min</span>
              </div>
            </div>
            <div>
              <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.recipes.difficulty}</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}
                className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all">
                <option value="Fácil">{t.recipes.easy}</option>
                <option value="Medio">{t.recipes.medium}</option>
                <option value="Difícil">{t.recipes.hard}</option>
              </select>
            </div>
            <div>
              <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.recipes.servings}</label>
              <input type="number" value={servings} onChange={e => setServings(Math.max(1, parseInt(e.target.value) || 1))} min={1}
                className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>

          {/* Suitable-for slots — empty means versatile (Q19 meal-taxonomy). */}
          <div>
            <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
              {t.createRecipe.suitableForLabel}
            </label>
            <MealSlotMultiSelect value={suitableFor} onChange={setSuitableFor} ariaLabel={t.createRecipe.suitableForLabel} />
            <p className="text-micro font-label tracking-widest uppercase text-on-surface-variant mt-2">
              {t.createRecipe.suitableForHelp}
            </p>
          </div>

          {/* Source & Video — creator-quality fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                {t.createRecipe.videoLabel}
              </label>
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant" />
            </div>
            <div>
              <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                {t.createRecipe.sourceLabel}
              </label>
              <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant" />
              {sourceUrl && (
                <Badge variant="outline" className="mt-2 text-on-surface-variant border-outline-variant/30">
                  {detectedSourceType}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ STEP 2: INGREDIENTS ═══════════════════ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Running macro total */}
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">{t.createRecipe.totalMacros}</span>
              <span className="font-label text-micro tracking-widest uppercase text-on-surface-variant">
                {recipeIngredients.length} items
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'kcal', value: totals.macros.calories, color: 'text-primary' },
                { label: 'Pro', value: `${totals.macros.protein}g`, color: 'text-macro-protein' },
                { label: 'Carbs', value: `${totals.macros.carbs}g`, color: 'text-macro-carbs' },
                { label: 'Fat', value: `${totals.macros.fats}g`, color: 'text-macro-fats' },
              ].map(m => (
                <MacroTile
                  key={m.label}
                  size="sm"
                  value={m.value}
                  label={m.label}
                  valueColorClassName={m.color}
                />
              ))}
            </div>
            {servings > 1 && (
              <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant mt-2 text-center">
                {t.createRecipe.perServing}: {perServing.calories} kcal · {perServing.protein}g P · {perServing.carbs}g C · {perServing.fats}g F
              </p>
            )}
          </div>

          {/* Ingredient list */}
          {recipeIngredients.map((ri, idx) => {
            const ing = dictionary.find(i => i.id === ri.ingredientId);
            if (!ing) return null;
            const sm = scaleMacros(ing.macros, ing.baseAmount, ri.amount);
            return (
              <div key={ri.id} className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-3 flex items-center gap-2">
                <div className="flex flex-col">
                  <button type="button" onClick={() => setRecipeIngredients(prev => swapped(prev, idx, -1))} disabled={idx === 0}
                    aria-label={locale === 'es' ? 'Subir ingrediente' : 'Move ingredient up'}
                    className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setRecipeIngredients(prev => swapped(prev, idx, 1))} disabled={idx === recipeIngredients.length - 1}
                    aria-label={locale === 'es' ? 'Bajar ingrediente' : 'Move ingredient down'}
                    className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <Heading level="h4" className="text-body-sm tracking-tight truncate">{ing.name}</Heading>
                  <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                    {ri.amount}g — {sm.calories} kcal · {sm.protein}g P
                  </p>
                </div>
                <button type="button" onClick={() => removeIngredient(ri.id)}
                  className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-sm transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Search & add */}
          {isSearching ? (
            <div className="bg-surface-container-highest border border-outline-variant/30 rounded-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20">
                <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
                <input type="text" autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.createRecipe.searchIngredient}
                  className="flex-1 bg-transparent text-sm font-body text-tertiary focus:outline-none placeholder:text-on-surface-variant" />
                <button type="button" onClick={() => { setIsSearching(false); setSearchQuery(''); setExpandedIngId(null); }}
                  className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-tertiary">{t.common.cancel}</button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant/10">
                {/* P4 — family rows first */}
                {familyResults.map(({ family, canonical }) => {
                  const familyName = locale === 'es' ? family.name : family.nameEn;
                  return (
                    <button
                      key={`fam-${family.id}`}
                      type="button"
                      onClick={() => { setPickerFamily(family); setPickerOpen(true); }}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex items-center gap-3"
                    >
                      <Layers className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <span className="block font-headline font-bold text-body-sm text-tertiary truncate">{familyName}</span>
                        <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
                          {canonical.macros.calories} kcal / 100g · {canonical.macros.protein}g P
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-primary/60 shrink-0" aria-hidden="true" />
                    </button>
                  );
                })}
                {/* Flat dictionary rows */}
                {filteredDictionary.map(ing => (
                  <div key={ing.id}>
                    <button type="button"
                      onClick={() => {
                        setExpandedIngId(expandedIngId === ing.id ? null : ing.id);
                        setPendingGrams(ing.servingSizes.find(s => s.isDefault)?.grams ?? 100);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="block font-headline font-bold text-body-sm text-tertiary truncate">{ing.name}</span>
                        <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
                          {ing.macros.calories} kcal / {ing.baseAmount}{ing.baseUnit} · {ing.macros.protein}g P
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-on-surface-variant transition-transform ${expandedIngId === ing.id ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedIngId === ing.id && (
                      <div className="px-4 pb-4 space-y-3">
                        <PortionSelector ingredient={ing} onChange={r => setPendingGrams(r.totalGrams)} unitSystem={unitSystem} />
                        <Button variant="brand" size="sm" className="w-full" onClick={() => addIngredient(ing, pendingGrams)}>
                          <Plus className="w-3.5 h-3.5" /> {t.createRecipe.addIngredient}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {filteredDictionary.length === 0 && (
                  <div className="p-6 text-center text-sm text-on-surface-variant">{t.common.noResults}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <DashedAddButton
                label={t.createRecipe.addIngredient}
                onClick={() => setIsSearching(true)}
                className="flex-1"
              />
              <DashedAddButton
                label={t.createRecipe.pasteList}
                ariaLabel={t.createRecipe.pasteListTitle}
                onClick={() => setPasteSheetOpen(true)}
                icon={ClipboardList}
                width="auto"
                hideLabelOnMobile
              />
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ STEP 3: INSTRUCTIONS ═══════════════════ */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">
            {steps.filter(s => s.text.trim()).length} {locale === 'es' ? 'pasos' : 'steps'}
          </p>

          {steps.map((s, idx) => {
            const timers = detectTimers(s.text);
            return (
              <div key={idx} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-headline font-bold flex items-center justify-center shrink-0 mt-1 text-body-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-2">
                  {/* Step photo preview — 16:9 crop stored on upload */}
                  {s.photoUrl ? (
                    <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-surface-container-highest">
                      <img
                        src={s.photoUrl}
                        alt={`Paso ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => updateStepPhoto(idx, null)}
                        className="absolute top-2 right-2 p-1 bg-neutral-900/70 hover:bg-neutral-900/90 text-white rounded-full transition-colors"
                        aria-label={t.createRecipe.removeStepPhoto}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}
                  <textarea
                    value={s.text}
                    onChange={e => updateStepText(idx, e.target.value)}
                    placeholder={`${t.createRecipe.stepPlaceholder} ${idx + 1}...`}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant min-h-[80px] resize-none"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {timers.length > 0 && timers.map((m, i) => (
                      <Badge key={i} variant="outline" className="text-primary border-primary/30 gap-1">
                        <Clock className="w-2.5 h-2.5" /> {m} min
                      </Badge>
                    ))}
                    {/* Per-step photo upload */}
                    <button
                      type="button"
                      onClick={() => handleStepPhotoClick(idx)}
                      className="inline-flex items-center gap-1 text-micro font-label uppercase tracking-widest text-on-surface-variant/60 hover:text-primary border border-dashed border-outline-variant/20 hover:border-primary/30 rounded-sm px-2 py-1 transition-colors"
                      aria-label={t.createRecipe.addStepPhoto}
                    >
                      <ImagePlus className="w-3 h-3" />
                      {t.createRecipe.photo}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col shrink-0 mt-1">
                  <button type="button" onClick={() => setSteps(prev => swapped(prev, idx, -1))} disabled={idx === 0}
                    aria-label={locale === 'es' ? 'Subir paso' : 'Move step up'}
                    className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setSteps(prev => swapped(prev, idx, 1))} disabled={idx === steps.length - 1}
                    aria-label={locale === 'es' ? 'Bajar paso' : 'Move step down'}
                    className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-20 transition-colors">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)}
                      aria-label={locale === 'es' ? 'Eliminar paso' : 'Delete step'}
                      className="min-w-11 min-h-11 flex items-center justify-center text-error/60 hover:text-error transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <DashedAddButton
            label={t.createRecipe.addStep}
            onClick={addStep}
            density="compact"
          />
        </div>
      )}

      {/* ═══════════════════ STEP 4: REVIEW ═══════════════════ */}
      {step === 4 && (
        <div className="space-y-5">
          {/* Recipe preview card */}
          <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-primary/20 to-brand-secondary/20 flex items-center justify-center">
              <Camera className="w-10 h-10 text-on-surface-variant/40" />
            </div>
            <div className="p-4 space-y-2">
              <Heading level="h3">{title || '—'}</Heading>
              {description && <p className="text-sm text-on-surface-variant line-clamp-2">{description}</p>}
              <div className="flex items-center gap-3 text-micro font-label uppercase tracking-widest text-on-surface-variant flex-wrap">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prepTime ? `${prepTime} min` : '—'} + {cookTime ? `${cookTime} min` : '—'}</span>
                <span className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" /> {difficulty}</span>
                <span>{servings} {t.recipes.servings}</span>
                {/* Icon-based food quality instead of emoji */}
                <Badge variant="outline" className={`gap-0.5 ${
                  quality === 'good' ? 'text-primary border-primary/30' :
                  quality === 'poor' ? 'text-error border-error/30' :
                  'text-brand-secondary border-brand-secondary/30'
                }`}>
                  {quality === 'good' ? <ThumbsUp className="w-2.5 h-2.5" /> :
                   quality === 'poor' ? <AlertTriangle className="w-2.5 h-2.5" /> :
                   <Minus className="w-2.5 h-2.5" />}
                  {t.recipes.foodQuality[quality]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Video preview */}
          {youtubeId && (
            <div className="rounded-sm overflow-hidden border border-outline-variant/20">
              <div className="aspect-video bg-surface-container-low relative">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                  title="Recipe video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Source link */}
          {sourceUrl && (
            <div className="flex items-center gap-2 bg-surface-container-low p-3 rounded-sm border border-outline-variant/20">
              <Link2 className="w-4 h-4 text-on-surface-variant shrink-0" />
              <span className="text-xs text-on-surface-variant truncate flex-1">{sourceUrl}</span>
              <Badge variant="outline" className="text-on-surface-variant border-outline-variant/30 shrink-0">{detectedSourceType}</Badge>
            </div>
          )}

          {/* Per-serving macros */}
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
            <Heading level="h4" variant="overline" className="text-on-surface-variant mb-3 text-micro">{t.createRecipe.perServing}</Heading>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'kcal', value: perServing.calories, color: 'text-primary' },
                { label: 'Pro', value: `${perServing.protein}g`, color: 'text-macro-protein' },
                { label: 'Carbs', value: `${perServing.carbs}g`, color: 'text-macro-carbs' },
                { label: 'Fat', value: `${perServing.fats}g`, color: 'text-macro-fats' },
              ].map(m => (
                <MacroTile
                  key={m.label}
                  size="md"
                  value={m.value}
                  label={m.label}
                  valueColorClassName={m.color}
                />
              ))}
            </div>
          </div>

          {/* Auto tags */}
          {autoTags.length > 0 && (
            <div className="space-y-2">
              <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
                {t.createRecipe.suggestedTags}
              </Heading>
              <div className="flex flex-wrap gap-1.5">
                {autoTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-primary border-primary/30">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ingredient summary */}
          <div className="space-y-2">
            <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
              {recipeIngredients.length} {t.recipes.ingredients}
            </Heading>
            {recipeIngredients.map(ri => {
              const ing = ri.ingredient
                ?? dictionary.find(i => i.id === ri.ingredientId);
              const name = ing?.name ?? ri.ingredientId ?? '—';
              return (
                <div key={ri.id} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
                  <span className="font-body text-sm text-tertiary">{name}</span>
                  <span className="font-label text-xs text-on-surface-variant">{ri.amount}g</span>
                </div>
              );
            })}
          </div>

          {/* Steps summary */}
          {steps.some(s => s.text.trim()) && (
            <div className="space-y-2">
              <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
                {steps.filter(s => s.text.trim()).length} {t.recipes.steps}
              </Heading>
              {steps.filter(s => s.text.trim()).map((s, idx) => {
                const timers = detectTimers(s.text);
                return (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-micro font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      {s.photoUrl && (
                        <div className="w-full aspect-video rounded-sm overflow-hidden mb-1.5 bg-surface-container-highest">
                          <img src={s.photoUrl} alt={`Paso ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-sm text-on-surface-variant line-clamp-2">{s.text}</p>
                      {timers.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {timers.map((m, i) => (
                            <Badge key={i} variant="outline" className="text-primary border-primary/30 gap-0.5 text-micro">
                              <Clock className="w-2 h-2" /> {m}min
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Verified-creator publish checkbox — visible only when profile flag is set */}
          {userProfile.isVerifiedCreator && (
            <label className="flex items-start gap-3 bg-surface-container-low p-4 rounded-sm border border-primary/20 cursor-pointer select-none">
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={publishAsVerified}
                  onChange={e => setPublishAsVerified(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${publishAsVerified ? 'bg-primary border-primary' : 'border-outline-variant bg-transparent'}`}>
                  {publishAsVerified && <Check className="w-3 h-3 text-on-primary" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5 font-headline font-bold text-body-sm text-tertiary">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {t.createRecipe.publishAsVerified}
                </span>
                <p className="text-xs text-on-surface-variant mt-0.5">{t.createRecipe.verifiedCreatorHint}</p>
              </div>
            </label>
          )}
        </div>
      )}

      {/* ═══════════════════ NAVIGATION ═══════════════════ */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
            {t.common.back}
          </Button>
        )}
        {step < STEP_COUNT ? (
          <Button variant="brand" className="flex-1" onClick={() => setStep(s => s + 1)}>
            {t.common.next} <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="brand" className="flex-1" onClick={handleSave} disabled={!canSave}>
            <Check className="w-4 h-4" /> {t.createRecipe.saveRecipe}
          </Button>
        )}
      </div>

      {/* P4 — Variant picker sheet for family-first ingredient selection */}
      {pickerFamily && (
        <VariantPickerSheet
          family={pickerFamily}
          allVariants={mergedVariants}
          userVariants={userVariants}
          open={pickerOpen}
          onOpenChange={(open) => {
            setPickerOpen(open);
            if (!open) setPickerFamily(null);
          }}
          onSelect={(variant) => {
            addIngredientFromVariant(pickerFamily, variant, 100);
          }}
        />
      )}

      {/* Hidden file input for step photo upload */}
      <input
        ref={stepPhotoInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleStepPhotoChange}
      />

      {/* Paste-bulk ingredient sheet — R7.1 */}
      <BottomSheet
        open={pasteSheetOpen}
        onOpenChange={(open) => {
          setPasteSheetOpen(open);
          if (!open) { setPasteText(''); setParsedLines([]); }
        }}
        title={t.createRecipe.pasteListTitle}
        headerLayout="cancel-action"
        size="focus"
        actionSlot={
          parsedLines.filter(l => l.confidence >= 0.6).length > 0 ? (
            <button
              type="button"
              onClick={handlePasteConfirm}
              className="font-headline font-bold text-body-sm text-primary uppercase tracking-widest"
            >
              {t.common.add}
            </button>
          ) : null
        }
      >
        <div className="px-4 pt-2 pb-4 space-y-4">
          <textarea
            autoFocus
            value={pasteText}
            onChange={e => handlePastePreview(e.target.value)}
            placeholder={t.createRecipe.pasteListPlaceholder}
            rows={5}
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant resize-none"
          />

          {parsedLines.length > 0 && (
            <div className="space-y-2">
              <p className="font-label text-micro font-bold tracking-widest uppercase text-on-surface-variant">
                {t.createRecipe.parsedNLines.replace('{n}', String(parsedLines.length))}
              </p>
              {parsedLines.map((item, i) => {
                const high = item.confidence >= 0.6;
                const matched = high && !!item.name && dictionary.some(
                  d =>
                    d.name.toLowerCase().includes(item.name!.toLowerCase()) ||
                    d.nameEn?.toLowerCase().includes(item.name!.toLowerCase()),
                );
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 p-3 rounded-sm border text-sm ${
                      matched
                        ? 'bg-primary/5 border-primary/20'
                        : high
                        ? 'bg-surface-container-highest border-outline-variant/20'
                        : 'bg-error/5 border-error/20'
                    }`}
                  >
                    {matched ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : high ? (
                      <AlertCircle className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-error/60 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-body text-tertiary truncate block">{item.raw}</span>
                      {!matched && high && (
                        <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                          {t.createRecipe.lowConfidence}
                        </span>
                      )}
                      {!high && (
                        <span className="text-micro font-label uppercase tracking-widest text-error/60">
                          {t.createRecipe.lowConfidence}
                        </span>
                      )}
                    </div>
                    {item.quantity && (
                      <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant shrink-0">
                        {item.quantity}{item.unit ?? ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BottomSheet>
    </PageShell>
  );
}
