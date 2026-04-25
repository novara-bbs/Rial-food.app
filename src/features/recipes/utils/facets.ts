/**
 * Recipe facets — heuristic derivation layer (ADR-014).
 *
 * The canonical `Recipe` model does not carry typed `cuisine` or
 * `dietaryTags` fields; that taxonomy migration (Q16 codemod) is deferred.
 * In the meantime, the FilterSheet UX needs facet predicates today.
 *
 * This module derives facets at read-time from existing fields:
 *   - `tags: string[]`            (ES uppercase free-form: `MEDITERRÁNEO`, `VEGANO`, …)
 *   - legacy `tag: string`        (singular, runtime-only — read defensively)
 *   - `prepTime` + `cookTime`     (string `XXM` minutes, sometimes `Xh Ymin`)
 *   - `difficulty`                (ES literal `Fácil` / `Medio` / `Difícil`)
 *   - `suitableFor: MealSlot[]`   (canonical meal slots)
 *
 * Recipes that don't match any cuisine keyword fall to `cuisine: 'other'` —
 * still selectable as an escape valve. Same for `dietaryTags: []` (no match).
 *
 * When the Q16 codemod ships and adds typed fields, swap the `derive*`
 * implementations to read the typed fields directly; the public API
 * (`matchesFilters`, `countActive`) stays stable.
 */

import type { Recipe, MealSlot } from '../../../types/recipe';

// ─── Public taxonomies ────────────────────────────────────────────────────

export type Cuisine =
  | 'italian'
  | 'mediterranean'
  | 'mexican'
  | 'asian'
  | 'american'
  | 'middleEastern'
  | 'latin'
  | 'other';

export type DietaryTag =
  | 'vegan'
  | 'vegetarian'
  | 'keto'
  | 'lowCarb'
  | 'highProtein'
  | 'glutenFree'
  | 'dairyFree';

export type TimeBucket = 'under15' | 'under30' | 'under60' | 'over60';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const CUISINES: readonly Cuisine[] = [
  'italian',
  'mediterranean',
  'mexican',
  'asian',
  'american',
  'middleEastern',
  'latin',
  'other',
] as const;

export const DIETARY_TAGS: readonly DietaryTag[] = [
  'vegan',
  'vegetarian',
  'keto',
  'lowCarb',
  'highProtein',
  'glutenFree',
  'dairyFree',
] as const;

export const TIME_BUCKETS: readonly TimeBucket[] = [
  'under15',
  'under30',
  'under60',
  'over60',
] as const;

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const;

// ─── FilterSheet value envelope ───────────────────────────────────────────

export type FilterValue = string | string[] | null;
export type FilterValues = Record<string, FilterValue>;

// ─── Derivation helpers ───────────────────────────────────────────────────

/** Read the legacy single `tag` field (runtime-only, not on canonical Recipe type). */
function getLegacyTag(r: Recipe): string {
  const raw = (r as unknown as { tag?: unknown }).tag;
  return typeof raw === 'string' ? raw : '';
}

/** Lowercase + strip diacritics — keyword matching is accent-insensitive. */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Concatenate `tags[]` + legacy `tag` into a single haystack for keyword search. */
function getAllTagText(r: Recipe): string {
  const arr = [...(r.tags ?? []), getLegacyTag(r)];
  return normalize(arr.filter(Boolean).join(' '));
}

const CUISINE_KEYWORDS: Record<Exclude<Cuisine, 'other'>, string[]> = {
  italian: ['italian', 'italiana', 'italiano', 'italia'],
  mediterranean: ['mediterraneo', 'mediterranea', 'mediterranean'],
  mexican: ['mexicana', 'mexicano', 'mexican', 'mexico'],
  asian: [
    'asiatica',
    'asiatico',
    'asian',
    'asia',
    'chino',
    'china',
    'japones',
    'japonesa',
    'japanese',
    'thai',
    'tailandes',
    'tailandesa',
  ],
  american: ['americana', 'americano', 'american', 'usa'],
  middleEastern: ['oriente medio', 'libanes', 'lebanese', 'turco', 'turkish', 'middle east', 'middle-eastern'],
  latin: ['latina', 'latino', 'latin ', 'latam'],
};

export function deriveCuisine(r: Recipe): Cuisine {
  const text = getAllTagText(r);
  for (const cuisine of CUISINES) {
    if (cuisine === 'other') continue;
    const kws = CUISINE_KEYWORDS[cuisine];
    if (kws.some(kw => text.includes(kw))) return cuisine;
  }
  return 'other';
}

const DIET_KEYWORDS: Record<DietaryTag, string[]> = {
  vegan: ['vegano', 'vegana', 'vegan'],
  vegetarian: ['vegetariano', 'vegetariana', 'vegetarian', 'veggie'],
  keto: ['keto', 'cetogenica', 'cetogenico'],
  lowCarb: ['low carb', 'lowcarb', 'low-carb', 'bajo en carbos', 'bajo carbos'],
  highProtein: ['alto proteina', 'alto en proteina', 'high protein', 'high-protein', 'highprotein'],
  glutenFree: ['sin gluten', 'gluten free', 'gluten-free', 'glutenfree'],
  dairyFree: ['sin lacteos', 'dairy free', 'dairy-free', 'dairyfree'],
};

export function deriveDietaryTags(r: Recipe): DietaryTag[] {
  const text = getAllTagText(r);
  const out: DietaryTag[] = [];
  for (const diet of DIETARY_TAGS) {
    const kws = DIET_KEYWORDS[diet];
    if (kws.some(kw => text.includes(kw))) out.push(diet);
  }
  // Vegan strictly implies vegetarian — surface both for filter UX.
  if (out.includes('vegan') && !out.includes('vegetarian')) out.push('vegetarian');
  return out;
}

/**
 * Parse a time string into total minutes. Handles RIAL canonical `XXM` format
 * plus a few common variants (`Xh Ymin`, `X horas`, bare numbers).
 * Returns 0 for unparseable input.
 */
export function parseMinutes(s: string | undefined | null): number {
  if (!s) return 0;
  const trimmed = s.trim().toUpperCase();
  // Canonical compact: "10M", "30M", "0M".
  const compact = trimmed.match(/^(\d+)\s*M$/);
  if (compact) return parseInt(compact[1], 10);
  // Composite: "1H 30MIN", "2 HORAS 15", etc.
  let total = 0;
  const hours = trimmed.match(/(\d+)\s*(?:H\b|HR|HRS|HOUR|HOURS|HORA|HORAS)/);
  if (hours) total += parseInt(hours[1], 10) * 60;
  const mins = trimmed.match(/(\d+)\s*(?:MIN|MINS|MINUTE|MINUTES|MINUTO|MINUTOS|M\b)/);
  if (mins) total += parseInt(mins[1], 10);
  if (total > 0) return total;
  // Bare number → assume minutes.
  const bare = trimmed.match(/^(\d+)$/);
  if (bare) return parseInt(bare[1], 10);
  return 0;
}

export function deriveTotalMinutes(r: Recipe): number {
  return parseMinutes(r.prepTime) + parseMinutes(r.cookTime);
}

export function deriveTimeBucket(r: Recipe): TimeBucket {
  const m = deriveTotalMinutes(r);
  if (m < 15) return 'under15';
  if (m < 30) return 'under30';
  if (m < 60) return 'under60';
  return 'over60';
}

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  facil: 'easy',
  easy: 'easy',
  medio: 'medium',
  medium: 'medium',
  dificil: 'hard',
  hard: 'hard',
};

export function deriveDifficulty(r: Recipe): Difficulty {
  const key = normalize(r.difficulty ?? '');
  return DIFFICULTY_MAP[key] ?? 'medium';
}

// ─── FilterValues helpers ─────────────────────────────────────────────────

/**
 * Count "active" filters (non-empty, non-null, non-`'all'`). Used to render
 * the badge on `<FilterButton activeCount={…}>` and to branch
 * `Discovery` between editorial swimlanes (idle) and flat grid (filtered).
 */
export function countActive(values: FilterValues): number {
  let n = 0;
  for (const v of Object.values(values)) {
    if (Array.isArray(v)) n += v.length;
    else if (v !== null && v !== undefined && v !== '' && v !== 'all') n += 1;
  }
  return n;
}

export interface MatchOptions {
  /**
   * Per-recipe context for the `source` filter section (Cocina). The caller
   * provides whether THIS recipe is "mine" / "imported" / "cooked" — facets.ts
   * has no access to user state. Omit when the screen has no source filter
   * (Discovery).
   */
  sourceContext?: { isMine?: boolean; isImported?: boolean; isCooked?: boolean };
}

/**
 * Predicate: does `r` match every active section in `values`?
 *
 * Section semantics:
 *   - `cuisine`: multi-select, UNION (recipe matches any of selected).
 *   - `diet`:    multi-select, INTERSECTION (recipe must satisfy all selected).
 *   - `time`:    single, equality on derived bucket.
 *   - `difficulty`: single, equality on derived difficulty.
 *   - `mealSlot`: single, recipe.suitableFor must include the slot.
 *   - `source`:  single, evaluated via `opts.sourceContext`.
 *
 * Empty / null / `'all'` values short-circuit (faceta no aplica).
 */
export function matchesFilters(
  r: Recipe,
  values: FilterValues,
  opts?: MatchOptions,
): boolean {
  const cuisine = values.cuisine;
  if (Array.isArray(cuisine) && cuisine.length > 0) {
    if (!cuisine.includes(deriveCuisine(r))) return false;
  }

  const diet = values.diet;
  if (Array.isArray(diet) && diet.length > 0) {
    const recipeDiets = new Set<string>(deriveDietaryTags(r));
    if (!diet.every(d => recipeDiets.has(d))) return false;
  }

  const time = values.time;
  if (typeof time === 'string' && time.length > 0 && time !== 'all') {
    if (deriveTimeBucket(r) !== time) return false;
  }

  const difficulty = values.difficulty;
  if (typeof difficulty === 'string' && difficulty.length > 0 && difficulty !== 'all') {
    if (deriveDifficulty(r) !== difficulty) return false;
  }

  const mealSlot = values.mealSlot;
  if (typeof mealSlot === 'string' && mealSlot.length > 0 && mealSlot !== 'all') {
    const slots: MealSlot[] = r.suitableFor ?? [];
    if (!slots.includes(mealSlot as MealSlot)) return false;
  }

  const source = values.source;
  if (typeof source === 'string' && source.length > 0 && source !== 'all') {
    const ctx = opts?.sourceContext ?? {};
    if (source === 'mine' && !ctx.isMine) return false;
    if (source === 'imported' && !ctx.isImported) return false;
    if (source === 'cooked' && !ctx.isCooked) return false;
  }

  return true;
}
