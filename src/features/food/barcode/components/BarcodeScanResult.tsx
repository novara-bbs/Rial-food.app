/**
 * BarcodeScanResult — "product found" panel inside the scan result sheet.
 *
 * Renders:
 * - Product header (image + badge + brand + source badge)
 * - ContextualScoreChip (P15 [1.5.73])
 * - BarcodeMatchResult (family match banner)
 * - PortionSelector inside a SectionCard
 * - Primary + secondary CTAs (add to meal / add to recipe / save / scan another)
 *
 * Pure presentation. All state is owned by the parent screen.
 *
 * Extracted from BarcodeScanner.tsx (Phase 3.3, ADR-015).
 */
import { CheckCircle2, UtensilsCrossed, BookOpen, Save, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionCard from '@/components/SectionCard';
import PortionSelector, { type PortionResult } from '../../components/PortionSelector';
import ContextualScoreChip from '../../components/ContextualScoreChip';
import { useI18n } from '@/i18n';
import BarcodeMatchResult from './BarcodeMatchResult';
import type { FamilyMatchResult } from '../../utils/food-family-resolver';
import type { ScannedProduct } from '../../utils/pseudo-ingredient';
import type { FoodVariant } from '../../../../types/food-family';
import type { Ingredient } from '../../../../types';
import type { UnitSystem } from '../../utils/units';
import { normalizeGoal } from '../../utils/contextual-score';
import { Heading } from '@/components/ui/Typography';

type ActiveGoal = ReturnType<typeof normalizeGoal>;

interface BarcodeScanResultProps {
  product: ScannedProduct;
  pseudoIngredient: Ingredient;
  matchResult: FamilyMatchResult | null;
  scoreVariant: FoodVariant | null;
  activeGoal: ActiveGoal;
  useSeedMacros: boolean;
  onToggleSeedMacros: () => void;
  savedBrandFamilyIds: Set<string>;
  onSaved: (familyId: string) => void;
  addUserVariant?: (variant: FoodVariant) => void;
  addVariantBarcode?: (barcode: string, variantId: string) => void;
  unitSystem: UnitSystem;
  onPortionChange: (result: PortionResult | null) => void;
  onAddToMeal: () => void;
  onAddToRecipe?: (product: ScannedProduct) => void;
  onSaveToDictionary?: (product: ScannedProduct) => void;
  onScanAnother: () => void;
}

export default function BarcodeScanResult({
  product,
  pseudoIngredient,
  matchResult,
  scoreVariant,
  activeGoal,
  useSeedMacros,
  onToggleSeedMacros,
  savedBrandFamilyIds,
  onSaved,
  addUserVariant,
  addVariantBarcode,
  unitSystem,
  onPortionChange,
  onAddToMeal,
  onAddToRecipe,
  onSaveToDictionary,
  onScanAnother,
}: BarcodeScanResultProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* Product header */}
      <div className="bg-surface-container-low border border-green-500/30 rounded-sm p-4">
        <div className="flex items-start gap-3">
          {product.image && (
            <img
              src={product.image}
              alt=""
              className="w-16 h-16 rounded-sm object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <Badge variant="outline" className="text-primary border-primary/30">
                {t.scanner.scanned}
              </Badge>
              {/* P16 [1.5.74] — data source badge */}
              {useSeedMacros ? (
                <Badge
                  variant="outline"
                  className="text-primary border-primary/30"
                  aria-label={t.scanner.sourceVerifiedAria}
                >
                  ✨ {t.scanner.sourceVerified}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-on-surface-variant border-outline-variant/40"
                  aria-label={t.scanner.sourceManufacturerAria}
                >
                  {t.scanner.sourceManufacturer}
                </Badge>
              )}
            </div>
            {product.brand && (
              <p className="text-micro text-on-surface-variant mt-0.5">{product.brand}</p>
            )}
            <p className="text-micro text-on-surface-variant/60 mt-1">{t.scanner.per100g}</p>
          </div>
        </div>
      </div>

      {/* P15 [1.5.73] — contextual score: immediate alignment feedback before logging */}
      {scoreVariant && activeGoal && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
            {t.contextualScore.forGoal.replace(
              '{{goal}}',
              t.contextualScore.goalLabels[activeGoal],
            )}
          </span>
          <ContextualScoreChip variant={scoreVariant} goal={activeGoal} size="md" />
        </div>
      )}

      {/* Family match banner */}
      {matchResult && matchResult.type !== 'no-match' && (
        <BarcodeMatchResult
          matchResult={matchResult}
          product={product}
          useSeedMacros={useSeedMacros}
          onToggleSeedMacros={onToggleSeedMacros}
          savedBrandFamilyIds={savedBrandFamilyIds}
          onSaved={onSaved}
          addUserVariant={addUserVariant}
          addVariantBarcode={addVariantBarcode}
        />
      )}

      {/* Portion selector */}
      <SectionCard padding="none" spacing="none" className="p-4 space-y-2">
        <Heading level="h4" variant="overline" className="text-micro font-label text-on-surface-variant">
          {t.portionSelector.adjustPortion}
        </Heading>
        <PortionSelector
          ingredient={pseudoIngredient}
          onChange={onPortionChange}
          unitSystem={unitSystem}
        />
      </SectionCard>

      {/* CTAs */}
      <div className="space-y-2">
        <Button variant="brand" className="w-full" onClick={onAddToMeal}>
          <UtensilsCrossed className="w-4 h-4 mr-2" aria-hidden="true" />
          {t.portionSelector.addToMeal}
        </Button>
        {(onAddToRecipe || onSaveToDictionary) && (
          <div className="grid grid-cols-2 gap-2">
            {onAddToRecipe && (
              <Button variant="outline" size="sm" onClick={() => onAddToRecipe(product)}>
                <BookOpen className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.portionSelector.addToRecipe}
              </Button>
            )}
            {onSaveToDictionary && (
              <Button variant="outline" size="sm" onClick={() => onSaveToDictionary(product)}>
                <Save className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.scanner.save}
              </Button>
            )}
          </div>
        )}
        <Button variant="ghost" className="w-full" onClick={onScanAnother}>
          <RotateCcw className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
          {t.scanner.scanAnother}
        </Button>
      </div>
    </div>
  );
}
