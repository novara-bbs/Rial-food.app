export interface Micronutrients {
  vitamins: {
    vitaminA?: number; // mcg
    vitaminC?: number; // mg
    vitaminD?: number; // mcg
    vitaminE?: number; // mg
    vitaminK?: number; // mcg
    vitaminB6?: number; // mg
    vitaminB12?: number; // mcg
    folate?: number; // mcg
    niacin?: number; // mg
    riboflavin?: number; // mg
    thiamin?: number; // mg
  };
  minerals: {
    iron?: number; // mg
    calcium?: number; // mg
    potassium?: number; // mg
    sodium?: number; // mg
    magnesium?: number; // mg
    zinc?: number; // mg
    phosphorus?: number; // mg
    selenium?: number; // mcg
  };
  others: {
    fiber?: number; // g
    cholesterol?: number; // mg
  };
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number; // g
  sugar?: number; // g
  saturatedFat?: number; // g
  transFat?: number; // g
}

export type IngredientCategory =
  | 'proteins' | 'vegetables' | 'fruits' | 'grains' | 'legumes'
  | 'dairy' | 'oils' | 'nuts_seeds' | 'pantry' | 'prepared'
  | 'supplements' | 'beverages';

export type FoodTag =
  | 'high-protein' | 'low-carb' | 'high-fiber' | 'low-fat'
  | 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free'
  | 'keto-friendly' | 'whole-grain' | 'omega-3' | 'antioxidant'
  | 'fermented' | 'raw' | 'sugar-free';

export type Allergen =
  | 'gluten' | 'dairy' | 'eggs' | 'nuts' | 'peanuts'
  | 'soy' | 'fish' | 'shellfish' | 'sesame' | 'celery'
  | 'mustard' | 'sulfites';

export interface ServingSize {
  id: string;
  name: string;
  nameEn: string;
  grams: number;
  isDefault?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: IngredientCategory;
  baseAmount: number; // always 100
  baseUnit: string; // 'g' or 'ml'
  servingSizes: ServingSize[];
  macros: Macros;
  micros: Micronutrients;
  tags: FoodTag[];
  allergens: Allergen[];
}

export interface RecipeIngredient {
  id: string; // unique id for the recipe ingredient entry
  ingredientId: string;
  amount: number;
  unit: string;
  ingredient?: Ingredient; // Populated at runtime
}
