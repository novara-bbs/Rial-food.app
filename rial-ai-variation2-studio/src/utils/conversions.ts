export const CONVERSIONS = {
  // Weight: g to oz
  gToOz: (g: number) => g * 0.035274,
  ozToG: (oz: number) => oz * 28.3495,
  
  // Volume: ml to cups
  mlToCups: (ml: number) => ml * 0.00422675,
  cupsToMl: (ml: number) => ml * 236.588,
  
  // Volume: ml to tbsp
  mlToTbsp: (ml: number) => ml * 0.067628,
  tbspToMl: (tbsp: number) => tbsp * 14.7868,
  
  // Volume: ml to tsp
  mlToTsp: (ml: number) => ml * 0.202884,
  tspToMl: (tsp: number) => tsp * 4.92892,
};

export type UnitSystem = 'metric' | 'imperial';

export interface Ingredient {
  name: string;
  amount: number; // base amount in metric (g or ml)
  unit: 'g' | 'ml';
}

export function formatIngredient(ingredient: Ingredient, servings: number, system: UnitSystem) {
  const totalAmount = ingredient.amount * servings;
  
  if (system === 'metric') {
    if (ingredient.unit === 'g' && totalAmount >= 1000) {
      return `${(totalAmount / 1000).toFixed(1)} kg`;
    }
    if (ingredient.unit === 'ml' && totalAmount >= 1000) {
      return `${(totalAmount / 1000).toFixed(1)} L`;
    }
    return `${Math.round(totalAmount)} ${ingredient.unit}`;
  } else {
    if (ingredient.unit === 'g') {
      const oz = CONVERSIONS.gToOz(totalAmount);
      if (oz >= 16) {
        return `${(oz / 16).toFixed(1)} lb`;
      }
      return `${oz.toFixed(1)} oz`;
    } else {
      // ml to imperial volumes
      const cups = CONVERSIONS.mlToCups(totalAmount);
      if (cups >= 1) {
        return `${cups.toFixed(1)} cups`;
      }
      const tbsp = CONVERSIONS.mlToTbsp(totalAmount);
      if (tbsp >= 1) {
        return `${tbsp.toFixed(1)} tbsp`;
      }
      return `${CONVERSIONS.mlToTsp(totalAmount).toFixed(1)} tsp`;
    }
  }
}
