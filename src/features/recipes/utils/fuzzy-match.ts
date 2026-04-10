/**
 * Fuzzy ingredient matching against RIAL dictionary.
 * Uses normalized Levenshtein + substring bonus for fast, accurate matching.
 */
import { Ingredient } from '../../../types';
import { INGREDIENT_DICTIONARY } from '../../food/data/ingredients';

export interface MatchResult {
  ingredient: Ingredient;
  score: number;       // 0–1, higher = better
  matchedOn: 'es' | 'en';
}

/** Normalize: lowercase, trim, strip accents, remove parenthetical info */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/\(.*?\)/g, '')          // remove (Cruda), (Cocida), etc.
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Score between 0–1: considers edit distance + substring containment */
function score(query: string, candidate: string): number {
  const nq = normalize(query);
  const nc = normalize(candidate);

  if (nq === nc) return 1;

  // Substring match bonus
  if (nc.includes(nq) || nq.includes(nc)) {
    const overlap = Math.min(nq.length, nc.length) / Math.max(nq.length, nc.length);
    return 0.8 + overlap * 0.2; // 0.8–1.0
  }

  // Word-level containment (e.g., "pollo" matches "pechuga de pollo")
  const queryWords = nq.split(' ');
  const candidateWords = nc.split(' ');
  const wordHits = queryWords.filter(w => candidateWords.some(cw => cw.includes(w) || w.includes(cw)));
  if (wordHits.length > 0) {
    const wordScore = wordHits.length / Math.max(queryWords.length, candidateWords.length);
    // Combine with edit distance for final score
    const dist = levenshtein(nq, nc);
    const maxLen = Math.max(nq.length, nc.length);
    const editScore = 1 - dist / maxLen;
    return Math.max(wordScore * 0.7 + 0.2, editScore);
  }

  // Pure edit distance
  const dist = levenshtein(nq, nc);
  const maxLen = Math.max(nq.length, nc.length);
  return 1 - dist / maxLen;
}

/**
 * Find the best dictionary match for an ingredient name.
 * Returns null if no match scores above threshold.
 */
export function matchIngredient(
  name: string,
  threshold = 0.45,
): MatchResult | null {
  let best: MatchResult | null = null;

  for (const ing of INGREDIENT_DICTIONARY) {
    const esScore = score(name, ing.name);
    const enScore = score(name, ing.nameEn);

    if (esScore >= enScore && esScore > (best?.score ?? 0)) {
      best = { ingredient: ing, score: esScore, matchedOn: 'es' };
    } else if (enScore > (best?.score ?? 0)) {
      best = { ingredient: ing, score: enScore, matchedOn: 'en' };
    }
  }

  return best && best.score >= threshold ? best : null;
}

/**
 * Find top N matches — useful for showing alternatives in UI.
 */
export function matchIngredientTopN(
  name: string,
  n = 3,
  threshold = 0.35,
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const ing of INGREDIENT_DICTIONARY) {
    const esScore = score(name, ing.name);
    const enScore = score(name, ing.nameEn);
    const best = esScore >= enScore
      ? { ingredient: ing, score: esScore, matchedOn: 'es' as const }
      : { ingredient: ing, score: enScore, matchedOn: 'en' as const };

    if (best.score >= threshold) results.push(best);
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
