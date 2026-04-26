/**
 * Tests for useFoodState — Phase 2.5 (ADR-015).
 *
 * Locks the contract for the food slice: 6 persisted vars + 6 callbacks
 * + 2 lazy code-split imports + 2 derived memos + 6 sync effects.
 *
 * Lazy imports (ingredients dictionary, food variants) are mocked because
 * the real seed files are 90KB+ and not needed for contract assertions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../lib/sync', () => ({ pushToCloud: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// Lazy-loaded data files — return empty arrays (real seeds are large).
vi.mock('../../features/food/data/ingredients', () => ({ INGREDIENT_DICTIONARY: [] }));
vi.mock('../../features/food/data/food-variants', () => ({ FOOD_VARIANTS: [] }));

import { useFoodState } from './useFoodState';
import { pushToCloud } from '../../lib/sync';
import { toast } from 'sonner';

// Minimal translations stub — only the keys this hook actually reads.
const tStub = {
  mealToasts: { foodSaved: 'Alimento guardado' },
} as never;

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('useFoodState — initial shape', () => {
  it('exposes the documented 13 return-keys', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    // State (6 persisted)
    expect(Array.isArray(result.current.userFoods)).toBe(true);
    expect(Array.isArray(result.current.userVariants)).toBe(true);
    expect(typeof result.current.userVariantBarcodes).toBe('object');
    expect(Array.isArray(result.current.dailyLog)).toBe(true);
    expect(Array.isArray(result.current.foodHistory)).toBe(true);
    expect(Array.isArray(result.current.favoriteIds)).toBe(true);
    // Callbacks (6 wrappers)
    expect(typeof result.current.addUserFood).toBe('function');
    expect(typeof result.current.addUserVariant).toBe('function');
    expect(typeof result.current.updateUserVariant).toBe('function');
    expect(typeof result.current.removeUserVariant).toBe('function');
    expect(typeof result.current.addVariantBarcode).toBe('function');
    expect(typeof result.current.toggleFavorite).toBe('function');
    // Setters (3 raw setters exposed for cloud-pull merge in applyRemoteData)
    expect(typeof result.current.setDailyLog).toBe('function');
    expect(typeof result.current.setFoodHistory).toBe('function');
    expect(typeof result.current.setFavoriteIds).toBe('function');
    // Memos
    expect(Array.isArray(result.current.mergedDictionary)).toBe(true);
    expect(Array.isArray(result.current.mergedVariants)).toBe(true);
  });
});

describe('useFoodState — addUserFood', () => {
  it('prepends a new food to userFoods', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    const food = { id: 'apple', name: 'Apple' } as never;
    act(() => result.current.addUserFood(food));
    expect(result.current.userFoods).toHaveLength(1);
    expect(result.current.userFoods[0]).toEqual(food);
  });

  it('skips duplicates by id (idempotent)', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    const food = { id: 'apple', name: 'Apple' } as never;
    act(() => result.current.addUserFood(food));
    act(() => result.current.addUserFood(food));
    expect(result.current.userFoods).toHaveLength(1);
  });

  it('shows a toast on success', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    act(() => result.current.addUserFood({ id: 'apple' } as never));
    expect(toast.success).toHaveBeenCalledWith('Alimento guardado');
  });
});

describe('useFoodState — variant management', () => {
  it('addUserVariant prepends + dedupes', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    const v = { id: 'v-1', name: 'Brand A' } as never;
    act(() => result.current.addUserVariant(v));
    act(() => result.current.addUserVariant(v));
    expect(result.current.userVariants).toHaveLength(1);
  });

  it('updateUserVariant patches by id', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    act(() => result.current.addUserVariant({ id: 'v-1', brand: { name: 'Old' }, macros: { calories: 100 } } as never));
    act(() => result.current.updateUserVariant('v-1', { brand: { name: 'New' } } as never));
    expect((result.current.userVariants[0] as { brand: { name: string } }).brand.name).toBe('New');
  });

  it('removeUserVariant also removes its barcode mappings', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    act(() => result.current.addUserVariant({ id: 'v-1' } as never));
    act(() => result.current.addVariantBarcode('123-bar', 'v-1'));
    expect(result.current.userVariantBarcodes['123-bar']).toBe('v-1');

    act(() => result.current.removeUserVariant('v-1'));
    expect(result.current.userVariants).toHaveLength(0);
    expect(result.current.userVariantBarcodes['123-bar']).toBeUndefined();
  });
});

describe('useFoodState — toggleFavorite', () => {
  it('adds an id when not present', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    act(() => result.current.toggleFavorite('apple'));
    expect(result.current.favoriteIds).toContain('apple');
  });

  it('removes an id when already present', () => {
    const { result } = renderHook(() => useFoodState({ t: tStub }));
    act(() => result.current.toggleFavorite('apple'));
    act(() => result.current.toggleFavorite('apple'));
    expect(result.current.favoriteIds).not.toContain('apple');
  });
});

describe('useFoodState — Supabase sync wiring', () => {
  it('syncs all 6 user-owned keys on mount', () => {
    renderHook(() => useFoodState({ t: tStub }));
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).toContain('userFoods');
    expect(calls).toContain('userVariants');
    expect(calls).toContain('userVariantBarcodes');
    expect(calls).toContain('dailyLog');
    expect(calls).toContain('foodHistory');
    expect(calls).toContain('favoriteIds');
  });
});
