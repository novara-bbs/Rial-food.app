/**
 * Social state slice — owns community + creators + challenges + notifications.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015) — the largest
 * domain in the codebase. This hook owns:
 *   - 9 persisted state vars (communityPosts, communityStories, notifications,
 *     likedPosts, savedPosts, followedCreators, joinedChallenges,
 *     challengeJoinDates, challengeProgress)
 *   - 2 lazy seeds (communityPosts, communityStories — both `replace` strategy)
 *   - 9 callbacks/handlers covering: like/save toggles with counter sync,
 *     notification reads, posts, comments, stories, follows, challenges
 *   - 6 Supabase sync effects for the user-owned slices (community content
 *     itself is backend-sourced and intentionally NOT synced)
 *
 * Internal patterns:
 *   - userProfileRef + tRef + getUserProfile + getT — ref-getter pattern that
 *     keeps handler identities stable across userProfile/t changes (otherwise
 *     every render would invalidate them and re-render every consumer).
 *   - joinedChallengesRef — same pattern for the toggle handler so it always
 *     sees the latest list (avoid stale-snapshot double-add bug).
 *
 * Cross-domain deps: userProfile + t (refs) + navigateTo. No domain setters
 * are needed; social handlers only mutate social state.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { pushToCloud } from '../../lib/sync';
import { shouldReseed, setStoredSeedVersion } from '../../lib/seedVersion';
import { logger } from '../../lib/logger';
import {
  createHandleCreatePost,
  createHandleAddComment,
} from '../../features/social/handlers/social-handlers';
import {
  createHandlePublishStory,
  createHandleMarkStoryViewed,
} from '../../features/social/handlers/story-handlers';
import { createHandleFollowCreator } from '../../features/social/handlers/creator-handlers';
import {
  createHandleJoinChallenge,
  createHandleLeaveChallenge,
  createHandleCheckInChallenge,
  createHandleToggleChallenge,
  type ChallengeProgress,
} from '../../features/social/handlers/challenge-handlers';
import type { Story, StorySlide, Notification as NotificationType } from '../../types/social';
import type { UserProfile } from '../../types/user';
import type { Translations } from '../../i18n';

interface UseSocialStateDeps {
  userProfile: UserProfile;
  t: Translations;
  navigateTo: (screen: string, data?: Record<string, unknown>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommunityPostRow = any;

export function useSocialState({ userProfile, t, navigateTo }: UseSocialStateDeps) {
  // ── Community posts (lazy seed: replace, since demo content) ─────────────
  const [communityPosts, setCommunityPosts] = useLocalStorageState<CommunityPostRow[]>('communityPosts', []);
  useEffect(() => {
    if (!shouldReseed('communityPosts', 'communityPosts')) return;
    import('../../features/social/data/seed-posts')
      .then((m) => {
        setCommunityPosts(m.SEED_POSTS);
        setStoredSeedVersion('communityPosts');
      })
      .catch((err) => logger.warn('seed.communityPosts load failed', { err }));
  }, [setCommunityPosts]);

  // ── Like/save toggles ─────────────────────────────────────────────────────
  // Two stores per toggle: per-user id-list (cross-device sync) AND mutate
  // the canonical post.likes / post.saves counter so PostCard renders the
  // real total (not a cosmetic +1). Order matters: toggles must come AFTER
  // setCommunityPosts is bound (closure captures setter at definition time).
  const [likedPosts, setLikedPosts] = useLocalStorageState<number[]>('likedPosts', []);
  const [savedPosts, setSavedPosts] = useLocalStorageState<number[]>('savedPosts', []);

  const toggleLikePost = useCallback((postId: number) => {
    setLikedPosts((prev: number[]) => {
      const willLike = !prev.includes(postId);
      setCommunityPosts((posts: CommunityPostRow[]) =>
        posts.map(p => p.id === postId
          ? { ...p, likes: Math.max(0, (p.likes || 0) + (willLike ? 1 : -1)) }
          : p,
        ),
      );
      return willLike ? [...prev, postId] : prev.filter(id => id !== postId);
    });
  }, [setLikedPosts, setCommunityPosts]);

  const toggleSavePost = useCallback((postId: number) => {
    setSavedPosts((prev: number[]) => {
      const willSave = !prev.includes(postId);
      setCommunityPosts((posts: CommunityPostRow[]) =>
        posts.map(p => p.id === postId
          ? { ...p, saves: Math.max(0, (p.saves || 0) + (willSave ? 1 : -1)) }
          : p,
        ),
      );
      return willSave ? [...prev, postId] : prev.filter(id => id !== postId);
    });
  }, [setSavedPosts, setCommunityPosts]);

  // ── Stories (lazy seed: replace) ─────────────────────────────────────────
  const [communityStories, setCommunityStories] = useLocalStorageState<Story[]>('communityStories', []);
  useEffect(() => {
    if (!shouldReseed('communityStories', 'communityStories')) return;
    import('../../features/social/data/seed-stories')
      .then((m) => {
        setCommunityStories(m.SEED_STORIES);
        setStoredSeedVersion('communityStories');
      })
      .catch((err) => logger.warn('seed.communityStories load failed', { err }));
  }, [setCommunityStories]);

  // ── Notifications + read-state callbacks ─────────────────────────────────
  const [notifications, setNotifications] = useLocalStorageState<NotificationType[]>('notifications', []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev: NotificationType[]) => prev.map(n => ({ ...n, read: true })));
  }, [setNotifications]);
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev: NotificationType[]) =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  }, [setNotifications]);

  // ── Social graph + challenge persistence (single writer via factory) ─────
  // Pre-Wave-3 these were declared inline in 5+ screens, causing stale-
  // snapshot bugs (toggle from Discover not reflected in Community until
  // unmount). Centralising the setters means every consumer sees the same
  // ref via context.
  const [followedCreators, setFollowedCreators] = useLocalStorageState<string[]>('followedCreators', []);
  const [joinedChallenges, setJoinedChallenges] = useLocalStorageState<string[]>('joinedChallenges', []);
  const [challengeJoinDates, setChallengeJoinDates] = useLocalStorageState<Record<string, string>>('challengeJoinDates', {});
  const [challengeProgress, setChallengeProgress] = useLocalStorageState<Record<string, ChallengeProgress>>('challengeProgress', {});

  // ── Ref getters for handlers that need the LATEST userProfile/t ──────────
  // Without this, every userProfile or t change would invalidate the handler
  // identity and cascade re-renders to every consumer.
  const userProfileRef = useRef(userProfile);
  useEffect(() => { userProfileRef.current = userProfile; }, [userProfile]);
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);
  const getUserProfile = useCallback(() => userProfileRef.current, []);
  const getT = useCallback(() => tRef.current, []);

  // ── Toast helper for handlers that need to notify ───────────────────────
  const notifyToast = useCallback((msg: string) => toast.success(msg), []);

  // ── Memoized handler factories ──────────────────────────────────────────
  const handleCreatePost = useMemo(
    () => createHandleCreatePost({ setCommunityPosts, navigateTo, getUserProfile, getT }),
    [setCommunityPosts, navigateTo, getUserProfile, getT],
  );
  const handleAddComment = useMemo(
    () => createHandleAddComment({ setCommunityPosts, getUserProfile, getT }),
    [setCommunityPosts, getUserProfile, getT],
  );
  const handlePublishStory = useMemo(
    () => createHandlePublishStory({ setCommunityStories, navigateTo, getUserProfile, getT }),
    [setCommunityStories, navigateTo, getUserProfile, getT],
  );
  const handleMarkStoryViewed = useMemo(
    () => createHandleMarkStoryViewed({ setCommunityStories }),
    [setCommunityStories],
  );
  const handleFollowCreator = useMemo(
    () => createHandleFollowCreator({ setFollowedCreators, getT, notify: notifyToast }),
    [setFollowedCreators, getT, notifyToast],
  );
  const handleJoinChallenge = useMemo(
    () => createHandleJoinChallenge({
      setJoinedChallenges,
      setJoinDates: setChallengeJoinDates,
      setChallengeProgress,
      getT,
      notify: notifyToast,
    }),
    [setJoinedChallenges, setChallengeJoinDates, setChallengeProgress, getT, notifyToast],
  );
  const handleLeaveChallenge = useMemo(
    () => createHandleLeaveChallenge({
      setJoinedChallenges,
      setChallengeProgress,
      getT,
      notify: notifyToast,
    }),
    [setJoinedChallenges, setChallengeProgress, getT, notifyToast],
  );
  const handleCheckInChallenge = useMemo(
    () => createHandleCheckInChallenge({ setChallengeProgress, getT, notify: notifyToast }),
    [setChallengeProgress, getT, notifyToast],
  );

  // toggle wrapper: ref-linked to joinedChallenges so the handler always
  // sees the latest list (otherwise toggling right after a join would still
  // see the pre-join snapshot and double-add).
  const joinedChallengesRef = useRef(joinedChallenges);
  useEffect(() => { joinedChallengesRef.current = joinedChallenges; }, [joinedChallenges]);
  const handleToggleChallenge = useMemo(
    () => createHandleToggleChallenge({
      getJoinedChallenges: () => joinedChallengesRef.current,
      handleJoinChallenge,
      handleLeaveChallenge,
    }),
    [handleJoinChallenge, handleLeaveChallenge],
  );

  // ── Supabase sync (community content NOT synced — backend-sourced) ──────
  useEffect(() => { pushToCloud('likedPosts', likedPosts); }, [likedPosts]);
  useEffect(() => { pushToCloud('savedPosts', savedPosts); }, [savedPosts]);
  useEffect(() => { pushToCloud('followedCreators', followedCreators); }, [followedCreators]);
  useEffect(() => { pushToCloud('joinedChallenges', joinedChallenges); }, [joinedChallenges]);
  useEffect(() => { pushToCloud('challengeJoinDates', challengeJoinDates); }, [challengeJoinDates]);
  useEffect(() => { pushToCloud('challengeProgress', challengeProgress); }, [challengeProgress]);

  return {
    communityPosts, setCommunityPosts,
    communityStories, setCommunityStories,
    notifications, markAllNotificationsRead, markNotificationRead,
    likedPosts, toggleLikePost,
    savedPosts, toggleSavePost,
    followedCreators,
    joinedChallenges,
    challengeJoinDates,
    challengeProgress,
    handleCreatePost,
    handleAddComment,
    handlePublishStory,
    handleMarkStoryViewed,
    handleFollowCreator,
    handleJoinChallenge,
    handleLeaveChallenge,
    handleCheckInChallenge,
    handleToggleChallenge,
  };
}

export type SocialState = ReturnType<typeof useSocialState>;

// Re-export StorySlide for convenience (consumers used to import it via the
// AppStateContext re-export chain).
export type { StorySlide };
