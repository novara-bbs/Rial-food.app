/**
 * Pure widget-visibility logic — Sprint E [1.5.218].
 *
 * Single source of truth for "which widgets render in which section
 * given the user's tier, overrides, and connected health sources".
 *
 * Zero React dependency — fully testable in Node. The hook layer in
 * `usePreferencesState.ts` consumes these functions; components consume
 * the hook, not these functions directly.
 *
 * @see src/types/preferences.ts
 */
import type {
  DetailTier,
  HealthPermission,
  HealthSourceConnection,
  Section,
  UserPreferences,
  WidgetId,
} from '../types/preferences';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Tier applied to sections that aren't explicitly set in user preferences. */
export const DEFAULT_TIER: DetailTier = 'standard';

// ─── Visibility matrix ───────────────────────────────────────────────────────

/**
 * Which widgets appear in each section at each tier.
 *
 * Reading the type: `Record<Section, Record<DetailTier, WidgetId[]>>`
 * forces every Section + Tier combination to be filled — adding a new
 * Section without filling its tier slots is a compile error.
 *
 * Conventions:
 *  - `simple` is a strict subset of `standard`, which is a strict subset
 *    of `advanced`. Tests enforce this invariant.
 *  - The order of widgets in each array IS the render order.
 *  - Widgets requiring a health source (see WIDGET_REQUIREMENTS) appear
 *    in the matrix but are filtered out at runtime by `getVisibleWidgets`
 *    if the requirement isn't met.
 */
export const WIDGET_MATRIX: Record<Section, Record<DetailTier, WidgetId[]>> = {
  'home.energy': {
    simple:   ['energy-arc'],
    standard: ['energy-arc', 'macro-rings'],
    advanced: ['energy-arc', 'macro-rings', 'energy-breakdown', 'kcal-breakdown'],
  },
  'home.macros': {
    simple:   ['macro-rings'],
    standard: ['macro-rings', 'food-quality'],
    advanced: ['macro-rings', 'food-quality'],
  },
  'home.activity': {
    simple:   ['steps-card'],
    standard: ['steps-card', 'exercise-card'],
    advanced: ['steps-card', 'exercise-card', 'sleep-card', 'hrv-card'],
  },
  'home.hydration': {
    simple:   ['hydration-chip'],
    standard: ['hydration-card'],
    advanced: ['hydration-card', 'electrolytes-summary'],
  },
  'home.wellness': {
    simple:   [],
    standard: ['realfeel-row'],
    advanced: ['realfeel-row', 'weekly-checkin', 'mood-chart'],
  },
  'home.meals': {
    simple:   ['todays-meals'],
    standard: ['todays-meals', 'meal-gap-suggestion'],
    advanced: ['todays-meals', 'meal-gap-suggestion'],
  },
  'nutrition.detail': {
    simple:   ['tab-summary'],
    standard: ['tab-summary', 'tab-macros', 'tab-quality', 'tab-hydration'],
    advanced: ['tab-summary', 'tab-macros', 'tab-quality', 'tab-vitamins', 'tab-minerals', 'tab-hydration', 'tab-performance'],
  },
  'progress.charts': {
    simple:   ['weight-chart'],
    standard: ['weight-chart', 'mood-chart-detailed'],
    advanced: ['weight-chart', 'mood-chart-detailed', 'energy-chart', 'sleep-chart'],
  },
};

// ─── Health source requirements ──────────────────────────────────────────────

/**
 * Widgets that require data from a connected health source. If no
 * connected source has the listed permission, the widget is hidden
 * regardless of the tier setting or override.
 *
 * Override note: a user can force-enable via `widgetOverrides[id] =
 * { visible: true }` but the widget will still hide if the data is
 * unavailable — UX-wise, a card with no data is worse than no card.
 */
export const WIDGET_REQUIREMENTS: Partial<Record<WidgetId, HealthPermission>> = {
  'sleep-card': 'sleep',
  'hrv-card': 'hrv',
  // glucose-card: future — only add when placed in a section matrix entry.
};

// ─── Defaults ────────────────────────────────────────────────────────────────

/**
 * Factory for the default preferences shape. Used both for fresh
 * installs (new user, no legacy `mode`) and as a fallback when stored
 * preferences are corrupt or missing.
 */
export function createDefaultPreferences(): UserPreferences {
  return {
    version: 1,
    sectionTiers: {}, // empty → DEFAULT_TIER applies everywhere
    widgetOverrides: {},
    healthSources: [
      // Manual is always available — user can always enter values by hand.
      { id: 'manual', enabled: true, permissions: ['weight', 'height'], connectedAt: new Date(0).toISOString() },
    ],
    migratedFromLegacyMode: false,
  };
}

// ─── Resolvers ───────────────────────────────────────────────────────────────

/** The tier currently applied to a section (defaults to DEFAULT_TIER). */
export function getTierForSection(
  prefs: UserPreferences,
  section: Section,
): DetailTier {
  return prefs.sectionTiers[section] ?? DEFAULT_TIER;
}

/** Whether any connected, enabled source grants the given permission. */
export function hasPermission(
  sources: HealthSourceConnection[],
  permission: HealthPermission,
): boolean {
  return sources.some(s => s.enabled && s.permissions.includes(permission));
}

/**
 * Whether a specific widget passes its health-source requirement.
 * Returns `true` for widgets with no requirement.
 */
export function meetsHealthRequirement(
  widget: WidgetId,
  sources: HealthSourceConnection[],
): boolean {
  const req = WIDGET_REQUIREMENTS[widget];
  if (!req) return true;
  return hasPermission(sources, req);
}

/**
 * Compute the list of widgets that should render in a section, given
 * preferences. Pure function — testable without React.
 *
 * Resolution order (most specific wins):
 *   1. Per-widget override `visible: false` → hide.
 *   2. Health source requirement not met → hide.
 *   3. Per-widget override `visible: true` → show (if requirement met).
 *   4. Widget in tier's matrix entry → show.
 *   5. Otherwise → hide.
 *
 * Return value preserves the order from `WIDGET_MATRIX`.
 */
export function getVisibleWidgets(
  section: Section,
  prefs: UserPreferences,
): WidgetId[] {
  const tier = getTierForSection(prefs, section);
  const baseWidgets = WIDGET_MATRIX[section][tier];

  // Widgets force-shown by an override that AREN'T already in the tier list.
  const forcedExtras: WidgetId[] = (Object.entries(prefs.widgetOverrides) as Array<[WidgetId, { visible: boolean } | undefined]>)
    .filter(([id, override]) =>
      override?.visible === true &&
      !baseWidgets.includes(id) &&
      isWidgetInSection(id, section),
    )
    .map(([id]) => id);

  const candidates = [...baseWidgets, ...forcedExtras];

  return candidates.filter(id => {
    // Override-hidden
    if (prefs.widgetOverrides[id]?.visible === false) return false;
    // Missing required health permission
    if (!meetsHealthRequirement(id, prefs.healthSources)) return false;
    return true;
  });
}

/**
 * Whether a widget ID belongs to a section (i.e., appears in at least
 * one tier of that section's matrix entry). Used to scope overrides.
 */
export function isWidgetInSection(widget: WidgetId, section: Section): boolean {
  const tiers = WIDGET_MATRIX[section];
  return Object.values(tiers).some(list => list.includes(widget));
}

/** Whether `widget` is shown at any tier in any section. */
export function isWidgetKnown(widget: WidgetId): boolean {
  for (const section of Object.keys(WIDGET_MATRIX) as Section[]) {
    if (isWidgetInSection(widget, section)) return true;
  }
  return false;
}
