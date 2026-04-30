/**
 * RecipeNutritionPanel — unified nutrition + servings card.
 *
 * Sprint 47 [1.5.161]: replaces the previous trio of standalone components
 * (RecipeNutritionBar + RecipeServingsControls + the inline food-quality
 * banner) with a single self-contained card. The three pieces are tightly
 * coupled in meaning:
 *
 *   • Macros (kcal / pro / carbs / fats) describe the nutritional payload.
 *   • The food-quality banner is derived from the recipe's base macros.
 *   • The servings stepper rescales the displayed macros + ingredients.
 *
 * Servings now step in 0.5 increments (1, 1.5, 2, 2.5, …) — see
 * `../utils/servings` for the pure stepper math.
 *
 * Layout: one outer card, internal sections separated by hairline dividers.
 * Macros + quality + servings are always visible; the family multiselect
 * only renders when at least one family member exists in the user profile.
 *
 * The component is presentation-only — `setServings`, `toggleFamilyMember`,
 * and `setSelectedFamily` come from the parent screen. The parent computes
 * the scaled macro numbers (so this panel doesn't need to know the scale
 * factor) and passes the ORIGINAL macro snapshot for the quality
 * heuristic, which is independent of portion size.
 */
import { ThumbsUp, AlertTriangle, Minus, Plus, Users } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import MacroTile from '@/components/patterns/MacroTile';
import SectionCard from '@/components/SectionCard';
import { getFoodQuality } from '../../../food/utils/nutrition';
import {
  SERVINGS_MIN,
  decrementServings,
  formatServings,
  incrementServings,
} from '../../utils/servings';
import type { FamilyMember } from '../../../../types/user';

export interface RecipeNutritionPanelProps {
  // Macros AS DISPLAYED (pre-scaled by the parent).
  cal: number;
  pro: number;
  carbs: number;
  fats: number;
  /** Original recipe macros — feeds the food-quality heuristic. Omit to hide the banner. */
  macros?: { calories: number; protein: number; carbs: number; fats: number } | null;
  // Servings stepper.
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  // Family scaler.
  familyMembers: FamilyMember[];
  selectedFamily: string[];
  toggleFamilyMember: (id: string) => void;
  setSelectedFamily: React.Dispatch<React.SetStateAction<string[]>>;
  totalDiners: number;
  /** Tighter top margin when an attribution card sits directly above. */
  hasAttribution?: boolean;
}

export default function RecipeNutritionPanel({
  cal, pro, carbs, fats, macros,
  servings, setServings,
  familyMembers, selectedFamily, toggleFamilyMember, setSelectedFamily, totalDiners,
  hasAttribution,
}: RecipeNutritionPanelProps) {
  const { t } = useI18n();

  const nutrients = [
    { label: 'kcal', value: String(cal), color: 'text-primary' },
    { label: 'pro', value: `${pro}g`, color: 'text-macro-protein' },
    { label: 'carbs', value: `${carbs}g`, color: 'text-macro-carbs' },
    { label: 'fats', value: `${fats}g`, color: 'text-macro-fats' },
  ] as const;

  const quality = macros ? getFoodQuality(macros) : null;
  const hasFamily = familyMembers.length > 0;
  const decrementDisabled = servings <= SERVINGS_MIN;

  return (
    <SectionCard
      padding="none"
      spacing="none"
      className={`${hasAttribution ? 'mt-3' : 'mt-4'} relative z-10 overflow-hidden`}
    >
      <div data-testid="recipe-nutrition-panel">
      {/* ── Section: macros grid ─────────────────────────────────────── */}
      <div className="p-3">
        <div className="grid grid-cols-4 gap-2">
          {nutrients.map((m) => (
            <MacroTile
              key={m.label}
              size="md"
              surface="card"
              value={m.value}
              label={m.label}
              valueColorClassName={m.color}
            />
          ))}
        </div>
      </div>

      {/* ── Section: food-quality banner (derived from base macros) ──── */}
      {quality && (
        <div
          className={`flex items-center gap-3 px-3 py-2.5 border-t border-outline-variant/10 ${
            quality === 'good'
              ? 'bg-primary/10'
              : quality === 'neutral'
                ? 'bg-brand-secondary/10'
                : 'bg-error/10'
          }`}
          data-testid="recipe-nutrition-quality"
        >
          {quality === 'good' ? (
            <ThumbsUp className="w-5 h-5 text-primary" />
          ) : quality === 'poor' ? (
            <AlertTriangle className="w-5 h-5 text-error" />
          ) : (
            <Minus className="w-5 h-5 text-brand-secondary" />
          )}
          <span className="text-caption font-bold uppercase tracking-widest text-on-surface-variant">
            {t.recipes.foodQuality[quality]}
          </span>
        </div>
      )}

      {/* ── Section: servings stepper (0.5 step) ─────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-outline-variant/10">
        <span className="font-headline font-semibold text-micro uppercase text-tertiary tracking-tight">
          {t.recipeDetail.servings}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setServings((prev) => decrementServings(prev))}
            aria-label={t.common.decreaseServings}
            disabled={decrementDisabled}
            className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-40 disabled:hover:text-on-surface-variant transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center">
              <Minus className="w-3.5 h-3.5" />
            </span>
          </button>
          <span
            className="font-headline font-bold text-body-lg text-tertiary w-10 text-center tabular-nums"
            data-testid="recipe-servings-value"
          >
            {formatServings(servings)}
          </span>
          <button
            type="button"
            onClick={() => setServings((prev) => incrementServings(prev))}
            aria-label={t.common.increaseServings}
            className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>

      {/* ── Section: family scaler (conditional) ─────────────────────── */}
      {hasFamily && (
        <div className="px-3 py-2.5 border-t border-outline-variant/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-label text-micro font-semibold tracking-widest uppercase text-tertiary">
              {t.recipeDetail.family}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => setSelectedFamily([])}
              className={`min-h-11 px-2.5 py-1 h-auto rounded-sm font-label text-micro font-semibold tracking-widest uppercase border transition-all ${
                selectedFamily.length === 0
                  ? 'bg-primary text-on-primary border-primary hover:bg-primary/90'
                  : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'
              }`}
            >
              {t.recipeDetail.onlyMe}
            </Button>
            {familyMembers.map((member) => (
              <Button
                key={member.id}
                variant="ghost"
                onClick={() => toggleFamilyMember(member.id)}
                className={`min-h-11 px-2.5 py-1 h-auto rounded-sm font-label text-micro font-semibold tracking-widest uppercase border transition-all ${
                  selectedFamily.includes(member.id)
                    ? 'bg-primary text-on-primary border-primary hover:bg-primary/90'
                    : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'
                }`}
              >
                + {member.name}
              </Button>
            ))}
          </div>
          <p className="mt-2 font-label text-micro text-on-surface-variant uppercase tracking-wider">
            {t.recipeDetail.scalingFor} {totalDiners}{' '}
            {totalDiners === 1 ? t.recipeDetail.person : t.recipeDetail.people}
          </p>
        </div>
      )}
      </div>
    </SectionCard>
  );
}
