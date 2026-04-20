/**
 * P7 `[1.5.63]` — trust tier derivation for FoodVariant provenance.
 *
 * Translates `FoodVariant.source` + `variantType` into a 4-value tier that
 * drives UI badges. The tiers map onto the patterns we benchmarked:
 *   - canonical → USDA / lab-verified (MFP-style green ✓, Cronometer NCCDB)
 *   - curated   → RIAL-verified brand seed (SEED_BRAND_ENTRIES in P2.6)
 *   - personal  → scanned by THIS user (MFP user-submitted, OFF off-lookup)
 *   - community → validated by the crowd (Q6 Supabase, reserved for future)
 *
 * Pure helper — no locale, no React. Labels + tooltips resolved at render
 * time via `t.foodDictionary.tierLabels[tier]` / `tierTooltips[tier]`.
 *
 * `FoodSource` already carries the raw signal; this helper adds the
 * `seed + brand` → `curated` branch that otherwise would need two fields
 * on every call-site.
 */
import type { FoodVariant } from '../../../types/food-family';

export type TrustTier = 'canonical' | 'curated' | 'personal' | 'community';

export const TRUST_TIERS: readonly TrustTier[] = [
  'canonical',
  'curated',
  'personal',
  'community',
] as const;

export function deriveTier(variant: FoodVariant): TrustTier {
  if (variant.source === 'seed') {
    return variant.variantType === 'brand' ? 'curated' : 'canonical';
  }
  if (variant.source === 'user' || variant.source === 'off') {
    return 'personal';
  }
  // 'edamam' and any future source fall back to canonical for safety.
  return 'canonical';
}

/**
 * Token classes per tier. Paired to the NEUTRAL palette conventions:
 *   - canonical: primary (green) — matches the overall brand primary
 *   - curated:   brand-secondary (warm) — "we endorsed this"
 *   - personal:  on-surface-variant (gray) — neutral/your data
 *   - community: tertiary (accent) — crowd layer, future
 */
export const TIER_COLOR: Record<TrustTier, string> = {
  canonical: 'text-primary',
  curated: 'text-brand-secondary',
  personal: 'text-on-surface-variant',
  community: 'text-tertiary',
};

/**
 * Lucide icon names per tier. Rendered by the `TierBadge` component, which
 * maps these to the actual lucide imports — keeps this module import-safe
 * (no React). ShieldCheck reads as "lab-verified"; Sparkles as "we picked
 * this one"; UserRound as "you"; Users as "crowd".
 */
export type TierIconName = 'ShieldCheck' | 'Sparkles' | 'UserRound' | 'Users';

export const TIER_ICON: Record<TrustTier, TierIconName> = {
  canonical: 'ShieldCheck',
  curated: 'Sparkles',
  personal: 'UserRound',
  community: 'Users',
};
