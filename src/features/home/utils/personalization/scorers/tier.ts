/**
 * tier scorer — small additive bias based on recipe trust tier.
 *
 *   - User-saved (no publishedBy or 'self') → +0.10
 *   - RIAL-curated (publishedBy starts with 'rial') → +0.05
 *   - Verified creator → +0.05
 *   - Forked from a creator → −0.05
 *
 * Tiny weights — this just breaks ties between equally-good options.
 */
import type { RecipeScorer } from '../types';

export const tierScorer: RecipeScorer = (recipe) => {
  const contributions = [];
  if (!recipe.publishedBy || recipe.publishedBy === 'self') {
    contributions.push({ kind: 'additive' as const, weight: 0.10, signal: 'tier-self' });
  } else if (recipe.publishedBy.startsWith('rial')) {
    contributions.push({ kind: 'additive' as const, weight: 0.05, signal: 'tier-rial' });
  }
  if (recipe.verified === 'creator' || recipe.verified === 'rial') {
    contributions.push({ kind: 'additive' as const, weight: 0.05, signal: 'tier-verified' });
  }
  if (recipe.forkedFrom) {
    contributions.push({ kind: 'additive' as const, weight: -0.05, signal: 'tier-fork' });
  }
  return contributions;
};
