/**
 * Onboarding taxonomies — single source of truth for the canonical lists
 * of values the user can pick during the flow.
 *
 * Why this file exists:
 *   - `ActivityLevel`, `Goal` and `Sex` are union types declared in
 *     `food/utils/nutrition.ts`, but the type alone doesn't give us a
 *     runtime list to iterate (for slider ticks, segmented tabs, etc).
 *     Inlining `['sedentary', 'light', ...]` in each consumer creates
 *     duplicate sources of truth and silent drift if the union grows.
 *   - `DietId` doesn't exist as a union in nutrition.ts at all — the
 *     restrictions list lived inline in `DietStep.tsx`.
 *
 * Add a new value:
 *   1. Add it to the union in `nutrition.ts` (or extend `DIET_IDS` here
 *      for diet-only additions).
 *   2. Add the matching i18n key in `i18n/locales/{es,en}/onboarding.ts`.
 *   3. TypeScript + `npm run check:i18n` flag any inconsistency.
 */
import type { ActivityLevel, Goal, Sex } from '../../food/utils/nutrition';

/** Activity levels in display order — drives `ActivitySlider` ticks. */
export const ACTIVITY_LEVELS: readonly ActivityLevel[] = [
  'sedentary',
  'light',
  'active',
  'veryActive',
] as const;

/** Goal options in display order — drives `GoalStep` icon cards. */
export const GOAL_IDS: readonly Goal[] = [
  'muscle',
  'cut',
  'maintain',
  'health',
  'family',
] as const;

/** Biological sex options — drives `IdentityStep` segmented tabs. */
export const SEX_IDS: readonly Sex[] = ['male', 'female'] as const;

/**
 * Dietary restrictions in display order — drives `DietStep` toggle pills
 * and `DoneStep` summary chips. Symmetric with `t.onboarding.diet.options`.
 */
export const DIET_IDS = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'lactoseFree',
  'keto',
  'paleo',
  'mediterranean',
] as const;

export type DietId = (typeof DIET_IDS)[number];
