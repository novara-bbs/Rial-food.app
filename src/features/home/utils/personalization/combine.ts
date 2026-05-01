/**
 * composeScorers — runs each scorer over a recipe and combines their
 * contributions into a single (score, reason) pair.
 *
 * Score model:
 *   - `kind: 'multiplier'` contributions are multiplied together.
 *   - `kind: 'additive'`  contributions are summed.
 *   - Final score = base × Π(multipliers) + Σ(additives).
 *
 * Reason resolution:
 *   - Each contribution may flag a `reason`.
 *   - We pick the reason whose priority (REASON_PRIORITY index) is highest
 *     among contributions that actually moved the score (multiplier ≠ 1
 *     or additive ≠ 0). Ties broken by priority (last-wins is fine since
 *     the priority list is already strict).
 *   - When no reason wins, fallback to 'macro-density'.
 */
import {
  REASON_PRIORITY,
  type PersonalizationContext,
  type RecipeReason,
  type RecipeScorer,
  type ScoreContribution,
} from './types';
import type { Recipe } from '../../../../types/recipe';

const NEUTRAL_MULTIPLIER = 1;
const NEUTRAL_ADDITIVE = 0;

const reasonRank = (r: RecipeReason): number => REASON_PRIORITY.indexOf(r);

export function composeScorers(
  recipe: Recipe,
  ctx: PersonalizationContext,
  base: number,
  scorers: readonly RecipeScorer[],
): { score: number; reason: RecipeReason } {
  let multiplier = 1;
  let additive = 0;
  let bestReason: RecipeReason = 'macro-density';
  let bestRank = reasonRank('macro-density');

  for (const scorer of scorers) {
    const contributions = scorer(recipe, ctx);
    for (const c of contributions) {
      applyContribution(c, (m) => { multiplier *= m; }, (a) => { additive += a; });
      if (isMeaningful(c) && c.reason) {
        const r = reasonRank(c.reason);
        if (r > bestRank) {
          bestRank = r;
          bestReason = c.reason;
        }
      }
    }
  }

  return {
    score: base * multiplier + additive,
    reason: bestReason,
  };
}

function applyContribution(
  c: ScoreContribution,
  applyMultiplier: (m: number) => void,
  applyAdditive: (a: number) => void,
): void {
  if (c.kind === 'multiplier') applyMultiplier(c.weight);
  else applyAdditive(c.weight);
}

function isMeaningful(c: ScoreContribution): boolean {
  if (c.kind === 'multiplier') return c.weight !== NEUTRAL_MULTIPLIER;
  return c.weight !== NEUTRAL_ADDITIVE;
}
