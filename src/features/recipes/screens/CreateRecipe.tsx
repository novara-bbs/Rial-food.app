/**
 * CreateRecipe orchestrator — 4-step recipe wizard.
 *
 * Uses React Hook Form + zodResolver(RecipeFormSchema) as the single source of
 * truth for all form data. Derived values (totals, perServing, etc.) are
 * computed from watched RHF state.
 *
 * Section components live in `src/features/recipes/components/create/`.
 * They receive controlled props; mutation callbacks call `setValue` on the form.
 *
 * Phase 3.2 (ADR-015) + Sprint 3 PR D (RHF wiring).
 */
import { useState, useMemo } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SubmitHandler } from 'react-hook-form';
import PageShell from '../../../components/PageShell';
import PageHeader from '../../../components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { getFoodQuality } from '../../food/utils/nutrition';
import { resolveVariant } from '../../food/utils/food-family-resolver';
import { variantToIngredient } from '../../food/utils/variant-to-ingredient';
import {
  RecipeFormSchema,
  RECIPE_FORM_INITIAL_VALUES,
  recipeToFormValues,
} from '../schemas/recipe-form.schema';
import type { RecipeFormValues, RecipeIngredientFormValues } from '../schemas/recipe-form.schema';
import type { Ingredient, RecipeIngredient, RecipeStep, Micronutrients, FoodTag, MealSlot } from '../../../types';
import type { Difficulty } from '../../../types/taxonomy';

import BasicInfoSection from '../components/create/BasicInfoSection';
import IngredientsSection from '../components/create/IngredientsSection';
import StepsSection from '../components/create/StepsSection';
import ReviewSection from '../components/create/ReviewSection';

// ─── Local types ──────────────────────────────────────────────────────────────

/**
 * Form ingredient row with the runtime-resolved Ingredient object attached.
 * Extends RecipeIngredientFormValues (which types ingredient as `unknown`)
 * with a properly-typed `ingredient` for section display.
 */
type RichIngredient = RecipeIngredientFormValues & { ingredient?: Ingredient };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEP_COUNT = 4;

/** Auto-suggest FoodTags from per-serving macros + ingredient properties */
function suggestTags(
  ps: { protein: number; carbs: number; fats: number; fiber: number },
  ris: RichIngredient[],
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

  // ── Wizard step (outside RHF — not a persistent form field) ────────────────
  const [step, setStep] = useState(1);

  // ── React Hook Form ────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { watch, setValue, handleSubmit } = useForm<RecipeFormValues, any, RecipeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(RecipeFormSchema) as any,
    defaultValues: (isEditing ? recipeToFormValues(recipe) : RECIPE_FORM_INITIAL_VALUES) as RecipeFormValues,
    mode: 'onSubmit', // validate on submit only — wizard UX avoids premature inline errors
  });

  // Watch all values once — single subscription, sections re-render on field change
  const formValues = watch();
  const {
    title, description,
    prepTime, cookTime, difficulty, servings,
    suitableFor, sourceUrl, videoUrl, photos,
    publishAsVerified,
  } = formValues;

  // Cast ingredient arrays to typed aliases — `ingredient?: unknown` safely narrowed here
  const recipeIngredients = (formValues.recipeIngredients ?? []) as RichIngredient[];
  const steps = (formValues.steps ?? []) as RecipeStep[];

  // ── Derived / computed ─────────────────────────────────────────────────────
  const totals = useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0, sat = 0, sug = 0;
    const micros: Micronutrients = { vitamins: {}, minerals: {}, others: {} };

    recipeIngredients.forEach(ri => {
      let ing: Ingredient | undefined =
        ri.ingredient ?? dictionary.find(i => i.id === ri.ingredientId);
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
          micros.vitamins[k as keyof typeof micros.vitamins] =
            ((micros.vitamins[k as keyof typeof micros.vitamins] || 0) + (v as number) * r);
        for (const [k, v] of Object.entries(ing.micros.minerals))
          micros.minerals[k as keyof typeof micros.minerals] =
            ((micros.minerals[k as keyof typeof micros.minerals] || 0) + (v as number) * r);
        for (const [k, v] of Object.entries(ing.micros.others))
          micros.others[k as keyof typeof micros.others] =
            ((micros.others[k as keyof typeof micros.others] || 0) + (v as number) * r);
      }
    });

    return {
      macros: {
        calories: Math.round(cal), protein: Math.round(pro), carbs: Math.round(carb),
        fats: Math.round(fat), fiber: Math.round(fib),
        saturatedFat: Math.round(sat), sugar: Math.round(sug),
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

  // ── Array mutation helpers ─────────────────────────────────────────────────
  // RHF setValue for array fields: apply updater function and write back.

  const updateIngredients = (updater: (prev: RecipeIngredient[]) => RecipeIngredient[]) => {
    const updated = updater(recipeIngredients as unknown as RecipeIngredient[]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue('recipeIngredients', updated as any);
  };

  const updateSteps = (updater: (prev: RecipeStep[]) => RecipeStep[]) => {
    const updated = updater(steps);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue('steps', updated as any);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onValidSubmit: SubmitHandler<RecipeFormValues> = (data) => {
    if (!onCreateRecipe) return;
    const cleanSteps = data.steps.filter(s => s.text.trim());
    // Strip runtime ingredient object before persisting (not a DB field)
    const cleanIngredients = data.recipeIngredients.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ ingredient: _ing, ...ri }) => ri,
    );

    onCreateRecipe({
      ...(recipe?.id ? { id: recipe.id, tag: recipe.tag, publishedBy: recipe.publishedBy } : {}),
      ...(data.publishAsVerified ? { verified: 'creator' } : {}),
      title: data.title.trim(),
      description: data.description,
      prepTime: `${data.prepTime || 15} min`,
      cookTime: `${data.cookTime || 15} min`,
      difficulty: data.difficulty,
      servings: data.servings,
      macros: totals.macros,
      micros: totals.micros,
      tags: autoTags,
      suitableFor: data.suitableFor.length > 0 ? data.suitableFor : undefined,
      img: (data.photos[0] ?? recipe?.img)
        || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      photos: data.photos.length > 0 ? data.photos : undefined,
      sourceUrl: data.sourceUrl || undefined,
      videoUrl: data.videoUrl || undefined,
      sourceType: data.sourceUrl ? detectedSourceType : undefined,
      recipeIngredients: cleanIngredients,
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
          title={title}
          onTitleChange={v => setValue('title', v)}
          description={description}
          onDescriptionChange={v => setValue('description', v)}
          prepTime={prepTime}
          onPrepTimeChange={v => setValue('prepTime', v)}
          cookTime={cookTime}
          onCookTimeChange={v => setValue('cookTime', v)}
          difficulty={difficulty as Difficulty}
          onDifficultyChange={v => setValue('difficulty', v)}
          servings={servings}
          onServingsChange={v => setValue('servings', v)}
          suitableFor={suitableFor as MealSlot[]}
          onSuitableForChange={v => setValue('suitableFor', v as RecipeFormValues['suitableFor'])}
          videoUrl={videoUrl}
          onVideoUrlChange={v => setValue('videoUrl', v)}
          sourceUrl={sourceUrl}
          onSourceUrlChange={v => setValue('sourceUrl', v)}
          detectedSourceType={detectedSourceType}
          photos={photos}
          onPhotosChange={v => setValue('photos', v)}
        />
      )}

      {step === 2 && (
        <IngredientsSection
          recipeIngredients={recipeIngredients as unknown as RecipeIngredient[]}
          onRecipeIngredientsChange={updateIngredients}
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
          onStepsChange={updateSteps}
        />
      )}

      {step === 4 && (
        <ReviewSection
          title={title}
          description={description}
          prepTime={prepTime}
          cookTime={cookTime}
          difficulty={difficulty as Difficulty}
          servings={servings}
          perServing={perServing}
          quality={quality}
          autoTags={autoTags}
          recipeIngredients={recipeIngredients as unknown as RecipeIngredient[]}
          steps={steps}
          videoUrl={videoUrl}
          sourceUrl={sourceUrl}
          detectedSourceType={detectedSourceType}
          dictionary={dictionary}
          publishAsVerified={publishAsVerified}
          onPublishAsVerifiedChange={v => setValue('publishAsVerified', v)}
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
          <Button variant="brand" className="flex-1" onClick={handleSubmit(onValidSubmit)}>
            <Check className="w-4 h-4" /> {t.createRecipe.saveRecipe}
          </Button>
        )}
      </div>
    </PageShell>
  );
}
