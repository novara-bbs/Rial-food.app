/**
 * Tests for TodaysMeals — Sprint 49 [1.5.163].
 * Locks: clicking a planned meal's image/title opens RecipeDetail via
 * onNavigateToRecipe; the "Log it" button still fires onLogMealNow without
 * triggering navigation (stopPropagation defence + sibling button layout).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import TodaysMeals from './TodaysMeals';
import type { Recipe } from '../../../types';

type PlannedMeal = Recipe & {
  executionStatus?: string;
  cal?: number;
  pro?: number;
  img?: string;
  time?: string;
  type?: string;
};

const baseRecipe: Recipe = {
  id: 'recipe-pollo-limon',
  title: 'Pollo al Limón',
  description: '',
  image: 'https://cdn.example/pollo.jpg',
  prepTime: '15 min',
  cookTime: '20 min',
  difficulty: 'Fácil',
  macros: { calories: 420, protein: 35, carbs: 18, fats: 22 },
  tags: [],
};

const plannedMeal: PlannedMeal = {
  ...baseRecipe,
  cal: 420,
  pro: 35,
  img: 'https://cdn.example/pollo.jpg',
  type: 'lunch',
  time: '13:30',
};

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('TodaysMeals — planned meal navigation (Sprint 49)', () => {
  it('opens the recipe detail when the meal title/image area is clicked', async () => {
    const onNavigateToRecipe = vi.fn();
    renderWithProviders(
      <TodaysMeals
        dailyLog={[]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
        onNavigateToRecipe={onNavigateToRecipe}
      />,
    );

    // The wrapper is a button labelled "View recipe: <title>" (en).
    const navButton = screen.getByLabelText(/view recipe.*pollo al limón/i);
    await userEvent.click(navButton);
    expect(onNavigateToRecipe).toHaveBeenCalledTimes(1);
    expect(onNavigateToRecipe).toHaveBeenCalledWith(plannedMeal);
  });

  it('"Log it" button fires onLogMealNow without triggering navigation', async () => {
    const onNavigateToRecipe = vi.fn();
    const onLogMealNow = vi.fn();
    renderWithProviders(
      <TodaysMeals
        dailyLog={[]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={onLogMealNow}
        onNavigateToRecipe={onNavigateToRecipe}
      />,
    );

    // The "Log it" copy comes from t.home.logIt.
    const logButton = screen.getByRole('button', { name: /log it/i });
    await userEvent.click(logButton);
    expect(onLogMealNow).toHaveBeenCalledTimes(1);
    expect(onLogMealNow).toHaveBeenCalledWith(plannedMeal, 1);
    expect(onNavigateToRecipe).not.toHaveBeenCalled();
  });

  it('disables the navigation wrapper when onNavigateToRecipe is not provided', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
      />,
    );
    const navButton = screen.getByLabelText(/view recipe.*pollo al limón/i) as HTMLButtonElement;
    expect(navButton.disabled).toBe(true);
  });
});
