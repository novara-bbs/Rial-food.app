/**
 * Recipe Intelligence — orchestrates fuzzy matching + unit conversion
 * to enhance AI-imported ingredients with RIAL dictionary data.
 */
import { matchIngredient, MatchResult } from './fuzzy-match';
import { convertToGrams, scaleMacros, ConversionResult } from './unit-conversion';
import { Macros } from '../../../types';

export interface EnhancedIngredient {
  // Original from AI extraction
  name: string;
  amount: number;
  unit: string;

  // Enhancement results
  match: MatchResult | null;
  conversion: ConversionResult;
  calculatedMacros: Macros | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface RecipeIntelligenceResult {
  ingredients: EnhancedIngredient[];
  totalMacros: Macros;
  matchRate: number; // 0–1, percentage of ingredients matched
}

/**
 * Process a list of AI-extracted ingredients through the intelligence pipeline.
 */
export function enhanceIngredients(
  rawIngredients: { name: string; amount: number; unit: string }[],
): RecipeIntelligenceResult {
  const enhanced: EnhancedIngredient[] = rawIngredients.map(raw => {
    // Step 1: Fuzzy match against dictionary
    const match = matchIngredient(raw.name);

    // Step 2: Convert to grams
    const defaultServing = match?.ingredient.servingSizes.find(s => s.isDefault);
    const conversion = convertToGrams(
      raw.amount,
      raw.unit,
      defaultServing?.grams,
    );

    // Step 3: Calculate macros from dictionary data
    let calculatedMacros: Macros | null = null;
    if (match && match.score >= 0.5) {
      calculatedMacros = scaleMacros(match.ingredient.macros, conversion.grams);
    }

    // Step 4: Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (match && match.score >= 0.7 && conversion.confidence >= 0.8) {
      confidence = 'high';
    } else if (match && match.score >= 0.5 && conversion.confidence >= 0.5) {
      confidence = 'medium';
    }

    return { ...raw, match, conversion, calculatedMacros, confidence };
  });

  // Aggregate total macros from calculated (dictionary) or fallback to raw amounts
  const totalMacros: Macros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  for (const ing of enhanced) {
    if (ing.calculatedMacros) {
      totalMacros.calories += ing.calculatedMacros.calories;
      totalMacros.protein += ing.calculatedMacros.protein;
      totalMacros.carbs += ing.calculatedMacros.carbs;
      totalMacros.fats += ing.calculatedMacros.fats;
    }
  }
  totalMacros.protein = parseFloat(totalMacros.protein.toFixed(1));
  totalMacros.carbs = parseFloat(totalMacros.carbs.toFixed(1));
  totalMacros.fats = parseFloat(totalMacros.fats.toFixed(1));

  const matched = enhanced.filter(i => i.match !== null).length;
  const matchRate = rawIngredients.length > 0 ? matched / rawIngredients.length : 0;

  return { ingredients: enhanced, totalMacros, matchRate };
}
