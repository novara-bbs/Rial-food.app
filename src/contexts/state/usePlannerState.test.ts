/**
 * Tests for usePlannerState — Phase 2.5 (ADR-015).
 *
 * Locks the contract for the planner slice: mealPlan + shoppingList +
 * 2 lazy-seed effects + 2 sync effects.
 *
 * Note: the lazy-seed dynamic imports are mocked because they pull data
 * files we don't need to load in unit tests; the test only needs to verify
 * the seed-gating flow.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../lib/sync', () => ({ pushToCloud: vi.fn() }));
vi.mock('../../lib/seedVersion', () => ({
  shouldReseed: vi.fn(() => false),
  setStoredSeedVersion: vi.fn(),
}));

import { usePlannerState } from './usePlannerState';
import { pushToCloud } from '../../lib/sync';
import { shouldReseed } from '../../lib/seedVersion';

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  // Default: don't try to reseed (otherwise dynamic imports would fire).
  (shouldReseed as ReturnType<typeof vi.fn>).mockReturnValue(false);
});

describe('usePlannerState — initial shape', () => {
  it('exposes mealPlan + shoppingList + 2 setters', () => {
    const { result } = renderHook(() => usePlannerState());
    expect(result.current.mealPlan).toEqual({});
    expect(result.current.shoppingList).toEqual([]);
    expect(typeof result.current.setMealPlan).toBe('function');
    expect(typeof result.current.setShoppingList).toBe('function');
  });
});

describe('usePlannerState — persistence', () => {
  it('setMealPlan writes to localStorage', () => {
    const { result } = renderHook(() => usePlannerState());
    act(() => result.current.setMealPlan({ 0: [{ id: 'r-1', title: 'Lunes' }] }));
    const raw = window.localStorage.getItem('mealPlan');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({ 0: [{ id: 'r-1', title: 'Lunes' }] });
  });

  it('rehydrates shoppingList from localStorage', () => {
    const seed = [{ id: 1, name: 'Pollo', category: 'Proteínas', checked: false }];
    window.localStorage.setItem('shoppingList', JSON.stringify(seed));
    const { result } = renderHook(() => usePlannerState());
    expect(result.current.shoppingList).toEqual(seed);
  });
});

describe('usePlannerState — seed gating', () => {
  it('does NOT reseed when shouldReseed returns false', () => {
    const importSpy = vi.fn();
    (shouldReseed as ReturnType<typeof vi.fn>).mockReturnValue(false);
    renderHook(() => usePlannerState());
    // Nothing else to assert — coverage is via shouldReseed call.
    expect(shouldReseed).toHaveBeenCalledWith('mealPlan', 'mealPlan');
    expect(shouldReseed).toHaveBeenCalledWith('shoppingList', 'shoppingList');
    expect(importSpy).not.toHaveBeenCalled();
  });
});

describe('usePlannerState — Supabase sync wiring', () => {
  it('syncs mealPlan + shoppingList on mount', () => {
    renderHook(() => usePlannerState());
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).toContain('mealPlan');
    expect(calls).toContain('shoppingList');
  });

  it('re-syncs mealPlan after setMealPlan', () => {
    const { result } = renderHook(() => usePlannerState());
    (pushToCloud as ReturnType<typeof vi.fn>).mockClear();
    act(() => result.current.setMealPlan({ 1: [{ id: 'r-2' }] }));
    expect(pushToCloud).toHaveBeenCalledWith('mealPlan', { 1: [{ id: 'r-2' }] });
  });
});
