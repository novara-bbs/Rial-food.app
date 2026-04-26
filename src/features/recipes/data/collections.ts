/**
 * Recipe collections registry — R3.
 *
 * Each entry defines a curated collection with an i18n label key, icon name,
 * theme color (CSS variable suffix), and a pure predicate on a scored recipe
 * object (must be side-effect-free, no closures over mutable state).
 *
 * Used by:
 *  - `Cocina.tsx` horizontal collections carousel via `CollectionsCarousel` → `ChipRow emoji`
 *
 * Predicates operate on the "scored recipe" shape augmented by Cocina:
 *   { ...Recipe, matchScore, cal, pro, totalTime, time }
 */

export interface RecipeCollection {
  id: string;
  /** i18n key — must exist in t.collections */
  labelKey: string;
  /**
   * @deprecated Lucide icon name; superseded by `emoji` in [1.5.97] when
   * CollectionsCarousel migrated to ChipRow emoji variant. Kept for backwards
   * compatibility with any external consumer; remove in next major.
   */
  icon: string;
  /**
   * Optional emoji prefix (delivery-app convention — Uber Eats / Glovo). Only
   * set when the emoji unambiguously represents the concept; absent when no
   * universally-readable emoji exists for the predicate (e.g. lowCarb).
   */
  emoji?: string;
  /**
   * @deprecated Editorial hero color per collection — dropped in [1.5.97]
   * for canonical chip uniformity (ADR-013). Field preserved to avoid
   * breaking any external snapshot/import tooling; ignore in new code.
   */
  heroColor: string;
  /**
   * Pure predicate. `r` is the scored recipe object from Cocina.
   * Must return boolean; no side-effects.
   */
  predicate: (r: any) => boolean;
}

export const COLLECTIONS: RecipeCollection[] = [
  {
    id: 'verified',
    labelKey: 'collections.verified',
    icon: 'BadgeCheck',
    emoji: '✅',
    heroColor: 'bg-primary',
    predicate: (r) => r.verified != null,
  },
  {
    id: 'quick',
    labelKey: 'collections.quick',
    icon: 'Zap',
    emoji: '⚡',
    heroColor: 'bg-tertiary',
    predicate: (r) => r.totalTime > 0 && r.totalTime <= 20,
  },
  {
    id: 'highProtein',
    labelKey: 'collections.highProtein',
    icon: 'Dumbbell',
    emoji: '🥩',
    heroColor: 'bg-brand-secondary',
    predicate: (r) => (r.pro ?? r.macros?.protein ?? 0) >= 30,
  },
  {
    id: 'vegan',
    labelKey: 'collections.vegan',
    icon: 'Leaf',
    emoji: '🌱',
    heroColor: 'bg-primary',
    predicate: (r) =>
      !!(r.dietaryTags?.includes('vegan') ||
      r.dietaryPreferences?.includes('vegan') ||
      r.tags?.some((tg: string) => tg.toLowerCase().includes('vegan')) ||
      r.tag?.toLowerCase().includes('vegano') ||
      r.tag?.toLowerCase().includes('vegan')),
  },
  {
    id: 'lowCarb',
    labelKey: 'collections.lowCarb',
    icon: 'Minus',
    // No emoji: no universal symbol for "low-carb"; text alone is clearer.
    heroColor: 'bg-tertiary',
    predicate: (r) => (r.macros?.carbs ?? r.macros?.carbohydrates ?? 100) < 20,
  },
  {
    id: 'batch',
    labelKey: 'collections.batch',
    icon: 'Package',
    emoji: '📦',
    heroColor: 'bg-secondary',
    predicate: (r) => (r.servings ?? 1) >= 4,
  },
  {
    id: 'cooked',
    labelKey: 'collections.cooked',
    icon: 'ChefHat',
    emoji: '👨‍🍳',
    heroColor: 'bg-primary',
    predicate: (r) => Array.isArray(r.cookedAt) && r.cookedAt.length > 0,
  },
];

/** Resolve a collection by id. Returns undefined when not found. */
export function getCollection(id: string): RecipeCollection | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}
