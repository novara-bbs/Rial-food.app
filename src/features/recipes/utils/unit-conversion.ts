/**
 * Unit normalization and conversion to grams.
 * Covers common recipe units in both Spanish and English.
 */

/** Volume-to-ml conversion factors */
const VOLUME_TO_ML: Record<string, number> = {
  // English
  'cup': 240, 'cups': 240,
  'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
  'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
  'fl oz': 30, 'fluid ounce': 30,
  'ml': 1, 'milliliter': 1, 'milliliters': 1,
  'l': 1000, 'liter': 1000, 'liters': 1000,
  // Spanish
  'taza': 240, 'tazas': 240,
  'cda': 15, 'cucharada': 15, 'cucharadas': 15,
  'cdta': 5, 'cucharadita': 5, 'cucharaditas': 5,
  'litro': 1000, 'litros': 1000,
};

/** Weight-to-grams conversion factors */
const WEIGHT_TO_G: Record<string, number> = {
  'g': 1, 'gram': 1, 'grams': 1, 'gramo': 1, 'gramos': 1,
  'kg': 1000, 'kilogram': 1000, 'kilograms': 1000, 'kilo': 1000, 'kilos': 1000,
  'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35, 'onza': 28.35, 'onzas': 28.35,
  'lb': 453.6, 'pound': 453.6, 'pounds': 453.6, 'libra': 453.6, 'libras': 453.6,
};

/** Count-based units (average grams per piece, rough estimates) */
const PIECE_UNITS = new Set([
  'ud', 'unidad', 'unidades', 'piece', 'pieces', 'pieza', 'piezas',
  'diente', 'dientes', // garlic cloves
  'rebanada', 'rebanadas', 'slice', 'slices',
  'hoja', 'hojas', 'leaf', 'leaves',
  'ramita', 'rama', 'sprig', 'sprigs',
  'pizca', 'pinch',
  'puñado', 'handful',
]);

export type ConversionResult = {
  grams: number;
  method: 'weight' | 'volume' | 'serving' | 'piece' | 'unknown';
  confidence: number; // 0–1
};

/**
 * Convert an amount + unit to grams.
 *
 * @param amount - numeric amount from recipe
 * @param unit - unit string (e.g., "cups", "g", "ud", "cda")
 * @param servingGrams - optional: grams per serving from dictionary ServingSize
 * @param densityGPerMl - optional: density for volume conversion (default ~1 for water-like)
 */
export function convertToGrams(
  amount: number,
  unit: string,
  servingGrams?: number,
  densityGPerMl = 1,
): ConversionResult {
  const u = unit.toLowerCase().trim();

  // Direct weight conversion
  if (WEIGHT_TO_G[u] != null) {
    return { grams: Math.round(amount * WEIGHT_TO_G[u]), method: 'weight', confidence: 1 };
  }

  // Volume → ml → grams (using density)
  if (VOLUME_TO_ML[u] != null) {
    const ml = amount * VOLUME_TO_ML[u];
    return { grams: Math.round(ml * densityGPerMl), method: 'volume', confidence: 0.8 };
  }

  // Count-based with serving size from dictionary
  if (PIECE_UNITS.has(u) && servingGrams) {
    return { grams: Math.round(amount * servingGrams), method: 'serving', confidence: 0.9 };
  }

  // Count-based without serving data — rough estimate
  if (PIECE_UNITS.has(u)) {
    return { grams: Math.round(amount * 100), method: 'piece', confidence: 0.4 };
  }

  // Unknown unit — assume grams if bare number or pass through
  if (u === '' || u === '-') {
    return { grams: Math.round(amount), method: 'weight', confidence: 0.5 };
  }

  // Last resort
  return { grams: Math.round(amount), method: 'unknown', confidence: 0.3 };
}

/**
 * Scale macros from per-100g base to actual grams.
 */
export function scaleMacros(
  macrosPer100g: { calories: number; protein: number; carbs: number; fats: number; fiber?: number; sugar?: number; saturatedFat?: number; transFat?: number },
  grams: number,
): typeof macrosPer100g {
  const factor = grams / 100;
  return {
    calories: Math.round(macrosPer100g.calories * factor),
    protein: parseFloat((macrosPer100g.protein * factor).toFixed(1)),
    carbs: parseFloat((macrosPer100g.carbs * factor).toFixed(1)),
    fats: parseFloat((macrosPer100g.fats * factor).toFixed(1)),
    ...(macrosPer100g.fiber != null && { fiber: parseFloat((macrosPer100g.fiber * factor).toFixed(1)) }),
    ...(macrosPer100g.sugar != null && { sugar: parseFloat((macrosPer100g.sugar * factor).toFixed(1)) }),
    ...(macrosPer100g.saturatedFat != null && { saturatedFat: parseFloat((macrosPer100g.saturatedFat * factor).toFixed(1)) }),
    ...(macrosPer100g.transFat != null && { transFat: parseFloat((macrosPer100g.transFat * factor).toFixed(1)) }),
  };
}
