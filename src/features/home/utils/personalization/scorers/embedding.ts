/**
 * embedding scorer — placeholder for future RAG migration (Q4 2026+).
 *
 * Designed contract:
 *   - `userVector` is a dense vector representing the user's profile +
 *     foodPreferences + recent foodHistory + recent meals, computed once
 *     per session by an Edge Function.
 *   - `embeddings` is a precomputed list of {recipeId, vector} from
 *     `recipe_embeddings` Supabase table populated via batch indexing.
 *   - Score contribution = 1 + cosine(userVector, recipeVector) × 0.15
 *     (capped at +0.15 to keep deterministic signals dominant).
 *
 * Today: returns no contribution. The pipeline calls this scorer but it
 * short-circuits when `ctx.embeddings`/`ctx.userVector` are undefined,
 * so there is **zero runtime cost** until RAG ships.
 *
 * When activating: set `ctx.embeddings` + `ctx.userVector` upstream (in
 * Home.tsx wiring), no other code changes required.
 */
import type { RecipeScorer } from '../types';

const EMBEDDING_MAX_BOOST = 0.15;

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export const embeddingScorer: RecipeScorer = (recipe, ctx) => {
  if (!ctx.embeddings || !ctx.userVector) return [];
  const entry = ctx.embeddings.find((e) => e.recipeId === recipe.id);
  if (!entry) return [];
  const sim = cosineSimilarity(entry.vector, ctx.userVector);
  if (sim <= 0) return [];
  return [{
    kind: 'multiplier',
    weight: 1 + sim * EMBEDDING_MAX_BOOST,
    reason: 'embedding',
    signal: 'embedding-similarity',
  }];
};
