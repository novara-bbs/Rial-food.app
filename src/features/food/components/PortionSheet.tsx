import { X, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import type { Ingredient } from '../../../types';
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
  // Pre-initialize with defaults — "Log it" is immediately enabled
  const [result, setResult] = useState<PortionResult>(() => defaultResult(ingredient));

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — max 85vh, scrollable content, sticky confirm */}
      <div className="relative w-full max-w-lg mx-auto bg-surface rounded-t-2xl border-t border-outline-variant/20 z-10 flex flex-col max-h-[85vh]">
        {/* Handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-outline-variant/40 rounded-full" />

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 pt-8 pb-4 space-y-5 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-headline text-lg font-bold uppercase tracking-tighter text-tertiary">{ingredient.name}</h3>
              <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mt-0.5">{ingredient.category}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant hover:text-tertiary transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Portion selector */}
          <PortionSelector ingredient={ingredient} onChange={setResult} unitSystem={unitSystem} />
        </div>

        {/* Confirm — always visible at bottom */}
        <div className="px-6 pb-6 pt-3 border-t border-outline-variant/10">
          <button
            onClick={() => onConfirm(result)}
            className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t.home.logIt}
          </button>
        </div>
      </div>
    </div>
  );
}
