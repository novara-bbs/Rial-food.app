import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import { useI18n } from '../../../../i18n';
import type { ScannedProduct } from '../../utils/pseudo-ingredient';

interface BarcodeCustomFoodFormProps {
  /** Called when the user confirms the custom food. The parent logs or adds it. */
  onSubmit: (product: ScannedProduct) => void;
}

type CustomFoodState = {
  name: string;
  brand: string;
  serving: string;
  cal: string;
  pro: string;
  carbs: string;
  fats: string;
};

const INITIAL: CustomFoodState = { name: '', brand: '', serving: '100', cal: '', pro: '', carbs: '', fats: '' };

/**
 * Self-contained form for creating a custom food from a failed scan.
 *
 * State is local — every time this component mounts (i.e. when `showCustomForm`
 * flips to true) it starts with a blank slate. The parent unmounts it when the
 * user navigates back, so no explicit reset is needed.
 */
export default function BarcodeCustomFoodForm({ onSubmit }: BarcodeCustomFoodFormProps) {
  const { t } = useI18n();
  const [food, setFood] = useState<CustomFoodState>(INITIAL);

  const set = (key: keyof CustomFoodState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFood(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    if (!food.name.trim() || !food.cal) return;
    const serving = parseFloat(food.serving) || 100;
    const product: ScannedProduct = {
      name: food.name.trim(),
      brand: food.brand.trim(),
      calories: Math.round((parseFloat(food.cal) || 0) / serving * 100),
      protein: Math.round(((parseFloat(food.pro) || 0) / serving * 100) * 10) / 10,
      carbs: Math.round(((parseFloat(food.carbs) || 0) / serving * 100) * 10) / 10,
      fats: Math.round(((parseFloat(food.fats) || 0) / serving * 100) * 10) / 10,
      barcode: `custom_${Date.now()}`,
      servingSizes: [
        { id: 'serving', name: `1 ración (${serving}g)`, nameEn: `1 serving (${serving}g)`, grams: serving, isDefault: true },
        { id: '100g', name: '100g', nameEn: '100g', grams: 100 },
      ],
    };
    onSubmit(product);
  };

  const inputCls = `${INPUT_SURFACE_CLASSES} w-full px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary`;
  const labelCls = 'text-micro font-label uppercase tracking-widest text-on-surface-variant block mb-1';

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className={labelCls}>{t.scanner.foodName} *</label>
          <input
            type="text"
            value={food.name}
            onChange={set('name')}
            placeholder={t.scanner.foodNamePlaceholder}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>{t.scanner.brand}</label>
          <input
            type="text"
            value={food.brand}
            onChange={set('brand')}
            placeholder={t.scanner.brandPlaceholder}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>{t.scanner.servingSize}</label>
          <input
            type="number"
            inputMode="decimal"
            value={food.serving}
            onChange={set('serving')}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t.scanner.calories} *</label>
            <input type="number" inputMode="decimal" value={food.cal} onChange={set('cal')} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.scanner.protein}</label>
            <input type="number" inputMode="decimal" value={food.pro} onChange={set('pro')} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.scanner.carbs}</label>
            <input type="number" inputMode="decimal" value={food.carbs} onChange={set('carbs')} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.scanner.fats}</label>
            <input type="number" inputMode="decimal" value={food.fats} onChange={set('fats')} placeholder="0" className={inputCls} />
          </div>
        </div>
      </div>

      <Button
        variant="brand"
        className="w-full"
        disabled={!food.name.trim() || !food.cal}
        onClick={handleSubmit}
      >
        <Save className="w-4 h-4 mr-2" />
        {t.scanner.saveAndLog}
      </Button>
    </div>
  );
}
