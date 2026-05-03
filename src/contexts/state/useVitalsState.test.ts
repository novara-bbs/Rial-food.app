/**
 * Tests for useVitalsState — Phase 2.5 (ADR-015).
 *
 * Locks the contract for the daily-vitals slice: 5 persisted vars
 * (dailyMacros, hydration, movement, dailyGoal, checkInStatus) + 4 sync
 * effects (checkInStatus is intentionally not synced yet).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../lib/sync', () => ({
  pushToCloud: vi.fn(),
  syncOnSignIn: vi.fn(),
}));

import { useVitalsState } from './useVitalsState';
import { pushToCloud } from '../../lib/sync';

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('useVitalsState — initial shape', () => {
  it('exposes 5 persisted vars + 5 setters', () => {
    const { result } = renderHook(() => useVitalsState());
    expect(result.current.dailyMacros).toBeDefined();
    expect(result.current.hydration).toBeDefined();
    expect(result.current.movement).toBeDefined();
    expect(typeof result.current.dailyGoal).toBe('string');
    expect(result.current.checkInStatus).toBeNull();

    expect(typeof result.current.setDailyMacros).toBe('function');
    expect(typeof result.current.setHydration).toBe('function');
    expect(typeof result.current.setMovement).toBe('function');
    expect(typeof result.current.setDailyGoal).toBe('function');
    expect(typeof result.current.setCheckInStatus).toBe('function');
  });

  it('boots dailyMacros at zero consumption with sensible targets', () => {
    const { result } = renderHook(() => useVitalsState());
    expect(result.current.dailyMacros.consumed).toEqual({ cal: 0, pro: 0, carbs: 0, fats: 0, fiber: 0 });
    expect(result.current.dailyMacros.target.cal).toBe(2400);
    expect(result.current.dailyMacros.target.pro).toBe(180);
    expect(result.current.dailyMacros.target.fiber).toBe(30);
  });

  it('boots hydration at 0/10 cups', () => {
    const { result } = renderHook(() => useVitalsState());
    expect(result.current.hydration).toEqual({ consumed: 0, target: 10 });
  });

  it('boots movement at 0 steps / 0 active min, with 10k step + 45 min targets', () => {
    const { result } = renderHook(() => useVitalsState());
    expect(result.current.movement).toEqual({
      steps: 0,
      target: 10000,
      activeMinutes: 0,
      activeTarget: 45,
      workoutMinutes: 0,
    });
  });

  it('boots dailyGoal as empty string', () => {
    const { result } = renderHook(() => useVitalsState());
    expect(result.current.dailyGoal).toBe('');
  });
});

describe('useVitalsState — persistence', () => {
  it('setDailyMacros writes to localStorage', () => {
    const { result } = renderHook(() => useVitalsState());
    act(() => result.current.setDailyMacros({
      consumed: { cal: 500, pro: 30, carbs: 50, fats: 20 },
      target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
    }));
    const raw = window.localStorage.getItem('dailyMacros');
    expect(JSON.parse(raw!).consumed.cal).toBe(500);
  });

  it('rehydrates dailyGoal from localStorage', () => {
    window.localStorage.setItem('dailyGoal', JSON.stringify('Beber 2L de agua'));
    const { result } = renderHook(() => useVitalsState());
    expect(result.current.dailyGoal).toBe('Beber 2L de agua');
  });

  it('functional setter (prev => next) works for hydration', () => {
    const { result } = renderHook(() => useVitalsState());
    act(() => result.current.setHydration((prev) => ({ ...prev, consumed: prev.consumed + 1 })));
    expect(result.current.hydration.consumed).toBe(1);
  });
});

describe('useVitalsState — Supabase sync wiring', () => {
  it('syncs dailyMacros on mount', () => {
    renderHook(() => useVitalsState());
    expect(pushToCloud).toHaveBeenCalledWith('dailyMacros', expect.any(Object));
  });

  it('syncs hydration, movement, dailyGoal on mount', () => {
    renderHook(() => useVitalsState());
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).toContain('hydration');
    expect(calls).toContain('movement');
    expect(calls).toContain('dailyGoal');
  });

  it('does NOT sync checkInStatus (V2 — declared in SyncKey but not yet wired)', () => {
    renderHook(() => useVitalsState());
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).not.toContain('checkInStatus');
  });

  it('re-syncs after a setter call', () => {
    const { result } = renderHook(() => useVitalsState());
    (pushToCloud as ReturnType<typeof vi.fn>).mockClear();
    act(() => result.current.setDailyGoal('Test goal'));
    expect(pushToCloud).toHaveBeenCalledWith('dailyGoal', 'Test goal');
  });
});
