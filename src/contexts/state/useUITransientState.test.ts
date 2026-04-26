/**
 * Tests for useUITransientState — Phase 2.5 (ADR-015).
 *
 * Locks the public contract of the hook: 8 ephemeral selection vars +
 * their setters. These power navigation flows (selected recipe drill-down,
 * selected creator profile, etc.) and intentionally do NOT persist.
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUITransientState } from './useUITransientState';

describe('useUITransientState — initial shape', () => {
  it('exposes the 8 selection vars all initially null/false', () => {
    const { result } = renderHook(() => useUITransientState());
    expect(result.current.selectedRecipe).toBeNull();
    expect(result.current.selectedCreatorId).toBeNull();
    expect(result.current.selectedPostId).toBeNull();
    expect(result.current.selectedStoryAuthorId).toBeNull();
    expect(result.current.selectedChallengeId).toBeNull();
    expect(result.current.targetPlanDay).toBeNull();
    expect(result.current.openScannerOnAddMeal).toBe(false);
    expect(result.current.recipeToEdit).toBeNull();
  });

  it('exposes a setter for each var (8 total)', () => {
    const { result } = renderHook(() => useUITransientState());
    expect(typeof result.current.setSelectedRecipe).toBe('function');
    expect(typeof result.current.setSelectedCreatorId).toBe('function');
    expect(typeof result.current.setSelectedPostId).toBe('function');
    expect(typeof result.current.setSelectedStoryAuthorId).toBe('function');
    expect(typeof result.current.setSelectedChallengeId).toBe('function');
    expect(typeof result.current.setTargetPlanDay).toBe('function');
    expect(typeof result.current.setOpenScannerOnAddMeal).toBe('function');
    expect(typeof result.current.setRecipeToEdit).toBe('function');
  });
});

describe('useUITransientState — setter behavior', () => {
  it('setSelectedRecipe updates the value', () => {
    const { result } = renderHook(() => useUITransientState());
    const recipe = { id: 'r-1', title: 'Test recipe' } as never;
    act(() => result.current.setSelectedRecipe(recipe));
    expect(result.current.selectedRecipe).toEqual(recipe);
  });

  it('setSelectedCreatorId accepts string or null', () => {
    const { result } = renderHook(() => useUITransientState());
    act(() => result.current.setSelectedCreatorId('creator-42'));
    expect(result.current.selectedCreatorId).toBe('creator-42');
    act(() => result.current.setSelectedCreatorId(null));
    expect(result.current.selectedCreatorId).toBeNull();
  });

  it('setOpenScannerOnAddMeal toggles the flag', () => {
    const { result } = renderHook(() => useUITransientState());
    act(() => result.current.setOpenScannerOnAddMeal(true));
    expect(result.current.openScannerOnAddMeal).toBe(true);
    act(() => result.current.setOpenScannerOnAddMeal(false));
    expect(result.current.openScannerOnAddMeal).toBe(false);
  });

  it('setTargetPlanDay accepts day index or null', () => {
    const { result } = renderHook(() => useUITransientState());
    act(() => result.current.setTargetPlanDay(3));
    expect(result.current.targetPlanDay).toBe(3);
    act(() => result.current.setTargetPlanDay(null));
    expect(result.current.targetPlanDay).toBeNull();
  });
});

describe('useUITransientState — non-persistence (intentional)', () => {
  it('two independent renders do NOT share state (no global store)', () => {
    const { result: a } = renderHook(() => useUITransientState());
    const { result: b } = renderHook(() => useUITransientState());

    act(() => a.current.setSelectedCreatorId('creator-x'));

    expect(a.current.selectedCreatorId).toBe('creator-x');
    // Each renderHook call is its own component instance — state is local.
    expect(b.current.selectedCreatorId).toBeNull();
  });

  it('unmounting and remounting starts fresh (no persistence layer)', () => {
    const { result, unmount } = renderHook(() => useUITransientState());
    act(() => result.current.setSelectedRecipe({ id: 'persisted?' } as never));
    expect(result.current.selectedRecipe).toEqual({ id: 'persisted?' });

    unmount();

    const { result: fresh } = renderHook(() => useUITransientState());
    expect(fresh.current.selectedRecipe).toBeNull();
  });
});
