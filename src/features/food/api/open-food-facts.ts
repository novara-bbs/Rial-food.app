/**
 * Open Food Facts product search + serving extraction.
 * Returns normalized results with macros per 100g and real serving sizes.
 */

import type { ServingSize } from '../../../types';

export interface OFFResult {
  id: string;
  title: string;
  cal: number;
  pro: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
  servingSizes: ServingSize[];
  isApiResult: true;
}

// ─── Serving parser ──────────────────────────────────────────────────────────

const GRAM_RE = /(\d+\.?\d*)\s*(g|gr|grams?|gramos?)/i;
const ML_RE = /(\d+\.?\d*)\s*(ml|millilitres?|mililitros?|cl|l)\b/i;
const PAREN_RE = /^(.+?)\s*\((\d+\.?\d*)\s*(g|ml|gr)\)/i;

/**
 * Parse OFF serving fields into structured ServingSize[].
 *
 * Examples of `serving_size` from OFF:
 *   "30g", "1 can (330ml)", "1 biscuit (12.5g)", "100 ml", "1 portion (40 g)"
 */
export function parseOFFServings(product: {
  serving_size?: string;
  serving_quantity?: number;
  product_quantity?: string;
}): ServingSize[] {
  const result: ServingSize[] = [];
  let hasDefault = false;

  // 1. Parse `serving_size` string
  if (product.serving_size) {
    const raw = product.serving_size.trim();

    // Try "name (Xg)" or "name (Xml)" pattern
    const parenMatch = raw.match(PAREN_RE);
    if (parenMatch) {
      const name = parenMatch[1].trim();
      const grams = parseFloat(parenMatch[2]);
      if (grams > 0) {
        result.push({
          id: 'serving',
          name: `1 ${name} (${grams}${parenMatch[3]})`,
          nameEn: `1 ${name} (${grams}${parenMatch[3]})`,
          grams,
          isDefault: true,
        });
        hasDefault = true;
      }
    } else {
      // Try plain "Xg" or "Xml" pattern
      const gramMatch = raw.match(GRAM_RE);
      const mlMatch = raw.match(ML_RE);
      const match = gramMatch || mlMatch;
      if (match) {
        let grams = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        // Convert cl→ml, l→ml
        if (unit === 'cl') grams *= 10;
        if (unit === 'l') grams *= 1000;
        if (grams > 0 && grams !== 100) {
          result.push({
            id: 'serving',
            name: `1 porción (${grams}${unit.startsWith('m') || unit === 'cl' || unit === 'l' ? 'ml' : 'g'})`,
            nameEn: `1 serving (${grams}${unit.startsWith('m') || unit === 'cl' || unit === 'l' ? 'ml' : 'g'})`,
            grams,
            isDefault: true,
          });
          hasDefault = true;
        }
      }
    }
  }

  // 2. Use `serving_quantity` as grams if available and no serving parsed yet
  if (!hasDefault && product.serving_quantity && product.serving_quantity > 0 && product.serving_quantity !== 100) {
    const g = product.serving_quantity;
    result.push({
      id: 'serving',
      name: `1 porción (${g}g)`,
      nameEn: `1 serving (${g}g)`,
      grams: g,
      isDefault: true,
    });
    hasDefault = true;
  }

  // 3. Add package serving from `product_quantity`
  if (product.product_quantity) {
    const pqMatch = product.product_quantity.match(/(\d+\.?\d*)\s*(g|ml|kg|l)?/i);
    if (pqMatch) {
      let pqGrams = parseFloat(pqMatch[1]);
      const pqUnit = (pqMatch[2] || 'g').toLowerCase();
      if (pqUnit === 'kg') pqGrams *= 1000;
      if (pqUnit === 'l') pqGrams *= 1000;
      if (pqGrams > 0 && pqGrams !== 100) {
        // Don't duplicate if it's the same as the serving
        const isDuplicate = result.some(r => Math.abs(r.grams - pqGrams) < 1);
        if (!isDuplicate) {
          result.push({
            id: 'package',
            name: `1 envase (${pqGrams}${pqUnit === 'kg' || pqUnit === 'l' ? (pqUnit === 'kg' ? 'g' : 'ml') : pqUnit})`,
            nameEn: `1 package (${pqGrams}${pqUnit === 'kg' || pqUnit === 'l' ? (pqUnit === 'kg' ? 'g' : 'ml') : pqUnit})`,
            grams: pqGrams,
            isDefault: !hasDefault,
          });
          if (!hasDefault) hasDefault = true;
        }
      }
    }
  }

  // 4. Always include 100g fallback
  result.push({
    id: '100g',
    name: '100g',
    nameEn: '100g',
    grams: 100,
    isDefault: !hasDefault,
  });

  return result;
}

// ─── Search API ──────────────────────────────────────────────────────────────

const SEARCH_FIELDS = [
  'id', 'product_name', 'brands', 'nutriments',
  'serving_size', 'serving_quantity', 'product_quantity',
].join(',');

export async function searchOpenFoodFacts(query: string): Promise<OFFResult[]> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=${SEARCH_FIELDS}`,
      { signal: AbortSignal.timeout(5000) },
    );
    const data = await res.json();
    return (data.products || [])
      .filter((p: any) => p.product_name)
      .map((p: any) => ({
        id: `off_${p.id}`,
        title: p.product_name + (p.brands ? ` (${p.brands})` : ''),
        cal: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        pro: parseFloat((p.nutriments?.proteins_100g || 0).toFixed(1)),
        carbs: parseFloat((p.nutriments?.carbohydrates_100g || 0).toFixed(1)),
        fats: parseFloat((p.nutriments?.fat_100g || 0).toFixed(1)),
        fiber: p.nutriments?.fiber_100g ? parseFloat(p.nutriments.fiber_100g.toFixed(1)) : undefined,
        sugar: p.nutriments?.sugars_100g ? parseFloat(p.nutriments.sugars_100g.toFixed(1)) : undefined,
        saturatedFat: p.nutriments?.['saturated-fat_100g'] ? parseFloat(p.nutriments['saturated-fat_100g'].toFixed(1)) : undefined,
        servingSizes: parseOFFServings(p),
        isApiResult: true as const,
      }));
  } catch {
    return [];
  }
}
