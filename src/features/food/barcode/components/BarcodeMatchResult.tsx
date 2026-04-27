/**
 * BarcodeMatchResult — family match banner rendered inside the scan result sheet.
 *
 * Handles all four match types returned by `matchFamilyForScan`:
 * - known-barcode: green confirmation of a previously saved variant.
 * - seed-match:    info card + seed-macros toggle + optional "save as brand" CTA.
 * - fuzzy:         single-family confirmation + save button.
 * - ambiguous:     multi-choice family picker.
 *
 * Pure presentation. All mutations are delegated to the parent via callbacks.
 *
 * Extracted from BarcodeScanner.tsx (Phase 3.3, ADR-015).
 */
import { CheckCircle2, Info, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SectionCard from '@/components/SectionCard';
import { useI18n } from '@/i18n';
import type { FamilyMatchResult } from '../../utils/food-family-resolver';
import type { ScannedProduct } from '../../utils/pseudo-ingredient';
import type { FoodVariant } from '../../../../types/food-family';
import { createVariantFromScan } from '../utils/create-variant-from-scan';

interface BarcodeMatchResultProps {
  matchResult: FamilyMatchResult;
  product: ScannedProduct;
  useSeedMacros: boolean;
  onToggleSeedMacros: () => void;
  savedBrandFamilyIds: Set<string>;
  onSaved: (familyId: string) => void;
  /** Undefined when caller doesn't support saving variants (e.g. recipe context). */
  addUserVariant?: (variant: FoodVariant) => void;
  addVariantBarcode?: (barcode: string, variantId: string) => void;
}

export default function BarcodeMatchResult({
  matchResult,
  product,
  useSeedMacros,
  onToggleSeedMacros,
  savedBrandFamilyIds,
  onSaved,
  addUserVariant,
  addVariantBarcode,
}: BarcodeMatchResultProps) {
  const { t, locale } = useI18n();

  const handleSaveBrand = (family: Parameters<typeof createVariantFromScan>[1]) => {
    if (!addUserVariant) return;
    if (savedBrandFamilyIds.has(family.id)) return; // P15: guard double-tap
    const v = createVariantFromScan(product, family);
    addUserVariant(v);
    if (
      addVariantBarcode &&
      product.barcode &&
      !product.barcode.startsWith('custom_')
    ) {
      addVariantBarcode(product.barcode, v.id);
    }
    onSaved(family.id);
    toast.success(t.scanner.savedToBrands);
  };

  if (matchResult.type === 'known-barcode') {
    const famName =
      locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
    const variantName =
      locale === 'es' ? matchResult.variant.name : matchResult.variant.nameEn;
    return (
      <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-sm p-3">
        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-body-sm text-on-surface">
            <span className="font-bold">{t.scanner.knownProductFound}</span>
          </p>
          <p className="text-micro text-on-surface-variant mt-0.5">
            {variantName} · {famName}
          </p>
        </div>
      </div>
    );
  }

  if (matchResult.type === 'seed-match') {
    const famName =
      locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
    const seedName =
      locale === 'es' ? matchResult.variant.name : matchResult.variant.nameEn;
    const saved = savedBrandFamilyIds.has(matchResult.family.id);
    const seedIsCurated = matchResult.variant.source === 'seed';
    const hideSaveButton = useSeedMacros && seedIsCurated;
    return (
      <div className="space-y-2">
        <SectionCard padding="none" spacing="none" className="flex items-start gap-2 p-3">
          <Info className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-body-sm text-on-surface-variant">
              {t.scanner.foundInFamily}{' '}
              <span className="font-bold text-on-surface">{famName}</span>
            </p>
            <p className="text-micro text-on-surface-variant/80 mt-0.5">
              {t.scanner.similarBrand}:{' '}
              <span className="font-bold text-on-surface">{seedName}</span>
            </p>
          </div>
        </SectionCard>
        <Button
          variant={useSeedMacros ? 'brand' : 'outline'}
          size="sm"
          className="w-full"
          onClick={onToggleSeedMacros}
          aria-pressed={useSeedMacros}
        >
          {useSeedMacros ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              {t.scanner.usingVerifiedData}
            </>
          ) : (
            <>
              <Info className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              {t.scanner.useVerifiedData.replace('{{name}}', seedName)}
            </>
          )}
        </Button>
        {addUserVariant && !hideSaveButton && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleSaveBrand(matchResult.family)}
            disabled={saved}
            aria-label={saved ? t.scanner.savedToBrands : t.scanner.saveAsBrandVariant}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.scanner.savedToBrands}
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.scanner.saveAsBrandVariant}
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  if (matchResult.type === 'fuzzy') {
    const famName =
      locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
    const saved = savedBrandFamilyIds.has(matchResult.family.id);
    return (
      <div className="space-y-2">
        <p className="text-body-sm text-on-surface-variant text-center">
          {t.scanner.confirmFamily}{' '}
          <span className="font-bold text-on-surface">{famName}</span>?
        </p>
        {addUserVariant && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleSaveBrand(matchResult.family)}
            disabled={saved}
            aria-label={saved ? t.scanner.savedToBrands : t.scanner.saveAsBrandVariant}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.scanner.savedToBrands}
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.scanner.saveAsBrandVariant}
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  if (matchResult.type === 'ambiguous') {
    return (
      <div className="space-y-2">
        <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant text-center">
          {t.scanner.chooseFamily}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {matchResult.candidates.map(({ family }) => {
            const famName =
              locale === 'es' ? family.name : family.nameEn;
            const saved = savedBrandFamilyIds.has(family.id);
            return (
              <button
                key={family.id}
                type="button"
                onClick={() => addUserVariant && handleSaveBrand(family)}
                disabled={saved}
                className={`px-3 py-1.5 rounded-sm text-body-sm border min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  saved
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface-container-highest border-outline-variant/20 text-on-surface'
                }`}
              >
                {saved ? `✓ ${famName}` : famName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
