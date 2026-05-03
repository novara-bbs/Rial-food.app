export interface Micronutrients {
  vitamins: {
    vitaminA?: number; // mcg
    vitaminC?: number; // mg
    vitaminD?: number; // mcg
    vitaminE?: number; // mg
    vitaminK?: number; // mcg
    vitaminB6?: number; // mg
    vitaminB12?: number; // mcg
    folate?: number; // mcg (B9)
    niacin?: number; // mg (B3)
    riboflavin?: number; // mg (B2)
    thiamin?: number; // mg (B1)
    // Sprint A1 — added so the "Vitaminas" tab in NutritionDetail can show
    // the full 13-vitamin RDA panel. Optional, so seed coverage stays valid.
    pantothenicAcid?: number; // mg (B5)
    biotin?: number; // mcg (B7)
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
    // P12 [1.5.70] — added for España-basics expansion (pescados, mariscos,
    // cereales integrales, especias). Not every ingredient populates them —
    // all optional, so existing seed entries remain valid.
    iodine?: number; // mcg
    manganese?: number; // mg
    copper?: number; // mg
    // Sprint A1 — added so the "Minerales" tab in NutritionDetail can show
    // the full 14-mineral RDA panel. Optional, so seed coverage stays valid.
    chloride?: number; // mg
    chromium?: number; // mcg
    molybdenum?: number; // mcg
  };
  others: {
    fiber?: number; // g
    cholesterol?: number; // mg
    // P12 [1.5.70] — added to expose caffeine content for teas/coffee
    // already in seed (useful downstream for sleep / evening coaching).
    caffeine?: number; // mg
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

/**
 * Flat nutrition entity. Kept for back-compat during the food-family
 * migration — see `FoodVariant` in `./food-family.ts`. New code should consume
 * variants via the resolver helpers in `features/food/utils/food-family-resolver.ts`.
 * The legacy `INGREDIENT_DICTIONARY` array in `features/food/data/ingredients.ts`
 * is a compat projection derived from `FOOD_VARIANTS`.
 *
 * @deprecated prefer `FoodVariant` + `FoodFamily` from `./food-family.ts`.
 */
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

/**
 * Recipe ingredient reference. Dual-shape during the food-family migration:
 *
 * - `familyId` (+ optional `variantId`) is the new canonical shape. Resolution
 *   order at render time: `variantId` → `userProfile.variantPreferences[familyId]`
 *   (future P6) → `family.canonicalVariantId`.
 * - `ingredientId` is the legacy single-pointer shape. Still accepted by the
 *   zod schema for hydration of pre-migration user data; consumers should
 *   resolve it through `ingredientIdToFamilyVariant()` to derive `familyId`.
 *
 * At least one of `familyId` or `ingredientId` must be present. Both are
 * optional at the type level so progressive migration is ergonomic.
 */
export interface RecipeIngredient {
  id: string; // unique id for the recipe ingredient entry
  familyId?: string;
  variantId?: string;
  /**
   * @deprecated use `familyId` + `variantId`. Retained for hydration of
   * pre-migration `savedRecipes` payloads.
   */
  ingredientId?: string;
  amount: number;
  unit: string;
  ingredient?: Ingredient; // Populated at runtime
}

/**
 * Duck-typed union accepted by `handleLogMeal` and `handleLogMealNow`.
 * Covers three concrete callers:
 * - Dictionary `Ingredient` (flat fields: cal, pro, carbs, fats, grams)
 * - `Recipe` (macros sub-object + recipeIngredients)
 * - Custom log objects from HomeQuickLog / BarcodeScanner (mixed shape)
 */
export interface LoggableMeal {
  id?: string | number;
  title?: string;
  name?: string;
  /** Flat macro fields (Ingredient / BarcodeScanner shape) */
  cal?: number;
  pro?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  grams?: number;
  portionDescription?: string;
  mealSlot?: string;
  time?: string;
  servingUsed?: string;
  servings?: number;
  steps?: unknown;
  isApiResult?: boolean;
  /** Recipe-style macro sub-object */
  macros?: { calories?: number; protein?: number; carbs?: number; fats?: number; fiber?: number };
  image?: string;
  /** @deprecated Legacy alias of `image`. Read by handlers as fallback for older mealPlan data. */
  img?: string;
  recipeIngredients?: Array<{
    ingredientId?: string;
    id?: string;
    amount?: number;
    unit?: string;
    ingredient?: { name?: string; baseUnit?: string; category?: string };
    name?: string;
  }>;
}
