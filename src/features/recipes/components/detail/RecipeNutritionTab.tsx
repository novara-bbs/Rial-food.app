/**
 * RecipeDetail "Nutrition" tab — detailed macros + micronutrients + goal-optimisation suggestions.
 *
 * Extracted from RecipeDetail.tsx (Phase 3.1, ADR-015).
 * Pure presentation; goal-suggestion handlers come in via props (the parent
 * owns the state mutations).
 */
import { Target } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';
import { toast } from 'sonner';
import type { Micronutrients } from '../../../../types';
import type { UserProfile } from '../../../../types/user';

interface CalculatedTotals {
  cal: number;
  pro: number;
  carbs: number;
  fats: number;
  micros: Micronutrients;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecipeData = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoalSuggestion = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtraIngredient = any;

interface RecipeNutritionTabProps {
  /** Recipe data (uses .macros + .micros for raw values not in calculatedTotals). */
  data: RecipeData;
  /** Pre-aggregated macro + micro totals (already includes extra ingredients). */
  calculatedTotals: CalculatedTotals;
  /** Scale factor — multiplies displayed values for diner / serving adjustments. */
  s: number;
  /** Goal-optimisation suggestions for the current user profile. */
  goalSuggestions: GoalSuggestion[];
  /** Active user profile (used to label the goal badge). */
  userProfile: UserProfile | undefined;
  /** Append a new ingredient to the parent's "extras" list. */
  setExtraIngredients: React.Dispatch<React.SetStateAction<ExtraIngredient[]>>;
  /** Replace ingredient `fromId` with `toIngredient` in the parent's swap map. */
  applySwap: (fromId: string, toIngredient: { id: string }) => void;
  /** Default 'nutrition' — only override if the parent uses a different tab id. */
  tabValue?: string;
}

export default function RecipeNutritionTab({
  data,
  calculatedTotals,
  s,
  goalSuggestions,
  userProfile,
  setExtraIngredients,
  applySwap,
  tabValue = 'nutrition',
}: RecipeNutritionTabProps) {
  const { t } = useI18n();

  const detailedRows = [
    { label: t.recipeDetail.calories, value: `${Math.round(calculatedTotals.cal * s)} kcal`, bold: true },
    { label: t.recipeDetail.proteinLabel, value: `${Math.round(calculatedTotals.pro * s)}g` },
    { label: t.recipeDetail.carbsLabel, value: `${Math.round(calculatedTotals.carbs * s)}g` },
    { label: t.recipeDetail.fatsLabel, value: `${Math.round(calculatedTotals.fats * s)}g` },
    { label: t.recipeDetail.saturatedFat, value: `${Math.round((data.macros?.saturatedFat || 0) * s)}g` },
    { label: t.recipeDetail.sugar, value: `${Math.round((data.macros?.sugar || 0) * s)}g` },
    { label: t.recipeDetail.fiber, value: `${Math.round((data.macros?.fiber || data.micros?.others?.fiber || 0) * s)}g` },
    { label: t.recipeDetail.cholesterol, value: `${Math.round((data.micros?.others?.cholesterol || 0) * s)}mg` },
    { label: t.recipeDetail.sodium, value: `${Math.round((data.micros?.minerals?.sodium || 0) * s)}mg` },
  ];

  const hasMicros =
    Object.keys(calculatedTotals.micros.vitamins).length > 0 ||
    Object.keys(calculatedTotals.micros.minerals).length > 0;

  const goalLabel =
    userProfile?.goal === 'gain' || userProfile?.goal === 'muscle'
      ? t.recipeDetail.goalBulk || 'Volumen'
      : t.recipeDetail.goalCut || 'Definición';

  return (
    <TabsContent value={tabValue} className="space-y-4 pt-4">
      {/* Detailed macros */}
      <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <Heading level="h4" className="mb-3">{t.recipeDetail.nutritionInfo}</Heading>
        <div className="space-y-1.5">
          {detailedRows.map(row => (
            <div key={row.label} className={`flex justify-between py-1.5 border-b border-outline-variant/10 text-sm ${row.bold ? 'font-bold' : ''}`}>
              <span className="text-on-surface-variant">{row.label}</span>
              <span className="text-tertiary font-mono">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Micronutrients */}
      {hasMicros && (
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
              {goalLabel}
            </Badge>
          </div>
          <div className="space-y-2">
            {goalSuggestions.map((gs: GoalSuggestion, i: number) => (
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
                    setExtraIngredients((prev: ExtraIngredient[]) => [...prev, {
                      id: `goal-${Date.now()}`,
                      ingredientId: gs.ingredient!.id,
                      ingredient: gs.ingredient,
                      amount: portion,
                      unit: gs.ingredient!.baseUnit,
                    }]);
                    toast.success(
                      t.recipeDetail.ingredientAdded?.replace('{name}', gs.ingredient.name) ||
                      `${gs.ingredient.name} añadido`,
                    );
                  } else if (gs.type === 'swap' && gs.fromIngredient && gs.toIngredient) {
                    applySwap(gs.fromIngredient.id, gs.toIngredient);
                  }
                }}>
                  {gs.type === 'add'
                    ? t.recipeDetail.addForGoal?.replace('{cal}', String(gs.macroImpact.cal)) || `+${gs.macroImpact.cal} kcal`
                    : t.recipeDetail.substitute}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </TabsContent>
  );
}
