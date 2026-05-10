/**
 * CreateRecipe — multi-step wizard composer (Sprint 32 [1.5.146]).
 *
 * State, handlers, and computed values live here. The four step panels and the
 * paste-bulk sheet are extracted to dedicated components under
 * `../components/create/` to keep this file ≤ 400 lines.
 *
 * Steps:
 *   1. Basics (title, photos, times, difficulty, slots, source)
 *   2. Ingredients (family-first P4 + flat dictionary + paste-bulk R7.1)
 *   3. Instructions (per-step text + optional 16:9 photo)
 *   4. Review (preview card, macros, tags, ingredient/step summaries)
 */
import { useState, useMemo, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import PageHeader from '../../../components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { track } from '../../../lib/analytics';
import { parseBulkIngredients, toApproxGrams } from '../utils/ingredient-parser';
import type { ParsedIngredient } from '../utils/ingredient-parser';
import { getRecipeSlots } from '../utils/meal-slot';
import { getFoodQuality } from '../../food/utils/nutrition';
import { searchFamilies, resolveVariant } from '../../food/utils/food-family-resolver';
import { variantToIngredient } from '../../food/utils/variant-to-ingredient';
import { suggestTags, cropTo16x9 } from '../utils/create-recipe-utils';
import VariantPickerSheet from '../../food/components/VariantPickerSheet';
import CreateRecipeStep1Basics from '../components/create/CreateRecipeStep1Basics';
import CreateRecipeStep2Ingredients from '../components/create/CreateRecipeStep2Ingredients';
import CreateRecipeStep3Instructions from '../components/create/CreateRecipeStep3Instructions';
import CreateRecipeStep4Review from '../components/create/CreateRecipeStep4Review';
import CreateRecipePasteBulkSheet from '../components/create/CreateRecipePasteBulkSheet';
import type { Recipe, Ingredient, RecipeIngredient, RecipeStep, Micronutrients, MealSlot } from '../../../types';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';

const STEP_COUNT = 4;

export default function CreateRecipe({
  onBack,
  onCreateRecipe,
  dictionary = [],
  initialRecipe,
}: {
  onBack: () => void;
  onCreateRecipe?: (recipe: Recipe) => void;
  dictionary?: Ingredient[];
  initialRecipe?: Partial<Recipe> | null;
}) {
  const { t, locale } = useI18n();
  const { userProfile, mergedVariants, userVariants } = useAppState();
  const unitSystem = userProfile.unitSystem ?? 'metric';
  const [step, setStep] = useState(1);

  const isEditing = !!initialRecipe;

  // ── Step 1: Basics ──
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const parseTimeToMinutes = (v: string | number | null | undefined): number => {
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
  const [suitableFor, setSuitableFor] = useState<MealSlot[]>(
    () => (initialRecipe ? getRecipeSlots(initialRecipe) ?? [] : []),
  );

  // ── Step 2: Ingredients ──
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(initialRecipe?.recipeIngredients || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedIngId, setExpandedIngId] = useState<string | null>(null);
  const [pendingGrams, setPendingGrams] = useState(100);
  const [pickerFamily, setPickerFamily] = useState<FoodFamily | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Step 3: Instructions ──
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
      let ing: Ingredient | undefined = dictionary.find(i => i.id === ri.ingredientId);
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

  // ── Derived search results ──
  const filteredDictionary = useMemo(() => {
    if (!searchQuery.trim()) return dictionary.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return dictionary.filter(i => i.name.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q)).slice(0, 20);
  }, [searchQuery, dictionary]);

  const familyResults = useMemo(
    () => searchQuery.trim().length >= 2 ? searchFamilies(searchQuery, mergedVariants, 6) : [],
    [searchQuery, mergedVariants],
  );

  const detectedSourceType = useMemo(() => {
    if (!sourceUrl) return 'original' as const;
    if (/youtube\.com|youtu\.be/i.test(sourceUrl)) return 'youtube' as const;
    if (/tiktok\.com/i.test(sourceUrl)) return 'tiktok' as const;
    if (/instagram\.com/i.test(sourceUrl)) return 'instagram' as const;
    return 'blog' as const;
  }, [sourceUrl]);

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

  const addIngredientFromVariant = (family: FoodFamily, variant: FoodVariant, grams: number) => {
    const isCanonical = variant.id === family.canonicalVariantId;
    setRecipeIngredients(prev => [...prev, {
      id: Date.now().toString(),
      familyId: family.id,
      variantId: isCanonical ? undefined : variant.id,
      ingredientId: variant.id,
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

  const handleStepPhotoClick = (idx: number) => {
    pendingStepPhotoIdx.current = idx;
    stepPhotoInputRef.current?.click();
  };

  const handleStepPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || pendingStepPhotoIdx.current < 0) return;
    try {
      const url = await cropTo16x9(file);
      updateStepPhoto(pendingStepPhotoIdx.current, url);
    } catch {
      // silent — photo just won't be added
    } finally {
      if (stepPhotoInputRef.current) stepPhotoInputRef.current.value = '';
      pendingStepPhotoIdx.current = -1;
    }
  };

  const handlePastePreview = (text: string) => {
    setPasteText(text);
    setParsedLines(parseBulkIngredients(text));
  };

  const handlePasteConfirm = () => {
    const toAdd: RecipeIngredient[] = [];
    for (const item of parsedLines) {
      if (item.confidence < 0.6 || !item.name) continue;
      const nameLower = item.name.toLowerCase();
      const ing = dictionary.find(
        d => d.name.toLowerCase().includes(nameLower) || d.nameEn?.toLowerCase().includes(nameLower),
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
      id: initialRecipe?.id ?? '',
      image: photos[0] ?? initialRecipe?.image ?? initialRecipe?.img ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      photos: photos.length > 0 ? photos : undefined,
      sourceUrl: sourceUrl || undefined,
      videoUrl: videoUrl || undefined,
      sourceType: sourceUrl ? detectedSourceType : undefined,
      recipeIngredients,
      instructions: cleanSteps.map(s => s.text),
      steps: cleanSteps,
    });

    // Creator metric — measures whether users save their first recipe.
    // No-op until VITE_POSTHOG_KEY is set (see src/lib/analytics.ts).
    track.recipeCreated({
      source: sourceUrl ? 'imported' : 'manual',
      servings,
      hasPhoto: photos.length > 0,
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
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-surface-container-highest'}`} />
        ))}
      </div>

      {step === 1 && (
        <CreateRecipeStep1Basics
          title={title} setTitle={setTitle}
          description={description} setDescription={setDescription}
          prepTime={prepTime} setPrepTime={setPrepTime}
          cookTime={cookTime} setCookTime={setCookTime}
          difficulty={difficulty} setDifficulty={setDifficulty}
          servings={servings} setServings={setServings}
          suitableFor={suitableFor} setSuitableFor={setSuitableFor}
          sourceUrl={sourceUrl} setSourceUrl={setSourceUrl}
          videoUrl={videoUrl} setVideoUrl={setVideoUrl}
          photos={photos} setPhotos={setPhotos}
          detectedSourceType={detectedSourceType}
          t={t}
        />
      )}

      {step === 2 && (
        <CreateRecipeStep2Ingredients
          recipeIngredients={recipeIngredients} setRecipeIngredients={setRecipeIngredients}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          isSearching={isSearching} setIsSearching={setIsSearching}
          expandedIngId={expandedIngId} setExpandedIngId={setExpandedIngId}
          pendingGrams={pendingGrams} setPendingGrams={setPendingGrams}
          onPickFamily={(family) => { setPickerFamily(family); setPickerOpen(true); }}
          onPasteListOpen={() => setPasteSheetOpen(true)}
          familyResults={familyResults}
          filteredDictionary={filteredDictionary}
          totals={totals}
          perServing={perServing}
          servings={servings}
          locale={locale}
          dictionary={dictionary}
          unitSystem={unitSystem}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
          t={t}
        />
      )}

      {step === 3 && (
        <CreateRecipeStep3Instructions
          steps={steps}
          setSteps={setSteps}
          onStepPhotoClick={handleStepPhotoClick}
          onUpdateStepText={updateStepText}
          onUpdateStepPhoto={updateStepPhoto}
          onRemoveStep={removeStep}
          onAddStep={addStep}
          t={t}
        />
      )}

      {step === 4 && (
        <CreateRecipeStep4Review
          title={title}
          description={description}
          prepTime={prepTime}
          cookTime={cookTime}
          difficulty={difficulty}
          servings={servings}
          videoUrl={videoUrl}
          sourceUrl={sourceUrl}
          detectedSourceType={detectedSourceType}
          perServing={perServing}
          autoTags={autoTags}
          quality={quality}
          recipeIngredients={recipeIngredients}
          steps={steps}
          dictionary={dictionary}
          publishAsVerified={publishAsVerified}
          setPublishAsVerified={setPublishAsVerified}
          userProfile={userProfile}
          t={t}
        />
      )}

      {/* Navigation */}
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
      <CreateRecipePasteBulkSheet
        open={pasteSheetOpen}
        onOpenChange={(open) => {
          setPasteSheetOpen(open);
          if (!open) { setPasteText(''); setParsedLines([]); }
        }}
        pasteText={pasteText}
        parsedLines={parsedLines}
        onPreview={handlePastePreview}
        onConfirm={handlePasteConfirm}
        dictionary={dictionary}
        t={t}
      />
    </PageShell>
  );
}
