import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import type { Ingredient } from '../../../types';
import BottomSheet from '../../../components/ui/bottom-sheet';
import PortionSelector, { PortionResult, scaleMacros } from './PortionSelector';
import type { UnitSystem } from '../utils/units';

interface Props {
  ingredient: Ingredient;
  onConfirm: (result: PortionResult) => void;
  onClose: () => void;
  unitSystem?: UnitSystem;
}

function defaultResult(ingredient: Ingredient): PortionResult {
  const serving = ingredient.servingSizes.find(s => s.isDefault) ?? ingredient.servingSizes[0];
  const totalGrams = serving?.grams ?? 100;
  const unit = ingredient.baseUnit === 'ml' ? 'ml' : 'g';
  return {
    servingId: serving?.id ?? '100g',
    quantity: 1,
    totalGrams,
    scaledMacros: scaleMacros(ingredient.macros, ingredient.baseAmount, totalGrams),
    portionDescription: serving?.name ?? `${totalGrams}${unit}`,
  };
}

export default function PortionSheet({ ingredient, onConfirm, onClose, unitSystem = 'metric' }: Props) {
  const { t } = useI18n();
  const [result, setResult] = useState<PortionResult>(() => defaultResult(ingredient));

  return (
    <BottomSheet
      open={true}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title={ingredient.name}
      description={ingredient.category}
      footer={
        <button
          type="button"
          onClick={() => onConfirm(result)}
          className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {t.home.logIt}
        </button>
      }
    >
      <div className="space-y-5 pt-2">
        <PortionSelector ingredient={ingredient} onChange={setResult} unitSystem={unitSystem} />
      </div>
    </BottomSheet>
  );
}
