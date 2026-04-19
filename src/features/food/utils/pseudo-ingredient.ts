/**
 * Pseudo-Ingredient helpers — wrap external food sources (Open Food Facts API
 * results, manually scanned barcodes) as temporary `Ingredient` objects so they
 * can flow through `PortionSelector` / `PortionSheet` without special cases.
 *
 * Extracted in Wave 2 (S3 Diccionario audit) — prior to this, AddMeal.tsx and
 * BarcodeScanner.tsx each maintained their own near-identical builder, which
 * drifted in subtle ways (one set `description = brand`, the other left it
 * empty; only one shipped a `servingSizes` fallback). Consolidating here
 * guarantees both surfaces emit an `Ingredient` shape identical to what the
 * dictionary seed produces, so `PortionSelector` doesn't need branch logic.
 */
import type { Ingredient, ServingSize } from '../../../types';
import type { OFFResult } from '../api/open-food-facts';

/**
 * Fallback serving sizes for external sources that don't declare their own
 * (rare for OFF, common for manually scanned products before OFF enrichment).
 * 100g is the canonical default so `baseAmount: 100` stays consistent.
 */
export const DEFAULT_GRAM_SERVING_SIZES: ServingSize[] = [
  { id: '100g', name: '100g', nameEn: '100g', grams: 100, isDefault: true },
  { id: '50g', name: '50g', nameEn: '50g', grams: 50 },
  { id: '150g', name: '150g', nameEn: '150g', grams: 150 },
  { id: '200g', name: '200g', nameEn: '200g', grams: 200 },
];

/**
 * Scanned barcode product shape — kept here (not in BarcodeScanner.tsx) so the
 * utility and the consumer share a single definition. BarcodeScanner re-exports
 * for call-site compatibility.
 */
export interface ScannedProduct {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
  barcode: string;
  image?: string;
  /** Real serving sizes parsed from Open Food Facts (optional) */
  servingSizes?: ServingSize[];
}

/** Shared skeleton — fills everything except name/description/servingSizes/id. */
function pseudoIngredientBase(
  id: string,
  name: string,
  description: string,
  servingSizes: ServingSize[],
  macros: Ingredient['macros'],
): Ingredient {
  return {
    id,
    name,
    nameEn: name,
    description,
    descriptionEn: description,
    category: 'prepared',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes,
    macros,
    micros: { vitamins: {}, minerals: {}, others: {} },
    tags: [],
    allergens: [],
  };
}

/** Convert an Open Food Facts API result into a temporary `Ingredient`. */
export function offResultToIngredient(food: OFFResult): Ingredient {
  return pseudoIngredientBase(
    food.id,
    food.title,
    '', // OFF results don't carry brand as a separate description
    food.servingSizes,
    {
      calories: food.cal,
      protein: food.pro,
      carbs: food.carbs,
      fats: food.fats,
      fiber: food.fiber,
      sugar: food.sugar,
      saturatedFat: food.saturatedFat,
    },
  );
}

/** Convert a scanned barcode product into a temporary `Ingredient`. */
export function scannedProductToIngredient(product: ScannedProduct): Ingredient {
  const servingSizes: ServingSize[] =
    product.servingSizes && product.servingSizes.length > 0
      ? product.servingSizes
      : DEFAULT_GRAM_SERVING_SIZES;

  return pseudoIngredientBase(
    `scanned_${product.barcode}`,
    product.name,
    product.brand || '',
    servingSizes,
    {
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fats: product.fats,
      fiber: product.fiber,
      sugar: product.sugar,
      saturatedFat: product.saturatedFat,
    },
  );
}
