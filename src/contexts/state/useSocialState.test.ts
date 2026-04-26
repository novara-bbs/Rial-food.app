/**
 * Tests for useSocialState — Phase 2.5 (ADR-015).
 *
 * Locks the contract for the social slice (the largest hook): 9 persisted
 * vars + 4 inline callbacks + 9 handlers + ref-getter pattern + 6 sync.
 *
 * The toggleLikePost / toggleSavePost callbacks are non-trivial (mutate
 * BOTH the id-list AND the canonical post counter) so they get focused
 * coverage.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../lib/sync', () => ({ pushToCloud: vi.fn() }));
vi.mock('../../lib/seedVersion', () => ({
  shouldReseed: vi.fn(() => false),
  setStoredSeedVersion: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useSocialState } from './useSocialState';
import { pushToCloud } from '../../lib/sync';

const navigateToStub = vi.fn();
const userProfileStub = { name: 'tester', avatar: '' } as never;
const tStub = {} as never;

function makeDeps() {
  return {
    userProfile: userProfileStub,
    t: tStub,
    navigateTo: navigateToStub,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('useSocialState — initial shape', () => {
  it('exposes the documented return-keys (state + callbacks + handlers)', () => {
    const { result } = renderHook(() => useSocialState(makeDeps()));
    // Persisted state (9)
    expect(Array.isArray(result.current.communityPosts)).toBe(true);
    expect(Array.isArray(result.current.communityStories)).toBe(true);
    expect(Array.isArray(result.current.notifications)).toBe(true);
    expect(Array.isArray(result.current.likedPosts)).toBe(true);
    expect(Array.isArray(result.current.savedPosts)).toBe(true);
    expect(Array.isArray(result.current.followedCreators)).toBe(true);
    expect(Array.isArray(result.current.joinedChallenges)).toBe(true);
    expect(typeof result.current.challengeJoinDates).toBe('object');
    expect(typeof result.current.challengeProgress).toBe('object');
    // Inline callbacks (4)
    expect(typeof result.current.markAllNotificationsRead).toBe('function');
    expect(typeof result.current.markNotificationRead).toBe('function');
    expect(typeof result.current.toggleLikePost).toBe('function');
    expect(typeof result.current.toggleSavePost).toBe('function');
    // Handler factories (9)
    expect(typeof result.current.handleCreatePost).toBe('function');
    expect(typeof result.current.handleAddComment).toBe('function');
    expect(typeof result.current.handlePublishStory).toBe('function');
    expect(typeof result.current.handleMarkStoryViewed).toBe('function');
    expect(typeof result.current.handleFollowCreator).toBe('function');
    expect(typeof result.current.handleJoinChallenge).toBe('function');
    expect(typeof result.current.handleLeaveChallenge).toBe('function');
    expect(typeof result.current.handleCheckInChallenge).toBe('function');
    expect(typeof result.current.handleToggleChallenge).toBe('function');
  });
});

describe('useSocialState — toggleLikePost (dual-store pattern)', () => {
  it('adds postId to likedPosts AND increments post.likes counter', () => {
    const { result } = renderHook(() => useSocialState(makeDeps()));
    act(() => result.current.setCommunityPosts([{ id: 1, likes: 5 } as never]));

    act(() => result.current.toggleLikePost(1));

    expect(result.current.likedPosts).toContain(1);
    expect(result.current.communityPosts[0].likes).toBe(6);
  });

  it('removes postId AND decrements post.likes when un-liking', () => {
    const { result } = renderHook(() => useSocialState(makeDeps()));
    act(() => result.current.setCommunityPosts([{ id: 1, likes: 5 } as never]));

    act(() => result.current.toggleLikePost(1)); // like → 6
    act(() => result.current.toggleLikePost(1)); // un-like → 5

    expect(result.current.likedPosts).not.toContain(1);
    expect(result.current.communityPosts[0].likes).toBe(5);
  });

  it('clamps at 0 when the underlying counter is missing/zero', () => {
    const { result } = renderHook(() => useSocialState(makeDeps()));
    act(() => result.current.setCommunityPosts([{ id: 1 } as never]));

    act(() => result.current.toggleLikePost(1));
    act(() => result.current.toggleLikePost(1)); // forces decrement
    act(() => result.current.toggleLikePost(1)); // un-like again
    act(() => result.current.toggleLikePost(1)); // forces decrement again

    expect(result.current.communityPosts[0].likes).toBeGreaterThanOrEqual(0);
  });
});

describe('useSocialState — toggleSavePost (mirrors like)', () => {
  it('adds postId to savedPosts AND increments post.saves', () => {
    const { result } = renderHook(() => useSocialState(makeDeps()));
    act(() => result.current.setCommunityPosts([{ id: 1, saves: 0 } as never]));
    act(() => result.current.toggleSavePost(1));
    expect(result.current.savedPosts).toContain(1);
    expect(result.current.communityPosts[0].saves).toBe(1);
  });
});

describe('useSocialState — notification reads', () => {
  it('markAllNotificationsRead flips read=true on every notification', () => {
    // Seed before the first render so the hook initializes with notifications.
    window.localStorage.setItem('notifications', JSON.stringify([
      { id: 'n1', read: false, type: 'like' },
      { id: 'n2', read: false, type: 'follow' },
    ]));
    const { result } = renderHook(() => useSocialState(makeDeps()));
    act(() => result.current.markAllNotificationsRead());
    expect(result.current.notifications.every(n => n.read === true)).toBe(true);
  });

  it('markNotificationRead flips a single notification by id', () => {
    window.localStorage.setItem('notifications', JSON.stringify([
      { id: 'n1', read: false }, { id: 'n2', read: false },
    ]));
    const { result } = renderHook(() => useSocialState(makeDeps()));
    act(() => result.current.markNotificationRead('n1'));
    expect(result.current.notifications.find(n => n.id === 'n1')!.read).toBe(true);
    expect(result.current.notifications.find(n => n.id === 'n2')!.read).toBe(false);
  });
});

describe('useSocialState — Supabase sync wiring', () => {
  it('syncs the 6 user-owned social keys on mount', () => {
    renderHook(() => useSocialState(makeDeps()));
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).toContain('likedPosts');
    expect(calls).toContain('savedPosts');
    expect(calls).toContain('followedCreators');
    expect(calls).toContain('joinedChallenges');
    expect(calls).toContain('challengeJoinDates');
    expect(calls).toContain('challengeProgress');
  });

  it('does NOT sync community content (backend-sourced)', () => {
    renderHook(() => useSocialState(makeDeps()));
    const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    expect(calls).not.toContain('communityPosts');
    expect(calls).not.toContain('communityStories');
    expect(calls).not.toContain('notifications');
  });
});
