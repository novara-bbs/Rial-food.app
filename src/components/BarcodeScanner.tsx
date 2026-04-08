import { useState, useEffect, useRef } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../i18n';

type ScanState = 'idle' | 'scanning' | 'looking-up' | 'found' | 'not-found' | 'error';

interface ProductResult {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  barcode: string;
  image?: string;
}

export default function BarcodeScanner({ onClose, onProductFound }: {
  onClose: () => void;
  onProductFound: (product: ProductResult) => void;
}) {
  const { t, locale } = useI18n();
  const [state, setState] = useState<ScanState>('idle');
  const [product, setProduct] = useState<ProductResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

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
          () => {} // ignore scan failures
        );
      } catch (err: any) {
        console.warn('Camera not available:', err);
        setState('idle');
        setErrorMsg(locale === 'es'
          ? 'Cámara no disponible. Introduce el código manualmente.'
          : 'Camera not available. Enter the code manually.');
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
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};

        const result: ProductResult = {
          name: p.product_name || p.product_name_es || p.product_name_en || 'Producto desconocido',
          brand: p.brands || '',
          calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein: Math.round((n.proteins_100g || n.proteins || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || n.carbohydrates || 0) * 10) / 10,
          fats: Math.round((n.fat_100g || n.fat || 0) * 10) / 10,
          fiber: n.fiber_100g ? Math.round(n.fiber_100g * 10) / 10 : undefined,
          barcode,
          image: p.image_front_small_url || p.image_url,
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

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <h2 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.fab.scanBarcode}</h2>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner viewport */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {(state === 'idle' || state === 'scanning') && (
          <>
            <div
              ref={scannerRef}
              id="barcode-reader"
              className="w-full max-w-sm aspect-[4/3] bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30 overflow-hidden"
            />
            {state === 'scanning' && (
              <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest animate-pulse">
                {locale === 'es' ? 'Apunta al código de barras...' : 'Point at the barcode...'}
              </p>
            )}
          </>
        )}

        {state === 'looking-up' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm text-on-surface-variant font-label uppercase tracking-widest">
              {locale === 'es' ? 'Buscando producto...' : 'Looking up product...'}
            </p>
          </div>
        )}

        {state === 'found' && product && (
          <div className="w-full max-w-sm space-y-4">
            <div className="bg-surface-container-low border border-green-500/30 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                {product.image && (
                  <img src={product.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-green-500">
                      {locale === 'es' ? 'Producto encontrado' : 'Product found'}
                    </span>
                  </div>
                  <h3 className="font-headline text-sm font-bold uppercase text-tertiary truncate">{product.name}</h3>
                  {product.brand && <p className="text-[10px] text-on-surface-variant">{product.brand}</p>}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4 text-center">
                <div>
                  <span className="font-mono text-lg font-bold text-primary">{product.calories}</span>
                  <p className="text-[8px] uppercase tracking-widest text-on-surface-variant">kcal</p>
                </div>
                <div>
                  <span className="font-mono text-lg font-bold text-tertiary">{product.protein}g</span>
                  <p className="text-[8px] uppercase tracking-widest text-on-surface-variant">P</p>
                </div>
                <div>
                  <span className="font-mono text-lg font-bold text-tertiary">{product.carbs}g</span>
                  <p className="text-[8px] uppercase tracking-widest text-on-surface-variant">C</p>
                </div>
                <div>
                  <span className="font-mono text-lg font-bold text-tertiary">{product.fats}g</span>
                  <p className="text-[8px] uppercase tracking-widest text-on-surface-variant">G</p>
                </div>
              </div>
              <p className="text-[9px] text-on-surface-variant mt-2 text-center">
                {locale === 'es' ? 'por 100g — Open Food Facts' : 'per 100g — Open Food Facts'}
              </p>
            </div>

            <button
              onClick={() => onProductFound(product)}
              className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline text-sm font-bold uppercase tracking-widest"
            >
              {t.fab.logMeal}
            </button>
            <button
              onClick={() => { setState('scanning'); setProduct(null); }}
              className="w-full py-3 bg-surface-container-highest text-on-surface-variant rounded-sm font-headline text-xs font-bold uppercase tracking-widest"
            >
              {locale === 'es' ? 'Escanear otro' : 'Scan another'}
            </button>
          </div>
        )}

        {state === 'not-found' && (
          <div className="w-full max-w-sm space-y-4 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
            <p className="text-sm text-on-surface-variant">
              {locale === 'es' ? 'Producto no encontrado. ¿Buscar por nombre?' : 'Product not found. Search by name?'}
            </p>
            <button
              onClick={() => { setState('scanning'); }}
              className="w-full py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest"
            >
              {locale === 'es' ? 'Reintentar' : 'Retry'}
            </button>
            <button onClick={onClose} className="w-full py-3 bg-surface-container-highest text-on-surface-variant rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
              {locale === 'es' ? 'Buscar manualmente' : 'Search manually'}
            </button>
          </div>
        )}

        {/* Manual input fallback */}
        {(state === 'idle' || state === 'scanning' || errorMsg) && (
          <div className="w-full max-w-sm space-y-3">
            {errorMsg && <p className="text-xs text-yellow-500 text-center">{errorMsg}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder={locale === 'es' ? 'Código de barras (ej: 8410032002002)' : 'Barcode (e.g. 8410032002002)'}
                className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface text-sm font-mono focus:outline-none focus:border-primary"
                onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              />
              <button
                onClick={handleManualSubmit}
                disabled={manualCode.trim().length < 8}
                className="px-6 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest disabled:opacity-40"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
