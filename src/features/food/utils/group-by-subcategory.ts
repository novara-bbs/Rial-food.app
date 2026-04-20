/**
 * P2.5 / P7 helper — group a list of `FoodFamily` entries by `subcategory`.
 *
 * The map key is the subcategory slug (`'aves'`, `'yogur'`, …) or `null` for
 * families that have no subcategory (render flat under their category header).
 * The null-bucket always ships first so ungrouped families don't appear as a
 * floating orphan section at the bottom of the category.
 *
 * Ordering:
 *   P2.5 shipped `sortSubcategoriesByPopulation()` — order by family count
 *   descending, alphabetic tie-break. Kept for back-compat but DEPRECATED.
 *
 *   P7 `[1.5.61]` introduces `sortSubcategoriesByOrder(map, category)` —
 *   deterministic ordering via hardcoded `SUBCATEGORY_ORDER[category]`
 *   arrays grouping subcats by macro-cluster (tierra → mar → otros for
 *   proteins; citrus → berries → pomo → hueso for fruits; etc.). Matches
 *   retail conventions (Carrefour Carnicería / Pescadería sections, USDA
 *   MyPlate protein subgroups). Slugs absent from the array fall to the
 *   end in alphabetic order as a defensive fallback.
 *
 * All functions are pure — no locale, no i18n lookup. Consumers resolve the
 * display label via `t.foodDictionary.subcategoryLabels[slug]` at render time.
 */
import type { FoodFamily } from '../../../types/food-family';
import type { IngredientCategory } from '../../../types/food';

export type SubcategoryKey = string | null;

export interface SubcategoryGroup {
  subcategoryKey: SubcategoryKey;
  families: FoodFamily[];
}

/**
 * P7 `[1.5.61]` — hardcoded subcategory ordering per `IngredientCategory`.
 * Macro-cluster grouping (tierra → mar → otros for proteins) matches retail
 * conventions (Carrefour, Mercadona) + USDA MyPlate subgroups.
 *
 * Empty array → category renders flat (no subcategory split).
 * Slug absent from the array → falls to the end in alphabetic order.
 */
export const SUBCATEGORY_ORDER: Record<IngredientCategory, readonly string[]> = {
  proteins: [
    // Tierra (carnes animales)
    'aves', 'vacuno', 'cerdo', 'caza', 'embutidos',
    // Mar
    'pescado-blanco', 'pescado-azul', 'marisco',
    // Otros
    'huevo', 'vegetal',
  ],
  vegetables: [
    'hojas', 'cruciferas', 'solanaceas', 'alliums',
    'cucurbitaceas', 'raices-tuberculos', 'otras',
  ],
  fruits: ['citricos', 'bayas', 'pomo', 'hueso', 'tropicales', 'melon', 'vid'],
  grains: ['arroz', 'pasta-trigo', 'pan', 'pseudocereales'],
  dairy: ['leche', 'yogur', 'queso-fresco', 'queso-curado', 'grasas-lacteas'],
  nuts_seeds: ['frutos-secos', 'semillas', 'mantecas-pastas'],
  pantry: ['endulzantes', 'chocolate-cacao', 'salsas', 'condimentos'],
  prepared: ['bebidas-vegetales', 'snacks'],
  beverages: ['aguas', 'cafe-te', 'zumos', 'refresco', 'energeticas', 'cerveza', 'vino'],
  oils: [],        // sin subcategoría — render plano
  legumes: [],     // sin subcategoría — render plano
  supplements: [], // sin subcategoría — render plano
};

/** Bucket families by `subcategory`. Preserves input order within each bucket. */
export function groupFamiliesBySubcategory(
  families: readonly FoodFamily[],
): Map<SubcategoryKey, FoodFamily[]> {
  const map = new Map<SubcategoryKey, FoodFamily[]>();
  for (const family of families) {
    const key: SubcategoryKey = family.subcategory ?? null;
    const list = map.get(key) ?? [];
    list.push(family);
    map.set(key, list);
  }
  return map;
}

/**
 * P7 `[1.5.61]` — order buckets by `SUBCATEGORY_ORDER[category]`.
 *
 *   null-bucket always first (flat families without subcategory).
 *   Then: slugs in the order declared in `SUBCATEGORY_ORDER[category]`.
 *   Finally: any slug not present in the array, alphabetic tie-break
 *   (defensive fallback — should not happen if `FAMILY_SUBCATEGORY` and
 *   `SUBCATEGORY_ORDER` stay in sync).
 */
export function sortSubcategoriesByOrder(
  map: Map<SubcategoryKey, FoodFamily[]>,
  category: IngredientCategory,
): SubcategoryGroup[] {
  const order = SUBCATEGORY_ORDER[category] ?? [];
  const orderIndex = new Map<string, number>();
  order.forEach((slug, i) => orderIndex.set(slug, i));

  const entries: SubcategoryGroup[] = [];
  for (const [subcategoryKey, families] of map.entries()) {
    entries.push({ subcategoryKey, families });
  }

  entries.sort((a, b) => {
    // null-bucket always first
    if (a.subcategoryKey === null && b.subcategoryKey !== null) return -1;
    if (a.subcategoryKey !== null && b.subcategoryKey === null) return 1;
    if (a.subcategoryKey === null && b.subcategoryKey === null) return 0;

    const aSlug = a.subcategoryKey as string;
    const bSlug = b.subcategoryKey as string;
    const aIdx = orderIndex.get(aSlug);
    const bIdx = orderIndex.get(bSlug);

    // both declared → follow declared order
    if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
    // only a declared → a first
    if (aIdx !== undefined) return -1;
    // only b declared → b first
    if (bIdx !== undefined) return 1;
    // neither declared → alphabetic tie-break (defensive fallback)
    return aSlug.localeCompare(bSlug);
  });

  return entries;
}

/**
 * @deprecated P7 `[1.5.61]` — prefer `sortSubcategoriesByOrder(map, category)`
 * which guarantees stable macro-cluster ordering (tierra → mar → otros for
 * proteins, etc.). Retained for back-compat with existing tests; new callers
 * should pass through `sortSubcategoriesByOrder`.
 */
export function sortSubcategoriesByPopulation(
  map: Map<SubcategoryKey, FoodFamily[]>,
): SubcategoryGroup[] {
  const entries: SubcategoryGroup[] = [];
  for (const [subcategoryKey, families] of map.entries()) {
    entries.push({ subcategoryKey, families });
  }

  entries.sort((a, b) => {
    // null-bucket always first
    if (a.subcategoryKey === null && b.subcategoryKey !== null) return -1;
    if (a.subcategoryKey !== null && b.subcategoryKey === null) return 1;
    if (a.subcategoryKey === null && b.subcategoryKey === null) return 0;

    // population desc
    const diff = b.families.length - a.families.length;
    if (diff !== 0) return diff;

    // alphabetic tie-break on slug
    return (a.subcategoryKey as string).localeCompare(b.subcategoryKey as string);
  });

  return entries;
}
