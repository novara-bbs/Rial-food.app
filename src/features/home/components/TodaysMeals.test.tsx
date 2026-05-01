/**
 * Tests for TodaysMeals — Sprint 49 [1.5.163] + Sprint 51 [1.5.182] unification.
 * Locks:
 *   - clicking a planned meal's image/title opens RecipeDetail via
 *     onNavigateToRecipe; the "Log it" button still fires onLogMealNow without
 *     triggering navigation (stopPropagation defence + sibling button layout).
 *   - Plan→Log dedupe: a planned meal whose title is already in dailyLog is
 *     hidden from the Plan band.
 *   - Inline Next Up banner: rendered when nextSuggestion is non-null; hidden
 *     when null. Click invokes onNextTap.
 *   - 4 empty-state branches render the correct copy.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import TodaysMeals from './TodaysMeals';
import type { Recipe } from '../../../types';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

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

const logEntry = (title: string, id = 1): DailyLogEntry => ({
  id,
  title,
  portionDescription: '100g',
  mealSlot: 'lunch',
  time: '13:30',
  macros: { cal: 420, pro: 35, carbs: 18, fats: 22 },
  grams: 100,
});

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

    const logButton = screen.getByRole('button', { name: /log it|registrar/i });
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

describe('TodaysMeals — Plan↔Log dedupe (Sprint 51)', () => {
  it('hides a planned meal whose title is already in dailyLog', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[logEntry('Pollo al Limón')]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    // No "View recipe" button (planned card is gone), but log row stays.
    expect(screen.queryByLabelText(/view recipe.*pollo al limón/i)).toBeNull();
    // Title still renders (in the Log band) — but as plain text, not a button.
    const titles = screen.getAllByText('Pollo al Limón');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('matches case-insensitively and trims whitespace', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[logEntry('  POLLO AL LIMÓN  ')]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
        onNavigateToRecipe={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText(/view recipe.*pollo al limón/i)).toBeNull();
  });
});

describe('TodaysMeals — Inline Next Up banner (Sprint 51)', () => {
  it('renders the inline banner when nextSuggestion is provided', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[logEntry('Otro')]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
        nextSuggestion={{
          title: 'Pollo al Limón',
          cal: 420,
          pro: 35,
          time: '13:30',
          source: 'plan',
          recipe: baseRecipe,
        }}
        onNextTap={vi.fn()}
      />,
    );
    expect(screen.getByTestId('todays-meals-next-up')).toBeTruthy();
    // Copy interpolation includes the title and time.
    expect(screen.getByTestId('todays-meals-next-up').textContent).toMatch(/pollo al limón/i);
    expect(screen.getByTestId('todays-meals-next-up').textContent).toMatch(/13:30/);
  });

  it('hides the banner when nextSuggestion is null', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[logEntry('Algo')]}
        todaysMeals={[]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
        nextSuggestion={null}
      />,
    );
    expect(screen.queryByTestId('todays-meals-next-up')).toBeNull();
  });

  it('invokes onNextTap when the banner is clicked', async () => {
    const onNextTap = vi.fn();
    renderWithProviders(
      <TodaysMeals
        dailyLog={[logEntry('Algo')]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
        nextSuggestion={{
          title: 'Pollo al Limón',
          cal: 420,
          pro: 35,
          time: '13:30',
          source: 'plan',
          recipe: baseRecipe,
        }}
        onNextTap={onNextTap}
      />,
    );
    await userEvent.click(screen.getByTestId('todays-meals-next-up'));
    expect(onNextTap).toHaveBeenCalledTimes(1);
  });
});

describe('TodaysMeals — empty states (Sprint 51)', () => {
  it('renders the global empty when both plan and log are empty', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[]}
        todaysMeals={[]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
      />,
    );
    // Global empty copy (ES default = "Aún no hay comidas para hoy")
    expect(screen.getByText(/no meals for today yet|aún no hay comidas/i)).toBeTruthy();
    // Plan day CTA visible
    expect(screen.getByText(/plan day|planificar día/i)).toBeTruthy();
  });

  it('renders intra-Log empty when there are planned but no logged meals', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
      />,
    );
    expect(screen.getByText(/nothing logged yet|aún no has registrado/i)).toBeTruthy();
  });

  it('renders intra-Plan empty when there are logged but no planned meals', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[logEntry('Café con leche')]}
        todaysMeals={[]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
      />,
    );
    expect(screen.getByText(/no plan for today|sin plan para hoy/i)).toBeTruthy();
  });

  it('does not render any empty copy when both plan and log have items', () => {
    renderWithProviders(
      <TodaysMeals
        dailyLog={[logEntry('Café')]}
        todaysMeals={[plannedMeal]}
        onAddMeal={vi.fn()}
        onLogMealNow={vi.fn()}
      />,
    );
    expect(screen.queryByText(/nothing logged yet|aún no has registrado/i)).toBeNull();
    expect(screen.queryByText(/no plan for today|sin plan para hoy/i)).toBeNull();
    expect(screen.queryByText(/no meals for today yet|aún no hay comidas/i)).toBeNull();
  });
});
