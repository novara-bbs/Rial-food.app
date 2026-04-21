import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle2, UtensilsCrossed, BookOpen, Save, RotateCcw, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useI18n } from '../../../i18n';
import { logger } from '../../../lib/logger';
import PortionSelector from './PortionSelector';
import type { PortionResult } from './PortionSelector';
import { parseOFFServings } from '../api/open-food-facts';
import type { UnitSystem } from '../utils/units';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import SectionCard from '../../../components/SectionCard';
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
import ContextualScoreChip from './ContextualScoreChip';
import { normalizeGoal } from '../utils/contextual-score';
import { variantToIngredient } from '../utils/variant-to-ingredient';

type ScanState = 'idle' | 'scanning' | 'looking-up' | 'found' | 'not-found' | 'error';

// Re-exported here so existing call-sites (AddMeal, RecipeDetail, etc.) keep
// their imports stable. Canonical shape now lives in `../utils/pseudo-ingredient`.
export type { ScannedProduct };

/** Build a brand FoodVariant from a scanned product + a family match. */
function createVariantFromScan(
  product: ScannedProduct,
  family: FoodFamily,
): FoodVariant {
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

export default function BarcodeScanner({
  onClose, onProductFound, onSaveToDictionary, onAddToRecipe,
  unitSystem = 'metric',
  knownVariants = [],
  addUserVariant,
  addVariantBarcode,
  userGoal,
}: Props) {
  const { t, locale } = useI18n();
  const [state, setState] = useState<ScanState>('idle');
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [matchResult, setMatchResult] = useState<FamilyMatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [portionResult, setPortionResult] = useState<PortionResult | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', brand: '', serving: '100', cal: '', pro: '', carbs: '', fats: '' });
  // P15 [1.5.73] — tracks brand saves made during the current scan session so
  // the «Guardar en mis marcas» button shows «Guardado ✓» + disables itself,
  // preventing silent double-taps that would duplicate userVariants.
  const [savedBrandFamilyIds, setSavedBrandFamilyIds] = useState<Set<string>>(() => new Set());
  // P16 [1.5.74] — when true, the PortionSelector + log uses the macros of the
  // matched seed/saved variant instead of the OFF payload. Auto-true for
  // `known-barcode` (user already chose to save that variant before); opt-in
  // for `seed-match` (user confirms «yes this is Activia Natural»).
  // Resets on every new lookup.
  const [useSeedMacros, setUseSeedMacros] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  // P15 [1.5.73] — normalise the user's goal once for the contextual chip.
  const activeGoal = useMemo(() => normalizeGoal(userGoal), [userGoal]);

  // P15 [1.5.73] — build a score-ready FoodVariant from the scanned product's
  // macros. Used for the ContextualScoreChip, not persisted. When match produced
  // a seed/user variant, prefer that (cleaner macros, known qualityTags).
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

  // P16 [1.5.74] — effective ingredient source.
  // When `useSeedMacros` is on AND we have a seed/known variant match, the
  // PortionSelector + onProductFound payload use the curated seed macros +
  // servingSizes. Otherwise fall back to the scanned OFF product. This is the
  // key fix closing the P15 lateral bug (chip used seed but log used OFF).
  const pseudoIngredient = useMemo(() => {
    if (!product) return null;
    const canUseSeed =
      useSeedMacros
      && (matchResult?.type === 'known-barcode' || matchResult?.type === 'seed-match')
      && matchResult.variant;
    if (canUseSeed) {
      // Override the display name to keep the user oriented to *their* scan,
      // but use the curated macros + servingSizes from the seed variant.
      const seedIngredient = variantToIngredient(matchResult.variant);
      return {
        ...seedIngredient,
        id: `scan_${product.barcode ?? Date.now()}`,
        name: product.name,
        nameEn: product.name,
      };
    }
    return scannedProductToIngredient(product);
  }, [product, useSeedMacros, matchResult]);

  const lookupBarcode = async (barcode: string) => {
    setState('looking-up');

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_es,product_name_en,brands,nutriments,serving_size,serving_quantity,product_quantity,image_front_small_url,image_url`);
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};

        const servingSizes = parseOFFServings({
          serving_size: p.serving_size,
          serving_quantity: p.serving_quantity,
          product_quantity: p.product_quantity,
        });

        const result: ScannedProduct = {
          name: p.product_name || p.product_name_es || p.product_name_en || 'Producto desconocido',
          brand: p.brands || '',
          calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein: Math.round((n.proteins_100g || n.proteins || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || n.carbohydrates || 0) * 10) / 10,
          fats: Math.round((n.fat_100g || n.fat || 0) * 10) / 10,
          fiber: n.fiber_100g ? Math.round(n.fiber_100g * 10) / 10 : undefined,
          sugar: n.sugars_100g ? Math.round(n.sugars_100g * 10) / 10 : undefined,
          saturatedFat: n['saturated-fat_100g'] ? Math.round(n['saturated-fat_100g'] * 10) / 10 : undefined,
          barcode,
          image: p.image_front_small_url || p.image_url,
          servingSizes,
        };

        setProduct(result);
        setState('found');

        // P5 — compute the family match asynchronously so UI is non-blocking
        if (knownVariants.length > 0) {
          const mr = matchFamilyForScan(
            barcode,
            p.brands || '',
            result.name,
            knownVariants,
          );
          setMatchResult(mr);
          // P16 [1.5.74] — auto-prefer saved macros on known-barcode (the user
          // already curated this entry). Seed-match stays opt-in because we
          // can't be sure the specific product is identical without a barcode
          // confirmation (that's P17).
          setUseSeedMacros(mr.type === 'known-barcode');
        } else {
          setUseSeedMacros(false);
        }
      } else {
        setState('not-found');
      }
    } catch (error) {
      // Network error vs unknown-barcode are the same UX ("not-found") because
      // the sheet always offers "create custom" as the escape hatch. But we
      // log the root cause so production telemetry can distinguish offline /
      // OFF outage / malformed response from a genuine miss.
      logger.warn('BarcodeScanner OFF lookup failed', { barcode, error });
      setState('not-found');
    }
  };

  /**
   * Shared scanner bootstrap used by both the mount effect and `handleScanAnother`.
   * Before Wave 1 this logic lived in two places — the retry path silently
   * swallowed camera-permission failures while the mount path surfaced them
   * via `errorMsg`. Unifying here means Sentry sees every failure through the
   * same `logger.warn('Camera not available', …)` breadcrumb and the UI
   * message is consistent whether scanning was triggered by mount or retry.
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
        (decodedText: string) => {
          scanner.stop().catch(() => {});
          lookupBarcode(decodedText);
        },
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
        html5QrRef.current.stop().catch(() => {});
      }
    };
    // Intentional mount-only effect: startScanner + lookupBarcode are
    // re-created every render but the camera only boots once on mount;
    // html5-qrcode teardown lives in the cleanup above.
  }, []);

  const handleManualSubmit = () => {
    if (manualCode.trim().length >= 8) {
      lookupBarcode(manualCode.trim());
    }
  };

  const handleScanAnother = () => {
    setState('idle');
    setProduct(null);
    setMatchResult(null);
    setPortionResult(null);
    setManualCode('');
    setShowCustomForm(false);
    // P16 [1.5.74] — reset the seed-macros toggle; each scan starts fresh.
    setUseSeedMacros(false);
    // Brief delay lets the prior scanner teardown settle before we boot a new
    // instance on the same `#barcode-reader` DOM node.
    setTimeout(() => { startScanner(); }, 100);
  };

  const sheetOpen = showCustomForm || state === 'found' || state === 'not-found';

  const sheetTitle = showCustomForm
    ? t.scanner.customFoodTitle
    : state === 'found' && product
      ? product.name
      : state === 'not-found'
        ? t.scanner.notFound
        : '';

  const handleSheetBack = () => {
    if (showCustomForm) {
      setShowCustomForm(false);
      return;
    }
    handleScanAnother();
  };

  return (
    <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <h2 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.fab.scanBarcode}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera viewport + manual fallback stay mounted underneath the sheet. */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
          <div
            ref={scannerRef}
            id="barcode-reader"
            className="w-full aspect-[4/3] bg-surface-container-low rounded-sm border-2 border-dashed border-outline-variant/30 overflow-hidden"
          />
          {state === 'scanning' && (
            <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest animate-pulse">
              {t.scanner.pointAtBarcode}
            </p>
          )}

          {state === 'looking-up' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-on-surface-variant font-label uppercase tracking-widest">
                {t.scanner.lookingUp}
              </p>
            </div>
          )}

          {/* Manual input fallback */}
          <div className="w-full space-y-3">
            {errorMsg && (
              <p role="alert" className="text-xs text-brand-secondary text-center">
                {errorMsg}
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

      {/* Post-scan result panel — BottomSheet size=focus with back-title-action header. */}
      <BottomSheet
        open={sheetOpen}
        onOpenChange={v => { if (!v) handleSheetBack(); }}
        title={sheetTitle}
        size="focus"
        headerLayout="back-title-action"
        onBack={handleSheetBack}
      >
        {/* FOUND — Product detail + match banner + portion selector + CTAs */}
        {!showCustomForm && state === 'found' && product && pseudoIngredient && (
          <div className="space-y-4">
            <div className="bg-surface-container-low border border-green-500/30 rounded-sm p-4">
              <div className="flex items-start gap-3">
                {product.image && (
                  <img src={product.image} alt="" className="w-16 h-16 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {t.scanner.scanned}
                    </Badge>
                    {/* P16 [1.5.74] — data source badge: RIAL curated vs OFF manufacturer. */}
                    {useSeedMacros
                      ? (
                        <Badge variant="outline" className="text-primary border-primary/30" aria-label={t.scanner.sourceVerifiedAria}>
                          ✨ {t.scanner.sourceVerified}
                        </Badge>
                      )
                      : (
                        <Badge variant="outline" className="text-on-surface-variant border-outline-variant/40" aria-label={t.scanner.sourceManufacturerAria}>
                          {t.scanner.sourceManufacturer}
                        </Badge>
                      )}
                  </div>
                  {product.brand && <p className="text-micro text-on-surface-variant mt-0.5">{product.brand}</p>}
                  <p className="text-micro text-on-surface-variant/60 mt-1">
                    {t.scanner.per100g}
                  </p>
                </div>
              </div>
            </div>

            {/* P15 [1.5.73] — contextual score chip: the user sees immediately
                if this product aligns with their goal, before deciding to log. */}
            {scoreVariant && activeGoal && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                  {t.contextualScore.forGoal.replace('{{goal}}', t.contextualScore.goalLabels[activeGoal])}
                </span>
                <ContextualScoreChip variant={scoreVariant} goal={activeGoal} size="md" />
              </div>
            )}

            {/* P5 — family match banner (P15 polished: save-feedback + variant-name). */}
            {matchResult && matchResult.type !== 'no-match' && (() => {
              const handleSaveBrand = (family: FoodFamily) => {
                if (!addUserVariant) return;
                // P15 [1.5.73] — guard double-tap: if already saved under this family
                // in the current session, no-op. Prevents duplicate userVariants.
                if (savedBrandFamilyIds.has(family.id)) return;
                const v = createVariantFromScan(product, family);
                addUserVariant(v);
                if (addVariantBarcode && product.barcode && !product.barcode.startsWith('custom_')) {
                  addVariantBarcode(product.barcode, v.id);
                }
                setSavedBrandFamilyIds(prev => {
                  const next = new Set(prev);
                  next.add(family.id);
                  return next;
                });
                toast.success(t.scanner.savedToBrands);
              };

              if (matchResult.type === 'known-barcode') {
                const famName = locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
                // P15 — show the saved variant name (not just family) so the user
                // recognises the exact previously-scanned entry.
                const variantName = locale === 'es'
                  ? matchResult.variant.name
                  : matchResult.variant.nameEn;
                return (
                  <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-sm p-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-on-surface">
                        <span className="font-bold">{t.scanner.knownProductFound}</span>
                      </p>
                      <p className="text-micro text-on-surface-variant mt-0.5">
                        {variantName}
                        {' · '}
                        {famName}
                      </p>
                    </div>
                  </div>
                );
              }

              if (matchResult.type === 'seed-match') {
                const famName = locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
                // P15 — highlight the seed variant the scanner matched to (e.g.
                // "Activia Natural"), not just the family, so the user can tell
                // whether our curated brand entry IS their product.
                const seedName = locale === 'es'
                  ? matchResult.variant.name
                  : matchResult.variant.nameEn;
                const saved = savedBrandFamilyIds.has(matchResult.family.id);
                // P16 [1.5.74] — when the user has opted into seed macros, the
                // seed variant IS the source of truth for this scan. The
                // «Guardar en mis marcas» button becomes redundant (it would
                // duplicate a curated entry as a userVariant), so we hide it.
                const seedIsCurated = matchResult.variant.source === 'seed';
                const hideSaveButton = useSeedMacros && seedIsCurated;
                return (
                  <div className="space-y-2">
                    <SectionCard padding="none" spacing="none" className="flex items-start gap-2 p-3">
                      <Info className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-on-surface-variant">
                          {t.scanner.foundInFamily}
                          {' '}
                          <span className="font-bold text-on-surface">{famName}</span>
                        </p>
                        <p className="text-micro text-on-surface-variant/80 mt-0.5">
                          {t.scanner.similarBrand}: <span className="font-bold text-on-surface">{seedName}</span>
                        </p>
                      </div>
                    </SectionCard>
                    {/* P16 [1.5.74] — let user swap macros source to the curated seed. */}
                    <Button
                      variant={useSeedMacros ? 'brand' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => setUseSeedMacros(prev => !prev)}
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
                const famName = locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
                const saved = savedBrandFamilyIds.has(matchResult.family.id);
                return (
                  <div className="space-y-2">
                    <p className="text-body-sm text-on-surface-variant text-center">
                      {t.scanner.confirmFamily}
                      {' '}
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
                        const famName = locale === 'es' ? family.name : family.nameEn;
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
            })()}

            <SectionCard padding="none" spacing="none" className="p-4 space-y-2">
              <h4 className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                {t.portionSelector.adjustPortion}
              </h4>
              <PortionSelector
                ingredient={pseudoIngredient}
                onChange={setPortionResult}
                unitSystem={unitSystem}
              />
            </SectionCard>

            <div className="space-y-2">
              <Button
                variant="brand"
                className="w-full"
                onClick={() => onProductFound(product, portionResult ?? undefined)}
              >
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
            </div>

            <Button variant="ghost" className="w-full" onClick={handleScanAnother}>
              <RotateCcw className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
              {t.scanner.scanAnother}
            </Button>
          </div>
        )}

        {/* NOT FOUND — explain + offer custom food creation or retry */}
        {!showCustomForm && state === 'not-found' && (
          <div className="space-y-4 text-center py-2">
            <AlertTriangle className="w-10 h-10 text-brand-secondary mx-auto" />
            <p className="text-sm text-on-surface-variant">
              {t.scanner.notFound}
            </p>
            <Button variant="brand" className="w-full" onClick={() => setShowCustomForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t.scanner.createCustom}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleScanAnother}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t.scanner.retry}
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              {t.scanner.searchManually}
            </Button>
          </div>
        )}

        {/* CUSTOM FOOD FORM */}
        {showCustomForm && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">{t.scanner.foodName} *</label>
                <input
                  type="text"
                  value={customFood.name}
                  onChange={e => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.scanner.foodNamePlaceholder}
                  className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
                />
              </div>

              <div>
                <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">{t.scanner.brand}</label>
                <input
                  type="text"
                  value={customFood.brand}
                  onChange={e => setCustomFood(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder={t.scanner.brandPlaceholder}
                  className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
                />
              </div>

              <div>
                <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">{t.scanner.servingSize}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={customFood.serving}
                  onChange={e => setCustomFood(prev => ({ ...prev, serving: e.target.value }))}
                  className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">{t.scanner.calories} *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customFood.cal}
                    onChange={e => setCustomFood(prev => ({ ...prev, cal: e.target.value }))}
                    placeholder="0"
                    className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
                  />
                </div>
                <div>
                  <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">{t.scanner.protein}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customFood.pro}
                    onChange={e => setCustomFood(prev => ({ ...prev, pro: e.target.value }))}
                    placeholder="0"
                    className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
                  />
                </div>
                <div>
                  <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">{t.scanner.carbs}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customFood.carbs}
                    onChange={e => setCustomFood(prev => ({ ...prev, carbs: e.target.value }))}
                    placeholder="0"
                    className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
                  />
                </div>
                <div>
                  <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">{t.scanner.fats}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customFood.fats}
                    onChange={e => setCustomFood(prev => ({ ...prev, fats: e.target.value }))}
                    placeholder="0"
                    className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
                  />
                </div>
              </div>
            </div>

            <Button
              variant="brand"
              className="w-full"
              disabled={!customFood.name.trim() || !customFood.cal}
              onClick={() => {
                if (!customFood.name.trim() || !customFood.cal) return;
                const serving = parseFloat(customFood.serving) || 100;
                const customProduct: ScannedProduct = {
                  name: customFood.name.trim(),
                  brand: customFood.brand.trim(),
                  calories: Math.round((parseFloat(customFood.cal) || 0) / serving * 100),
                  protein: Math.round(((parseFloat(customFood.pro) || 0) / serving * 100) * 10) / 10,
                  carbs: Math.round(((parseFloat(customFood.carbs) || 0) / serving * 100) * 10) / 10,
                  fats: Math.round(((parseFloat(customFood.fats) || 0) / serving * 100) * 10) / 10,
                  barcode: `custom_${Date.now()}`,
                  servingSizes: [
                    { id: 'serving', name: `1 ración (${serving}g)`, nameEn: `1 serving (${serving}g)`, grams: serving, isDefault: true },
                    { id: '100g', name: '100g', nameEn: '100g', grams: 100 },
                  ],
                };
                onProductFound(customProduct);
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              {t.scanner.saveAndLog}
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
