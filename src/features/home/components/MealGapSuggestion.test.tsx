/**
 * Sprint 50 [1.5.164] — MealGapSuggestion component tests.
 *
 * Locks the contract: when there's a macro deficit and the user has
 * recipes in the vault, recipes are surfaced first; ingredients render
 * below as fallback. Tap on a recipe opens RecipeDetail (no auto-log).
 * Tap on an ingredient logs 1× 100 g directly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import MealGapSuggestion from './MealGapSuggestion';
import type { Recipe } from '../../../types/recipe';
import type { FoodVariant } from '../../../types/food-family';
import type { ConsumedTarget } from '../utils/meal-gaps';

const dailyMacrosWithProteinDeficit: ConsumedTarget = {
  consumed: { cal: 1200, pro: 30, carbs: 150, fats: 40 },
  target: { cal: 2200, pro: 140, carbs: 250, fats: 70 },
};

const proteinRecipe: Recipe = {
  id: 'r-pollo-bowl',
  title: 'Pollo Bowl con Quinoa',
  description: '',
  image: 'https://cdn.example/pollo.jpg',
  prepTime: '10 min',
  cookTime: '15 min',
  difficulty: 'Fácil',
  macros: { calories: 520, protein: 48, carbs: 45, fats: 14 },
  tags: [],
  ingredients: ['pechuga de pollo', 'quinoa', 'aguacate'],
};

const chickenVariant: FoodVariant = {
  id: 'fam_chicken_breast',
  familyId: 'fam_chicken',
  name: 'Pechuga de pollo',
  nameEn: 'Chicken breast',
  variantType: 'canonical',
  baseAmount: 100,
  baseUnit: 'g',
  servingSizes: [],
  macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  micros: { vitamins: {}, minerals: {}, others: {} },
  allergens: [],
  source: 'seed',
};

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('MealGapSuggestion — recipes block (Sprint 50)', () => {
  it('renders the recipes sub-block when savedRecipes contains qualifying entries', () => {
    renderWithProviders(
      <MealGapSuggestion
        dailyMacros={dailyMacrosWithProteinDeficit}
        mergedVariants={[chickenVariant]}
        savedRecipes={[proteinRecipe]}
        mealPlanToday={[]}
        dailyLog={[]}
        onLogFood={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    // The recipes title comes from t.home.mealGap.recipesTitle (en: "Recipes that help").
    expect(screen.getByText(/recipes that help/i)).toBeTruthy();
    // Recipe card title is rendered.
    expect(screen.getByText(/pollo bowl con quinoa/i)).toBeTruthy();
  });

  it('navigates to the recipe (does NOT auto-log) when a recipe card is tapped', async () => {
    const onNavigateToRecipe = vi.fn();
    const onLogFood = vi.fn();
    renderWithProviders(
      <MealGapSuggestion
        dailyMacros={dailyMacrosWithProteinDeficit}
        mergedVariants={[chickenVariant]}
        savedRecipes={[proteinRecipe]}
        mealPlanToday={[]}
        dailyLog={[]}
        onLogFood={onLogFood}
        onNavigateToRecipe={onNavigateToRecipe}
      />,
    );
    // RecipeCard sets aria-label to the recipe title.
    const recipeButton = screen.getByLabelText(/pollo bowl con quinoa/i);
    await userEvent.click(recipeButton);
    expect(onNavigateToRecipe).toHaveBeenCalledTimes(1);
    expect(onNavigateToRecipe).toHaveBeenCalledWith(proteinRecipe);
    expect(onLogFood).not.toHaveBeenCalled();
  });

  it('logs the variant (does NOT navigate) when an ingredient row is tapped', async () => {
    const onNavigateToRecipe = vi.fn();
    const onLogFood = vi.fn();
    renderWithProviders(
      <MealGapSuggestion
        dailyMacros={dailyMacrosWithProteinDeficit}
        mergedVariants={[chickenVariant]}
        savedRecipes={[proteinRecipe]}
        mealPlanToday={[]}
        dailyLog={[]}
        onLogFood={onLogFood}
        onNavigateToRecipe={onNavigateToRecipe}
      />,
    );
    // Ingredient row text comes from variant.nameEn (en locale).
    const ingredientButton = screen.getByRole('button', { name: /chicken breast/i });
    await userEvent.click(ingredientButton);
    expect(onLogFood).toHaveBeenCalledTimes(1);
    expect(onLogFood).toHaveBeenCalledWith(chickenVariant);
    expect(onNavigateToRecipe).not.toHaveBeenCalled();
  });

  it('hides the recipes block when savedRecipes is empty (graceful fallback)', () => {
    renderWithProviders(
      <MealGapSuggestion
        dailyMacros={dailyMacrosWithProteinDeficit}
        mergedVariants={[chickenVariant]}
        savedRecipes={[]}
        mealPlanToday={[]}
        dailyLog={[]}
        onLogFood={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    // The recipesTitle should NOT appear.
    expect(screen.queryByText(/recipes that help/i)).toBeNull();
    // But the ingredient block still renders.
    expect(screen.getByRole('button', { name: /chicken breast/i })).toBeTruthy();
  });

  it('renders <img> when recipe.image is populated [1.5.176]', () => {
    // All seed recipes were migrated to the canonical `image:` field in [1.5.176].
    // RecipeImage renders an <img> when src is populated; ChefHat when absent.
    const withImage = { ...proteinRecipe, image: 'https://cdn.example/pollo.jpg' };
    renderWithProviders(
      <MealGapSuggestion
        dailyMacros={dailyMacrosWithProteinDeficit}
        mergedVariants={[chickenVariant]}
        savedRecipes={[withImage]}
        mealPlanToday={[]}
        dailyLog={[]}
        onLogFood={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    const img = screen.getByRole('img', { name: /pollo bowl con quinoa/i });
    expect(img.getAttribute('src')).toBe('https://cdn.example/pollo.jpg');
  });

  it('hides a recipe whose title is already in dailyLog (dedupe lock — Sprint 52)', () => {
    renderWithProviders(
      <MealGapSuggestion
        dailyMacros={dailyMacrosWithProteinDeficit}
        mergedVariants={[chickenVariant]}
        savedRecipes={[proteinRecipe]}
        mealPlanToday={[]}
        dailyLog={[
          {
            id: 1,
            title: 'Pollo Bowl con Quinoa',
            portionDescription: '1 ración',
            mealSlot: 'lunch',
            time: '13:00',
            macros: { cal: 520, pro: 48, carbs: 45, fats: 14 },
          },
        ]}
        onLogFood={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    // Recipe is hidden once logged today; recipes title disappears (no qualifying entries).
    expect(screen.queryByLabelText(/pollo bowl con quinoa/i)).toBeNull();
  });

  it('renders the editorial header (h2 + Lightbulb icon, deficit subtitle)', () => {
    renderWithProviders(
      <MealGapSuggestion
        dailyMacros={dailyMacrosWithProteinDeficit}
        mergedVariants={[chickenVariant]}
        savedRecipes={[proteinRecipe]}
        mealPlanToday={[]}
        dailyLog={[]}
        onLogFood={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    // Header is h2 (matches TodaysMeals editorial level), not h3.
    const heading = screen.getByRole('heading', { level: 2, name: /what you need today|qué te falta hoy/i });
    expect(heading).toBeTruthy();
  });

  it('renders nothing when no deficit and no suggestions', () => {
    const balanced: ConsumedTarget = {
      consumed: { cal: 2000, pro: 130, carbs: 240, fats: 65 },
      target: { cal: 2000, pro: 130, carbs: 240, fats: 65 },
    };
    const { container } = renderWithProviders(
      <MealGapSuggestion
        dailyMacros={balanced}
        mergedVariants={[chickenVariant]}
        savedRecipes={[proteinRecipe]}
        mealPlanToday={[]}
        dailyLog={[]}
        onLogFood={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-meal-gap-suggestion]')).toBeNull();
  });
});
