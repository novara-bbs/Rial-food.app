/**
 * Gamification system: streaks, badges, user levels
 */

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  recipesCreated: number;
  recipesImported: number;
  mealsLogged: number;
  realFeelCount: number;
  postsPublished: number;
  plansCreated: number;
  shoppingListUsed: boolean;
  fastingsCompleted: number;
  wearableConnected: boolean;
  trainingDayUsed: number;
  challengesCompleted: number;
  isVerifiedCreator: boolean;
  streakDays: number;
}

export const BADGES: Badge[] = [
  { id: 'firstRecipe', emoji: '🥄', name: 'firstRecipe', description: 'Create or import your first recipe', condition: s => (s.recipesCreated + s.recipesImported) >= 1 },
  { id: 'chef', emoji: '📖', name: 'chef', description: '10 recipes in your recipe book', condition: s => (s.recipesCreated + s.recipesImported) >= 10 },
  { id: 'personalChef', emoji: '📚', name: 'personalChef', description: '30 recipes (free limit reached)', condition: s => (s.recipesCreated + s.recipesImported) >= 30 },
  { id: 'planner', emoji: '📅', name: 'planner', description: 'Complete your first weekly plan', condition: s => s.plansCreated >= 1 },
  { id: 'organized', emoji: '🛒', name: 'organized', description: 'Use the shopping list', condition: s => s.shoppingListUsed },
  { id: 'batchMaster', emoji: '👨‍🍳', name: 'batchMaster', description: 'Complete batch cooking', condition: s => s.plansCreated >= 4 },
  { id: 'conscious', emoji: '😊', name: 'conscious', description: '7 consecutive days of Real Feel', condition: s => s.realFeelCount >= 7 },
  { id: 'detective', emoji: '🔍', name: 'detective', description: 'See your first correlation insight', condition: s => s.realFeelCount >= 14 },
  { id: 'social', emoji: '👥', name: 'social', description: 'Publish your first post', condition: s => s.postsPublished >= 1 },
  { id: 'competitor', emoji: '🏆', name: 'competitor', description: 'Complete your first challenge', condition: s => s.challengesCompleted >= 1 },
  { id: 'disciplined', emoji: '⏱️', name: 'disciplined', description: 'Complete 7 fasts', condition: s => s.fastingsCompleted >= 7 },
  { id: 'connected', emoji: '⌚', name: 'connected', description: 'Connect a wearable', condition: s => s.wearableConnected },
  { id: 'trainer', emoji: '💪', name: 'trainer', description: 'Use training day toggle 7 times', condition: s => s.trainingDayUsed >= 7 },
  { id: 'verifiedCreator', emoji: '✓', name: 'verifiedCreator', description: 'Get verified as a creator', condition: s => s.isVerifiedCreator },
];

export const LEVELS = [
  { level: 1, name: 'novice', minPoints: 0 },
  { level: 2, name: 'active', minPoints: 50 },
  { level: 3, name: 'committed', minPoints: 200 },
  { level: 4, name: 'dedicated', minPoints: 500 },
  { level: 5, name: 'expert', minPoints: 1200 },
  { level: 6, name: 'legend', minPoints: 3000 },
];

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

export function calculateStreak(mealLogDates: string[]): number {
  if (!mealLogDates.length) return 0;

  const uniqueDays = [...new Set(mealLogDates.map(d => new Date(d).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Must have logged today or yesterday to maintain streak
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const curr = new Date(uniqueDays[i]).getTime();
    const prev = new Date(uniqueDays[i + 1]).getTime();
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else if (diffDays === 2) {
      // 1 grace day per month (simplified: allow 1 gap)
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function calculatePoints(stats: UserStats): number {
  return (
    stats.mealsLogged * 2 +
    (stats.recipesCreated + stats.recipesImported) * 5 +
    stats.realFeelCount * 3 +
    stats.postsPublished * 4 +
    stats.streakDays * 1 +
    stats.plansCreated * 3 +
    stats.fastingsCompleted * 2
  );
}

export function getUserLevel(points: number): typeof LEVELS[number] {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getEarnedBadges(stats: UserStats): Badge[] {
  return BADGES.filter(b => b.condition(stats));
}

export function getNextMilestone(streak: number): number | null {
  return STREAK_MILESTONES.find(m => m > streak) || null;
}
