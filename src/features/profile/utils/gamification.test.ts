import { describe, it, expect } from 'vitest';
import {
  calculatePoints,
  getUserLevel,
  getEarnedBadges,
  getNextMilestone,
  LEVELS,
  STREAK_MILESTONES,
  type UserStats,
} from './gamification';
import { calcStreaks } from '../../wellness/utils/streaks';
import type { DailyArchive } from '../../../hooks/useDailyReset';

// Helper: build a minimal DailyArchive stub N days before `refNow`.
const DAY_MS = 86_400_000;

function archiveDaysAgo(n: number, refNow: Date): DailyArchive {
  const d = new Date(refNow.getTime() - n * DAY_MS);
  const date = d.toISOString().slice(0, 10);
  return { date, mealCount: 1 } as DailyArchive;
}

const baseStats: UserStats = {
  recipesCreated: 0,
  recipesImported: 0,
  mealsLogged: 0,
  realFeelCount: 0,
  postsPublished: 0,
  plansCreated: 0,
  shoppingListUsed: false,
  fastingsCompleted: 0,
  wearableConnected: false,
  trainingDayUsed: 0,
  challengesCompleted: 0,
  isVerifiedCreator: false,
  streakDays: 0,
};

// ─── calcStreaks (canonical Q13 — replaces deprecated calculateStreak) ────────

describe('calcStreaks – mealLog.current', () => {
  const now = new Date('2026-04-24T12:00:00Z');

  it('returns 0 for empty history', () => {
    const result = calcStreaks({ history: [], realFeelLogs: [], now });
    expect(result.mealLog.current).toBe(0);
  });

  it('returns 1 when only today has meals (via todayHasMeals flag)', () => {
    const result = calcStreaks({ history: [], realFeelLogs: [], todayHasMeals: true, now });
    expect(result.mealLog.current).toBe(1);
  });

  it('returns 1 when only yesterday has meals in archive', () => {
    const history = [archiveDaysAgo(1, now)];
    const result = calcStreaks({ history, realFeelLogs: [], now });
    expect(result.mealLog.current).toBe(1);
  });

  it('returns 0 when last log was 2+ days ago', () => {
    const history = [archiveDaysAgo(2, now)];
    const result = calcStreaks({ history, realFeelLogs: [], now });
    expect(result.mealLog.current).toBe(0);
  });

  it('returns consecutive streak including today', () => {
    const history = [archiveDaysAgo(1, now), archiveDaysAgo(2, now)];
    const result = calcStreaks({ history, realFeelLogs: [], todayHasMeals: true, now });
    expect(result.mealLog.current).toBe(3);
  });

  it('returns consecutive streak when all in archive (today not logged)', () => {
    const history = [archiveDaysAgo(1, now), archiveDaysAgo(2, now), archiveDaysAgo(3, now)];
    const result = calcStreaks({ history, realFeelLogs: [], now });
    expect(result.mealLog.current).toBe(3);
  });

  it('stops counting at gap', () => {
    const history = [archiveDaysAgo(1, now), archiveDaysAgo(5, now), archiveDaysAgo(6, now)];
    const result = calcStreaks({ history, realFeelLogs: [], todayHasMeals: true, now });
    expect(result.mealLog.current).toBe(2);
  });

  it('deduplicates same-day entries (mealCount > 0 check)', () => {
    // Two archive entries for the same day — should still count as 1 day.
    const sameDay = archiveDaysAgo(1, now);
    const history = [sameDay, { ...sameDay }, archiveDaysAgo(2, now)];
    const result = calcStreaks({ history, realFeelLogs: [], todayHasMeals: true, now });
    expect(result.mealLog.current).toBe(3);
  });
});

describe('calcStreaks – mealLog.best', () => {
  const now = new Date('2026-04-24T12:00:00Z');

  it('returns 0 best for empty history', () => {
    expect(calcStreaks({ history: [], realFeelLogs: [], now }).mealLog.best).toBe(0);
  });

  it('best equals current when always consecutive', () => {
    const history = [archiveDaysAgo(1, now), archiveDaysAgo(2, now), archiveDaysAgo(3, now)];
    const result = calcStreaks({ history, realFeelLogs: [], now });
    expect(result.mealLog.best).toBe(3);
  });

  it('best is preserved across a gap', () => {
    // 3-day run long ago, 1-day current streak
    const history = [
      archiveDaysAgo(1, now),
      archiveDaysAgo(10, now), archiveDaysAgo(11, now), archiveDaysAgo(12, now),
    ];
    const result = calcStreaks({ history, realFeelLogs: [], now });
    expect(result.mealLog.best).toBe(3);
    expect(result.mealLog.current).toBe(1);
  });
});

// ─── calculatePoints ─────────────────────────────────────────────────────────

describe('calculatePoints', () => {
  it('returns 0 for empty stats', () => {
    expect(calculatePoints(baseStats)).toBe(0);
  });

  it('counts meals at 2 pts each', () => {
    expect(calculatePoints({ ...baseStats, mealsLogged: 10 })).toBe(20);
  });

  it('counts recipes (created + imported) at 5 pts each', () => {
    expect(calculatePoints({ ...baseStats, recipesCreated: 3, recipesImported: 2 })).toBe(25);
  });

  it('counts realFeel at 3 pts each', () => {
    expect(calculatePoints({ ...baseStats, realFeelCount: 7 })).toBe(21);
  });

  it('counts posts at 4 pts each', () => {
    expect(calculatePoints({ ...baseStats, postsPublished: 5 })).toBe(20);
  });

  it('counts streak at 1 pt per day', () => {
    expect(calculatePoints({ ...baseStats, streakDays: 30 })).toBe(30);
  });

  it('counts plans at 3 pts each', () => {
    expect(calculatePoints({ ...baseStats, plansCreated: 4 })).toBe(12);
  });

  it('counts fastings at 2 pts each', () => {
    expect(calculatePoints({ ...baseStats, fastingsCompleted: 7 })).toBe(14);
  });

  it('sums all contributions', () => {
    const stats: UserStats = {
      ...baseStats,
      mealsLogged: 5,       // 10
      recipesCreated: 2,    // 10
      realFeelCount: 3,     // 9
      postsPublished: 1,    // 4
      streakDays: 10,       // 10
      plansCreated: 1,      // 3
      fastingsCompleted: 2, // 4
    };
    expect(calculatePoints(stats)).toBe(50);
  });
});

// ─── getUserLevel ─────────────────────────────────────────────────────────────

describe('getUserLevel', () => {
  it('0 points → level 1 (novice)', () => {
    expect(getUserLevel(0).level).toBe(1);
    expect(getUserLevel(0).name).toBe('novice');
  });

  it('49 points → level 1', () => {
    expect(getUserLevel(49).level).toBe(1);
  });

  it('50 points → level 2 (active)', () => {
    expect(getUserLevel(50).level).toBe(2);
  });

  it('200 points → level 3 (committed)', () => {
    expect(getUserLevel(200).level).toBe(3);
  });

  it('3000 points → level 6 (legend)', () => {
    expect(getUserLevel(3000).level).toBe(6);
  });

  it('very large points → highest level', () => {
    expect(getUserLevel(99999).level).toBe(LEVELS[LEVELS.length - 1].level);
  });
});

// ─── getEarnedBadges ──────────────────────────────────────────────────────────

describe('getEarnedBadges', () => {
  it('returns empty array for zero stats', () => {
    expect(getEarnedBadges(baseStats)).toHaveLength(0);
  });

  it('earns firstRecipe badge after 1 recipe', () => {
    const badges = getEarnedBadges({ ...baseStats, recipesCreated: 1 });
    expect(badges.some(b => b.id === 'firstRecipe')).toBe(true);
  });

  it('earns chef badge at 10 recipes (created + imported)', () => {
    const badges = getEarnedBadges({ ...baseStats, recipesCreated: 5, recipesImported: 5 });
    expect(badges.some(b => b.id === 'chef')).toBe(true);
  });

  it('earns planner badge at 1 plan', () => {
    const badges = getEarnedBadges({ ...baseStats, plansCreated: 1 });
    expect(badges.some(b => b.id === 'planner')).toBe(true);
  });

  it('earns organized badge when shoppingListUsed', () => {
    const badges = getEarnedBadges({ ...baseStats, shoppingListUsed: true });
    expect(badges.some(b => b.id === 'organized')).toBe(true);
  });

  it('earns conscious badge at 7 realFeel entries', () => {
    const badges = getEarnedBadges({ ...baseStats, realFeelCount: 7 });
    expect(badges.some(b => b.id === 'conscious')).toBe(true);
  });

  it('earns verifiedCreator badge when isVerifiedCreator', () => {
    const badges = getEarnedBadges({ ...baseStats, isVerifiedCreator: true });
    expect(badges.some(b => b.id === 'verifiedCreator')).toBe(true);
  });

  it('earns multiple badges at once', () => {
    const stats: UserStats = {
      ...baseStats,
      recipesCreated: 1,
      plansCreated: 1,
      shoppingListUsed: true,
    };
    const badges = getEarnedBadges(stats);
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── getNextMilestone ────────────────────────────────────────────────────────

describe('getNextMilestone', () => {
  it('streak 0 → next milestone is 3', () => {
    expect(getNextMilestone(0)).toBe(STREAK_MILESTONES[0]);
  });

  it('streak 2 → next milestone is 3', () => {
    expect(getNextMilestone(2)).toBe(3);
  });

  it('streak 3 → next milestone is 7', () => {
    expect(getNextMilestone(3)).toBe(7);
  });

  it('streak 7 → next milestone is 14', () => {
    expect(getNextMilestone(7)).toBe(14);
  });

  it('streak 365 (max) → returns null', () => {
    expect(getNextMilestone(365)).toBeNull();
  });

  it('streak beyond max → returns null', () => {
    expect(getNextMilestone(1000)).toBeNull();
  });
});
