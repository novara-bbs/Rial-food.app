/**
 * Tests for useProfileState — Phase 2.5 (ADR-015).
 *
 * Locks the contract for the profile slice: 5 persisted vars, the R8.3
 * foodDislikes→foodPreferences migration, and 3 Supabase sync effects.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the sync layer so tests don't try to talk to Supabase.
vi.mock('../../lib/sync', () => ({
  pushToCloud: vi.fn(),
  syncOnSignIn: vi.fn(),
  pullFromCloud: vi.fn().mockResolvedValue({}),
  exportUserData: vi.fn().mockResolvedValue('{}'),
}));

import { useProfileState } from './useProfileState';
import { pushToCloud } from '../../lib/sync';

beforeEach(() => {
  // Each test starts with a fresh localStorage so seeds don't leak between specs.
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('useProfileState — initial shape', () => {
  it('exposes 5 persisted state vars + 5 setters', () => {
    const { result } = renderHook(() => useProfileState());
    // Persisted state
    expect(typeof result.current.isPro).toBe('boolean');
    expect(typeof result.current.showAIBot).toBe('boolean');
    expect(typeof result.current.isFirstTime).toBe('boolean');
    expect(typeof result.current.miseEnPlaceEnabled).toBe('boolean');
    expect(result.current.userProfile).toBeDefined();
    // Setters
    expect(typeof result.current.setIsPro).toBe('function');
    expect(typeof result.current.setShowAIBot).toBe('function');
    expect(typeof result.current.setIsFirstTime).toBe('function');
    expect(typeof result.current.setMiseEnPlaceEnabled).toBe('function');
    expect(typeof result.current.setUserProfile).toBe('function');
  });

  it('boots with first-time defaults (isFirstTime=true, isPro=false, showAIBot=true, miseEnPlace=true)', () => {
    const { result } = renderHook(() => useProfileState());
    expect(result.current.isFirstTime).toBe(true);
    expect(result.current.isPro).toBe(false);
    expect(result.current.showAIBot).toBe(true);
    expect(result.current.miseEnPlaceEnabled).toBe(true);
  });

  it('boots userProfile with sensible default biometrics + empty restrictions', () => {
    const { result } = renderHook(() => useProfileState());
    expect(result.current.userProfile.name).toBe('');
    expect(result.current.userProfile.age).toBe(32);
    expect(result.current.userProfile.height).toBe(175);
    expect(result.current.userProfile.weight).toBe(78);
    expect(result.current.userProfile.goal).toBe('maintain');
    expect(result.current.userProfile.dietaryPreferences).toEqual([]);
  });
});

describe('useProfileState — persistence', () => {
  it('writes setIsPro updates to localStorage under rial_isPro', () => {
    const { result } = renderHook(() => useProfileState());
    act(() => result.current.setIsPro(true));
    expect(window.localStorage.getItem('isPro')).toBe('true');
    expect(result.current.isPro).toBe(true);
  });

  it('rehydrates from localStorage on remount', () => {
    window.localStorage.setItem('isPro', 'true');
    window.localStorage.setItem('isFirstTime', 'false');
    const { result } = renderHook(() => useProfileState());
    expect(result.current.isPro).toBe(true);
    expect(result.current.isFirstTime).toBe(false);
  });

  it('userProfile updates are persisted as JSON', () => {
    const { result } = renderHook(() => useProfileState());
    act(() => result.current.setUserProfile({
      ...result.current.userProfile,
      name: 'Vicente',
      goal: 'cut',
    }));
    const raw = window.localStorage.getItem('userProfile');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.name).toBe('Vicente');
    expect(parsed.goal).toBe('cut');
  });
});

describe('useProfileState — R8.3 migration (foodDislikes → foodPreferences)', () => {
  it('migrates legacy foodDislikes[] to foodPreferences Record on mount', () => {
    window.localStorage.setItem('userProfile', JSON.stringify({
      name: 'legacy', age: 30, height: 170, weight: 70,
      sex: 'female', goal: 'maintain', activity: 'active', trains: false,
      dietaryPreferences: [],
      foodDislikes: ['ing-1', 'ing-2'],
    }));

    const { result } = renderHook(() => useProfileState());
    // Migration runs in useEffect; renderHook waits for effects to flush.
    expect(result.current.userProfile.foodPreferences).toEqual({
      'ing-1': 'dislike',
      'ing-2': 'dislike',
    });
    // Original foodDislikes is preserved (kept for backward-compat).
    expect(result.current.userProfile.foodDislikes).toEqual(['ing-1', 'ing-2']);
  });

  it('is a no-op when foodPreferences already exists (idempotent)', () => {
    const existingPrefs = { 'ing-A': 'like' as const, 'ing-B': 'dislike' as const };
    window.localStorage.setItem('userProfile', JSON.stringify({
      name: 'already-migrated', age: 30, height: 170, weight: 70,
      sex: 'female', goal: 'maintain', activity: 'active', trains: false,
      dietaryPreferences: [],
      foodDislikes: ['ing-1'],
      foodPreferences: existingPrefs,
    }));

    const { result } = renderHook(() => useProfileState());
    // foodPreferences should NOT be overwritten by the migration.
    expect(result.current.userProfile.foodPreferences).toEqual(existingPrefs);
  });

  it('is a no-op when foodDislikes is empty / missing', () => {
    const { result } = renderHook(() => useProfileState());
    expect(result.current.userProfile.foodPreferences).toBeUndefined();
  });
});

describe('useProfileState — Supabase sync wiring', () => {
  it('calls pushToCloud("userProfile", value) on initial mount', () => {
    renderHook(() => useProfileState());
    expect(pushToCloud).toHaveBeenCalledWith('userProfile', expect.any(Object));
  });

  it('calls pushToCloud("isPro", value) on initial mount', () => {
    renderHook(() => useProfileState());
    expect(pushToCloud).toHaveBeenCalledWith('isPro', false);
  });

  it('calls pushToCloud("isFirstTime", value) on initial mount', () => {
    renderHook(() => useProfileState());
    expect(pushToCloud).toHaveBeenCalledWith('isFirstTime', true);
  });

  it('does NOT sync showAIBot or miseEnPlaceEnabled (UI prefs, intentionally local)', () => {
    renderHook(() => useProfileState());
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls;
    const keys = calls.map(c => c[0]);
    expect(keys).not.toContain('showAIBot');
    expect(keys).not.toContain('miseEnPlacePreCook');
  });

  it('re-syncs userProfile after a setter call', () => {
    const { result } = renderHook(() => useProfileState());
    (pushToCloud as ReturnType<typeof vi.fn>).mockClear();

    act(() => result.current.setIsPro(true));

    expect(pushToCloud).toHaveBeenCalledWith('isPro', true);
  });
});
