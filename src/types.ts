export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  avatarUrl?: string;
  connectedDevices: {
    whoop: boolean;
    oura: boolean;
    garmin: boolean;
  };
  dailyTargets: {
    cal: number;
    pro: number;
    carbs: number;
    fats: number;
  };
  dietaryPreferences: string[];
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // ISO string
  status: 'Optimal' | 'Stable' | 'Sluggish' | 'Recovering';
  sleep: number; // hours
  stress: number; // 1-100 scale or similar
  symptoms: string[];
}

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
  saturatedFat?: number; // g
  transFat?: number; // g
  sugar?: number; // g
}

export interface ServingSize {
  name: string; // e.g., "1 cup", "1 tbsp"
  amount: number; // e.g., 250
  unit: string; // e.g., "g" or "ml"
}

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  category: string;
  baseAmount: number; // e.g., 100
  baseUnit: string; // e.g., 'g' or 'ml'
  servingSizes?: ServingSize[];
  macros: Macros;
  micros: Micronutrients;
}

export interface RecipeIngredient {
  id: string; // unique id for the recipe ingredient entry
  ingredientId: string;
  amount: number;
  unit: string;
  ingredient?: Ingredient; // Populated at runtime
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  macros: Macros;
  micros?: Micronutrients; // Calculated total micros
  supplements?: string[]; // Added supplements
  tags: string[];
  ingredients?: string[]; // Legacy string ingredients
  recipeIngredients?: RecipeIngredient[]; // New structured ingredients
  instructions?: string[];
}

export interface ToleranceLog {
  id: string;
  userId: string;
  date: string;
  food: string;
  reaction: 'Severe' | 'Moderate' | 'Mild';
  symptoms: string;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    isPro: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface MealPlanDay {
  day: string;
  meals: Recipe[];
}

export interface AppState {
  user: User | null;
  checkInStatus: DailyCheckIn | null;
  dailyMacros: {
    consumed: { cal: number; pro: number; carbs: number; fats: number };
    target: { cal: number; pro: number; carbs: number; fats: number };
  };
  savedRecipes: Recipe[];
  toleranceLogs: ToleranceLog[];
  mealPlan: MealPlanDay[];
  shoppingList: string[];
}
