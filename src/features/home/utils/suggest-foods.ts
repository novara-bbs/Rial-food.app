/**
 * P11 `[1.5.69]` — rank FoodVariants that help close a macro gap.
 *
 * Inputs:
 *   - the `biggestDeficit` output (which macro to close + how much)
 *   - the user's `FoodHistoryEntry[]` (what they already know and like)
 *   - the pool of `FoodVariant[]` to rank (typically `mergedVariants` =
 *     seed + user scans)
 *   - optional `userProfile.goal` → contextual score filter to avoid
 *     suggesting grade-E foods
 *   - optional current `MealSlotGuess` → filters recipes/foods by `suitableFor[]`
 *     (not enforced for raw variants, only for recipes)
 *   - optional intolerances → hard filter (exclude anything matching)
 *
 * Ranking strategy:
 *   1. **Macro density match** — the variant's grams of the deficit macro per
 *      100 g, normalised across the pool. Higher density = better score.
 *   2. **Historical affinity** — variants whose id appears in recent history
 *      get a 1.5× multiplier (the user already logs it → likely to log again).
 *   3. **Contextual score alignment** — A/B grades for the user's goal boost
 *      the score; D/E grades disqualify outright (we don't recommend cola for
 *      a protein deficit even if it has some carbs).
 *   4. **Trust tier** — canonical + curated rank above personal-scanned, all
 *      things equal. Avoids suggesting someone's one-off scan above a staple.
 *   5. **Variant type preference** — canonical > preparation > quality > brand
 *      when the user has no history signal (consistency).
 *
 * Output: top-N variants ordered best-first. Returns `[]` when no variant
 * contributes meaningfully to the deficit (caller should show an empty state).
 *
 * All pure functions — no dates read, no locale, no localStorage.
 */
import type { FoodVariant } from '../../../types/food-family';
import type { FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import {
  computeContextualScore,
  normalizeGoal,
  type Goal,
} from '../../food/utils/contextual-score';
import { deriveTier, type TrustTier } from '../../food/utils/trust-tier';
import type { MacroKey } from './meal-gaps';

export interface SuggestOptions {
  /** Raw user profile goal string — maps through `normalizeGoal`. */
  rawGoal?: string | null;
  /** Recent history (30-day cutoff applied upstream, optional here). */
  history?: FoodHistoryEntry[];
  /** Allergen slugs to exclude (intolerance names). */
  excludeAllergens?: string[];
  /** Max results. Default 3. */
  limit?: number;
}

interface Ranked {
  variant: FoodVariant;
  score: number;
  reason: 'history' | 'macro-density' | 'whole-food';
}

const TIER_PRIORITY: Record<TrustTier, number> = {
  canonical: 3,
  curated: 2,
  community: 1,
  personal: 0,
};

/**
 * Returns grams of the given macro per 100 g (or ml) of the variant.
 */
function macroPer100(variant: FoodVariant, key: MacroKey): number {
  const m = variant.macros;
  switch (key) {
    case 'cal':   return m.calories ?? 0;
    case 'pro':   return m.protein ?? 0;
    case 'carbs': return m.carbs ?? 0;
    case 'fats':  return m.fats ?? 0;
  }
}

function allergenHit(variant: FoodVariant, excluded: string[]): boolean {
  if (!excluded || excluded.length === 0) return false;
  if (!variant.allergens || variant.allergens.length === 0) return false;
  const setE = new Set(excluded.map(s => s.toLowerCase()));
  return variant.allergens.some(a => setE.has(a.toLowerCase()));
}

function contextualMultiplier(
  variant: FoodVariant,
  goal: Goal | null,
): { mult: number; disqualified: boolean } {
  if (!goal) return { mult: 1, disqualified: false };
  const score = computeContextualScore(variant, goal);
  if (score.grade === 'E') return { mult: 0, disqualified: true };
  if (score.grade === 'D') return { mult: 0.3, disqualified: false };
  if (score.grade === 'C') return { mult: 0.7, disqualified: false };
  if (score.grade === 'B') return { mult: 1.1, disqualified: false };
  return { mult: 1.3, disqualified: false }; // A
}

/**
 * Main ranker. Given the target macro to close and the pool of variants,
 * returns the top-N variants that best help close the gap.
 *
 * Rule: when `macroKey === 'cal'` we DON'T maximise calorie density (that
 * would push oils/nuts). Instead we maximise the protein+carbs+fats density
 * combined (= total macronutrient content), biased toward whole foods.
 * A user who's 800 kcal under target usually wants a meal, not a shot of oil.
 */
export function rankFoodsForGap(
  macroKey: MacroKey,
  pool: readonly FoodVariant[],
  options: SuggestOptions = {},
): Ranked[] {
  const goal = normalizeGoal(options.rawGoal);
  const limit = options.limit ?? 3;
  const excludeAllergens = options.excludeAllergens ?? [];

  // Build a history-id set for O(1) affinity checks.
  const historyIds = new Set<string>();
  const historyUseCount = new Map<string, number>();
  for (const h of options.history ?? []) {
    historyIds.add(h.foodId);
    historyUseCount.set(h.foodId, (historyUseCount.get(h.foodId) ?? 0) + h.useCount);
  }

  const scored: Ranked[] = [];

  for (const v of pool) {
    // Hard filters first.
    if (allergenHit(v, excludeAllergens)) continue;
    const ctx = contextualMultiplier(v, goal);
    if (ctx.disqualified) continue;

    // Base macro density. For 'cal' we use the non-cal macro sum AND
    // penalise mono-macro foods (oils = 100 % fat, pure sugar = 100 % carbs)
    // so balanced whole foods rank above calorie-dense single-macro sources.
    // The multiplier is the fraction of non-zero macros among protein/carbs/fats.
    let density: number;
    if (macroKey === 'cal') {
      const p = v.macros.protein ?? 0;
      const c = v.macros.carbs ?? 0;
      const f = v.macros.fats ?? 0;
      const sum = p + c + f;
      const nonZeroCount = (p > 0 ? 1 : 0) + (c > 0 ? 1 : 0) + (f > 0 ? 1 : 0);
      // Strong penalty for mono-macro foods (pure oils, pure sugar drinks) —
      // we want to suggest real meals, not shots of oil, to close a calorie gap.
      // 3 non-zero (balanced whole food) → 1.0
      // 2 non-zero (lean cuts, dairy) → 0.5
      // 1 non-zero (oils, pure sugar)  → 0.2
      const balanceMultiplier = nonZeroCount === 3 ? 1 : nonZeroCount === 2 ? 0.5 : 0.2;
      density = sum * balanceMultiplier;
    } else {
      density = macroPer100(v, macroKey);
    }
    if (density <= 0) continue;

    // Tier bonus: canonical + curated edge out scanned brands by default.
    const tier = deriveTier(v);
    const tierBonus = TIER_PRIORITY[tier] * 0.05; // max +0.15

    // Historical affinity: boost if the variant id is in the user's recents.
    const historyCount = historyUseCount.get(v.id) ?? 0;
    const historyMult = historyCount > 0 ? 1.5 : 1.0;

    const score = density * ctx.mult * historyMult + tierBonus;
    const reason: Ranked['reason'] =
      historyCount > 0 ? 'history' : (macroKey === 'cal' ? 'whole-food' : 'macro-density');
    scored.push({ variant: v, score, reason });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
