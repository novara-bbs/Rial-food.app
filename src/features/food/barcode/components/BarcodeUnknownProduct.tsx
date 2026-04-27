/**
 * BarcodeUnknownProduct — "not found" state + custom food creation form.
 *
 * Shown when the OFF lookup returns no match for a scanned barcode.
 * Lets the user create a custom food entry from scratch.
 *
 * Pure presentation. Owns its own `customFood` form state; calls
 * `onConfirm` with a fully-shaped ScannedProduct on submit.
 *
 * Extracted from BarcodeScanner.tsx (Phase 3.3, ADR-015).
 */
import { useState } from 'react';
import { Plus, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import { useI18n } from '@/i18n';
import type { ScannedProduct } from '../../utils/pseudo-ingredient';

interface BarcodeUnknownProductProps {
  onConfirm: (product: ScannedProduct) => void;
  onRetry: () => void;
  onSearchManually: () => void;
}

export default function BarcodeUnknownProduct({
  onConfirm,
  onRetry,
  onSearchManually,
}: BarcodeUnknownProductProps) {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    brand: '',
    serving: '100',
    cal: '',
    pro: '',
    carbs: '',
    fats: '',
  });

  if (!showForm) {
    return (
      <div className="space-y-4 text-center py-2">
        <AlertTriangle className="w-10 h-10 text-brand-secondary mx-auto" />
        <p className="text-sm text-on-surface-variant">{t.scanner.notFound}</p>
        <Button variant="brand" className="w-full" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.scanner.createCustom}
        </Button>
        <Button variant="outline" className="w-full" onClick={onRetry}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {t.scanner.retry}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onSearchManually}>
          {t.scanner.searchManually}
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!customFood.name.trim() || !customFood.cal) return;
    const serving = parseFloat(customFood.serving) || 100;
    const product: ScannedProduct = {
      name: customFood.name.trim(),
      brand: customFood.brand.trim(),
      calories: Math.round(((parseFloat(customFood.cal) || 0) / serving) * 100),
      protein: Math.round(
        (((parseFloat(customFood.pro) || 0) / serving) * 100) * 10,
      ) / 10,
      carbs: Math.round(
        (((parseFloat(customFood.carbs) || 0) / serving) * 100) * 10,
      ) / 10,
      fats: Math.round(
        (((parseFloat(customFood.fats) || 0) / serving) * 100) * 10,
      ) / 10,
      barcode: `custom_${Date.now()}`,
      servingSizes: [
        {
          id: 'serving',
          name: `1 ración (${serving}g)`,
          nameEn: `1 serving (${serving}g)`,
          grams: serving,
          isDefault: true,
        },
        { id: '100g', name: '100g', nameEn: '100g', grams: 100 },
      ],
    };
    onConfirm(product);
  };

  const field = (
    key: keyof typeof customFood,
    label: string,
    extra?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label className="text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1">
        {label}
      </label>
      <input
        type={extra?.type ?? 'text'}
        inputMode={extra?.inputMode}
        value={customFood[key]}
        onChange={e => setCustomFood(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={extra?.placeholder}
        className={`${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {field('name', `${t.scanner.foodName} *`, {
          placeholder: t.scanner.foodNamePlaceholder,
        })}
        {field('brand', t.scanner.brand, {
          placeholder: t.scanner.brandPlaceholder,
        })}
        {field('serving', t.scanner.servingSize, {
          type: 'number',
          inputMode: 'decimal',
        })}
        <div className="grid grid-cols-2 gap-3">
          {field('cal', `${t.scanner.calories} *`, {
            type: 'number',
            inputMode: 'decimal',
            placeholder: '0',
          })}
          {field('pro', t.scanner.protein, {
            type: 'number',
            inputMode: 'decimal',
            placeholder: '0',
          })}
          {field('carbs', t.scanner.carbs, {
            type: 'number',
            inputMode: 'decimal',
            placeholder: '0',
          })}
          {field('fats', t.scanner.fats, {
            type: 'number',
            inputMode: 'decimal',
            placeholder: '0',
          })}
        </div>
      </div>
      <Button
        variant="brand"
        className="w-full"
        disabled={!customFood.name.trim() || !customFood.cal}
        onClick={handleSubmit}
      >
        <Save className="w-4 h-4 mr-2" />
        {t.scanner.saveAndLog}
      </Button>
    </div>
  );
}
