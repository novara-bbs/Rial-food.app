/**
 * Single mapping point: `OnboardingDraft → output contract`.
 *
 * The contract is consumed by `App.tsx`'s `onComplete` callback:
 *   { userProfile, targets, initialWeightKg }
 *
 * Keeping the mapping in one file means a future signature change in
 * `nutrition.ts` has a 1-file blast radius. Reuses
 * `calculateDailyTargetsWithBreakdown` so PlanRevealStep can show the same
 * numbers shown to `App.tsx` without a second computation.
 */

import {
  calculateDailyTargets,
  calculateDailyTargetsWithBreakdown,
  type DailyTargetsBreakdown,
  type Goal,
  type Sex,
  type ActivityLevel,
} from '../../food/utils/nutrition';
import { isDraftComplete } from '../state/validators';
import type { OnboardingDraft } from '../state/types';

export interface OnboardingOutput {
  userProfile: {
    name: string;
    age: number;
    height: number;
    weight: number;
    sex: Sex;
    goal: string;
    activity: string;
    trains: boolean;
    dietaryPreferences: string[];
  };
  targets: { cal: number; pro: number; carbs: number; fats: number };
  initialWeightKg: number;
  breakdown: DailyTargetsBreakdown;
}

/**
 * Coerce a complete draft into the output contract.
 *
 * Throws when the draft is missing required fields (caller is expected to
 * have validated). PlanRevealStep and DoneStep gate this with
 * `isDraftComplete(draft)`.
 */
export function deriveOutput(draft: OnboardingDraft): OnboardingOutput {
  if (!isDraftComplete(draft)) {
    throw new Error('deriveOutput called with incomplete draft');
  }
  // After `isDraftComplete`, sentinels are guaranteed populated.
  const goal = draft.goal as Goal;
  const sex = draft.sex as Sex;
  const activity = draft.activity as ActivityLevel;
  const weight = draft.weight as number;
  const height = draft.height as number;
  const age = draft.age as number;

  const targets = calculateDailyTargets(weight, height, age, sex, activity, goal);
  const breakdown = calculateDailyTargetsWithBreakdown(
    weight,
    height,
    age,
    sex,
    activity,
    goal,
    draft.trains,
  );

  return {
    userProfile: {
      name: draft.name,
      age,
      height,
      weight,
      sex,
      goal,
      activity,
      trains: draft.trains,
      dietaryPreferences: draft.restrictions,
    },
    targets,
    initialWeightKg: weight,
    breakdown,
  };
}

/**
 * Preview-friendly derive: returns the breakdown for the current draft if
 * complete, else `null`. PlanRevealStep uses this to drive the counter-up
 * without forcing the caller to handle thrown errors.
 */
export function previewBreakdown(
  draft: OnboardingDraft,
): DailyTargetsBreakdown | null {
  if (!isDraftComplete(draft)) return null;
  return calculateDailyTargetsWithBreakdown(
    draft.weight as number,
    draft.height as number,
    draft.age as number,
    draft.sex as Sex,
    draft.activity as ActivityLevel,
    draft.goal as Goal,
    draft.trains,
  );
}
