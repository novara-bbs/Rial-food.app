import { AlertTriangle, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../../i18n';

interface BarcodeNotFoundPanelProps {
  onCreateCustom: () => void;
  onScanAnother: () => void;
  onClose: () => void;
}

/**
 * Renders when a barcode is recognised but not found in Open Food Facts.
 * Offers the user three escape hatches: create custom food, retry scan, or
 * dismiss the scanner and search the dictionary manually.
 */
export default function BarcodeNotFoundPanel({
  onCreateCustom, onScanAnother, onClose,
}: BarcodeNotFoundPanelProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 text-center py-2">
      <AlertTriangle className="w-10 h-10 text-brand-secondary mx-auto" />
      <p className="text-sm text-on-surface-variant">{t.scanner.notFound}</p>

      <Button variant="brand" className="w-full" onClick={onCreateCustom}>
        <Plus className="w-4 h-4 mr-2" />
        {t.scanner.createCustom}
      </Button>
      <Button variant="outline" className="w-full" onClick={onScanAnother}>
        <RotateCcw className="w-4 h-4 mr-2" />
        {t.scanner.retry}
      </Button>
      <Button variant="ghost" className="w-full" onClick={onClose}>
        {t.scanner.searchManually}
      </Button>
    </div>
  );
}
