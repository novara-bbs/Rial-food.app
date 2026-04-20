/**
 * Collapsed/expanded card for one `FoodFamily` in the dictionary.
 *
 * Collapsed shows the family's name + the canonical variant's macros + a
 * generic "Variantes" indicator (dot + uppercase label) when any non-canonical
 * variants exist. The numeric count was intentionally dropped in P2.6 — owner
 * decision "con que me ponga que hay variantes a nivel general me vale"; at
 * 100+ retail brand variants per family the counter becomes noise, while the
 * *presence* of a drill-down is the only signal the user needs.
 *
 * Expanded renders a primary-view of the canonical (description, tags,
 * allergens, portion selector slot, micro highlights slot, CTAs) plus the
 * non-canonical siblings grouped by `variantType` via `groupVariantsByType`.
 * Each group is capped at `INITIAL_LIMIT = 5` rows with a "Ver más" toggle
 * expanding the remainder. The hard cap keeps first-paint deterministic
 * regardless of how many brand variants land in a family.
 *
 * Slots (`portionSlot`, `microSlot`, `ctaSlot`) keep the card free of
 * AppState + navigation dependencies — `FoodDictionary` injects the concrete
 * PortionSelector / MicroHighlights / CTA rows.
 */
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '../../../i18n';
import type { FoodFamily, FoodVariant, VariantType } from '../../../types/food-family';
import { computeMacroDelta, groupVariantsByType } from '../utils/food-family-resolver';
import VariantRow from './VariantRow';

interface Props {
  family: FoodFamily;
  canonicalVariant: FoodVariant;
  /** All variants of the family including canonical, ordered as in `family.variantIds`. */
  variants: FoodVariant[];
  expanded: boolean;
  onToggle: () => void;
  /** Variant currently selected (for PortionSelector etc.). Defaults to canonical. */
  selectedVariantId?: string;
  onSelectVariant?: (variant: FoodVariant) => void;
  portionSlot?: React.ReactNode;
  microSlot?: React.ReactNode;
  ctaSlot?: React.ReactNode;
}

/** Rows shown per group before the "Ver más" toggle kicks in. */
const INITIAL_LIMIT = 5;

/**
 * Fixed render order of the variantType groups within the drill-down. Matches
 * the owner's mental model ("primero la variación de preparación, luego las
 * marcas que encuentro en el súper"). `canonical` is omitted — the canonical
 * is the family's primary view, painted outside the drill-down.
 *
 * Exported so `VariantPickerSheet` (P3) reuses the same ordering without
 * duplicating the constant.
 */
export const GROUP_ORDER: readonly VariantType[] = [
  'preparation',
  'quality',
  'regional',
  'brand',
  'user',
] as const;

export default function FamilyCard({
  family,
  canonicalVariant,
  variants,
  expanded,
  onToggle,
  selectedVariantId,
  onSelectVariant,
  portionSlot,
  microSlot,
  ctaSlot,
}: Props) {
  const { t, locale } = useI18n();
  const [expandedGroups, setExpandedGroups] = useState<Set<VariantType>>(() => new Set());

  const name = locale === 'es' ? family.name : family.nameEn;
  const description = locale === 'es' ? family.description : family.descriptionEn;

  const nonCanonicalVariants = useMemo(
    () => variants.filter(v => v.id !== family.canonicalVariantId),
    [variants, family.canonicalVariantId],
  );
  const variantCount = nonCanonicalVariants.length;

  const groupedVariants = useMemo(
    () => groupVariantsByType(variants, family.canonicalVariantId),
    [variants, family.canonicalVariantId],
  );

  const macros = canonicalVariant.macros;
  const buttonId = `family-${family.id}-toggle`;
  const panelId = `family-${family.id}-panel`;

  const toggleGroup = (type: VariantType) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
      {/* Collapsed header — HIG min-h-11 on the button, full-width tap. */}
      <button
        id={buttonId}
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full min-h-11 flex items-center p-3 text-left hover:bg-surface-container-highest/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex-1 min-w-0">
          <span className="font-headline font-bold text-body-sm text-on-surface block truncate">
            {name}
          </span>
          <span className="text-micro font-label text-on-surface-variant tracking-wide">
            {macros.calories} {t.common.kcal} · {macros.protein}g {t.portionSelector.protein} · {macros.carbs}g {t.portionSelector.carbs} · {macros.fats}g {t.portionSelector.fats}
          </span>
        </div>
        {variantCount > 0 && (
          <span
            className="mr-2 inline-flex items-center gap-1 text-micro font-label uppercase tracking-widest text-on-surface-variant shrink-0"
            aria-label={t.foodDictionary.variantsIndicatorAria}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
            {t.foodDictionary.variantsIndicatorLabel}
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="px-3 pb-4 pt-1 space-y-4 border-t border-outline-variant/20"
        >
          {/* Primary-view header: description + primary badge on the canonical. */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-micro">
                {t.foodDictionary.primaryLabel}
              </Badge>
              <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {locale === 'es' ? canonicalVariant.name : canonicalVariant.nameEn}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">{description}</p>
          </div>

          {canonicalVariant.tags && canonicalVariant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {canonicalVariant.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-micro">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {canonicalVariant.allergens.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {t.foodDictionary.allergens}:
              </span>
              {canonicalVariant.allergens.map(a => (
                <Badge key={a} variant="destructive" className="text-micro">
                  {t.foodDictionary.allergenLabels[a]}
                </Badge>
              ))}
            </div>
          )}

          {portionSlot}
          {microSlot}
          {ctaSlot}

          {nonCanonicalVariants.length > 0 && (
            <div className="space-y-3">
              {GROUP_ORDER.map(type => {
                const groupVariants = groupedVariants.get(type);
                if (!groupVariants || groupVariants.length === 0) return null;

                const isExpanded = expandedGroups.has(type);
                const displayed = isExpanded
                  ? groupVariants
                  : groupVariants.slice(0, INITIAL_LIMIT);
                const hasMore = groupVariants.length > INITIAL_LIMIT;

                return (
                  <div key={type} className="space-y-1.5" data-variant-group={type}>
                    <h4 className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                      {t.foodDictionary.variantTypes[type]}
                    </h4>
                    <div className="space-y-1.5">
                      {displayed.map(v => (
                        <VariantRow
                          key={v.id}
                          variant={v}
                          delta={computeMacroDelta(v)}
                          selected={selectedVariantId === v.id}
                          onSelect={onSelectVariant}
                        />
                      ))}
                    </div>
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(type)}
                        className="text-micro font-label uppercase tracking-widest text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-11 px-1"
                      >
                        {isExpanded
                          ? t.foodDictionary.showLess
                          : t.foodDictionary.showMore}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
