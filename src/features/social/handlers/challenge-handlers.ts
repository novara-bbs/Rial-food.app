/**
 * Challenge handlers — join / leave / check-in.
 *
 * Pulled out of Challenges.tsx + ChallengeDetail.tsx + Discover.tsx, where
 * the same `useLocalStorageState` tuple was declared three times against the
 * same storage key (`joinedChallenges`/`challengeJoinDates`/`challengeProgress`).
 * Three writers → stale reads across screens and zero central hook for
 * notifications/analytics. The factory pattern fixes both.
 *
 * i18n contract: uses `t.challenges.checkedIn` / `t.challenges.joined` /
 * `t.challenges.left`. Keys are guaranteed symmetric ES↔EN by `check:i18n`.
 */

export interface ChallengeProgress {
  challengeId: string;
  joinDate: string;
  checkIns: { date: string; note?: string }[];
}

interface ChallengesT {
  challenges: {
    checkedIn: string;
    joined: string;
    left: string;
  };
}

/** Today's date in `YYYY-MM-DD` form (local tz, not UTC). */
function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function createHandleJoinChallenge(deps: {
  setJoinedChallenges: (fn: (prev: string[]) => string[]) => void;
  setJoinDates: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  setChallengeProgress: (fn: (prev: Record<string, ChallengeProgress>) => Record<string, ChallengeProgress>) => void;
  getT: () => ChallengesT;
  notify?: (message: string) => void;
}) {
  return (challengeId: string) => {
    const today = todayIso();
    deps.setJoinedChallenges(prev => (prev.includes(challengeId) ? prev : [...prev, challengeId]));
    deps.setJoinDates(prev => (prev[challengeId] ? prev : { ...prev, [challengeId]: new Date().toISOString() }));
    deps.setChallengeProgress(prev => (
      prev[challengeId]
        ? prev
        : { ...prev, [challengeId]: { challengeId, joinDate: today, checkIns: [] } }
    ));
    if (deps.notify) {
      deps.notify(deps.getT().challenges.joined);
    }
  };
}

export function createHandleLeaveChallenge(deps: {
  setJoinedChallenges: (fn: (prev: string[]) => string[]) => void;
  setChallengeProgress: (fn: (prev: Record<string, ChallengeProgress>) => Record<string, ChallengeProgress>) => void;
  getT: () => ChallengesT;
  notify?: (message: string) => void;
}) {
  return (challengeId: string) => {
    deps.setJoinedChallenges(prev => prev.filter(id => id !== challengeId));
    deps.setChallengeProgress(prev => {
      if (!prev[challengeId]) return prev;
      const next = { ...prev };
      delete next[challengeId];
      return next;
    });
    if (deps.notify) {
      deps.notify(deps.getT().challenges.left);
    }
  };
}

export function createHandleCheckInChallenge(deps: {
  setChallengeProgress: (fn: (prev: Record<string, ChallengeProgress>) => Record<string, ChallengeProgress>) => void;
  getT: () => ChallengesT;
  notify?: (message: string) => void;
}) {
  return (challengeId: string): { alreadyCheckedIn: boolean } => {
    const today = todayIso();
    let alreadyCheckedIn = false;
    deps.setChallengeProgress(prev => {
      const existing = prev[challengeId] || { challengeId, joinDate: today, checkIns: [] };
      if (existing.checkIns.some(c => c.date === today)) {
        alreadyCheckedIn = true;
        return prev;
      }
      return {
        ...prev,
        [challengeId]: { ...existing, checkIns: [...existing.checkIns, { date: today }] },
      };
    });
    if (!alreadyCheckedIn && deps.notify) {
      deps.notify(deps.getT().challenges.checkedIn);
    }
    return { alreadyCheckedIn };
  };
}

/**
 * Toggle wrapper — used in the Discover/Challenges CTAs where the same button
 * joins or leaves depending on current state. Keeping the toggle logic server-
 * side of the React layer keeps the call sites short and consistent.
 */
export function createHandleToggleChallenge(deps: {
  getJoinedChallenges: () => string[];
  handleJoinChallenge: (id: string) => void;
  handleLeaveChallenge: (id: string) => void;
}) {
  return (challengeId: string) => {
    if (deps.getJoinedChallenges().includes(challengeId)) {
      deps.handleLeaveChallenge(challengeId);
    } else {
      deps.handleJoinChallenge(challengeId);
    }
  };
}
