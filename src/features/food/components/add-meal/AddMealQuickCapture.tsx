import type { RefObject } from 'react';
import React from 'react';
import { Camera, Barcode, Loader2 } from 'lucide-react';
import { useI18n } from '../../../../i18n';

interface AddMealQuickCaptureProps {
  onScanPress: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing: boolean;
}

const BTN_CLS =
  'bg-surface-container-high text-tertiary border border-outline-variant/30 p-4 font-label text-micro font-bold tracking-widest uppercase flex flex-col items-center gap-2.5 rounded-sm hover:bg-surface-container-highest transition-colors group';

/**
 * Quick-capture row: Scan Barcode button + Photo AI button (with hidden file input).
 * Owns no state — parent passes the refs and handlers.
 */
export default function AddMealQuickCapture({
  onScanPress, fileInputRef, onFileChange, isAnalyzing,
}: AddMealQuickCaptureProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={onScanPress} className={BTN_CLS}>
        <Barcode className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
        {t.fab.scanBarcode}
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isAnalyzing}
        className={`${BTN_CLS} disabled:opacity-60`}
      >
        {isAnalyzing
          ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
          : <Camera className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
        }
        {isAnalyzing ? t.common.loading : t.fab.photoAI}
      </button>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
      />
    </div>
  );
}
