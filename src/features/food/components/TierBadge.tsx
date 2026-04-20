/**
 * P7 `[1.5.63]` — visual badge for `FoodVariant` provenance.
 *
 * Tiny icon + tooltip that tells the user whether a variant is lab-verified
 * USDA data, a brand RIAL curated, a scan of their own, or a crowd-validated
 * entry (future). Mounted inside `VariantRow` to the left of the variant
 * name.
 *
 * Intentionally light on a11y: the icon is `aria-hidden`, but the tier label
 * is rendered as a sibling screen-reader-only span so the row announcement
 * reads "Variant X — Oficial" rather than "Variant X, image".
 */
import { useI18n } from '../../../i18n';
import { ShieldCheck, Sparkles, UserRound, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TIER_COLOR, TIER_ICON, type TrustTier } from '../utils/trust-tier';

const ICON_MAP: Record<TrustTier, LucideIcon> = {
  canonical: ShieldCheck,
  curated: Sparkles,
  personal: UserRound,
  community: Users,
};

interface Props {
  tier: TrustTier;
  /**
   * When true, also renders the tier label next to the icon (used in
   * contexts where the badge is the main element, e.g. tier filters).
   * Default: icon-only with sr-only label.
   */
  showLabel?: boolean;
}

export default function TierBadge({ tier, showLabel = false }: Props) {
  const { t } = useI18n();
  const tierLabels = t.foodDictionary.tierLabels as Record<string, string>;
  const tierTooltips = t.foodDictionary.tierTooltips as Record<string, string>;
  // Defensive: keep the icon map private to this file so the helper module
  // stays React-free (can be unit-tested without JSX).
  const Icon = ICON_MAP[tier] ?? ICON_MAP.canonical;
  const colorClass = TIER_COLOR[tier];
  const iconName = TIER_ICON[tier];
  const label = tierLabels[tier] ?? tier;
  const tooltip = tierTooltips[tier] ?? label;

  return (
    <span
      data-tier={tier}
      data-tier-icon={iconName}
      className={`inline-flex items-center gap-1 ${colorClass}`}
      title={tooltip}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {showLabel ? (
        <span className="text-micro font-label uppercase tracking-widest">
          {label}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}
