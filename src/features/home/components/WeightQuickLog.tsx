import { useState } from 'react';
import { Scale, Plus, Check, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { bodyWeightFromKg, bodyWeightToKg, getBodyWeightUnit } from '../../food/utils/units';
import { useI18n } from '../../../i18n';
import type { UnitSystem } from '../../food/utils/units';

interface WeightEntry {
  date: string;
  kg: number;
  note?: string;
}

interface WeightQuickLogProps {
  weightHistory: WeightEntry[];
  setWeightHistory: (fn: any) => void;
  unitSystem: UnitSystem;
  targetWeight?: number;
}

export default function WeightQuickLog({ weightHistory, setWeightHistory, unitSystem, targetWeight }: WeightQuickLogProps) {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const unit = getBodyWeightUnit(unitSystem);
  const today = new Date().toISOString().slice(0, 10);

  // Latest weight
  const sorted = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const currentDisplay = latest ? bodyWeightFromKg(latest.kg, unitSystem) : null;

  // Delta from previous entry
  const previous = sorted[1];
  const delta = latest && previous ? +(bodyWeightFromKg(latest.kg, unitSystem) - bodyWeightFromKg(previous.kg, unitSystem)).toFixed(1) : null;

  // Target weight progress
  const targetDisplay = targetWeight ? bodyWeightFromKg(targetWeight, unitSystem) : null;
  const toGoal = latest && targetWeight ? +(bodyWeightFromKg(latest.kg, unitSystem) - bodyWeightFromKg(targetWeight, unitSystem)).toFixed(1) : null;

  // Mini sparkline (last 7 entries)
  const sparkData = sorted.slice(0, 7).reverse();
  const sparkline = sparkData.length >= 2 ? (() => {
    const vals = sparkData.map(e => bodyWeightFromKg(e.kg, unitSystem));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const w = 60;
    const h = 20;
    const points = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return (
      <svg width={w} height={h} className="opacity-60">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
      </svg>
    );
  })() : null;

  const handleLog = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 20 || val > 300) return;
    const kg = bodyWeightToKg(val, unitSystem);
    setWeightHistory((prev: WeightEntry[]) => {
      // Replace today's entry if exists, else add new
      const filtered = prev.filter((e: WeightEntry) => e.date !== today);
      return [...filtered, { date: today, kg }];
    });
    setIsEditing(false);
    setInputValue('');
  };

  const DeltaIcon = delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor = delta === null ? 'text-on-surface-variant' : delta > 0 ? 'text-error' : delta < 0 ? 'text-primary' : 'text-on-surface-variant';

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{t.home.weight || 'Peso'}</p>
            <div className="flex items-center gap-2">
              <p className="font-headline font-bold text-sm text-tertiary uppercase">
                {currentDisplay !== null ? `${currentDisplay} ${unit}` : `— ${unit}`}
              </p>
              {delta !== null && (
                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${deltaColor}`}>
                  <DeltaIcon className="w-3 h-3" />
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              )}
              {sparkline}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toGoal !== null && (
            <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest hidden sm:inline">
              {Math.abs(toGoal)} {unit} {t.home.toGoal || 'para objetivo'}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (!isEditing && currentDisplay !== null) setInputValue(String(currentDisplay));
              setIsEditing(!isEditing);
            }}
            className="w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 shrink-0"
            aria-label={t.home.logWeight || 'Log weight'}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="pt-3 mt-3 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={currentDisplay !== null ? String(currentDisplay) : '70.0'}
              className="flex-1 bg-surface-container-highest border border-outline-variant/30 rounded-sm px-3 py-2 text-sm font-mono text-tertiary focus:outline-none focus:border-primary"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleLog(); }}
            />
            <span className="text-xs font-bold text-on-surface-variant uppercase">{unit}</span>
            <button
              type="button"
              onClick={handleLog}
              className="w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-90 transition-all"
              aria-label="Confirm"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
          {targetDisplay !== null && (
            <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest mt-2">
              {t.home.weightGoal || 'Objetivo'}: {targetDisplay} {unit}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
