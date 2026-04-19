/**
 * Row inside a `<FamilyCard>` drill-down — shows a single non-canonical
 * variant with its type badge + signed macro delta vs the family's canonical
 * reference. Tapping selects the variant (callers can pipe the selected id
 * into PortionSelector / AddMeal).
 *
 * Presentation-only: no data fetching, no localStorage. The variant + its
 * computed delta come in as props. The delta is computed once by the parent
 * via `computeMacroDelta(variant)` (resolver helper) — recomputing here would
 * duplicate work across the list.
 */
import { useI18n } from '../../../i18n';
import type { FoodVariant, MacroDelta as MacroDeltaValue } from '../../../types/food-family';
import MacroDelta from './MacroDelta';

interface Props {
  variant: FoodVariant;
  delta: MacroDeltaValue | null;
  selected?: boolean;
  onSelect?: (variant: FoodVariant) => void;
}

export default function VariantRow({ variant, delta, selected, onSelect }: Props) {
  const { t, locale } = useI18n();
  const typeLabel = t.foodDictionary.variantTypes[variant.variantType];
  return (
    <button
      type="button"
      aria-pressed={Boolean(selected)}
      onClick={onSelect ? () => onSelect(variant) : undefined}
      className={
        'w-full text-left p-3 rounded-sm border transition-colors ' +
        (selected
          ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/40'
          : 'bg-surface-container border-outline-variant/20 hover:bg-surface-container-high')
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="block font-headline font-bold text-body-sm text-on-surface truncate">
            {locale === 'es' ? variant.name : variant.nameEn}
          </span>
          <span className="mt-0.5 block text-micro font-label uppercase tracking-widest text-on-surface-variant">
            {typeLabel}
          </span>
        </div>
      </div>
      <div className="mt-1.5">
        <MacroDelta delta={delta} />
      </div>
    </button>
  );
}
