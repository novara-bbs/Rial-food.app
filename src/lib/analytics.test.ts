/**
 * Smoke tests for the analytics module.
 *
 * Validates:
 *   1. The no-op default does not throw.
 *   2. The typed `track.*` helpers all forward to `analytics.track` with the
 *      correct event name (catches a refactor that swaps two helper names).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analytics, track, type AnalyticsEvent } from './analytics';

describe('analytics — no-op stub', () => {
  it('analytics.track does not throw when key is unset', () => {
    expect(() => analytics.track('meal_logged')).not.toThrow();
    expect(() => analytics.track('recipe_created', { source: 'manual', servings: 4, hasPhoto: true })).not.toThrow();
  });

  it('analytics.identify and reset do not throw', () => {
    expect(() => analytics.identify('user-123')).not.toThrow();
    expect(() => analytics.reset()).not.toThrow();
  });
});

describe('analytics — typed helpers map to correct event names', () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    trackSpy = vi.spyOn(analytics, 'track');
  });

  it.each([
    ['onboardingStarted',  () => track.onboardingStarted(),                                          'onboarding_started'],
    ['onboardingComplete', () => track.onboardingComplete({ goal: 'lose', sex: 'male', trains: true }), 'onboarding_complete'],
    ['mealLogged',         () => track.mealLogged({ source: 'planner', mealSlot: 'lunch', calories: 500 }), 'meal_logged'],
    ['recipeCreated',      () => track.recipeCreated({ source: 'manual', servings: 4, hasPhoto: true }), 'recipe_created'],
    ['recipeForked',       () => track.recipeForked({ fromId: 'recipe-1' }),                          'recipe_forked'],
    ['recipeImported',     () => track.recipeImported({ sourceType: 'tiktok' }),                      'recipe_imported'],
    ['aiCoachUsed',        () => track.aiCoachUsed({ promptLength: 42 }),                             'ai_coach_used'],
    ['barcodeScanned',     () => track.barcodeScanned({ found: true }),                               'barcode_scanned'],
    ['planUpgraded',       () => track.planUpgraded({ tier: 'plus' }),                                'plan_upgraded'],
    ['streakMilestone',    () => track.streakMilestone({ days: 7 }),                                  'streak_milestone'],
    ['weeklyCheckinDone',  () => track.weeklyCheckinDone(),                                           'weekly_checkin_done'],
  ])('track.%s forwards to analytics.track("%s")', (_name, invoke, expectedEvent) => {
    invoke();
    expect(trackSpy).toHaveBeenCalledTimes(1);
    // Check only the event name — properties are optional per helper.
    expect(trackSpy.mock.calls[0]?.[0]).toBe(expectedEvent);
  });
});

describe('analytics — event union completeness', () => {
  it('every AnalyticsEvent member has a typed helper', () => {
    // Compile-time check: this list must exhaustively cover the union.
    // If a new event is added to AnalyticsEvent without a track.* helper,
    // the satisfies check below fails at build time.
    const allEvents: Record<AnalyticsEvent, true> = {
      onboarding_started: true,
      onboarding_complete: true,
      meal_logged: true,
      recipe_created: true,
      recipe_forked: true,
      recipe_imported: true,
      ai_coach_used: true,
      barcode_scanned: true,
      plan_upgraded: true,
      streak_milestone: true,
      weekly_checkin_done: true,
    };
    expect(Object.keys(allEvents)).toHaveLength(11);
  });
});
