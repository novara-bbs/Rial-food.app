/**
 * `VariantPickerSheet` — P3 AddMeal family-first picker.
 *
 * A `focus`-sized BottomSheet that lists all variants of a FoodFamily:
 *   1. Canonical row (always first, labelled "Principal")
 *   2. Non-canonical variants grouped by `GROUP_ORDER` (from FamilyCard)
 *   3. User-scanned variants for this family (section "Mis marcas")
 *
 * The sheet is purely presentational. The caller (AddMeal) passes:
 *   - `family` + `allVariants` to compute the display list.
 *   - `userVariants` — the user's scanned/saved brand variants pool.
 *   - `selectedVariantId?` — highlights the current selection.
 *   - `onSelect` — called when the user taps a VariantRow.
 *   - `open` + `onOpenChange` — controlled sheet state.
 *
 * Reuses `VariantRow` (existing) and `GROUP_ORDER` / `groupVariantsByType` to
 * stay in sync with `FamilyCard`'s drill-down UX.
 */
import { useMemo } from 'react';
import BottomSheet from '@/components/ui/bottom-sheet';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '../../../i18n';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';
import { computeMacroDelta, groupVariantsByType } from '../utils/food-family-resolver';
import { GROUP_ORDER } from './FamilyCard';
import VariantRow from './VariantRow';

interface Props {
  family: FoodFamily;
  /** Merged pool (FOOD_VARIANTS + userVariants) for this family. */
  allVariants: FoodVariant[];
  /** The pool of user-saved variants — used to identify and section "Mis marcas". */
  userVariants: FoodVariant[];
  selectedVariantId?: string;
  onSelect: (variant: FoodVariant) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VariantPickerSheet({
  family,
  allVariants,
  userVariants,
  selectedVariantId,
  onSelect,
  open,
  onOpenChange,
}: Props) {
  const { t, locale } = useI18n();

  const familyName = locale === 'es' ? family.name : family.nameEn;

  /** Variants belonging specifically to this family (from the merged pool). */
  const familyVariants = useMemo(
    () => allVariants.filter(v => v.familyId === family.id),
    [allVariants, family.id],
  );

  const canonical = useMemo(
    () => familyVariants.find(v => v.id === family.canonicalVariantId),
    [familyVariants, family.canonicalVariantId],
  );

  const grouped = useMemo(
    () => groupVariantsByType(familyVariants, family.canonicalVariantId),
    [familyVariants, family.canonicalVariantId],
  );

  /** User-scanned variants for this specific family. */
  const userVariantsForFamily = useMemo(
    () => userVariants.filter(v => v.familyId === family.id),
    [userVariants, family.id],
  );

  const handleSelect = (variant: FoodVariant) => {
    onSelect(variant);
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={familyName}
      size="focus"
      headerLayout="back-title-action"
      onBack={() => onOpenChange(false)}
    >
      <div className="space-y-4 pb-4">
        {/* Canonical — always first */}
        {canonical && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-micro">
                {t.foodDictionary.primaryLabel}
              </Badge>
            </div>
            <VariantRow
              variant={canonical}
              delta={null}
              selected={selectedVariantId === canonical.id || !selectedVariantId}
              onSelect={handleSelect}
            />
          </div>
        )}

        {/* Non-canonical variants by GROUP_ORDER */}
        {GROUP_ORDER.map(type => {
          const groupVariants = grouped.get(type);
          if (!groupVariants || groupVariants.length === 0) return null;

          const sectionLabel = t.foodDictionary.variantTypes[type];

          return (
            <div key={type} className="space-y-1.5" data-variant-group={type}>
              <h4 className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {sectionLabel}
              </h4>
              <div className="space-y-1.5">
                {groupVariants.map(v => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    delta={computeMacroDelta(v)}
                    selected={selectedVariantId === v.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* User-scanned brands for this family */}
        {userVariantsForFamily.length > 0 && (
          <div className="space-y-1.5" data-variant-group="user-scanned">
            <h4 className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
              {t.addMealScreen.myScannedBrands}
            </h4>
            <div className="space-y-1.5">
              {userVariantsForFamily.map(v => (
                <VariantRow
                  key={v.id}
                  variant={v}
                  delta={computeMacroDelta(v)}
                  selected={selectedVariantId === v.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
