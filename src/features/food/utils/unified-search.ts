/**
 * Unified food search — merges results from:
 *   1. RIAL ingredient dictionary (including user foods) via fuzzy matching
 *   2. Saved recipes via title search
 *
 * Returns a single ranked array suitable for direct rendering in AddMeal.
 * Existing object shapes (Ingredient, Recipe) are preserved so downstream
 * code (PortionSheet, quality emoji, history badges) keeps working unmodified.
 */
import { Ingredient, Recipe } from '../../../types';
import { matchIngredientTopNFromList } from '../../recipes/utils/fuzzy-match';

export interface UnifiedSearchOptions {
  /** Max total results to return (default: 30) */
  maxResults?: number;
  /** Min fuzzy score for ingredient results (default: 0.3) */
  ingredientThreshold?: number;
}

/**
 * Score a recipe title against a query. Returns 0–1.
 * Strategy: exact > starts-with > includes > word overlap.
 */
function recipeScore(query: string, title: string): number {
  const q = query.toLowerCase().trim();
  const t = title.toLowerCase().trim();
  if (!q || !t) return 0;
  if (t === q) return 1;
  if (t.startsWith(q)) return 0.9;
  if (t.includes(q)) return 0.7 + (q.length / t.length) * 0.15;
  // Word overlap — only meaningful tokens (> 2 chars) from both sides
  const qWords = q.split(/\s+/).filter(w => w.length > 2);
  const tWords = t.split(/\s+/).filter(w => w.length > 2);
  const hits = qWords.filter(w => tWords.some(tw => tw.includes(w) || w.includes(tw)));
  if (hits.length > 0) return hits.length / Math.max(qWords.length, tWords.length) * 0.65;
  return 0;
}

/**
 * Unified search across ingredient dictionary and saved recipes.
 *
 * @param query      User's search query (must be >= 2 chars to get results)
 * @param sources    The data sources to search
 * @param options    Optional tuning parameters
 * @returns          Ordered array of Ingredient | Recipe objects, best matches first
 */
export function unifiedSearch(
  query: string,
  sources: {
    dictionary: Ingredient[];  // mergedDictionary already includes userFoods
    savedRecipes: Recipe[];
  },
  options: UnifiedSearchOptions = {},
): Array<Ingredient | Recipe> {
  const { maxResults = 30, ingredientThreshold = 0.3 } = options;
  const q = query.trim();
  if (q.length < 2) return [];

  const results: Array<{ item: Ingredient | Recipe; score: number }> = [];
  const seen = new Set<string>();

  // ── 1. Fuzzy-match ingredients (includes userFoods via mergedDictionary) ──
  const ingredientMatches = matchIngredientTopNFromList(
    q,
    sources.dictionary,
    maxResults,
    ingredientThreshold,
  );
  for (const match of ingredientMatches) {
    const id = String(match.ingredient.id);
    if (!seen.has(id)) {
      seen.add(id);
      results.push({ item: match.ingredient, score: match.score });
    }
  }

  // ── 2. Recipe title search ────────────────────────────────────────────────
  for (const recipe of sources.savedRecipes) {
    const id = String(recipe.id);
    if (seen.has(id)) continue;
    const s = recipeScore(q, recipe.title ?? '');
    if (s > 0) {
      seen.add(id);
      results.push({ item: recipe, score: s });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(r => r.item);
}
