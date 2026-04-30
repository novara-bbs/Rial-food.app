/**
 * Onboarding copy helpers — pure functions for resolving localized labels
 * out of the i18n dictionary.
 *
 * Why this module exists:
 *   - Three steps used to duplicate `draft.name ? template.replace('{name}', name) : fallback`.
 *   - DietStep and DoneStep both did inline diet-id → label lookup with subtly
 *     different fallbacks.
 *   - The shell (Onboarding.tsx) carried `pickPrimaryLabel` and
 *     `mapErrorKeyToCopy` at the bottom of the file — testable utilities
 *     buried inside a 380-line component.
 *
 * Where to put new code:
 *   - If a label requires CONTEXTUAL lookup, INTERPOLATION, or FALLBACK logic,
 *     add a helper here.
 *   - If it's a direct key access (`t.onboarding.X.foo`), keep it inline at
 *     the call site — adding a helper for that is over-engineering.
 *
 * All helpers are pure (no React hooks, no side effects). Easy to unit-test
 * in isolation.
 */
import type { Translations } from '@/i18n';

import type { ProgressSummaryData } from '../components/OnboardingProgressSummary';
import { type DietId } from '../state/taxonomies';
import type { OnboardingDraft, StepId } from '../state/types';

// ── Name interpolation ───────────────────────────────────────────────────────

/**
 * Replace `{name}` in a template string when the user provided a name; fall
 * back to the un-personalized template otherwise.
 *
 * Used by BodyStep, PlanRevealStep and DoneStep to switch between
 * `subtitleNamed`/`titleNamed` and the generic alternative.
 */
export function interpolateName(
  templateNamed: string,
  fallback: string,
  name: string | undefined,
): string {
  return name ? templateNamed.replace('{name}', name) : fallback;
}

// ── Diet labels ──────────────────────────────────────────────────────────────

/**
 * Resolve a diet ID to its localized label. Returns the raw ID as a last-
 * resort fallback so the UI never renders `undefined` if the data and the
 * dictionary drift apart.
 */
export function resolveDietLabel(
  id: string,
  options: Translations['onboarding']['diet']['options'],
): string {
  return options[id as DietId] ?? id;
}

// ── Footer CTA + error hint ──────────────────────────────────────────────────

/** Localized label for the footer primary CTA, resolved per step. */
export function pickPrimaryLabel(stepId: StepId, t: Translations): string {
  switch (stepId) {
    // 'welcome' footer is hidden — this case is never reached.
    case 'plan': return t.onboarding.shell.createPlan;
    case 'done': return t.onboarding.done.cta;
    default:     return t.onboarding.shell.next;
  }
}

/**
 * Map a validator-emitted error key (e.g. `'weightOutOfRange'`) to its
 * localized copy. Returns `undefined` if the key isn't recognized.
 */
export function mapErrorKeyToCopy(
  key: string,
  errorsCopy: Translations['onboarding']['errors'],
): string | undefined {
  return (errorsCopy as Record<string, string>)[key];
}

// ── Header progress summary ─────────────────────────────────────────────────

/**
 * Threshold at which each chip first appears in the header summary. The
 * indices come from `STEP_ORDER` in `state/types.ts` (welcome=0, goal=1,
 * identity=2, body=3, activity=4, training=5, plan=6, diet=7, done=8).
 *
 * Pattern: each chip appears once the user has CLEARED its source step.
 *   - goal chip   → from identity onward (user just chose a goal)
 *   - sex chip    → from body onward
 *   - body chip   → from activity onward
 *   - activity chip → from training onward
 */
const SUMMARY_THRESHOLDS = {
  goal: 2,
  sex: 3,
  body: 4,
  activity: 5,
} as const;

/**
 * Build the read-only chip data shown below the progress bar. Returns
 * `undefined` on welcome (idx 0) and goal (idx 1) where there is nothing
 * to summarize yet — the caller short-circuits the render.
 */
export function buildSummary(
  draft: OnboardingDraft,
  stepIndex: number,
  t: Translations,
): ProgressSummaryData | undefined {
  if (stepIndex < SUMMARY_THRESHOLDS.goal) return undefined;
  const opts = t.onboarding;
  return {
    goal:
      stepIndex >= SUMMARY_THRESHOLDS.goal && draft.goal
        ? opts.goal.options[draft.goal as keyof typeof opts.goal.options]
        : undefined,
    sex:
      stepIndex >= SUMMARY_THRESHOLDS.sex && draft.sex
        ? draft.sex === 'male'
          ? opts.identity.male
          : opts.identity.female
        : undefined,
    body:
      stepIndex >= SUMMARY_THRESHOLDS.body &&
      draft.weight != null &&
      draft.height != null
        ? `${draft.weight} kg · ${draft.height} cm`
        : undefined,
    activity:
      stepIndex >= SUMMARY_THRESHOLDS.activity && draft.activity
        ? opts.activity.options[
            draft.activity as keyof typeof opts.activity.options
          ]?.label
        : undefined,
  };
}
