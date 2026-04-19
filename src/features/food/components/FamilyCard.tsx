/**
 * Collapsed/expanded card for one `FoodFamily` in the dictionary.
 *
 * Collapsed shows the family's name + the canonical variant's macros +
 * a "5 variantes" counter on multi-variant families. Expanded renders a
 * primary-view of the canonical (description, tags, allergens, portion
 * selector slot, micro highlights slot, CTAs) plus a `<VariantRow>` list of
 * the non-canonical siblings when any exist.
 *
 * Slots (`portionSlot`, `microSlot`, `ctaSlot`) are used to keep the card
 * free of AppState + navigation dependencies — `FoodDictionary` injects the
 * concrete PortionSelector / MicroHighlights / CTA rows that need those.
 */
import { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '../../../i18n';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';
import { computeMacroDelta } from '../utils/food-family-resolver';
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

  const name = locale === 'es' ? family.name : family.nameEn;
  const description = locale === 'es' ? family.description : family.descriptionEn;

  const nonCanonicalVariants = useMemo(
    () => variants.filter(v => v.id !== family.canonicalVariantId),
    [variants, family.canonicalVariantId],
  );
  const variantCount = nonCanonicalVariants.length;
  const macros = canonicalVariant.macros;
  const buttonId = `family-${family.id}-toggle`;
  const panelId = `family-${family.id}-panel`;

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
          <Badge variant="outline" className="mr-2 shrink-0">
            {(variantCount === 1 ? t.foodDictionary.variantsCountOne : t.foodDictionary.variantsCount).replace('{count}', String(variantCount))}
          </Badge>
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
            <div className="space-y-1.5">
              <h4 className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {t.foodDictionary.variantsSection} ({nonCanonicalVariants.length})
              </h4>
              <div className="space-y-1.5">
                {nonCanonicalVariants.map(v => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    delta={computeMacroDelta(v)}
                    selected={selectedVariantId === v.id}
                    onSelect={onSelectVariant}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
