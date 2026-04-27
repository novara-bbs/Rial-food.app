/**
 * CreateRecipe orchestrator — 4-step recipe wizard.
 *
 * Owns all persistent form state (title, ingredients, steps, …).
 * Each wizard step is rendered by a focused section component in
 * `src/features/recipes/components/create/`.
 *
 * Phase 3.2 — extracted from 1053-line monolith (ADR-015).
 */
import { useState, useMemo } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import PageHeader from '../../../components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { getRecipeSlots } from '../utils/meal-slot';
import { getFoodQuality } from '../../food/utils/nutrition';
import { resolveVariant } from '../../food/utils/food-family-resolver';
import { variantToIngredient } from '../../food/utils/variant-to-ingredient';
import type { Ingredient, RecipeIngredient, RecipeStep, Micronutrients, FoodTag, MealSlot } from '../../../types';
import type { Difficulty } from '../../../types/taxonomy';

import BasicInfoSection from '../components/create/BasicInfoSection';
import IngredientsSection from '../components/create/IngredientsSection';
import StepsSection from '../components/create/StepsSection';
import ReviewSection from '../components/create/ReviewSection';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEP_COUNT = 4;

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

/** Parse a legacy time string or number to minutes. */
function parseTimeToMinutes(v: unknown): number {
  if (typeof v === 'number') return v;
  const n = parseInt(String(v || ''), 10);
  return Number.isNaN(n) ? 0 : n;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateRecipe({
  onBack,
  onCreateRecipe,
  dictionary = [],
  initialRecipe,
}: {
  onBack: () => void;
  onCreateRecipe?: (recipe: unknown) => void;
  dictionary?: Ingredient[];
  initialRecipe?: unknown;
}) {
  const { t } = useI18n();
  const { userProfile, mergedVariants, userVariants } = useAppState();
  const unitSystem = userProfile.unitSystem ?? 'metric';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recipe = initialRecipe as any;
  const isEditing = !!recipe;

  const [step, setStep] = useState(1);

  // ── Step 1: Basics ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState<string>(recipe?.title ?? '');
  const [description, setDescription] = useState<string>(recipe?.description ?? '');
  const [prepTime, setPrepTime] = useState<number>(parseTimeToMinutes(recipe?.prepTime));
  const [cookTime, setCookTime] = useState<number>(parseTimeToMinutes(recipe?.cookTime));
  const [difficulty, setDifficulty] = useState<Difficulty>(recipe?.difficulty ?? 'medium');
  const [servings, setServings] = useState<number>(recipe?.servings ?? 4);
  const [sourceUrl, setSourceUrl] = useState<string>(recipe?.sourceUrl ?? '');
  const [videoUrl, setVideoUrl] = useState<string>(recipe?.videoUrl ?? '');
  const [photos, setPhotos] = useState<string[]>(recipe?.photos ?? []);
  const [suitableFor, setSuitableFor] = useState<MealSlot[]>(
    () => (recipe ? (getRecipeSlots(recipe) ?? []) : []),
  );

  // ── Step 2: Ingredients ─────────────────────────────────────────────────────
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(
    recipe?.recipeIngredients ?? [],
  );

  // ── Step 3: Steps ───────────────────────────────────────────────────────────
  const [steps, setSteps] = useState<RecipeStep[]>(() => {
    if (recipe?.steps?.length) return recipe.steps;
    if (recipe?.instructions?.length) return recipe.instructions.map((text: string) => ({ text }));
    return [{ text: '' }];
  });

  // ── Step 4: Publish flag ────────────────────────────────────────────────────
  const [publishAsVerified, setPublishAsVerified] = useState(false);

  // ── Derived / computed ─────────────────────────────────────────────────────
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

  const detectedSourceType = useMemo(() => {
    if (!sourceUrl) return 'original' as const;
    if (/youtube\.com|youtu\.be/i.test(sourceUrl)) return 'youtube' as const;
    if (/tiktok\.com/i.test(sourceUrl)) return 'tiktok' as const;
    if (/instagram\.com/i.test(sourceUrl)) return 'instagram' as const;
    return 'blog' as const;
  }, [sourceUrl]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const canSave = title.trim().length > 0 && recipeIngredients.length > 0 && steps.some(s => s.text.trim());

  const handleSave = () => {
    if (!onCreateRecipe || !canSave) return;
    const cleanSteps = steps.filter(s => s.text.trim());
    onCreateRecipe({
      ...(recipe?.id ? { id: recipe.id, tag: recipe.tag, publishedBy: recipe.publishedBy } : {}),
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
      img: photos[0] ?? recipe?.img ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      photos: photos.length > 0 ? photos : undefined,
      sourceUrl: sourceUrl || undefined,
      videoUrl: videoUrl || undefined,
      sourceType: sourceUrl ? detectedSourceType : undefined,
      recipeIngredients,
      instructions: cleanSteps.map(s => s.text),
      steps: cleanSteps,
    });
  };

  // ── Labels ─────────────────────────────────────────────────────────────────
  const sl = t.createRecipe.stepLabels;
  const stepLabels = [sl.information, sl.ingredients, sl.steps, sl.review];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageShell maxWidth="default" spacing="lg">
      <PageHeader
        onBack={step === 1 ? onBack : () => setStep(s => s - 1)}
        label={
          isEditing
            ? (t.createRecipe.editTitle || 'Editar Receta')
            : t.createRecipe.stepProgress
                .replace('{step}', String(step))
                .replace('{total}', String(STEP_COUNT))
        }
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

      {/* ── Section renderers ── */}
      {step === 1 && (
        <BasicInfoSection
          title={title} onTitleChange={setTitle}
          description={description} onDescriptionChange={setDescription}
          prepTime={prepTime} onPrepTimeChange={setPrepTime}
          cookTime={cookTime} onCookTimeChange={setCookTime}
          difficulty={difficulty} onDifficultyChange={setDifficulty}
          servings={servings} onServingsChange={setServings}
          suitableFor={suitableFor} onSuitableForChange={setSuitableFor}
          videoUrl={videoUrl} onVideoUrlChange={setVideoUrl}
          sourceUrl={sourceUrl} onSourceUrlChange={setSourceUrl}
          detectedSourceType={detectedSourceType}
          photos={photos} onPhotosChange={setPhotos}
        />
      )}

      {step === 2 && (
        <IngredientsSection
          recipeIngredients={recipeIngredients}
          onRecipeIngredientsChange={setRecipeIngredients}
          totals={totals}
          perServing={perServing}
          servings={servings}
          dictionary={dictionary}
          mergedVariants={mergedVariants}
          userVariants={userVariants}
          unitSystem={unitSystem}
        />
      )}

      {step === 3 && (
        <StepsSection
          steps={steps}
          onStepsChange={setSteps}
        />
      )}

      {step === 4 && (
        <ReviewSection
          title={title} description={description}
          prepTime={prepTime} cookTime={cookTime}
          difficulty={difficulty} servings={servings}
          perServing={perServing} quality={quality}
          autoTags={autoTags}
          recipeIngredients={recipeIngredients}
          steps={steps}
          videoUrl={videoUrl} sourceUrl={sourceUrl}
          detectedSourceType={detectedSourceType}
          dictionary={dictionary}
          publishAsVerified={publishAsVerified}
          onPublishAsVerifiedChange={setPublishAsVerified}
          isVerifiedCreator={!!userProfile.isVerifiedCreator}
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
    </PageShell>
  );
}
