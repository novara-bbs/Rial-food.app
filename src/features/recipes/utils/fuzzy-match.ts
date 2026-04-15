/**
 * Fuzzy ingredient matching against RIAL dictionary.
 * v2: alias map, prep-word stripping, measurement-prefix extraction,
 *     plural normalization, token Jaccard — for deeper import matching.
 */
import { Ingredient } from '../../../types';
import { INGREDIENT_DICTIONARY } from '../../food/data/ingredients';

export interface MatchResult {
  ingredient: Ingredient;
  score: number;       // 0–1, higher = better
  matchedOn: 'es' | 'en';
}

// ─── Regional / common-name alias map ────────────────────────────────────────
// Keys: accent-stripped, lowercase. Values: canonical fragment that will
// score well against the dictionary after normalization.
const ALIASES: Record<string, string> = {
  // Latin America potato variants
  'papa': 'patata',
  'papas': 'patata',
  'camote': 'batata',
  'boniato': 'batata',
  // Pepper / chili variants
  'chile': 'pimiento',
  'aji': 'pimiento',
  'chili': 'pimiento',
  'morrón': 'pimiento',
  'morron': 'pimiento',
  // Legume regional names
  'frijol': 'judias',
  'frijoles': 'judias',
  'alubia': 'judias',
  'poroto': 'judias',
  'porotos': 'judias',
  'habichuela': 'judias',
  'habichuelas': 'judias',
  'caraota': 'judias',
  // Corn variants
  'elote': 'maiz',
  'choclo': 'maiz',
  // Avocado
  'palta': 'aguacate',
  'paltas': 'aguacate',
  // Beef / minced meat
  'carne picada': 'carne de res molida',
  'carne molida': 'carne de res molida',
  'carne de vaca': 'carne de res',
  // Canned tuna aliases
  'atun en conserva': 'atun en lata',
  'atun en agua': 'atun en lata',
  'atun natural': 'atun en lata',
  // Ham
  'jamon cocido': 'jamon de york',
  'jamon de york': 'jamon de york',
  // Chicken shorthand
  'pechuga': 'pechuga de pollo',
  'pechugas': 'pechuga de pollo',
  'muslo de pollo': 'pollo',
  'muslos de pollo': 'pollo',
  // Plural normalizations (supplement pluralToSingular for irregular forms)
  'huevos': 'huevo',
  'tomates': 'tomate',
  'cebollas': 'cebolla',
  'zanahorias': 'zanahoria',
  'berenjenas': 'berenjena',
  'espinacas': 'espinaca',
  'lentejas rojas': 'lentejas',
  'lentejas verdes': 'lentejas',
  'lentejas pardinas': 'lentejas',
  // Pasta generic names
  'espaguetis': 'espaguetis',
  'macarrones': 'pasta',
  'fideos': 'pasta',
  'tallarines': 'pasta',
  // Yogurt
  'yogur': 'yogur griego',
  'yogurt': 'yogur griego',
  // Milk variants
  'leche entera': 'leche',
  'leche semidesnatada': 'leche',
  'leche desnatada': 'leche',
  // Olive oil
  'aceite': 'aceite de oliva',
  'aove': 'aceite de oliva',
};

// ─── Prep / state adjectives to strip from ingredient names ──────────────────
const PREP_WORDS = new Set([
  'cocido', 'cocida', 'cocidos', 'cocidas',
  'crudo', 'cruda', 'crudos', 'crudas',
  'asado', 'asada', 'asados', 'asadas',
  'tostado', 'tostada', 'tostados', 'tostadas',
  'rallado', 'rallada', 'rallados', 'ralladas',
  'picado', 'picada', 'picados', 'picadas',
  'troceado', 'troceada', 'troceados', 'troceadas',
  'entero', 'entera', 'enteros', 'enteras',
  'fresco', 'fresca', 'frescos', 'frescas',
  'congelado', 'congelada', 'congelados', 'congeladas',
  'enlatado', 'enlatada', 'enlatados', 'enlatadas',
  'hervido', 'hervida', 'hervidos', 'hervidas',
  'frito', 'frita', 'fritos', 'fritas',
  'horneado', 'horneada', 'horneados', 'horneadas',
  'salteado', 'salteada', 'salteados', 'salteadas',
  'marinado', 'marinada', 'marinados', 'marinadas',
  'deshidratado', 'deshidratada',
  'triturado', 'triturada',
  'pelado', 'pelada', 'pelados', 'peladas',
  'desmenuzado', 'desmenuzada',
  'majado', 'majada',
  'plancha', 'vapor', 'horno',
  // Isolated prepositions that appear when prep words are stripped
  'al', 'la', 'el',
]);

// ─── Measurement prefix pattern ───────────────────────────────────────────────
// Matches things like "200g de", "2 tazas de", "1 lata de", "una cucharada de"
const MEASUREMENT_PREFIX_RE =
  /^[\d\s./,]*\s*(kg|g|gr|gramos?|ml|l|litros?|oz|lb|cup|tazas?|cucharadas?|cdas?|cdtas?|unidades?|uds?|piezas?|porciones?|latas?|rebanadas?|dientes?|puñados?|ramas?)\s*(de\s+)?/i;

// Also strip leading plain numbers ("3 " at the start before a word)
const LEADING_NUMBER_RE = /^\d+[\d\s./,]*\s+(de\s+)?/;

// ─── Core normalize: accents, case, parentheticals ───────────────────────────
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

/** Simple plural-to-singular: strips common Spanish -es / -s suffixes */
function pluralToSingular(s: string): string {
  if (s.endsWith('ces')) return s.slice(0, -3) + 'z';  // nueces → nuez
  if (s.endsWith('nes')) return s.slice(0, -2);          // limones → limon
  if (s.endsWith('es') && s.length > 4) return s.slice(0, -2);
  if (s.endsWith('s') && s.length > 3) return s.slice(0, -1);
  return s;
}

/**
 * Full preprocessing pipeline:
 * 1. Strip measurement prefix ("200g de", "2 tazas de")
 * 2. Normalize (accents, case, parentheticals)
 * 3. Alias substitution on full string
 * 4. Strip trailing/embedded prep-state words
 * 5. Re-check alias on cleaned string
 * 6. Singular normalization on each token
 */
function preprocess(raw: string): string {
  let s = raw;

  // 1. Strip measurement prefixes
  s = s.replace(MEASUREMENT_PREFIX_RE, '');
  s = s.replace(LEADING_NUMBER_RE, '');

  // 2. Normalize
  s = normalize(s);

  // 3. Full-string alias
  const aliasedFull = ALIASES[s];
  if (aliasedFull) return normalize(aliasedFull);

  // 4. Strip prep/state words
  const tokens = s.split(' ').filter(t => t.length > 0 && !PREP_WORDS.has(t));
  s = tokens.join(' ').trim();

  // 5. Re-check alias on stripped string
  const aliasedStripped = ALIASES[s];
  if (aliasedStripped) return normalize(aliasedStripped);

  // 6. Per-token singular normalization (skip very short tokens)
  const singular = s
    .split(' ')
    .map(t => (t.length > 4 ? pluralToSingular(t) : t))
    .join(' ');

  // Guard: never return empty — fallback to basic normalize
  return singular.trim() || normalize(raw);
}

// ─── Levenshtein distance ─────────────────────────────────────────────────────
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

/** Token Jaccard similarity: |A ∩ B| / |A ∪ B| on meaningful tokens (>2 chars) */
function tokenJaccard(a: string, b: string): number {
  const setA = new Set(a.split(' ').filter(w => w.length > 2));
  const setB = new Set(b.split(' ').filter(w => w.length > 2));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

/**
 * Multi-signal score (0–1) between a raw query and a candidate dictionary name.
 * Signals combined: exact match, substring, token Jaccard, word partial, edit distance.
 */
function score(query: string, candidate: string): number {
  const pq = preprocess(query);
  const pc = preprocess(candidate);
  const nq = normalize(query);
  const nc = normalize(candidate);

  // Exact match after preprocessing or basic normalization
  if (pq === pc || nq === nc) return 1;

  let best = 0;

  // 1. Substring containment on preprocessed strings (strong signal)
  if (pc.includes(pq) || pq.includes(pc)) {
    const overlap = Math.min(pq.length, pc.length) / Math.max(pq.length, pc.length);
    best = Math.max(best, 0.82 + overlap * 0.18);
  }

  // 2. Substring containment on normalized strings (slightly weaker)
  if (nc.includes(nq) || nq.includes(nc)) {
    const overlap = Math.min(nq.length, nc.length) / Math.max(nq.length, nc.length);
    best = Math.max(best, 0.75 + overlap * 0.2);
  }

  // 3. Token Jaccard on preprocessed strings
  const jaccard = tokenJaccard(pq, pc);
  if (jaccard > 0) {
    // Scale: full overlap (1.0) → 0.95; partial overlap (0.5) → ~0.52
    best = Math.max(best, jaccard * 0.9 + 0.05);
  }

  // 4. Word-level partial containment (each token from query vs candidate)
  const queryWords = pq.split(' ').filter(w => w.length > 2);
  const candidateWords = pc.split(' ').filter(w => w.length > 2);
  if (queryWords.length > 0 && candidateWords.length > 0) {
    const wordHits = queryWords.filter(w =>
      candidateWords.some(cw => cw.includes(w) || w.includes(cw)),
    );
    if (wordHits.length > 0) {
      const wordScore = wordHits.length / Math.max(queryWords.length, candidateWords.length);
      best = Math.max(best, wordScore * 0.75 + 0.15);
    }
  }

  // 5. Edit distance fallback (always computed, used as floor)
  const dist = levenshtein(pq, pc);
  const maxLen = Math.max(pq.length, pc.length, 1);
  best = Math.max(best, 1 - dist / maxLen);

  return Math.min(best, 1);
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

/** Exported for testing only */
export { preprocess as _preprocessForTest };
