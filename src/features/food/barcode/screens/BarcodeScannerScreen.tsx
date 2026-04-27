/**
 * BarcodeScannerScreen — full-viewport barcode scanner overlay.
 *
 * Composes:
 * - useBarcodeCamera  — camera lifecycle (start / stop / restart)
 * - useProductLookup  — OFF lookup + family matching + derived state
 * - BarcodeScanResult — found-state panel (image + score + match + portion + CTAs)
 * - BarcodeUnknownProduct — not-found state + custom food creation
 *
 * Ownership: header, camera viewport, manual input, BottomSheet wrapper,
 * portionResult, overall ScanState derived from the two hooks.
 *
 * Promoted to sub-feature from src/features/food/components/BarcodeScanner.tsx
 * (Phase 3.3, ADR-015). Public interface is identical so the shim at the old
 * path keeps all existing import sites working unchanged.
 */
import { useState, useMemo, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomSheet from '@/components/ui/bottom-sheet';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import { useI18n } from '@/i18n';
import { Heading } from '@/components/ui/Typography';
import { normalizeGoal } from '../../utils/contextual-score';
import { useBarcodeCamera } from '../hooks/useBarcodeCamera';
import { useProductLookup } from '../hooks/useProductLookup';
import BarcodeScanResult from '../components/BarcodeScanResult';
import BarcodeUnknownProduct from '../components/BarcodeUnknownProduct';
import type { ScannedProduct } from '../../utils/pseudo-ingredient';
import type { PortionResult } from '../../components/PortionSelector';
import type { FoodVariant } from '../../../../types/food-family';
import type { UnitSystem } from '../../utils/units';

// Re-exported here so existing call-sites keep their imports stable.
export type { ScannedProduct };

interface Props {
  onClose: () => void;
  onProductFound: (product: ScannedProduct, portionResult?: PortionResult) => void;
  onSaveToDictionary?: (product: ScannedProduct) => void;
  onAddToRecipe?: (product: ScannedProduct) => void;
  unitSystem?: UnitSystem;
  /** Merged variant pool (FOOD_VARIANTS + userVariants). Used for match-result UI. */
  knownVariants?: FoodVariant[];
  addUserVariant?: (variant: FoodVariant) => void;
  addVariantBarcode?: (barcode: string, variantId: string) => void;
  /**
   * P15 `[1.5.73]` — raw user goal. When present a ContextualScoreChip renders
   * so the user sees alignment with their goal before deciding to log.
   */
  userGoal?: string | null;
}

export default function BarcodeScannerScreen({
  onClose,
  onProductFound,
  onSaveToDictionary,
  onAddToRecipe,
  unitSystem = 'metric',
  knownVariants = [],
  addUserVariant,
  addVariantBarcode,
  userGoal,
}: Props) {
  const { t } = useI18n();
  const [manualCode, setManualCode] = useState('');
  const [portionResult, setPortionResult] = useState<PortionResult | null>(null);

  // P15 [1.5.73] — normalise user goal once for the score chip.
  const activeGoal = useMemo(() => normalizeGoal(userGoal), [userGoal]);

  /* ── hooks ─────────────────────────────────────────────────────── */

  const {
    lookup,
    status: lookupStatus,
    product,
    matchResult,
    useSeedMacros,
    setUseSeedMacros,
    pseudoIngredient,
    scoreVariant,
    savedBrandFamilyIds,
    addSavedFamily,
    reset: resetLookup,
  } = useProductLookup(knownVariants, activeGoal);

  const {
    scannerRef,
    startScanner,
    cameraStatus,
    cameraErrorMsg,
  } = useBarcodeCamera(lookup);

  /* ── derived state ──────────────────────────────────────────────── */

  // Overall scan state collapses camera + lookup statuses.
  const scanState = lookupStatus === 'idle' ? cameraStatus : lookupStatus;

  const sheetOpen = scanState === 'found' || lookupStatus === 'not-found';
  const sheetTitle =
    scanState === 'found' && product
      ? product.name
      : lookupStatus === 'not-found'
        ? t.scanner.notFound
        : '';

  /* ── handlers ───────────────────────────────────────────────────── */

  const handleScanAnother = useCallback(() => {
    resetLookup();
    setPortionResult(null);
    setManualCode('');
    // Brief delay lets the prior scanner instance teardown before a new
    // Html5Qrcode boots on the same `#barcode-reader` DOM node.
    setTimeout(startScanner, 100);
  }, [resetLookup, startScanner]);

  const handleManualSubmit = () => {
    if (manualCode.trim().length >= 8) lookup(manualCode.trim());
  };

  const handleAddToMeal = () => {
    if (!product) return;
    onProductFound(product, portionResult ?? undefined);
  };

  const handleCustomConfirm = (customProduct: ScannedProduct) => {
    onProductFound(customProduct);
  };

  /* ── render ─────────────────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <Heading level="h2" className="text-lg tracking-tight">
          {t.fab.scanBarcode}
        </Heading>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera viewport + manual fallback (stay mounted underneath the sheet) */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
          <div
            ref={scannerRef}
            id="barcode-reader"
            className="w-full aspect-[4/3] bg-surface-container-low rounded-sm border-2 border-dashed border-outline-variant/30 overflow-hidden"
          />
          {cameraStatus === 'scanning' && (
            <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest animate-pulse">
              {t.scanner.pointAtBarcode}
            </p>
          )}
          {lookupStatus === 'looking-up' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-on-surface-variant font-label uppercase tracking-widest">
                {t.scanner.lookingUp}
              </p>
            </div>
          )}

          {/* Manual input fallback */}
          <div className="w-full space-y-3">
            {cameraErrorMsg && (
              <p role="alert" className="text-xs text-brand-secondary text-center">
                {cameraErrorMsg}
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder={t.scanner.barcodePlaceholder}
                className={`${INPUT_SURFACE_CLASSES} flex-1 px-4 py-3 text-on-surface text-sm font-mono focus:outline-none focus:border-primary`}
                onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={manualCode.trim().length < 8}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-scan result sheet */}
      <BottomSheet
        open={sheetOpen}
        onOpenChange={v => { if (!v) handleScanAnother(); }}
        title={sheetTitle}
        size="focus"
        headerLayout="back-title-action"
        onBack={handleScanAnother}
      >
        {scanState === 'found' && product && pseudoIngredient && (
          <BarcodeScanResult
            product={product}
            pseudoIngredient={pseudoIngredient}
            matchResult={matchResult}
            scoreVariant={scoreVariant}
            activeGoal={activeGoal}
            useSeedMacros={useSeedMacros}
            onToggleSeedMacros={() => setUseSeedMacros(prev => !prev)}
            savedBrandFamilyIds={savedBrandFamilyIds}
            onSaved={addSavedFamily}
            addUserVariant={addUserVariant}
            addVariantBarcode={addVariantBarcode}
            unitSystem={unitSystem}
            onPortionChange={setPortionResult}
            onAddToMeal={handleAddToMeal}
            onAddToRecipe={onAddToRecipe}
            onSaveToDictionary={onSaveToDictionary}
            onScanAnother={handleScanAnother}
          />
        )}

        {lookupStatus === 'not-found' && (
          <BarcodeUnknownProduct
            onConfirm={handleCustomConfirm}
            onRetry={handleScanAnother}
            onSearchManually={onClose}
          />
        )}
      </BottomSheet>
    </div>
  );
}
