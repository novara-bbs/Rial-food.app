/**
 * Tests for RecipeNutritionPanel — Sprint 47 [1.5.161].
 *
 * Locks the unified-card contract:
 *   • Macros grid renders the four scaled values.
 *   • Quality banner derives from the ORIGINAL macros snapshot (not from servings).
 *   • Servings stepper increments/decrements by 0.5.
 *   • Decrement is disabled at SERVINGS_MIN.
 *   • Servings value renders integers without a decimal and halves with one.
 *   • Family scaler appears only when familyMembers.length > 0.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeNutritionPanel from './RecipeNutritionPanel';

const baseMacros = { calories: 280, protein: 18, carbs: 35, fats: 8 };
const familyMembers = [
  { id: 'm-1', name: 'Ana', age: 8, goal: 'health' },
  { id: 'm-2', name: 'Luis', age: 35, goal: 'maintain' },
];

const baseProps = {
  cal: 280,
  pro: 18,
  carbs: 35,
  fats: 8,
  macros: baseMacros,
  servings: 1,
  setServings: vi.fn(),
  familyMembers: [],
  selectedFamily: [],
  toggleFamilyMember: vi.fn(),
  setSelectedFamily: vi.fn(),
  totalDiners: 1,
};

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('RecipeNutritionPanel — macros + quality', () => {
  it('renders the four macro values', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} cal={280} pro={18} carbs={35} fats={8} />);
    expect(screen.getByText('280')).toBeTruthy();
    expect(screen.getByText('18g')).toBeTruthy();
    expect(screen.getByText('35g')).toBeTruthy();
    expect(screen.getByText('8g')).toBeTruthy();
  });

  it('renders the quality banner when macros are provided', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} />);
    const banner = screen.getByTestId('recipe-nutrition-quality');
    expect(banner).toBeTruthy();
  });

  it('hides the quality banner when macros are null', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} macros={null} />);
    expect(screen.queryByTestId('recipe-nutrition-quality')).toBeNull();
  });
});

describe('RecipeNutritionPanel — servings stepper (0.5 step)', () => {
  it('renders the integer servings count without a decimal', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} servings={2} />);
    expect(screen.getByTestId('recipe-servings-value').textContent).toBe('2');
  });

  it('renders a half servings count with one decimal', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} servings={1.5} />);
    expect(screen.getByTestId('recipe-servings-value').textContent).toBe('1.5');
  });

  it('disables decrement at servings = 1', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} servings={1} />);
    expect(screen.getByLabelText(/decrease|reducir/i).hasAttribute('disabled')).toBe(true);
  });

  it('increments by 0.5 from 1 to 1.5', async () => {
    const setServings = vi.fn();
    renderWithProviders(<RecipeNutritionPanel {...baseProps} servings={1} setServings={setServings} />);
    await userEvent.click(screen.getByLabelText(/increase|aumentar/i));
    expect(setServings).toHaveBeenCalledTimes(1);
    const reducer = setServings.mock.calls[0][0] as (prev: number) => number;
    expect(reducer(1)).toBe(1.5);
  });

  it('decrements by 0.5 from 2 to 1.5', async () => {
    const setServings = vi.fn();
    renderWithProviders(<RecipeNutritionPanel {...baseProps} servings={2} setServings={setServings} />);
    await userEvent.click(screen.getByLabelText(/decrease|reducir/i));
    expect(setServings).toHaveBeenCalledTimes(1);
    const reducer = setServings.mock.calls[0][0] as (prev: number) => number;
    expect(reducer(2)).toBe(1.5);
  });

  it('keeps decrement clamped at SERVINGS_MIN (1)', () => {
    const setServings = vi.fn();
    renderWithProviders(<RecipeNutritionPanel {...baseProps} servings={1} setServings={setServings} />);
    // At 1 the button is disabled — userEvent.click is a no-op on disabled buttons,
    // but even if it did fire, the clamp would return 1.
    const dec = screen.getByLabelText(/decrease|reducir/i);
    expect(dec.hasAttribute('disabled')).toBe(true);
  });
});

describe('RecipeNutritionPanel — family scaler', () => {
  it('hides the family panel when no members exist', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} familyMembers={[]} />);
    expect(screen.queryByText(/Ana|Luis/)).toBeNull();
  });

  it('renders one chip per family member', () => {
    renderWithProviders(<RecipeNutritionPanel {...baseProps} familyMembers={familyMembers} />);
    expect(screen.getByText(/\+ Ana/)).toBeTruthy();
    expect(screen.getByText(/\+ Luis/)).toBeTruthy();
  });

  it('clicking "Only me" calls setSelectedFamily([])', async () => {
    const setSelectedFamily = vi.fn();
    renderWithProviders(
      <RecipeNutritionPanel
        {...baseProps}
        familyMembers={familyMembers}
        selectedFamily={['m-1']}
        setSelectedFamily={setSelectedFamily}
      />,
    );
    await userEvent.click(screen.getByText(/just me|solo yo/i));
    expect(setSelectedFamily).toHaveBeenCalledWith([]);
  });

  it('clicking a member chip calls toggleFamilyMember(id)', async () => {
    const toggleFamilyMember = vi.fn();
    renderWithProviders(
      <RecipeNutritionPanel {...baseProps} familyMembers={familyMembers} toggleFamilyMember={toggleFamilyMember} />,
    );
    await userEvent.click(screen.getByText(/\+ Ana/));
    expect(toggleFamilyMember).toHaveBeenCalledWith('m-1');
  });
});
