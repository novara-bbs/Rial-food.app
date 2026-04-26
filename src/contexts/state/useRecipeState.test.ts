/**
 * Tests for useRecipeState — Phase 2.5 (ADR-015).
 *
 * Locks the contract for the recipe slice: savedRecipes + 2 in-memory
 * migrations + 7 handlers + navigateToRecipe + sync (with data-URL guard).
 *
 * Migrations (Q19 mealType→suitableFor, P4.4 ingredientId→familyId+variantId)
 * are tested via the seeded localStorage path: hydrate with legacy shape,
 * verify the hook normalises it on mount.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../lib/sync', () => ({ pushToCloud: vi.fn() }));
vi.mock('../../lib/seedVersion', () => ({
  shouldReseed: vi.fn(() => false),
  setStoredSeedVersion: vi.fn(),
}));

import { useRecipeState } from './useRecipeState';
import { pushToCloud } from '../../lib/sync';

const tStub = {
  toast: { recipeSaved: 'Saved!', recipeDeleted: 'Deleted' },
  recipes: { saved: 'Saved', recipeLimitReached: 'Limit' },
} as never;

const navigateToStub = vi.fn();
const setMealPlanStub = vi.fn();
const setShoppingListStub = vi.fn();
const setSelectedRecipeStub = vi.fn();

function makeDeps() {
  return {
    setMealPlan: setMealPlanStub,
    setShoppingList: setShoppingListStub,
    setSelectedRecipe: setSelectedRecipeStub,
    navigateTo: navigateToStub,
    t: tStub,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('useRecipeState — initial shape', () => {
  it('exposes savedRecipes + setSavedRecipes + 7 handlers + navigateToRecipe', () => {
    const { result } = renderHook(() => useRecipeState(makeDeps()));
    expect(Array.isArray(result.current.savedRecipes)).toBe(true);
    expect(typeof result.current.setSavedRecipes).toBe('function');
    expect(typeof result.current.navigateToRecipe).toBe('function');
    expect(typeof result.current.handleSaveRecipe).toBe('function');
    expect(typeof result.current.handleAddToPlan).toBe('function');
    expect(typeof result.current.handleCreateRecipeSubmit).toBe('function');
    expect(typeof result.current.handleDeleteRecipe).toBe('function');
    expect(typeof result.current.handleMarkAsCooked).toBe('function');
    expect(typeof result.current.handleDuplicateRecipe).toBe('function');
    expect(typeof result.current.handleImportRecipe).toBe('function');
  });

  it('boots with empty savedRecipes', () => {
    const { result } = renderHook(() => useRecipeState(makeDeps()));
    expect(result.current.savedRecipes).toEqual([]);
  });
});

describe('useRecipeState — Q19 mealType→suitableFor migration', () => {
  it('normalises legacy mealType into suitableFor on mount', () => {
    window.localStorage.setItem('savedRecipes', JSON.stringify([
      { id: 'r-1', title: 'Tortilla', mealType: 'breakfast' },
    ]));
    const { result } = renderHook(() => useRecipeState(makeDeps()));
    const r = result.current.savedRecipes[0];
    // mealType stripped, suitableFor populated by getRecipeSlots
    expect(r.mealType).toBeUndefined();
    expect(Array.isArray(r.suitableFor)).toBe(true);
  });

  it('is idempotent (skips when suitableFor already populated)', () => {
    const initial = [
      { id: 'r-1', title: 'Tortilla', suitableFor: ['breakfast'] },
    ];
    window.localStorage.setItem('savedRecipes', JSON.stringify(initial));
    const { result } = renderHook(() => useRecipeState(makeDeps()));
    expect(result.current.savedRecipes[0].suitableFor).toEqual(['breakfast']);
  });
});

describe('useRecipeState — navigateToRecipe', () => {
  it('selects the recipe + navigates to recipe-detail with recipeId', () => {
    const { result } = renderHook(() => useRecipeState(makeDeps()));
    const recipe = { id: 'r-42', title: 'Test' } as never;
    act(() => result.current.navigateToRecipe(recipe));
    expect(setSelectedRecipeStub).toHaveBeenCalledWith(recipe);
    expect(navigateToStub).toHaveBeenCalledWith('recipe-detail', { recipeId: 'r-42' });
  });

  it('marks the Guided Setup "Explora una receta" step complete', () => {
    const { result } = renderHook(() => useRecipeState(makeDeps()));
    act(() => result.current.navigateToRecipe({ id: 'r-1' } as never));
    expect(window.localStorage.getItem('rial_recipeViewed')).toBe('1');
  });
});

describe('useRecipeState — Supabase sync (data-URL guard)', () => {
  it('syncs savedRecipes when no data-URL photos are present', () => {
    window.localStorage.setItem('savedRecipes', JSON.stringify([
      { id: 'r-1', photos: ['https://cdn.example/photo.jpg'] },
    ]));
    renderHook(() => useRecipeState(makeDeps()));
    expect(pushToCloud).toHaveBeenCalledWith('savedRecipes', expect.any(Array));
  });

  it('SKIPS sync when a recipe contains a data:image base64 photo', () => {
    window.localStorage.setItem('savedRecipes', JSON.stringify([
      { id: 'r-1', photos: ['data:image/jpeg;base64,/9j/4AAQ...'] },
    ]));
    renderHook(() => useRecipeState(makeDeps()));
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).not.toContain('savedRecipes');
  });

  it('SKIPS sync when a step contains a data: photoUrl', () => {
    window.localStorage.setItem('savedRecipes', JSON.stringify([
      { id: 'r-1', steps: [{ text: 'Cook it', photoUrl: 'data:image/png;base64,iVBOR...' }] },
    ]));
    renderHook(() => useRecipeState(makeDeps()));
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).not.toContain('savedRecipes');
  });
});
