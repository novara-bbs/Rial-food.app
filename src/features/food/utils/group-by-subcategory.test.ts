/**
 * Unit tests for the P2.5 subcategory grouping helpers.
 *
 * Locks the ordering contract — null bucket first, then population descending,
 * alphabetic tie-break — because the FoodDictionary layout depends on it.
 */
import { describe, it, expect } from 'vitest';
import type { FoodFamily } from '../../../types/food-family';
import {
  groupFamiliesBySubcategory,
  sortSubcategoriesByPopulation,
  sortSubcategoriesByOrder,
  SUBCATEGORY_ORDER,
} from './group-by-subcategory';

// Small helper to avoid stubbing the whole FoodFamily shape when we only
// care about `subcategory` + `id` in ordering tests.
function fam(id: string, subcategory?: string): FoodFamily {
  return {
    id,
    name: id,
    nameEn: id,
    description: '',
    descriptionEn: '',
    category: 'proteins',
    canonicalVariantId: `${id}_canonical`,
    variantIds: [`${id}_canonical`],
    tags: [],
    ...(subcategory ? { subcategory } : {}),
  };
}

describe('groupFamiliesBySubcategory', () => {
  it('buckets families by slug, preserves input order within each bucket', () => {
    const families = [
      fam('a', 'aves'),
      fam('b', 'vacuno'),
      fam('c', 'aves'),
    ];
    const map = groupFamiliesBySubcategory(families);
    expect(map.get('aves')?.map(f => f.id)).toEqual(['a', 'c']);
    expect(map.get('vacuno')?.map(f => f.id)).toEqual(['b']);
  });

  it('buckets families without subcategory under null', () => {
    const families = [fam('a'), fam('b', 'aves'), fam('c')];
    const map = groupFamiliesBySubcategory(families);
    expect(map.get(null)?.map(f => f.id)).toEqual(['a', 'c']);
    expect(map.get('aves')?.map(f => f.id)).toEqual(['b']);
  });

  it('returns an empty map for empty input', () => {
    expect(groupFamiliesBySubcategory([]).size).toBe(0);
  });
});

describe('sortSubcategoriesByPopulation', () => {
  it('puts the null-bucket first', () => {
    const map = groupFamiliesBySubcategory([
      fam('a', 'aves'),
      fam('b'),
      fam('c', 'aves'),
      fam('d'),
    ]);
    const sorted = sortSubcategoriesByPopulation(map);
    expect(sorted[0].subcategoryKey).toBeNull();
  });

  it('orders subcategories by population descending', () => {
    const map = groupFamiliesBySubcategory([
      fam('a', 'aves'),
      fam('b', 'vacuno'),
      fam('c', 'vacuno'),
      fam('d', 'vacuno'),
      fam('e', 'aves'),
    ]);
    const sorted = sortSubcategoriesByPopulation(map);
    expect(sorted.map(g => g.subcategoryKey)).toEqual(['vacuno', 'aves']);
  });

  it('alphabetic tie-break on equal population', () => {
    const map = groupFamiliesBySubcategory([
      fam('a', 'vacuno'),
      fam('b', 'aves'),
      fam('c', 'cerdo'),
    ]);
    const sorted = sortSubcategoriesByPopulation(map);
    // all size=1, tie-break alphabetical: aves < cerdo < vacuno
    expect(sorted.map(g => g.subcategoryKey)).toEqual(['aves', 'cerdo', 'vacuno']);
  });

  it('returns empty array for empty map', () => {
    expect(sortSubcategoriesByPopulation(new Map())).toEqual([]);
  });

  it('handles null-only map (all families flat, no subcategory)', () => {
    const map = groupFamiliesBySubcategory([fam('a'), fam('b'), fam('c')]);
    const sorted = sortSubcategoriesByPopulation(map);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].subcategoryKey).toBeNull();
    expect(sorted[0].families.map(f => f.id)).toEqual(['a', 'b', 'c']);
  });
});

// --- P7 [1.5.61] ---

describe('SUBCATEGORY_ORDER', () => {
  it('declares the full 12 IngredientCategory entries', () => {
    const keys = Object.keys(SUBCATEGORY_ORDER);
    expect(keys.sort()).toEqual(
      [
        'beverages',
        'dairy',
        'fruits',
        'grains',
        'legumes',
        'nuts_seeds',
        'oils',
        'pantry',
        'prepared',
        'proteins',
        'supplements',
        'vegetables',
      ].sort(),
    );
  });

  it('declares proteins in macro-cluster order (tierra → mar → otros)', () => {
    expect(SUBCATEGORY_ORDER.proteins).toEqual([
      'aves',
      'vacuno',
      'cerdo',
      'caza',
      'embutidos',
      'pescado-blanco',
      'pescado-azul',
      'marisco',
      'huevo',
      'vegetal',
    ]);
  });

  it('leaves oils/legumes/supplements empty (flat render)', () => {
    expect(SUBCATEGORY_ORDER.oils).toEqual([]);
    expect(SUBCATEGORY_ORDER.legumes).toEqual([]);
    expect(SUBCATEGORY_ORDER.supplements).toEqual([]);
  });
});

describe('sortSubcategoriesByOrder', () => {
  it('proteins orders tierra before mar before otros', () => {
    // 1 family each — would be alphabetic under sortSubcategoriesByPopulation
    // (aves, cerdo, huevo, marisco, pescado-azul, vacuno, vegetal).
    const map = groupFamiliesBySubcategory([
      fam('huevo1', 'huevo'),
      fam('mar1', 'marisco'),
      fam('pav1', 'pescado-azul'),
      fam('vac1', 'vacuno'),
      fam('ave1', 'aves'),
      fam('ceg1', 'vegetal'),
      fam('cer1', 'cerdo'),
    ]);
    const sorted = sortSubcategoriesByOrder(map, 'proteins');
    expect(sorted.map(g => g.subcategoryKey)).toEqual([
      'aves',
      'vacuno',
      'cerdo',
      'pescado-azul',
      'marisco',
      'huevo',
      'vegetal',
    ]);
  });

  it('null-bucket always first even when proteins order defined', () => {
    const map = groupFamiliesBySubcategory([
      fam('ave1', 'aves'),
      fam('ung', undefined),
    ]);
    const sorted = sortSubcategoriesByOrder(map, 'proteins');
    expect(sorted[0].subcategoryKey).toBeNull();
    expect(sorted[1].subcategoryKey).toBe('aves');
  });

  it('slug not in SUBCATEGORY_ORDER falls to end in alphabetic order', () => {
    // 'unknown-slug-a' and 'unknown-slug-b' aren't declared in proteins order.
    const map = groupFamiliesBySubcategory([
      fam('u1', 'unknown-slug-b'),
      fam('ave1', 'aves'),
      fam('u2', 'unknown-slug-a'),
    ]);
    const sorted = sortSubcategoriesByOrder(map, 'proteins');
    expect(sorted.map(g => g.subcategoryKey)).toEqual([
      'aves',
      'unknown-slug-a',
      'unknown-slug-b',
    ]);
  });

  it('handles empty SUBCATEGORY_ORDER (oils/legumes/supplements) by falling back to alphabetic', () => {
    const map = groupFamiliesBySubcategory([
      fam('a', 'zeta'),
      fam('b', 'alfa'),
      fam('c', 'mid'),
    ]);
    const sorted = sortSubcategoriesByOrder(map, 'oils');
    expect(sorted.map(g => g.subcategoryKey)).toEqual(['alfa', 'mid', 'zeta']);
  });
});
