import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle2, UtensilsCrossed, BookOpen, Save, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useI18n } from '../../../i18n';
import { logger } from '../../../lib/logger';
import PortionSelector from './PortionSelector';
import type { PortionResult } from './PortionSelector';
import type { Ingredient, ServingSize } from '../../../types';
import { parseOFFServings } from '../api/open-food-facts';
import type { UnitSystem } from '../utils/units';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import SectionCard from '../../../components/SectionCard';

type ScanState = 'idle' | 'scanning' | 'looking-up' | 'found' | 'not-found' | 'error';

export interface ScannedProduct {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
  barcode: string;
  image?: string;
  /** Real serving sizes parsed from Open Food Facts */
  servingSizes?: ServingSize[];
}

interface Props {
  onClose: () => void;
  onProductFound: (product: ScannedProduct, portionResult?: PortionResult) => void;
  onSaveToDictionary?: (product: ScannedProduct) => void;
  onAddToRecipe?: (product: ScannedProduct) => void;
  unitSystem?: UnitSystem;
}

/** Convert a scanned product to a temporary Ingredient for PortionSelector */
function productToIngredient(product: ScannedProduct): Ingredient {
  const servingSizes: ServingSize[] = product.servingSizes && product.servingSizes.length > 0
    ? product.servingSizes
    : [
        { id: '100g', name: '100g', nameEn: '100g', grams: 100, isDefault: true },
        { id: '50g', name: '50g', nameEn: '50g', grams: 50 },
        { id: '150g', name: '150g', nameEn: '150g', grams: 150 },
        { id: '200g', name: '200g', nameEn: '200g', grams: 200 },
      ];

  return {
    id: `scanned_${product.barcode}`,
    name: product.name,
    nameEn: product.name,
    description: product.brand || '',
    descriptionEn: product.brand || '',
    category: 'prepared',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes,
    macros: {
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fats: product.fats,
      fiber: product.fiber,
      sugar: product.sugar,
      saturatedFat: product.saturatedFat,
    },
    micros: { vitamins: {}, minerals: {}, others: {} },
    tags: [],
    allergens: [],
  };
}

export default function BarcodeScanner({ onClose, onProductFound, onSaveToDictionary, onAddToRecipe, unitSystem = 'metric' }: Props) {
  const { t } = useI18n();
  const [state, setState] = useState<ScanState>('idle');
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [portionResult, setPortionResult] = useState<PortionResult | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', brand: '', serving: '100', cal: '', pro: '', carbs: '', fats: '' });
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  const pseudoIngredient = useMemo(
    () => product ? productToIngredient(product) : null,
    [product],
  );

  useEffect(() => {
    let scanner: any = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!scannerRef.current) return;

        scanner = new Html5Qrcode('barcode-reader');
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
      } catch (err: any) {
        logger.warn('Camera not available', { error: err instanceof Error ? err.message : String(err) });
        setState('idle');
        setErrorMsg(t.scanner.cameraNotAvailable);
      }
    };

    startScanner();

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

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
      } else {
        setState('not-found');
      }
    } catch {
      setState('not-found');
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim().length >= 8) {
      lookupBarcode(manualCode.trim());
    }
  };

  const handleScanAnother = () => {
    setState('idle');
    setProduct(null);
    setPortionResult(null);
    setManualCode('');
    setShowCustomForm(false);
    // Re-trigger scanner
    setTimeout(() => {
      const startAgain = async () => {
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
        } catch {
          setState('idle');
        }
      };
      startAgain();
    }, 100);
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
            {errorMsg && <p className="text-xs text-brand-secondary text-center">{errorMsg}</p>}
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
        {/* FOUND — Product detail + portion selector + CTAs */}
        {!showCustomForm && state === 'found' && product && pseudoIngredient && (
          <div className="space-y-4">
            <div className="bg-surface-container-low border border-green-500/30 rounded-sm p-4">
              <div className="flex items-start gap-3">
                {product.image && (
                  <img src={product.image} alt="" className="w-16 h-16 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {t.scanner.scanned}
                    </Badge>
                  </div>
                  {product.brand && <p className="text-micro text-on-surface-variant mt-0.5">{product.brand}</p>}
                  <p className="text-micro text-on-surface-variant/60 mt-1">
                    {t.scanner.per100g}
                  </p>
                </div>
              </div>
            </div>

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
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                {t.portionSelector.addToMeal}
              </Button>

              {(onAddToRecipe || onSaveToDictionary) && (
                <div className="grid grid-cols-2 gap-2">
                  {onAddToRecipe && (
                    <Button variant="outline" size="sm" onClick={() => onAddToRecipe(product)}>
                      <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                      {t.portionSelector.addToRecipe}
                    </Button>
                  )}
                  {onSaveToDictionary && (
                    <Button variant="outline" size="sm" onClick={() => onSaveToDictionary(product)}>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {t.scanner.save}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" className="w-full" onClick={handleScanAnother}>
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
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
