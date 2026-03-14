import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LoggedFood {
  id: string;
  name: string;
  desc: string;
  cals: number;
  macros: { p: number; c: number; f: number };
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  status: 'logged' | 'planned';
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  cals: number;
  macros: { p: number; c: number; f: number };
  ingredients: string[];
  image: string;
}

interface AppState {
  dailyLog: LoggedFood[];
  addFoodToLog: (food: Omit<LoggedFood, 'id'>) => void;
  removeFoodFromLog: (id: string) => void;
  updateFoodStatus: (id: string, status: 'logged' | 'planned') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedRecipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  mood: string;
  setMood: (mood: string) => void;
  preferences: Set<string>;
  togglePreference: (pref: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_LOG: LoggedFood[] = [
  {
    id: '1',
    name: 'Honey-Spiced Granola',
    desc: '1 serving • Greek yogurt base',
    cals: 450,
    macros: { p: 35, c: 55, f: 12 },
    mealType: 'breakfast',
    status: 'logged'
  },
  {
    id: '2',
    name: 'Omega-3 Power Bowl',
    desc: 'From Cookbook • 1 serving',
    cals: 650,
    macros: { p: 42, c: 60, f: 24 },
    mealType: 'lunch',
    status: 'logged'
  },
  {
    id: '3',
    name: 'Black Coffee',
    desc: '1 cup • No sugar',
    cals: 5,
    macros: { p: 0, c: 1, f: 0 },
    mealType: 'lunch',
    status: 'logged'
  },
  {
    id: '4',
    name: 'Batch-Prep Quinoa Bowl',
    desc: 'Planned Meal • Needs confirmation',
    cals: 545,
    macros: { p: 45, c: 65, f: 15 },
    mealType: 'dinner',
    status: 'planned'
  }
];

const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Omega-3 Power Bowl',
    category: 'High Protein',
    time: '15m',
    cals: 650,
    macros: { p: 42, c: 60, f: 24 },
    ingredients: ['Wild Salmon', 'Quinoa', 'Avocado', 'Kimchi'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&h=600'
  },
  {
    id: '2',
    title: 'Spicy Sesame Chicken Stir Fry',
    category: 'Batch Prep',
    time: '25m',
    cals: 480,
    macros: { p: 45, c: 35, f: 18 },
    ingredients: ['Chicken Breast', 'Broccoli', 'Sesame Oil', 'Soy Sauce', 'Brown Rice'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800&h=600'
  },
  {
    id: '3',
    title: 'Blueberry Overnight Protein Oats',
    category: 'Breakfast',
    time: '5m',
    cals: 380,
    macros: { p: 30, c: 45, f: 8 },
    ingredients: ['Oats', 'Protein Powder', 'Almond Milk', 'Blueberries', 'Chia Seeds'],
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=800&h=600'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mood, setMood] = useState('Great');
  const [preferences, setPreferences] = useState<Set<string>>(new Set(['comfortable-clothing', 'lipstick']));

  const togglePreference = (pref: string) => {
    setPreferences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pref)) newSet.delete(pref);
      else newSet.add(pref);
      return newSet;
    });
  };

  const [dailyLog, setDailyLog] = useState<LoggedFood[]>(() => {
    const saved = localStorage.getItem('nutrition_daily_log');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return DEFAULT_LOG;
  });

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('nutrition_saved_recipes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return INITIAL_RECIPES;
  });

  useEffect(() => {
    localStorage.setItem('nutrition_daily_log', JSON.stringify(dailyLog));
  }, [dailyLog]);

  useEffect(() => {
    localStorage.setItem('nutrition_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const addFoodToLog = (food: Omit<LoggedFood, 'id'>) => {
    const newFood = { ...food, id: Math.random().toString(36).substr(2, 9) };
    setDailyLog(prev => [...prev, newFood]);
  };

  const removeFoodFromLog = (id: string) => {
    setDailyLog(prev => prev.filter(food => food.id !== id));
  };

  const updateFoodStatus = (id: string, status: 'logged' | 'planned') => {
    setDailyLog(prev => prev.map(food => food.id === id ? { ...food, status } : food));
  };

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe = { ...recipe, id: Math.random().toString(36).substr(2, 9) };
    setSavedRecipes(prev => [newRecipe, ...prev]);
  };

  return (
    <AppContext.Provider value={{ dailyLog, addFoodToLog, removeFoodFromLog, updateFoodStatus, activeTab, setActiveTab, savedRecipes, addRecipe, mood, setMood, preferences, togglePreference }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
