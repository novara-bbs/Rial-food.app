/**
 * Pure helpers to navigate the FoodFamily + FoodVariant seed. No React, no
 * localStorage — consumers (FoodDictionary P2, AddMeal P3, RecipeDetail P4,
 * BarcodeScanner P5) wrap these behind their own memoisation.
 *
 * Resolution priority for a recipe ingredient:
 *   1. explicit `pinnedVariantId` (user selected a specific variant)
 *   2. user preference (added in P6 — not wired here)
 *   3. `family.canonicalVariantId` (the USDA reference)
 */
import type {
  FoodFamily,
  FoodVariant,
  MacroDelta,
  VariantType,
} from '../../../types/food-family';
import { FOOD_FAMILIES, VARIANT_ID_TO_FAMILY } from '../data/food-families';
import { FOOD_VARIANTS } from '../data/food-variants';

const familyById = new Map<string, FoodFamily>(FOOD_FAMILIES.map(f => [f.id, f]));
const variantById = new Map<string, FoodVariant>(FOOD_VARIANTS.map(v => [v.id, v]));

/** Variants grouped by familyId (ordered as declared in family.variantIds). */
const variantsByFamily = new Map<string, FoodVariant[]>();
for (const family of FOOD_FAMILIES) {
  variantsByFamily.set(
    family.id,
    family.variantIds
      .map(id => variantById.get(id))
      .filter((v): v is FoodVariant => Boolean(v)),
  );
}

export function getFamily(familyId: string): FoodFamily | undefined {
  return familyById.get(familyId);
}

export function getVariant(variantId: string): FoodVariant | undefined {
  return variantById.get(variantId);
}

export function getVariantsOfFamily(familyId: string): FoodVariant[] {
  return variantsByFamily.get(familyId) ?? [];
}

export function getCanonicalVariant(familyId: string): FoodVariant | undefined {
  const family = familyById.get(familyId);
  if (!family) return undefined;
  return variantById.get(family.canonicalVariantId);
}

/**
 * Resolve the variant to render for a given family, preferring an explicit
 * pinned variantId. Returns `undefined` if the family doesn't exist; callers
 * should surface a warning if that happens (it means a stale familyId in user
 * data, typically after a seed id rename).
 */
export function resolveVariant(
  familyId: string,
  pinnedVariantId?: string,
): FoodVariant | undefined {
  if (pinnedVariantId) {
    const pinned = variantById.get(pinnedVariantId);
    if (pinned && pinned.familyId === familyId) return pinned;
  }
  return getCanonicalVariant(familyId);
}

/**
 * Legacy `Ingredient.id` → `{familyId, variantId}`. Used by AppStateContext
 * hydration to map pre-migration `RecipeIngredient.ingredientId` entries into
 * the new dual-shape without rewriting localStorage.
 *
 * Returns `null` when the id is not in the seed (e.g., a scanned product from
 * an old session). Caller decides whether to drop the entry or conserve it.
 */
export function ingredientIdToFamilyVariant(
  legacyId: string,
): { familyId: string; variantId: string } | null {
  const entry = VARIANT_ID_TO_FAMILY[legacyId];
  if (!entry) return null;
  return { familyId: entry.familyId, variantId: legacyId };
}

/**
 * Signed macro delta of a variant against its family's canonical reference.
 * Used by the dictionary drill-down to render "vs principal" chips.
 *
 * Returns `null` when the variant IS the canonical (no delta to show) or
 * when its family has no canonical (shouldn't happen for well-formed seed).
 */
export function computeMacroDelta(variant: FoodVariant): MacroDelta | null {
  const family = familyById.get(variant.familyId);
  if (!family || family.canonicalVariantId === variant.id) return null;
  const canonical = variantById.get(family.canonicalVariantId);
  if (!canonical) return null;
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    calories: round(variant.macros.calories - canonical.macros.calories),
    protein: round(variant.macros.protein - canonical.macros.protein),
    carbs: round(variant.macros.carbs - canonical.macros.carbs),
    fats: round(variant.macros.fats - canonical.macros.fats),
  };
}

/**
 * Group a family's variants by their primary `variantType`, excluding the
 * canonical itself. Used by `FamilyCard` (P2.6) to render the drill-down in
 * sections (`PREPARACIÓN` / `CALIDAD` / `REGIONAL` / `MARCA` / `USER`).
 *
 * The canonical is the family's "primary view" — it's painted outside the
 * drill-down, so we filter it out here to keep each bucket semantically
 * clean. `VariantType` keys that have no variants simply don't appear in the
 * output map (caller `.get(type)` returns `undefined` → skip section header).
 *
 * Insertion order within each bucket mirrors the input array order, which
 * itself mirrors `family.variantIds` from `food-families.ts`. Stable enough
 * for tests; real popularity ordering waits for telemetry (Q6+).
 */
export function groupVariantsByType(
  variants: FoodVariant[],
  canonicalId: string,
): Map<VariantType, FoodVariant[]> {
  const out = new Map<VariantType, FoodVariant[]>();
  for (const v of variants) {
    if (v.id === canonicalId) continue;
    const bucket = out.get(v.variantType) ?? [];
    bucket.push(v);
    out.set(v.variantType, bucket);
  }
  return out;
}

// ─── P5 Barcode scan matching ──────────────────────────────────────────────────

/**
 * Result of matching a scanned product against the seed + user variant library.
 * Discriminated union so callers handle each branch explicitly.
 */
export type FamilyMatchResult =
  | {
      type: 'known-barcode';
      /** The variant already saved for this barcode (seed-match or prior scan). */
      variant: FoodVariant;
      family: FoodFamily;
      confidence: 1;
    }
  | {
      type: 'seed-match';
      /** A seed brand variant matched by brand name. */
      variant: FoodVariant;
      family: FoodFamily;
      confidence: number;
    }
  | {
      type: 'fuzzy';
      /** Most-likely family. A new user variant should be created under it. */
      family: FoodFamily;
      confidence: number;
    }
  | {
      type: 'ambiguous';
      /** Top-3 candidate families for the user to choose from. */
      candidates: { family: FoodFamily; confidence: number }[];
      confidence: number;
    }
  | {
      type: 'no-match';
      confidence: 0;
    };

/**
 * Fuzzy stopwords filtered from product titles before token comparison.
 * Short, language-agnostic list covering the most common noise words in
 * Spanish + English retail product names.
 */
const SCAN_STOPWORDS = new Set([
  'de', 'el', 'la', 'los', 'las', 'del', 'natural', 'sin', 'con', 'bio',
  'eco', 'organic', 'fresh', 'the', 'and', 'of', 'with', 'without',
  'original', 'classic', 'clásico', 'gourmet', 'premium', 'light',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !SCAN_STOPWORDS.has(t));
}

/**
 * Match a scanned OFF product against the combined variant library.
 *
 * Algorithm (4 steps, short-circuit on first hit):
 * 1. Exact barcode lookup in `knownVariants`.
 * 2. Brand-name match against seed brand variants (variantType === 'brand').
 * 3. Fuzzy title-token match against family names + aliases.
 *    - Single best hit > 0.5 → 'fuzzy'.
 *    - Two or more hits > 0.35 → 'ambiguous'.
 * 4. 'no-match'.
 *
 * @param barcode - EAN/UPC barcode string from the OFF API.
 * @param brandName - `brands` field from the OFF product (may be empty string).
 * @param productTitle - `product_name` from the OFF API.
 * @param knownVariants - Merged variant pool from AppStateContext.mergedVariants.
 */
export function matchFamilyForScan(
  barcode: string,
  brandName: string,
  productTitle: string,
  knownVariants: FoodVariant[],
): FamilyMatchResult {
  // Step 1 — exact barcode in known variants (seed + user-saved)
  if (barcode) {
    const existing = knownVariants.find(v => v.brand?.barcode === barcode);
    if (existing) {
      const fam = familyById.get(existing.familyId);
      if (fam) return { type: 'known-barcode', variant: existing, family: fam, confidence: 1 };
    }
  }

  // Step 2 — brand-name match against seed brand variants
  if (brandName) {
    const brandTokens = tokenize(brandName);
    if (brandTokens.length > 0) {
      const seedBrands = knownVariants.filter(v => v.variantType === 'brand' && v.brand?.name);
      for (const sv of seedBrands) {
        const svBrandTokens = tokenize(sv.brand!.name);
        const hits = brandTokens.filter(bt => svBrandTokens.some(st => st.includes(bt) || bt.includes(st)));
        if (hits.length > 0) {
          const fam = familyById.get(sv.familyId);
          if (fam) {
            const confidence = hits.length / Math.max(brandTokens.length, svBrandTokens.length);
            return { type: 'seed-match', variant: sv, family: fam, confidence };
          }
        }
      }
    }
  }

  // Step 3 — fuzzy title-token match against families
  const titleTokens = tokenize(productTitle);
  if (titleTokens.length > 0) {
    const scored: { family: FoodFamily; confidence: number }[] = [];

    for (const fam of FOOD_FAMILIES) {
      // Deduplicate so repeated alias tokens don't inflate the denominator
      const searchTokens = Array.from(new Set([
        ...tokenize(fam.name),
        ...tokenize(fam.nameEn),
        ...(fam.aliases ?? []).flatMap(a => tokenize(a)),
      ]));
      if (searchTokens.length === 0) continue;

      const hits = titleTokens.filter(t => searchTokens.some(s => s.includes(t) || t.includes(s)));
      if (hits.length === 0) continue;

      const confidence = hits.length / Math.max(titleTokens.length, searchTokens.length);
      if (confidence > 0.35) scored.push({ family: fam, confidence });
    }

    scored.sort((a, b) => b.confidence - a.confidence);

    if (scored.length > 0 && scored[0].confidence >= 0.45) {
      // Check if there's a second strong candidate (ambiguous)
      const strong = scored.filter(s => s.confidence > 0.35);
      if (strong.length >= 2 && strong[1].confidence > 0.35) {
        return {
          type: 'ambiguous',
          candidates: strong.slice(0, 3),
          confidence: scored[0].confidence,
        };
      }
      return { type: 'fuzzy', family: scored[0].family, confidence: scored[0].confidence };
    }
  }

  // Step 4 — no match
  return { type: 'no-match', confidence: 0 };
}

// ─── P3 Family-first search ────────────────────────────────────────────────────

/** One row in the AddMeal family-search results. */
export interface FamilySearchResult {
  family: FoodFamily;
  canonical: FoodVariant;
  /** Top non-canonical variants by heuristic order (brand > quality > ...). Up to 3. */
  topVariants: FoodVariant[];
  /** User-saved variants for this family (from userVariants slice of allVariants). */
  userVariantsForFamily: FoodVariant[];
  score: number;
}

/**
 * Search families by query, returning results ranked by relevance.
 *
 * Matches against:
 * - family.name + family.nameEn + family.aliases
 * - canonical variant name + nameEn
 * - brand variant names (captures "hacendado" → matches peanut-butter family)
 *
 * User variants for a family lift that family into results even if the name
 * score alone is low — ensures scanned Activia shows up when searching "yogur".
 *
 * @param query - Raw search string (≥2 chars recommended).
 * @param allVariants - Merged pool (FOOD_VARIANTS + userVariants) from context.
 * @param n - Maximum results to return (default 20).
 */
export function searchFamilies(
  query: string,
  allVariants: FoodVariant[],
  n = 20,
): FamilySearchResult[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // Index user variants per family for fast lookup
  const userVariantsByFamily = new Map<string, FoodVariant[]>();
  for (const v of allVariants) {
    // User variants have ids starting with 'off_' or 'user_' (per P5 convention)
    if (v.id.startsWith('off_') || v.id.startsWith('user_')) {
      const arr = userVariantsByFamily.get(v.familyId) ?? [];
      arr.push(v);
      userVariantsByFamily.set(v.familyId, arr);
    }
  }

  const results: FamilySearchResult[] = [];

  for (const fam of FOOD_FAMILIES) {
    const canonical = variantById.get(fam.canonicalVariantId);
    if (!canonical) continue;

    // Build the full token corpus for this family (deduped to keep confidence fair)
    const corpusSet = new Set([
      ...tokenize(fam.name),
      ...tokenize(fam.nameEn),
      ...(fam.aliases ?? []).flatMap(a => tokenize(a)),
      ...tokenize(canonical.name),
      ...tokenize(canonical.nameEn),
    ]);

    // Also score against brand variant names within this family (add but don't
    // let many brands push the denominator unboundedly — only add tokens not
    // already in corpus).
    const familyVariants = allVariants.filter(v => v.familyId === fam.id);
    for (const fv of familyVariants) {
      if (fv.brand?.name) tokenize(fv.brand.name).forEach(t => corpusSet.add(t));
    }
    const corpusTokens = Array.from(corpusSet);

    const hits = queryTokens.filter(qt =>
      corpusTokens.some(ct => ct.includes(qt) || qt.includes(ct)),
    );

    const userVariantsForFamily = userVariantsByFamily.get(fam.id) ?? [];

    // A family with user variants for this query gets a lift so it's always surfaced
    const userLift = userVariantsForFamily.length > 0 ? 0.15 : 0;
    const score = corpusTokens.length > 0
      ? hits.length / Math.max(queryTokens.length, corpusTokens.length) + userLift
      : userLift;

    if (score <= 0) continue;

    const topVariants = topVariantsByFamily(fam.id, 3);

    results.push({ family: fam, canonical, topVariants, userVariantsForFamily, score });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/**
 * Top-N variants of a family by a deterministic popularity heuristic
 * (`brand > quality > regional > preparation > user`). Used by AddMeal result
 * previews (P3+) and RecipeDetail swap sheet (P4) to surface "3 marcas
 * populares" without rendering the full list.
 *
 * Real popularity signals require Q6 telemetry (scan counts, recipe mentions,
 * creator preferences). Until then the ordering is fixed — brand-first
 * because the typical drill-down intent post-P2.6 is "which retail option
 * do I have?", and it keeps the placeholder behaviour stable for tests.
 *
 * Canonical is excluded — it's the family's primary view, not a "top variant".
 * Returns `[]` for a family whose only variant is the canonical (valid case
 * for singleton families with no preparation/brand yet).
 */
export function topVariantsByFamily(
  familyId: string,
  n: number,
): FoodVariant[] {
  const order: VariantType[] = ['brand', 'quality', 'regional', 'preparation', 'user'];
  const canonical = getCanonicalVariant(familyId);
  return getVariantsOfFamily(familyId)
    .filter(v => v.id !== canonical?.id)
    .sort((a, b) => {
      const ai = order.indexOf(a.variantType);
      const bi = order.indexOf(b.variantType);
      // Unknown types (shouldn't happen — VariantType is 6-literal) sink to
      // the bottom. `indexOf` returns -1 for absent, so bump to `order.length`.
      const ax = ai === -1 ? order.length : ai;
      const bx = bi === -1 ? order.length : bi;
      return ax - bx;
    })
    .slice(0, n);
}
