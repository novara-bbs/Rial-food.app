import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { Recipe, DailyCheckIn as DailyCheckInType } from '../types';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useNavigation } from './NavigationContext';
import { INGREDIENT_DICTIONARY } from '../data/ingredients';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppStateContextType {
  // Profile & session
  isPro: boolean;
  setIsPro: (v: boolean) => void;
  showAIBot: boolean;
  setShowAIBot: (v: boolean) => void;
  isFirstTime: boolean;
  setIsFirstTime: (v: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (v: UserProfile) => void;

  // Macros & vitals
  dailyMacros: DailyMacros;
  setDailyMacros: (v: DailyMacros | ((prev: DailyMacros) => DailyMacros)) => void;
  hydration: { consumed: number; target: number };
  setHydration: (v: any) => void;
  movement: { steps: number; target: number; activeMinutes: number; activeTarget: number };
  setMovement: (v: any) => void;
  dailyGoal: string;
  setDailyGoal: (v: string) => void;

  // Content
  savedRecipes: Recipe[];
  setSavedRecipes: (v: any) => void;
  mealPlan: Record<number, any[]>;
  setMealPlan: (v: any) => void;
  shoppingList: ShoppingItem[];
  setShoppingList: (v: any) => void;
  communityPosts: any[];
  setCommunityPosts: (v: any) => void;
  toleranceLogs: any[];
  setToleranceLogs: (v: any) => void;
  realFeelLogs: any[];
  setRealFeelLogs: (v: any) => void;

  // Check-in
  checkInStatus: DailyCheckInType | null;
  setCheckInStatus: (v: any) => void;

  // Misc
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (v: Recipe | null) => void;
  targetPlanDay: number | null;
  setTargetPlanDay: (v: number | null) => void;
  dictionary: typeof INGREDIENT_DICTIONARY;

  // Handlers
  handleLogMeal: (meal: any) => void;
  handleLogMealNow: (meal: any, servings: number) => void;
  handleSaveRecipe: (recipe: any) => void;
  handleCreatePost: (content: string, performance?: any) => void;
  handleAddComment: (postId: number, commentText: string) => void;
  handleAddToleranceLog: (log: any) => void;
  handleCreateRecipeSubmit: (recipe: any) => void;
  handleRealFeelLog: (entry: any) => void;
  handleImportRecipe: (recipe: any) => void;
  handleAddToPlan: (recipe: any, dayIndex: number) => void;
  handleCheckIn: (status?: string) => void;
  handleCompleteCheckIn: (data: any) => void;
  navigateToRecipe: (recipe: any) => void;
}

interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  goal: string;
  activity: string;
  trains: boolean;
  dietaryPreferences: string[];
}

interface DailyMacros {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { navigateTo, currentScreen, previousScreen } = useNavigation();

  // UI state (not persisted)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [targetPlanDay, setTargetPlanDay] = useState<number | null>(null);

  // Persisted state
  const [isPro, setIsPro] = useLocalStorageState<boolean>('isPro', false);
  const [showAIBot, setShowAIBot] = useLocalStorageState<boolean>('showAIBot', true);
  const [isFirstTime, setIsFirstTime] = useLocalStorageState<boolean>('isFirstTime', true);
  const [checkInStatus, setCheckInStatus] = useLocalStorageState<DailyCheckInType | null>('checkInStatus', null);

  const [userProfile, setUserProfile] = useLocalStorageState<UserProfile>('userProfile', {
    name: '',
    age: 32,
    height: 175,
    weight: 78,
    gender: 'female',
    goal: 'maintain',
    activity: 'active',
    trains: false,
    dietaryPreferences: ['Alta Proteína'],
  });

  const [dailyMacros, setDailyMacros] = useLocalStorageState<DailyMacros>('dailyMacros', {
    consumed: { cal: 840, pro: 45, carbs: 110, fats: 25 },
    target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
  });

  const [hydration, setHydration] = useLocalStorageState('hydration', { consumed: 4, target: 10 });

  const [movement, setMovement] = useLocalStorageState('movement', {
    steps: 6432,
    target: 10000,
    activeMinutes: 24,
    activeTarget: 45,
  });

  const [dailyGoal, setDailyGoal] = useLocalStorageState('dailyGoal', 'Bebe 2L de agua hoy');

  const [savedRecipes, setSavedRecipes] = useLocalStorageState<any[]>('savedRecipes', [
    {
      id: 1,
      title: 'Bol de Salmón Vibrante',
      description: 'Un bol lleno de nutrientes con salmón salvaje, quinoa y aguacate fresco.',
      prepTime: '10M', cookTime: '20M', difficulty: 'Medio',
      macros: { calories: 740, protein: 52, carbs: 45, fats: 38, saturatedFat: 5, transFat: 0, sugar: 2 },
      img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
      tag: 'GUARDADO',
      recipeIngredients: [
        { id: 'ri_1', ingredientId: 'ing_2', amount: 200, unit: 'g' },
        { id: 'ri_2', ingredientId: 'ing_3', amount: 150, unit: 'g' },
        { id: 'ri_3', ingredientId: 'ing_4', amount: 50, unit: 'g' },
      ],
      micros: { vitamins: { vitaminD: 20 }, minerals: { iron: 2.8, potassium: 1226, sodium: 59 }, others: { fiber: 7.5 } },
    },
    {
      id: 2,
      title: 'Bol de Pollo y Quinoa',
      description: 'Bol de preparación de comidas simple y efectivo con pechuga de pollo magra y quinoa.',
      prepTime: '10M', cookTime: '25M', difficulty: 'Fácil',
      macros: { calories: 550, protein: 45, carbs: 40, fats: 10, saturatedFat: 1, transFat: 0, sugar: 1 },
      img: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
      tag: 'GUARDADO',
      recipeIngredients: [
        { id: 'ri_4', ingredientId: 'ing_1', amount: 150, unit: 'g' },
        { id: 'ri_5', ingredientId: 'ing_3', amount: 150, unit: 'g' },
        { id: 'ri_6', ingredientId: 'ing_6', amount: 100, unit: 'g' },
      ],
      micros: { vitamins: { vitaminC: 89 }, minerals: { iron: 2.2, potassium: 588, sodium: 148 }, others: { fiber: 5.4 } },
    },
    {
      id: 3,
      title: 'Bol de Avena Energético',
      description: 'Desayuno alto en proteínas para empezar bien el día.',
      prepTime: '5M', cookTime: '10M', difficulty: 'Fácil',
      macros: { calories: 450, protein: 30, carbs: 50, fats: 12, saturatedFat: 2, transFat: 0, sugar: 5 },
      img: 'https://images.unsplash.com/photo-1517673400267-0251240c3562?auto=format&fit=crop&w=600&q=80',
      tag: 'GUARDADO',
      recipeIngredients: [
        { id: 'ri_7', ingredientId: 'ing_8', amount: 30, unit: 'g' },
        { id: 'ri_8', ingredientId: 'ing_9', amount: 30, unit: 'g' },
      ],
      micros: { vitamins: {}, minerals: { calcium: 176, iron: 1.1, potassium: 444, sodium: 126 }, others: { fiber: 3.5 } },
    },
  ]);

  const [mealPlan, setMealPlan] = useLocalStorageState<Record<number, any[]>>('mealPlan', {
    0: [],
    1: [
      { id: 101, time: '07:30', type: 'DESAYUNO', title: 'Avena Cortada en Acero + Suero', cal: 450, tag: 'PREPARACIÓN' },
      { id: 102, time: '13:00', type: 'ALMUERZO', title: 'Chili de Bisonte con Quinoa', cal: 680, tag: 'SOBRAS' },
    ],
    2: [], 3: [], 4: [], 5: [], 6: [],
  });

  const [shoppingList, setShoppingList] = useLocalStorageState<ShoppingItem[]>('shoppingList', [
    { id: 1, name: 'Salmón Salvaje (1.5 lbs)', category: 'Carne y Pescado', checked: false },
    { id: 2, name: 'Pechuga de Pollo (2 lbs)', category: 'Carne y Pescado', checked: true },
    { id: 3, name: 'Quinoa (1 bolsa)', category: 'Despensa', checked: false },
    { id: 4, name: 'Edamame (Congelado)', category: 'Frutas y Verduras', checked: false },
    { id: 5, name: 'Aguacate (3)', category: 'Frutas y Verduras', checked: false },
    { id: 6, name: 'Salsa de Soja (Baja en Sodio)', category: 'Despensa', checked: true },
  ]);

  const [communityPosts, setCommunityPosts] = useLocalStorageState<any[]>('communityPosts', [
    {
      id: 1,
      author: { name: 'Marcus Vance', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=100&q=80', role: 'Entrenador de Salud', time: 'Hace 2h' },
      content: 'Enfocado en la nutrición esta semana. La calidad del sueño está dando sus frutos. Listo para arrasar en la sesión de entrenamiento de hoy.',
      likes: 342, comments: 24,
      type: 'performance',
      performance: { recovery: 98, strain: 18.4 },
      commentsList: [{ id: 101, text: '¡Modo bestia activado! 🔥', author: 'Coach Ali', time: 'Hace 1h' }],
    },
    {
      id: 2,
      author: { name: 'Elara K.', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=100&q=80', role: 'Atleta', time: 'Hace 5h' },
      content: 'Cambié la avena estándar por el Bol de Nutrientes Energético. La digestión es 10 veces mejor.',
      likes: 892, comments: 56,
      type: 'recipe',
      recipe: { title: 'Bol de Nutrientes Energético', cal: 680, pro: 55, time: '15M', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80', tag: 'Alta Proteína' },
      commentsList: [{ id: 102, text: '¡Necesito esta receta!', author: 'Sarah J.', time: 'Hace 2h' }],
    },
  ]);

  const [toleranceLogs, setToleranceLogs] = useLocalStorageState<any[]>('toleranceLogs', [
    { id: 1, ingredient: 'Avena Cortada en Acero', level: 'optimal', notes: 'Energía sostenida durante más de 4 horas. Sin hinchazón.' },
    { id: 2, ingredient: 'Concentrado de Suero', level: 'inflammation', notes: 'Leve malestar digestivo y letargo post-consumo.' },
    { id: 3, ingredient: 'Mantequilla de Almendras', level: 'neutral', notes: 'Buena energía, pero pesada si se consume muy cerca del entrenamiento.' },
  ]);

  const [realFeelLogs, setRealFeelLogs] = useLocalStorageState<any[]>('realFeelLogs', []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const navigateToRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    navigateTo('recipe-detail');
  };

  const handleCheckIn = (status?: string) => {
    if (status) setCheckInStatus({ status: status as any } as any);
    navigateTo('daily-check-in');
  };

  const handleCompleteCheckIn = (data: any) => {
    setCheckInStatus(data);
    toast.success('¡Check-in diario completado!');
    navigateTo('home');
  };

  const handleLogMeal = (meal: any) => {
    if (targetPlanDay !== null) {
      setMealPlan((prev: Record<number, any[]>) => ({
        ...prev,
        [targetPlanDay]: [...(prev[targetPlanDay] || []), { ...meal, time: 'Planeado', type: 'Comida' }],
      }));
      if (meal.recipeIngredients?.length > 0) {
        setShoppingList((prev: ShoppingItem[]) => [
          ...prev,
          ...meal.recipeIngredients.map((ri: any, idx: number) => ({
            id: Date.now() + idx,
            name: `${ri.ingredient?.name || ri.name || 'Ingrediente'} (${ri.amount}${ri.ingredient?.baseUnit || ri.unit || ''})`,
            category: ri.ingredient?.category || 'Otros',
            checked: false,
          })),
        ]);
      } else {
        setShoppingList((prev: ShoppingItem[]) => [
          ...prev,
          { id: Date.now(), name: `Ingredientes de ${meal.title || meal.name}`, category: 'Comidas Planeadas', checked: false },
        ]);
      }
      setTargetPlanDay(null);
      toast.success('¡Comida añadida al planificador!');
      navigateTo('plan');
    } else {
      setDailyMacros((prev: DailyMacros) => ({
        ...prev,
        consumed: {
          cal: prev.consumed.cal + (meal.cal || meal.macros?.calories || 0),
          pro: prev.consumed.pro + (meal.pro || meal.macros?.protein || 0),
          carbs: prev.consumed.carbs + (meal.carbs || meal.macros?.carbs || 0),
          fats: prev.consumed.fats + (meal.fats || meal.macros?.fats || 0),
        },
      }));
      toast.success('¡Comida registrada con éxito!');
      navigateTo(previousScreen);
    }
  };

  const handleLogMealNow = (meal: any, servings: number) => {
    setDailyMacros((prev: DailyMacros) => ({
      ...prev,
      consumed: {
        cal: prev.consumed.cal + (meal.cal * servings),
        pro: prev.consumed.pro + (meal.pro * servings),
        carbs: prev.consumed.carbs + ((meal.carbs || 0) * servings),
        fats: prev.consumed.fats + ((meal.fats || 0) * servings),
      },
    }));
    toast.success(`¡Registrada(s) ${servings} porción(es) de ${meal.title}!`);
    navigateTo('home');
  };

  const handleSaveRecipe = (recipe: any) => {
    setSavedRecipes((prev: any[]) => {
      const exists = prev.find((r: any) => r.id === recipe.id);
      if (exists) {
        toast.info('Receta eliminada de la Bóveda');
        return prev.filter((r: any) => r.id !== recipe.id);
      }
      toast.success('¡Receta guardada en la Bóveda!');
      return [...prev, { ...recipe, tag: 'GUARDADO' }];
    });
  };

  const handleAddToPlan = (recipe: any, dayIndex: number) => {
    setMealPlan((prev: Record<number, any[]>) => ({
      ...prev,
      [dayIndex]: [
        ...prev[dayIndex],
        {
          id: Date.now(),
          time: '12:00',
          type: 'COMIDA',
          title: recipe.title,
          cal: recipe.cal,
          pro: recipe.pro,
          carbs: recipe.carbs,
          fats: recipe.fats,
          micros: recipe.micros,
          recipeIngredients: recipe.recipeIngredients,
          tag: 'PLANEADO',
        },
      ],
    }));
    if (recipe.recipeIngredients?.length > 0) {
      setShoppingList((prev: ShoppingItem[]) => [
        ...prev,
        ...recipe.recipeIngredients.map((ri: any, idx: number) => ({
          id: Date.now() + idx,
          name: `${ri.ingredient.name} (${ri.amount}${ri.ingredient.baseUnit})`,
          category: ri.ingredient.category || 'Otros',
          checked: false,
        })),
      ]);
    } else {
      setShoppingList((prev: ShoppingItem[]) => [
        ...prev,
        { id: Date.now(), name: `Ingredientes de ${recipe.title}`, category: 'Comidas Planeadas', checked: false },
      ]);
    }
    toast.success(`${recipe.title} añadido al plan!`);
    navigateTo('plan');
  };

  const handleCreatePost = (content: string, performance?: any) => {
    setCommunityPosts((prev: any[]) => [
      {
        id: Date.now(),
        author: { name: 'Tú', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', role: 'Miembro', time: 'Justo ahora' },
        content,
        likes: 0,
        comments: 0,
        type: performance ? 'performance' : 'text',
        performance,
        commentsList: [],
      },
      ...prev,
    ]);
    navigateTo('explore');
  };

  const handleAddComment = (postId: number, commentText: string) => {
    setCommunityPosts((prev: any[]) =>
      prev.map((post: any) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
              commentsList: [...(post.commentsList || []), { id: Date.now(), text: commentText, author: 'Tú', time: 'Justo ahora' }],
            }
          : post
      )
    );
  };

  const handleAddToleranceLog = (log: any) => {
    setToleranceLogs((prev: any[]) => [{ ...log, id: Date.now() }, ...prev]);
    navigateTo('cocina');
  };

  const handleCreateRecipeSubmit = (recipe: any) => {
    setSavedRecipes((prev: any[]) => [{ ...recipe, id: Date.now(), tag: 'MI RECETA' }, ...prev]);
    navigateTo('cocina');
  };

  const handleRealFeelLog = (entry: any) => {
    setRealFeelLogs((prev: any[]) => [{ ...entry, id: Date.now(), date: new Date().toISOString() }, ...prev]);
  };

  const handleImportRecipe = (recipe: any) => {
    setSavedRecipes((prev: any[]) => [{ ...recipe, id: Date.now(), tag: 'IMPORTADA' }, ...prev]);
    toast.success('¡Receta importada!');
    navigateTo('cocina');
  };

  // ─── Context value ──────────────────────────────────────────────────────────

  const value: AppStateContextType = {
    isPro, setIsPro,
    showAIBot, setShowAIBot,
    isFirstTime, setIsFirstTime,
    userProfile, setUserProfile,
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    savedRecipes, setSavedRecipes,
    mealPlan, setMealPlan,
    shoppingList, setShoppingList,
    communityPosts, setCommunityPosts,
    toleranceLogs, setToleranceLogs,
    realFeelLogs, setRealFeelLogs,
    checkInStatus, setCheckInStatus,
    selectedRecipe, setSelectedRecipe,
    targetPlanDay, setTargetPlanDay,
    dictionary: INGREDIENT_DICTIONARY,
    handleLogMeal,
    handleLogMealNow,
    handleSaveRecipe,
    handleCreatePost,
    handleAddComment,
    handleAddToleranceLog,
    handleCreateRecipeSubmit,
    handleRealFeelLog,
    handleImportRecipe,
    handleAddToPlan,
    handleCheckIn,
    handleCompleteCheckIn,
    navigateToRecipe,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
