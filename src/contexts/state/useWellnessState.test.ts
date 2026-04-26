/**
 * Tests for useWellnessState — Phase 2.5 (ADR-015).
 *
 * Locks the contract for the wellness slice: 4 persisted vars + 4 lazy
 * seeds + special weeklyCheckIns seed + 4 sync effects + 8 handlers.
 *
 * Lazy seeds are gated by shouldReseed(); we mock that to false to keep
 * tests free of dynamic imports.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../lib/sync', () => ({ pushToCloud: vi.fn() }));
vi.mock('../../lib/seedVersion', () => ({
  shouldReseed: vi.fn(() => false),
  setStoredSeedVersion: vi.fn(),
}));

import { useWellnessState } from './useWellnessState';
import { pushToCloud } from '../../lib/sync';

const setUserProfileStub = vi.fn();
const setCheckInStatusStub = vi.fn();
const setCommunityPostsStub = vi.fn();
const navigateToStub = vi.fn();

function makeDeps(overrides: Partial<Parameters<typeof useWellnessState>[0]> = {}) {
  return {
    setUserProfile: setUserProfileStub,
    setCheckInStatus: setCheckInStatusStub,
    setCommunityPosts: setCommunityPostsStub,
    dailyLog: [],
    navigateTo: navigateToStub,
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('useWellnessState — initial shape', () => {
  it('exposes the 4 persisted vars + 4 setters + 8 handlers', () => {
    const { result } = renderHook(() => useWellnessState(makeDeps()));
    // State + setters
    expect(Array.isArray(result.current.toleranceLogs)).toBe(true);
    expect(Array.isArray(result.current.realFeelLogs)).toBe(true);
    expect(Array.isArray(result.current.weightHistory)).toBe(true);
    expect(Array.isArray(result.current.nutritionHistory)).toBe(true);
    expect(typeof result.current.setToleranceLogs).toBe('function');
    expect(typeof result.current.setRealFeelLogs).toBe('function');
    expect(typeof result.current.setWeightHistory).toBe('function');
    expect(typeof result.current.setNutritionHistory).toBe('function');
    // 8 handler factories
    expect(typeof result.current.handleLogWeight).toBe('function');
    expect(typeof result.current.handleUpdateSnapshot).toBe('function');
    expect(typeof result.current.handleDeleteSnapshot).toBe('function');
    expect(typeof result.current.handleAddToleranceLog).toBe('function');
    expect(typeof result.current.handleRealFeelLog).toBe('function');
    expect(typeof result.current.handleCheckIn).toBe('function');
    expect(typeof result.current.handleCompleteCheckIn).toBe('function');
    expect(typeof result.current.handleShareProgress).toBe('function');
  });

  it('boots all logs as empty arrays', () => {
    const { result } = renderHook(() => useWellnessState(makeDeps()));
    expect(result.current.toleranceLogs).toEqual([]);
    expect(result.current.realFeelLogs).toEqual([]);
    expect(result.current.weightHistory).toEqual([]);
    expect(result.current.nutritionHistory).toEqual([]);
  });
});

describe('useWellnessState — persistence', () => {
  it('persists weightHistory mutations', () => {
    const { result } = renderHook(() => useWellnessState(makeDeps()));
    const snapshot = { date: '2026-04-26', kg: 75, source: 'manual' as const };
    act(() => result.current.setWeightHistory([snapshot]));
    const raw = window.localStorage.getItem('weightHistory');
    expect(JSON.parse(raw!)).toEqual([snapshot]);
  });

  it('rehydrates toleranceLogs from localStorage', () => {
    window.localStorage.setItem('toleranceLogs', JSON.stringify([{ id: 't-1' }]));
    const { result } = renderHook(() => useWellnessState(makeDeps()));
    expect(result.current.toleranceLogs).toEqual([{ id: 't-1' }]);
  });
});

describe('useWellnessState — Supabase sync wiring', () => {
  it('syncs the 4 user-owned wellness keys on mount', () => {
    renderHook(() => useWellnessState(makeDeps()));
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).toContain('toleranceLogs');
    expect(calls).toContain('realFeelLogs');
    expect(calls).toContain('weightHistory');
    expect(calls).toContain('nutritionHistory');
  });
});
