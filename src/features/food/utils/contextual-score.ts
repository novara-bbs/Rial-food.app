/**
 * P9 `[1.5.66]` — contextual score multi-goal.
 *
 * Owner directive 2026-04-21: *«El aceite de oliva virgen extra es buenísimo
 * pero son mucha grasa. Quien baja de peso tiene que reducir; quien sube de
 * peso no lo quiere reducir, lo quiere aumentar»*. The score of a food should
 * adapt to what the user is trying to achieve — NOT a single universal grade
 * like Yuka or Nutri-Score.
 *
 * Three goals (P9 MVP):
 *   - `lose-weight`   → reward high protein, low energy density, high fiber
 *   - `maintain`       → reward balanced whole-foods; neutral for most things
 *   - `gain-weight`    → reward energy density of quality sources, plus
 *                        protein + complex carbs
 *
 * Five grades A-E. A = optimal for this goal, E = actively
 * counterproductive. The goal of the grade is *decision support*, not moral
 * judgment — "E for perder" doesn't mean "bad food", it means "this food is
 * working against a weight-loss effort".
 *
 * Heuristic (v1): protein density, kcal density, protein:kcal ratio, variant
 * type (brand/ultra-processed penalty). Later revisions may add sugar + fiber
 * + sodium once seed fields are present.
 *
 * Mapping from `userProfile.goal` (free-form string) to Goal:
 *   lose | cut                   → 'lose-weight'
 *   maintain | health | family   → 'maintain'
 *   gain | muscle | performance  → 'gain-weight'
 */
import type { FoodVariant } from '../../../types/food-family';

export type Goal = 'lose-weight' | 'maintain' | 'gain-weight';
export const GOALS: readonly Goal[] = ['lose-weight', 'maintain', 'gain-weight'] as const;

export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export const SCORE_GRADES: readonly ScoreGrade[] = ['A', 'B', 'C', 'D', 'E'] as const;

/**
 * i18n rationale slugs — closed set to keep translation surface finite.
 * Resolved via `t.contextualScore.rationales.{slug}` in ES + EN.
 */
export type RationaleSlug =
  | 'high-protein-low-cal'
  | 'protein-base'
  | 'whole-food-balanced'
  | 'lean-light'
  | 'energy-dense-quality'
  | 'energy-dense-good-for-gain'
  | 'dense-calorie-watch-portion'
  | 'sugar-empty-calories'
  | 'ultra-processed-caution'
  | 'neutral-use-in-moderation'
  | 'mostly-water-low-impact'
  | 'protein-rich-quality-fat'
  | 'carb-rich-sustained';

export type CaveatSlug =
  | 'watch-portion'
  | 'ultra-processed'
  | 'add-carbs-or-fat'
  | 'pair-with-protein'
  | 'dense-calorie'
  | 'check-added-sugar';

export interface ContextualScore {
  grade: ScoreGrade;
  /** i18n slug resolved at render time. */
  rationale: RationaleSlug;
  /** 0-2 advisory slugs rendered as secondary chips. */
  caveats: CaveatSlug[];
}

/**
 * Normalise the free-form `userProfile.goal` string into a P9 Goal.
 * Returns null when unknown so callers can gracefully fall back.
 */
export function normalizeGoal(rawGoal: string | undefined | null): Goal | null {
  if (!rawGoal) return null;
  const g = rawGoal.toLowerCase().trim();
  if (g === 'lose' || g === 'cut' || g === 'lose-weight') return 'lose-weight';
  if (g === 'gain' || g === 'muscle' || g === 'performance' || g === 'gain-weight') return 'gain-weight';
  if (g === 'maintain' || g === 'health' || g === 'family') return 'maintain';
  return null;
}

// ─── Heuristic helpers ────────────────────────────────────────────────

function isUltraProcessedHint(variant: FoodVariant): boolean {
  // Conservative heuristic until we have Open Food Facts additives integration.
  // Brand variants without 'no-additives' qualityTag are *candidates* — not
  // definitive — for the caveat. Canonical/preparation/quality variants are
  // treated as whole food here.
  if (variant.variantType !== 'brand' && variant.variantType !== 'user') return false;
  const tags = variant.qualityTags ?? [];
  return !tags.includes('no-additives') && !tags.includes('organic');
}

function proteinDensity(v: FoodVariant): number {
  // Protein grams per 100 g.
  return v.macros.protein;
}
function kcalDensity(v: FoodVariant): number {
  return v.macros.calories;
}
function proteinPerKcal(v: FoodVariant): number {
  const kcal = v.macros.calories;
  if (kcal <= 0) return 0;
  return (v.macros.protein * 4) / kcal; // fraction of kcal from protein
}

// ─── Scorers per goal ──────────────────────────────────────────────────

function scoreForLoseWeight(v: FoodVariant): ContextualScore {
  const p = proteinDensity(v);
  const k = kcalDensity(v);
  const c = v.macros.carbs;
  const pPerK = proteinPerKcal(v);
  const ultra = isUltraProcessedHint(v);

  // Water-like / broths — no caloric impact.
  if (k <= 10) return { grade: 'A', rationale: 'mostly-water-low-impact', caveats: [] };

  // Empty-calorie drinks and sweets (cola, zumo, bollería). Low protein + sugar
  // where calories come mostly from carbs and there's no nutritional ballast.
  // Covers both low-kcal sugary drinks AND ultra-processed sweets.
  if (p < 2 && c >= 5 && (ultra || k <= 80)) {
    return {
      grade: 'E',
      rationale: 'sugar-empty-calories',
      caveats: ['check-added-sugar', ...(ultra ? (['ultra-processed'] as CaveatSlug[]) : [])],
    };
  }

  // High-protein lean foods — ideal for a deficit.
  if (p >= 20 && k <= 200) {
    return { grade: 'A', rationale: 'high-protein-low-cal', caveats: [] };
  }

  // Light whole vegetables — very low kcal even if protein is low. Fiber + water
  // win here. Excludes ultra-processed to avoid scoring zero-cal sweeteners.
  if (!ultra && k <= 60) {
    return { grade: 'B', rationale: 'lean-light', caveats: [] };
  }

  // Medium protein, moderate kcal → fine.
  if (p >= 10 && k <= 250) {
    return {
      grade: 'B',
      rationale: 'lean-light',
      caveats: ultra ? ['ultra-processed'] : [],
    };
  }

  // Dense quality fat / nuts / avocado — C with watch-portion. Not a red flag,
  // just a "measure it" reminder.
  if (!ultra && k >= 200 && pPerK < 0.1) {
    return {
      grade: 'C',
      rationale: 'dense-calorie-watch-portion',
      caveats: ['watch-portion', 'dense-calorie'],
    };
  }

  // Ultra-processed dense food → D.
  if (ultra && k >= 200) {
    return {
      grade: 'D',
      rationale: 'ultra-processed-caution',
      caveats: ['ultra-processed', 'watch-portion'],
    };
  }

  return {
    grade: 'C',
    rationale: 'neutral-use-in-moderation',
    caveats: ultra ? ['ultra-processed'] : [],
  };
}

function scoreForMaintain(v: FoodVariant): ContextualScore {
  const p = proteinDensity(v);
  const k = kcalDensity(v);
  const ultra = isUltraProcessedHint(v);

  if (k <= 10) return { grade: 'A', rationale: 'mostly-water-low-impact', caveats: [] };

  // Whole food with balanced macros → A.
  if (!ultra && p >= 8 && k >= 80 && k <= 400) {
    return { grade: 'A', rationale: 'whole-food-balanced', caveats: [] };
  }

  // Ultra-processed flag downgrades by 2 steps universally.
  if (ultra && k >= 100) {
    return {
      grade: 'D',
      rationale: 'ultra-processed-caution',
      caveats: ['ultra-processed'],
    };
  }

  // Empty-calorie drinks (soda, energy drinks) — discouraged but not cataclysmic.
  if (k >= 30 && p < 2 && v.macros.carbs >= 8) {
    return {
      grade: 'D',
      rationale: 'sugar-empty-calories',
      caveats: ['check-added-sugar'],
    };
  }

  // Dense kcal whole foods (oils, nuts) are fine in moderation.
  if (!ultra && k >= 400) {
    return {
      grade: 'B',
      rationale: 'energy-dense-quality',
      caveats: ['watch-portion'],
    };
  }

  return {
    grade: 'B',
    rationale: 'neutral-use-in-moderation',
    caveats: ultra ? ['ultra-processed'] : [],
  };
}

function scoreForGainWeight(v: FoodVariant): ContextualScore {
  const p = proteinDensity(v);
  const k = kcalDensity(v);
  const ultra = isUltraProcessedHint(v);

  if (k <= 10) {
    return {
      grade: 'D',
      rationale: 'mostly-water-low-impact',
      caveats: ['add-carbs-or-fat'],
    };
  }

  // Dense kcal from QUALITY source (whole food, not ultra-processed).
  if (!ultra && k >= 300) {
    if (p >= 15) {
      return { grade: 'A', rationale: 'protein-rich-quality-fat', caveats: [] };
    }
    return { grade: 'A', rationale: 'energy-dense-good-for-gain', caveats: [] };
  }

  // High protein even if kcal is moderate — good base for a surplus.
  if (p >= 20) {
    return { grade: 'B', rationale: 'protein-base', caveats: ['add-carbs-or-fat'] };
  }

  // Good carb source (rice, oats, pasta) — sustained energy for a bulk.
  if (v.macros.carbs >= 25 && k >= 100 && !ultra) {
    return { grade: 'A', rationale: 'carb-rich-sustained', caveats: [] };
  }

  // Ultra-processed calories — yes they count but quality matters.
  if (ultra && k >= 100) {
    return {
      grade: 'C',
      rationale: 'ultra-processed-caution',
      caveats: ['ultra-processed', 'check-added-sugar'],
    };
  }

  // Low kcal, low protein, low carbs — not useful for a gain.
  if (k < 80) {
    return {
      grade: 'C',
      rationale: 'lean-light',
      caveats: ['add-carbs-or-fat'],
    };
  }

  return {
    grade: 'B',
    rationale: 'neutral-use-in-moderation',
    caveats: ultra ? ['ultra-processed'] : [],
  };
}

/**
 * Main entry point. Returns the contextual score for a variant under a given
 * goal. Pure function — no locale, no userProfile state side effects.
 */
export function computeContextualScore(variant: FoodVariant, goal: Goal): ContextualScore {
  switch (goal) {
    case 'lose-weight':
      return scoreForLoseWeight(variant);
    case 'maintain':
      return scoreForMaintain(variant);
    case 'gain-weight':
      return scoreForGainWeight(variant);
  }
}

/**
 * Tailwind color class for a grade. Used by ContextualScoreChip.
 * Keep semantic: A/B green-ish (on track), C neutral, D/E warning (off track).
 */
export function gradeColorClass(grade: ScoreGrade): string {
  switch (grade) {
    case 'A': return 'bg-primary text-on-primary';
    case 'B': return 'bg-primary/20 text-primary';
    case 'C': return 'bg-surface-container-high text-on-surface-variant';
    case 'D': return 'bg-brand-secondary/15 text-brand-secondary';
    case 'E': return 'bg-error/10 text-error';
  }
}
