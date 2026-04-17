/**
 * Creator (follow) handlers.
 *
 * Centralizes the follow/unfollow toggle that used to live inline in
 * Discover/CreatorProfile/Community/CreatorVerification as
 * `useLocalStorageState('followedCreators')`. Moving it to a factory gives:
 *   - one authoritative writer per key (no race between screens),
 *   - a single toast/locale point,
 *   - a future hook for notifications/analytics when follow flips,
 *   - cross-screen live propagation via AppStateContext re-renders (the old
 *     inline snapshot in Community was stale after a toggle from Discover).
 *
 * i18n contract: uses `t.social.followed` / `t.social.unfollowed`. No literal
 * Spanish fallbacks — the keys are guaranteed by `check:i18n`.
 */

interface SocialT {
  social: {
    followed: string;
    unfollowed: string;
  };
}

export function createHandleFollowCreator(deps: {
  setFollowedCreators: (fn: (prev: string[]) => string[]) => void;
  getT: () => SocialT;
  notify?: (message: string) => void;
}) {
  return (creatorId: string): { followed: boolean } => {
    let followed = false;
    deps.setFollowedCreators((prev: string[]) => {
      const isFollowing = prev.includes(creatorId);
      followed = !isFollowing;
      return isFollowing ? prev.filter(id => id !== creatorId) : [...prev, creatorId];
    });
    if (deps.notify) {
      const t = deps.getT();
      deps.notify(followed ? t.social.followed : t.social.unfollowed);
    }
    return { followed };
  };
}
