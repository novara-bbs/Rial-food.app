/**
 * P2.5 helper — group a list of `FoodFamily` entries by `subcategory`.
 *
 * The map key is the subcategory slug (`'aves'`, `'yogur'`, …) or `null` for
 * families that have no subcategory (render flat under their category header).
 * The null-bucket always ships first so ungrouped families don't appear as a
 * floating orphan section at the bottom of the category.
 *
 * Subcategories are ordered by population descending (the most populated
 * subcategory first), with an alphabetic tie-break so ordering stays stable
 * across re-renders for groups of identical size.
 *
 * Both functions are pure — no locale, no i18n lookup. Consumers resolve the
 * display label via `t.foodDictionary.subcategoryLabels[slug]` at render time.
 */
import type { FoodFamily } from '../../../types/food-family';

export type SubcategoryKey = string | null;

export interface SubcategoryGroup {
  subcategoryKey: SubcategoryKey;
  families: FoodFamily[];
}

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
 * Stable ordering: null-bucket first (flat families), then subcategories by
 * population descending, alphabetic tie-break on the slug. Returns [] when
 * the map is empty.
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
