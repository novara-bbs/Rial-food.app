import type { RefObject } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import { useI18n } from '../../../../i18n';

type ScanState = 'idle' | 'scanning' | 'looking-up' | 'found' | 'not-found' | 'error';

interface BarcodeViewportProps {
  scannerRef: RefObject<HTMLDivElement | null>;
  state: ScanState;
  errorMsg: string;
  manualCode: string;
  onManualChange: (v: string) => void;
  onManualSubmit: () => void;
}

/**
 * Camera viewport + manual barcode entry fallback.
 *
 * The DOM node for html5-qrcode is rendered here (`id="barcode-reader"`).
 * The ref is owned by the parent (BarcodeScanner) which manages the camera
 * lifecycle — we only receive the ref and render against it.
 */
export default function BarcodeViewport({
  scannerRef, state, errorMsg, manualCode, onManualChange, onManualSubmit,
}: BarcodeViewportProps) {
  const { t } = useI18n();

  return (
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
              onChange={e => onManualChange(e.target.value)}
              placeholder={t.scanner.barcodePlaceholder}
              className={`${INPUT_SURFACE_CLASSES} flex-1 px-4 py-3 text-on-surface text-sm font-mono focus:outline-none focus:border-primary`}
              onKeyDown={e => e.key === 'Enter' && onManualSubmit()}
            />
            <Button onClick={onManualSubmit} disabled={manualCode.trim().length < 8}>
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
