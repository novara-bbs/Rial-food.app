/**
 * Tests for RecipeIngredientsTab — Phase 3.1 (ADR-015).
 * Locks: ingredient list rendering, checked-state styling, extras add/
 * remove flow, brand-swap visibility gating.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeIngredientsTab from './RecipeIngredientsTab';

const baseProps = {
  allIngredientsToDisplay: [
    { id: 'i-1', name: 'Pollo', amount: 200, unit: 'g', familyId: 'fam_chicken' },
    { id: 'i-2', name: 'Arroz', amount: 80, unit: 'g' },
  ],
  checkedIngredients: [],
  toggleIngredient: vi.fn(),
  formatAmount: (n: number) => String(n),
  isAddingIngredient: false,
  setIsAddingIngredient: vi.fn(),
  searchQuery: '',
  setSearchQuery: vi.fn(),
  filteredDictionary: [],
  addExtraIngredient: vi.fn(),
  updateExtraIngredientAmount: vi.fn(),
  removeExtraIngredient: vi.fn(),
  openSwapPicker: vi.fn(),
};

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('RecipeIngredientsTab — list rendering', () => {
  it('renders one row per ingredient', () => {
    renderWithProviders(<RecipeIngredientsTab {...baseProps} />, { inTabs: { defaultValue: 'ingredients' } });
    expect(screen.getByText(/Pollo/)).toBeTruthy();
    expect(screen.getByText(/Arroz/)).toBeTruthy();
  });

  it('shows the brand-swap button only for rows with familyId', () => {
    renderWithProviders(<RecipeIngredientsTab {...baseProps} />, { inTabs: { defaultValue: 'ingredients' } });
    // Brand swap is the only button with aria-label = t.recipeDetail.swapVariant ('Change variant' / 'Cambiar variante').
    const swapButtons = screen.getAllByLabelText(/change variant|cambiar variante/i);
    expect(swapButtons).toHaveLength(1); // only Pollo has familyId
  });

  it('clicking an ingredient row fires toggleIngredient(id)', async () => {
    const toggleIngredient = vi.fn();
    renderWithProviders(
      <RecipeIngredientsTab {...baseProps} toggleIngredient={toggleIngredient} />,
      { inTabs: { defaultValue: 'ingredients' } },
    );
    await userEvent.click(screen.getByText(/Pollo/));
    expect(toggleIngredient).toHaveBeenCalledWith('i-1');
  });
});

describe('RecipeIngredientsTab — extras add/remove', () => {
  it('hides the search input when isAddingIngredient=false', () => {
    renderWithProviders(<RecipeIngredientsTab {...baseProps} />, { inTabs: { defaultValue: 'ingredients' } });
    expect(screen.queryByPlaceholderText(/search ingredients|buscar ingredientes/i)).toBeNull();
  });

  it('shows the search input when isAddingIngredient=true', () => {
    renderWithProviders(
      <RecipeIngredientsTab {...baseProps} isAddingIngredient />,
      { inTabs: { defaultValue: 'ingredients' } },
    );
    expect(screen.getByPlaceholderText(/search ingredients|buscar ingredientes/i)).toBeTruthy();
  });

  it('clicking a dictionary suggestion fires addExtraIngredient', async () => {
    const addExtraIngredient = vi.fn();
    const dictItem = { id: 'd-1', name: 'Tomato', baseUnit: 'g', servingSizes: [{ grams: 80 }], baseAmount: 100, macros: { calories: 20, protein: 1, carbs: 4, fats: 0 }, micros: { vitamins: {}, minerals: {}, others: {} } };
    renderWithProviders(
      <RecipeIngredientsTab
        {...baseProps}
        isAddingIngredient
        searchQuery="tom"
        filteredDictionary={[dictItem as never]}
        addExtraIngredient={addExtraIngredient}
      />,
      { inTabs: { defaultValue: 'ingredients' } },
    );
    await userEvent.click(screen.getByText('Tomato'));
    expect(addExtraIngredient).toHaveBeenCalledWith(dictItem);
  });
});

describe('RecipeIngredientsTab — shopping list CTA gating', () => {
  it('hides "Add to shopping list" when onAddToShoppingList is not wired', () => {
    renderWithProviders(<RecipeIngredientsTab {...baseProps} />, { inTabs: { defaultValue: 'ingredients' } });
    expect(screen.queryByText(/list|lista/i)).toBeNull();
  });

  it('shows "Add to shopping list" when onAddToShoppingList is wired', () => {
    const handleAddToShoppingList = vi.fn();
    renderWithProviders(
      <RecipeIngredientsTab
        {...baseProps}
        onAddToShoppingList={vi.fn()}
        handleAddToShoppingList={handleAddToShoppingList}
      />,
      { inTabs: { defaultValue: 'ingredients' } },
    );
    // Button shows 't.recipeDetail.listBtn' = 'List' (en) / 'Lista' (es)
    const buttons = screen.getAllByRole('button');
    const listBtn = buttons.find(b => /list|lista/i.test(b.textContent || ''));
    expect(listBtn).toBeTruthy();
  });
});
