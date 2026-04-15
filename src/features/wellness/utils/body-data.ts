import type { WeightEntry } from '../../../contexts/AppStateContext';

/**
 * Returns the user's current weight in kg.
 * Priority: latest weightHistory entry → userProfile.weight → null.
 *
 * Use this instead of reading `userProfile.weight` directly, because
 * WeightQuickLog and Progress write to weightHistory, not userProfile.weight.
 */
export function getCurrentWeight(
  userProfile: { weight?: number } | null | undefined,
  weightHistory: WeightEntry[],
): number | null {
  if (weightHistory.length > 0) {
    const sorted = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0].kg;
  }
  return userProfile?.weight ?? null;
}
