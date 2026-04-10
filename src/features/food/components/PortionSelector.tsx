import { useState, useMemo, useCallback } from 'react';
import { Minus, Plus, Scale, UtensilsCrossed } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import type { Ingredient, Macros, ServingSize } from '../../../types';
import { formatWeight, getWeightUnit, toGrams, fromGrams, getQuickWeights, getWeightStep, type UnitSystem } from '../utils/units';

export interface PortionResult {
  servingId: string;
  quantity: number;
  totalGrams: number;
  scaledMacros: Macros;
  /** Human-readable description, e.g. "167g" or "2 × 1 lata" */
  portionDescription: string;
}

interface PortionSelectorProps {
  ingredient: Ingredient;
  initialServingId?: string;
  initialQuantity?: number;
  onChange?: (result: PortionResult) => void;
  compact?: boolean;
  unitSystem?: UnitSystem;
}

function scaleMacros(macros: Macros, baseAmount: number, totalGrams: number): Macros {
  const factor = totalGrams / baseAmount;
  return {
    calories: Math.round(macros.calories * factor),
    protein: +(macros.protein * factor).toFixed(1),
    carbs: +(macros.carbs * factor).toFixed(1),
    fats: +(macros.fats * factor).toFixed(1),
    fiber: macros.fiber != null ? +(macros.fiber * factor).toFixed(1) : undefined,
    sugar: macros.sugar != null ? +(macros.sugar * factor).toFixed(1) : undefined,
    saturatedFat: macros.saturatedFat != null ? +(macros.saturatedFat * factor).toFixed(1) : undefined,
  };
}

type InputMode = 'serving' | 'weight';

const QUICK_AMOUNTS = [0.5, 1, 1.5, 2];

export default function PortionSelector({
  ingredient,
  initialServingId,
  initialQuantity = 1,
  onChange,
  compact = false,
  unitSystem = 'metric',
}: PortionSelectorProps) {
  const { t, locale } = useI18n();
  const baseUnit = ingredient.baseUnit === 'ml' ? 'ml' : 'g';
  const displayUnit = getWeightUnit(unitSystem, baseUnit);
  const quickWeights = getQuickWeights(unitSystem, baseUnit);
  const weightStep = getWeightStep(unitSystem);

  const defaultServing = ingredient.servingSizes.find(s => s.isDefault)
    ?? ingredient.servingSizes[0];

  const [mode, setMode] = useState<InputMode>('serving');
  const [servingId, setServingId] = useState(initialServingId ?? defaultServing?.id ?? '100g');
  const [quantity, setQuantity] = useState(initialQuantity);
  // Internal state — always stored in grams
  const [customGrams, setCustomGrams] = useState(defaultServing?.grams ?? 100);

  const selectedServing = useMemo(
    () => ingredient.servingSizes.find(s => s.id === servingId) ?? defaultServing,
    [ingredient.servingSizes, servingId, defaultServing],
  );

  // ─── Computed grams + macros ────────────────────────────────────────────────

  const totalGrams = useMemo(
    () => mode === 'weight'
      ? customGrams
      : selectedServing ? +(selectedServing.grams * quantity).toFixed(1) : 0,
    [mode, customGrams, selectedServing, quantity],
  );

  // Display value for weight input (converts grams → display units for imperial)
  const displayWeight = useMemo(
    () => fromGrams(customGrams, unitSystem, baseUnit),
    [customGrams, unitSystem, baseUnit],
  );

  const scaled = useMemo(
    () => scaleMacros(ingredient.macros, ingredient.baseAmount, totalGrams),
    [ingredient.macros, ingredient.baseAmount, totalGrams],
  );

  // ─── Description builder ────────────────────────────────────────────────────

  function buildDescription(sid: string, qty: number, grams: number, inputMode: InputMode): string {
    if (inputMode === 'weight') return formatWeight(grams, unitSystem, baseUnit);
    const serving = ingredient.servingSizes.find(s => s.id === sid) ?? defaultServing;
    if (!serving) return formatWeight(grams, unitSystem, baseUnit);
    const name = locale === 'es' ? serving.name : serving.nameEn;
    return qty === 1 ? name : `${qty} × ${name}`;
  }

  // ─── Change emitters ───────────────────────────────────────────────────────

  const emitChange = useCallback((sid: string, qty: number, grams: number, inputMode: InputMode) => {
    onChange?.({
      servingId: inputMode === 'weight' ? 'custom' : sid,
      quantity: inputMode === 'weight' ? 1 : qty,
      totalGrams: grams,
      scaledMacros: scaleMacros(ingredient.macros, ingredient.baseAmount, grams),
      portionDescription: buildDescription(sid, qty, grams, inputMode),
    });
  }, [ingredient, defaultServing, onChange, locale, baseUnit, unitSystem]);

  const handleServingChange = (id: string) => {
    setServingId(id);
    emitChange(id, quantity, +(
      (ingredient.servingSizes.find(s => s.id === id)?.grams ?? 100) * quantity
    ).toFixed(1), 'serving');
  };

  const handleQuantityChange = (next: number) => {
    const clamped = Math.max(0.25, Math.min(next, 99));
    const rounded = Math.round(clamped * 4) / 4;
    setQuantity(rounded);
    const grams = +((selectedServing?.grams ?? 100) * rounded).toFixed(1);
    emitChange(servingId, rounded, grams, 'serving');
  };

  const handleQuantityInput = (raw: string) => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v > 0) handleQuantityChange(v);
  };

  /** Accept value in INTERNAL grams */
  const handleCustomGramsChange = (grams: number) => {
    const clamped = Math.max(1, Math.min(grams, 9999));
    setCustomGrams(clamped);
    emitChange(servingId, quantity, clamped, 'weight');
  };

  /** Accept value in DISPLAY units (user-typed) — convert to grams */
  const handleDisplayWeightChange = (displayValue: number) => {
    const grams = toGrams(displayValue, unitSystem, baseUnit);
    handleCustomGramsChange(grams);
  };

  const handleDisplayWeightInput = (raw: string) => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v > 0) handleDisplayWeightChange(v);
  };

  /** Stepper: ± in display units */
  const handleWeightStep = (direction: 1 | -1) => {
    const nextDisplay = displayWeight + direction * weightStep;
    if (nextDisplay < (unitSystem === 'imperial' ? 0.5 : 1)) return;
    handleDisplayWeightChange(nextDisplay);
  };

  // ─── Mode toggle ───────────────────────────────────────────────────────────

  const switchMode = (next: InputMode) => {
    setMode(next);
    if (next === 'weight') {
      // Pre-fill with current total grams
      const currentGrams = selectedServing ? +(selectedServing.grams * quantity).toFixed(1) : 100;
      setCustomGrams(currentGrams);
      emitChange(servingId, quantity, currentGrams, 'weight');
    } else {
      emitChange(servingId, quantity,
        +((selectedServing?.grams ?? 100) * quantity).toFixed(1), 'serving');
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex rounded-sm overflow-hidden border border-outline-variant/30">
        <button
          type="button"
          onClick={() => switchMode('serving')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-headline font-bold uppercase tracking-widest transition-colors ${
            mode === 'serving'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:text-tertiary'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          {t.portionSelector.servingMode}
        </button>
        <button
          type="button"
          onClick={() => switchMode('weight')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-headline font-bold uppercase tracking-widest transition-colors ${
            mode === 'weight'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:text-tertiary'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          {t.portionSelector.weightMode}
        </button>
      </div>

      {mode === 'serving' ? (
        <>
          {/* Serving dropdown */}
          <Select value={servingId} onValueChange={handleServingChange}>
            <SelectTrigger className="w-full bg-surface-container-low border-outline-variant/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ingredient.servingSizes.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {locale === 'es' ? s.name : s.nameEn} — {formatWeight(s.grams, unitSystem, baseUnit)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quantity stepper + quick buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-container-low rounded-sm border border-outline-variant/30 overflow-hidden">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 0.25)}
                disabled={quantity <= 0.25}
                className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={e => handleQuantityInput(e.target.value)}
                className="w-14 text-center bg-transparent text-on-surface font-headline font-bold text-lg border-x border-outline-variant/30 py-1.5 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 0.25)}
                className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-1 flex-1">
              {QUICK_AMOUNTS.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleQuantityChange(amt)}
                  className={`flex-1 py-1.5 rounded-sm text-xs font-headline font-bold uppercase tracking-wider transition-colors ${
                    quantity === amt
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Custom weight input — displays in user's unit system */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-container-low rounded-sm border border-outline-variant/30 overflow-hidden flex-1">
              <button
                type="button"
                onClick={() => handleWeightStep(-1)}
                disabled={displayWeight <= weightStep}
                className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="text"
                inputMode="decimal"
                value={displayWeight}
                onChange={e => handleDisplayWeightInput(e.target.value)}
                className="w-20 text-center bg-transparent text-on-surface font-headline font-bold text-lg border-x border-outline-variant/30 py-1.5 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleWeightStep(1)}
                className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="font-headline font-bold text-sm text-on-surface-variant uppercase tracking-widest shrink-0">{displayUnit}</span>
          </div>

          {/* Quick weight buttons — values in display units */}
          <div className="flex gap-1">
            {quickWeights.map(w => (
              <button
                type="button"
                key={w}
                onClick={() => handleDisplayWeightChange(w)}
                className={`flex-1 py-1.5 rounded-sm text-xs font-headline font-bold uppercase tracking-wider transition-colors ${
                  displayWeight === w
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Total weight display */}
      <p className="text-xs text-on-surface-variant font-label tracking-wide">
        = {formatWeight(totalGrams, unitSystem, baseUnit)} {t.portionSelector.total}
      </p>

      {/* Live macro display */}
      {!compact && (
        <div className="grid grid-cols-4 gap-2">
          {([
            { label: 'kcal', value: scaled.calories, color: 'text-primary' },
            { label: t.portionSelector.protein, value: `${scaled.protein}g`, color: 'text-red-400' },
            { label: t.portionSelector.carbs, value: `${scaled.carbs}g`, color: 'text-amber-400' },
            { label: t.portionSelector.fats, value: `${scaled.fats}g`, color: 'text-sky-400' },
          ] as const).map(m => (
            <div key={m.label} className="bg-surface-container-highest rounded-sm p-2 text-center">
              <span className={`block font-headline font-bold text-lg ${m.color}`}>{m.value}</span>
              <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant">{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { scaleMacros };
