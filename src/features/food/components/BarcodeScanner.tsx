import { useState, useEffect, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { Heading } from '@/components/ui/Typography';
import { toast } from 'sonner';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useI18n } from '../../../i18n';
import { logger } from '../../../lib/logger';
import { track } from '../../../lib/analytics';
import type { PortionResult } from './PortionSelector';
import { parseOFFServings } from '../api/open-food-facts';
import type { UnitSystem } from '../utils/units';
import {
  scannedProductToIngredient,
  type ScannedProduct,
} from '../utils/pseudo-ingredient';
import type { FoodVariant, FoodFamily } from '../../../types/food-family';
import {
  matchFamilyForScan,
  getCanonicalVariant,
  type FamilyMatchResult,
} from '../utils/food-family-resolver';
import { normalizeGoal } from '../utils/contextual-score';
import { variantToIngredient } from '../utils/variant-to-ingredient';
import BarcodeViewport from './barcode/BarcodeViewport';
import BarcodeFoundPanel from './barcode/BarcodeFoundPanel';
import BarcodeNotFoundPanel from './barcode/BarcodeNotFoundPanel';
import BarcodeCustomFoodForm from './barcode/BarcodeCustomFoodForm';

type ScanState = 'idle' | 'scanning' | 'looking-up' | 'found' | 'not-found' | 'error';

// Re-exported here so existing call-sites (AddMeal, RecipeDetail, etc.) keep
// their imports stable. Canonical shape now lives in `./pseudo-ingredient`.
export type { ScannedProduct };

/** Build a brand FoodVariant from a scanned product + a family match. */
function createVariantFromScan(product: ScannedProduct, family: FoodFamily): FoodVariant {
  const canonical = getCanonicalVariant(family.id);
  const barcode = product.barcode && !product.barcode.startsWith('custom_')
    ? product.barcode
    : undefined;
  const id = barcode ? `off_${barcode}` : `user_${Date.now()}`;
  return {
    id,
    familyId: family.id,
    name: product.name,
    nameEn: product.name,
    variantType: 'brand',
    brand: { name: product.brand || 'Marca desconocida', barcode, scanned: true },
    baseAmount: canonical?.baseAmount ?? 100,
    baseUnit: canonical?.baseUnit ?? 'g',
    servingSizes: product.servingSizes?.length ? product.servingSizes : (canonical?.servingSizes ?? []),
    macros: {
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fats: product.fats,
      saturatedFat: product.saturatedFat,
      sugar: product.sugar,
    },
    micros: canonical?.micros ?? { vitamins: {}, minerals: {}, others: {} },
    allergens: canonical?.allergens ?? [],
    tags: canonical?.tags ?? [],
    source: 'off',
  };
}

interface Props {
  onClose: () => void;
  onProductFound: (product: ScannedProduct, portionResult?: PortionResult) => void;
  onSaveToDictionary?: (product: ScannedProduct) => void;
  onAddToRecipe?: (product: ScannedProduct) => void;
  unitSystem?: UnitSystem;
  /** Merged variant pool from AppStateContext (FOOD_VARIANTS + userVariants). Used for match-result UI. */
  knownVariants?: FoodVariant[];
  /** Called when the user saves a scanned product to their brand library. */
  addUserVariant?: (variant: FoodVariant) => void;
  /** Called to index the barcode → variantId so re-scans are instant. */
  addVariantBarcode?: (barcode: string, variantId: string) => void;
  /**
   * P15 `[1.5.73]` — raw user goal (from `userProfile.goal`). When present,
   * a `ContextualScoreChip` renders next to the scanned product so the user
   * sees immediately whether this product aligns with their goal, before
   * deciding to log it. Normalised internally via `normalizeGoal`.
   */
  userGoal?: string | null;
}

/**
 * Barcode scanner — composer component.
 *
 * Owns camera lifecycle (html5-qrcode via dynamic import), the scan state
 * machine, and Open Food Facts lookup. Delegates all result UI to sub-
 * components in `./barcode/`:
 *
 *   BarcodeViewport      — camera div + manual-entry fallback
 *   BarcodeFoundPanel    — product detail, match banner, portion selector, CTAs
 *   BarcodeNotFoundPanel — not-found escape hatches
 *   BarcodeCustomFoodForm — custom food creation form
 *
 * [Sprint 34] split from 823 → ~200 lines.
 */
export default function BarcodeScanner({
  onClose, onProductFound, onSaveToDictionary, onAddToRecipe,
  unitSystem = 'metric',
  knownVariants = [],
  addUserVariant,
  addVariantBarcode,
  userGoal,
}: Props) {
  const { t } = useI18n();

  // ─── Scan state machine ───────────────────────────────────────────────────
  const [state, setState] = useState<ScanState>('idle');
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [matchResult, setMatchResult] = useState<FamilyMatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [portionResult, setPortionResult] = useState<PortionResult | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // P15 [1.5.73] — guard double-tap on brand saves during a session.
  const [savedBrandFamilyIds, setSavedBrandFamilyIds] = useState<Set<string>>(() => new Set());

  // P16 [1.5.74] — swap macros source between OFF payload and curated seed.
  const [useSeedMacros, setUseSeedMacros] = useState(false);

  // ─── Camera refs ─────────────────────────────────────────────────────────
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);

  // ─── Derived values ───────────────────────────────────────────────────────

  // P15 [1.5.73] — normalise the user's goal once for the contextual chip.
  const activeGoal = useMemo(() => normalizeGoal(userGoal), [userGoal]);

  // P15 [1.5.73] — build a score-ready FoodVariant from the scanned product.
  const scoreVariant = useMemo<FoodVariant | null>(() => {
    if (!activeGoal || !product) return null;
    if (matchResult?.type === 'known-barcode' || matchResult?.type === 'seed-match') {
      return matchResult.variant;
    }
    return {
      id: `scan_${product.barcode ?? Date.now()}`,
      familyId: 'fam_scan_result',
      name: product.name,
      nameEn: product.name,
      variantType: 'brand',
      baseAmount: 100,
      baseUnit: 'g',
      servingSizes: [],
      macros: {
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fats: product.fats,
        saturatedFat: product.saturatedFat,
        sugar: product.sugar,
      },
      micros: { vitamins: {}, minerals: {}, others: {} },
      allergens: [],
      source: 'off',
    };
  }, [activeGoal, product, matchResult]);

  // P16 [1.5.74] — effective ingredient source: seed variant or OFF payload.
  const pseudoIngredient = useMemo(() => {
    if (!product) return null;
    const canUseSeed =
      useSeedMacros
      && (matchResult?.type === 'known-barcode' || matchResult?.type === 'seed-match')
      && matchResult.variant;
    if (canUseSeed) {
      const seedIngredient = variantToIngredient(matchResult.variant);
      return { ...seedIngredient, id: `scan_${product.barcode ?? Date.now()}`, name: product.name, nameEn: product.name };
    }
    return scannedProductToIngredient(product);
  }, [product, useSeedMacros, matchResult]);

  // ─── OFF lookup ───────────────────────────────────────────────────────────

  const lookupBarcode = async (barcode: string) => {
    setState('looking-up');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_es,product_name_en,brands,nutriments,serving_size,serving_quantity,product_quantity,image_front_small_url,image_url`);
      const data = await res.json() as { status: number; product?: Record<string, unknown> };

      if (data.status === 1 && data.product) {
        const p = data.product as Record<string, unknown>;
        const n = (p.nutriments ?? {}) as Record<string, number>;

        const servingSizes = parseOFFServings({
          serving_size: p.serving_size as string | undefined,
          serving_quantity: p.serving_quantity as number | undefined,
          product_quantity: p.product_quantity as string | undefined,
        });

        const result: ScannedProduct = {
          name: (p.product_name || p.product_name_es || p.product_name_en || 'Producto desconocido') as string,
          brand: (p.brands || '') as string,
          calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein: Math.round((n.proteins_100g || n.proteins || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || n.carbohydrates || 0) * 10) / 10,
          fats: Math.round((n.fat_100g || n.fat || 0) * 10) / 10,
          fiber: n.fiber_100g ? Math.round(n.fiber_100g * 10) / 10 : undefined,
          sugar: n.sugars_100g ? Math.round(n.sugars_100g * 10) / 10 : undefined,
          saturatedFat: n['saturated-fat_100g'] ? Math.round(n['saturated-fat_100g'] * 10) / 10 : undefined,
          barcode,
          image: (p.image_front_small_url as string | undefined) || (p.image_url as string | undefined),
          servingSizes,
        };

        setProduct(result);
        setState('found');

        if (knownVariants.length > 0) {
          const mr = matchFamilyForScan(barcode, p.brands as string || '', result.name, knownVariants);
          setMatchResult(mr);
          // P16 — auto-prefer saved macros on known-barcode.
          setUseSeedMacros(mr.type === 'known-barcode');
        } else {
          setUseSeedMacros(false);
        }
      } else {
        setState('not-found');
      }
      // Barcode-funnel metric — fires once per scan with found/not-found outcome.
      // No-op until VITE_POSTHOG_KEY is set (see src/lib/analytics.ts).
      track.barcodeScanned({ found: data.status === 1 && !!data.product });
    } catch (error) {
      logger.warn('BarcodeScanner OFF lookup failed', { barcode, error });
      setState('not-found');
      track.barcodeScanned({ found: false });
    }
  };

  // ─── Camera lifecycle ─────────────────────────────────────────────────────

  /**
   * Shared scanner bootstrap used by mount effect and handleScanAnother.
   * Unified here so both paths surface camera-permission failures via the
   * same `logger.warn` breadcrumb. [Sprint 34]
   */
  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!scannerRef.current) return;
      const scanner = new Html5Qrcode('barcode-reader');
      html5QrRef.current = scanner;
      setState('scanning');
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 120 }, aspectRatio: 1.5 },
        (decodedText: string) => { scanner.stop().catch(() => {}); lookupBarcode(decodedText); },
        () => {},
      );
    } catch (err) {
      logger.warn('Camera not available', { error: err instanceof Error ? err.message : String(err) });
      setState('idle');
      setErrorMsg(t.scanner.cameraNotAvailable);
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (html5QrRef.current) {
        (html5QrRef.current as { stop: () => Promise<void> }).stop().catch(() => {});
      }
    };
    // Intentional mount-only effect — camera boots once; teardown is in cleanup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Event handlers ───────────────────────────────────────────────────────

  const handleManualSubmit = () => {
    if (manualCode.trim().length >= 8) lookupBarcode(manualCode.trim());
  };

  const handleScanAnother = () => {
    setState('idle');
    setProduct(null);
    setMatchResult(null);
    setPortionResult(null);
    setManualCode('');
    setShowCustomForm(false);
    setUseSeedMacros(false);
    setTimeout(() => { startScanner(); }, 100);
  };

  const handleSaveBrand = (family: FoodFamily) => {
    if (!addUserVariant || !product) return;
    if (savedBrandFamilyIds.has(family.id)) return;
    const v = createVariantFromScan(product, family);
    addUserVariant(v);
    if (addVariantBarcode && product.barcode && !product.barcode.startsWith('custom_')) {
      addVariantBarcode(product.barcode, v.id);
    }
    setSavedBrandFamilyIds(prev => { const next = new Set(prev); next.add(family.id); return next; });
    toast.success(t.scanner.savedToBrands);
  };

  const handleSheetBack = () => {
    if (showCustomForm) { setShowCustomForm(false); return; }
    handleScanAnother();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const sheetOpen = showCustomForm || state === 'found' || state === 'not-found';
  const sheetTitle = showCustomForm
    ? t.scanner.customFoodTitle
    : state === 'found' && product ? product.name
    : state === 'not-found' ? t.scanner.notFound
    : '';

  return (
    <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <Heading level="h2" className="font-headline text-title-sm font-bold uppercase text-tertiary tracking-tight">{t.fab.scanBarcode}</Heading>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <BarcodeViewport
        scannerRef={scannerRef}
        state={state}
        errorMsg={errorMsg}
        manualCode={manualCode}
        onManualChange={setManualCode}
        onManualSubmit={handleManualSubmit}
      />

      <BottomSheet
        open={sheetOpen}
        onOpenChange={v => { if (!v) handleSheetBack(); }}
        title={sheetTitle}
        size="focus"
        headerLayout="back-title-action"
        onBack={handleSheetBack}
      >
        {!showCustomForm && state === 'found' && product && pseudoIngredient && (
          <BarcodeFoundPanel
            product={product}
            pseudoIngredient={pseudoIngredient}
            matchResult={matchResult}
            portionResult={portionResult}
            useSeedMacros={useSeedMacros}
            onToggleSeedMacros={() => setUseSeedMacros(prev => !prev)}
            scoreVariant={scoreVariant}
            activeGoal={activeGoal}
            savedBrandFamilyIds={savedBrandFamilyIds}
            onSaveBrand={handleSaveBrand}
            unitSystem={unitSystem}
            onPortionChange={setPortionResult}
            onProductFound={onProductFound}
            onAddToRecipe={onAddToRecipe}
            onSaveToDictionary={onSaveToDictionary}
            onScanAnother={handleScanAnother}
          />
        )}

        {!showCustomForm && state === 'not-found' && (
          <BarcodeNotFoundPanel
            onCreateCustom={() => setShowCustomForm(true)}
            onScanAnother={handleScanAnother}
            onClose={onClose}
          />
        )}

        {showCustomForm && (
          <BarcodeCustomFoodForm onSubmit={onProductFound} />
        )}
      </BottomSheet>
    </div>
  );
}
