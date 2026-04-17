import { TrendingUp, TrendingDown, Scale, Plus, Check } from 'lucide-react';
import type { UnitSystem } from '../../food/utils/units';

interface WeightTrendCardProps {
  weights: { date: string; kg: number }[];
  currentWeight: number | null;
  firstWeight: number | null;
  weekDelta: number | null;
  isEditingWeight: boolean;
  setIsEditingWeight: (v: boolean) => void;
  weightInput: string;
  setWeightInput: (v: string) => void;
  onLogWeight: () => void;
  unitSystem: UnitSystem;
  weightUnit: string;
  bodyWeightFromKg: (kg: number, sys: UnitSystem) => number;
  t: {
    weightTrend?: string;
    thisWeek?: string;
    current?: string;
    start?: string;
    change?: string;
    noWeightData?: string;
    logWeight?: string;
  };
}

export default function WeightTrendCard({
  weights, currentWeight, firstWeight, weekDelta, isEditingWeight, setIsEditingWeight,
  weightInput, setWeightInput, onLogWeight, unitSystem, weightUnit, bodyWeightFromKg, t,
}: WeightTrendCardProps) {
  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const last30 = sortedWeights.slice(-30);

  const chartWidth = 300;
  const chartHeight = 120;
  const chartPadding = 10;
  let weightPath = '';
  if (last30.length >= 2) {
    const minKg = Math.min(...last30.map(w => w.kg)) - 0.5;
    const maxKg = Math.max(...last30.map(w => w.kg)) + 0.5;
    const range = maxKg - minKg || 1;
    const points = last30.map((w, i) => {
      const x = chartPadding + (i / (last30.length - 1)) * (chartWidth - 2 * chartPadding);
      const y = chartPadding + (1 - (w.kg - minKg) / range) * (chartHeight - 2 * chartPadding);
      return `${x},${y}`;
    });
    weightPath = `M${points.join(' L')}`;
  }

  return (
    <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" /> {t.weightTrend || 'Tendencia de Peso'}
        </h2>
        {weekDelta !== null && (
          <div className={`flex items-center gap-1 text-micro font-bold uppercase tracking-widest ${
            weekDelta > 0 ? 'text-brand-secondary' : weekDelta < 0 ? 'text-primary' : 'text-on-surface-variant'
          }`}>
            {weekDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : weekDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
            {weekDelta > 0 ? '+' : ''}{bodyWeightFromKg(Math.abs(weekDelta), unitSystem).toFixed(1)} {weightUnit} {t.thisWeek || 'esta semana'}
          </div>
        )}
      </div>

      {last30.length >= 2 ? (
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
          <path d={weightPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {last30.map((w, i) => {
            const minKg = Math.min(...last30.map(w2 => w2.kg)) - 0.5;
            const maxKg = Math.max(...last30.map(w2 => w2.kg)) + 0.5;
            const range = maxKg - minKg || 1;
            const x = chartPadding + (i / (last30.length - 1)) * (chartWidth - 2 * chartPadding);
            const y = chartPadding + (1 - (w.kg - minKg) / range) * (chartHeight - 2 * chartPadding);
            return <circle key={w.date} cx={x} cy={y} r="3" fill="var(--primary)" />;
          })}
        </svg>
      ) : (
        <div className="h-32 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
          {t.noWeightData || 'Registra tu peso para ver la tendencia'}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-outline-variant/10">
        <div className="text-center">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.current || 'Actual'}</span>
          <span className="font-headline font-black text-lg text-tertiary">
            {currentWeight ? `${bodyWeightFromKg(currentWeight, unitSystem)} ${weightUnit}` : '—'}
          </span>
        </div>
        <div className="text-center">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.start || 'Inicio'}</span>
          <span className="font-headline font-black text-lg text-on-surface-variant">
            {firstWeight ? `${bodyWeightFromKg(firstWeight, unitSystem)} ${weightUnit}` : '—'}
          </span>
        </div>
        <div className="text-center">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.change || 'Cambio'}</span>
          <span className={`font-headline font-black text-lg ${
            currentWeight && firstWeight
              ? (currentWeight - firstWeight > 0 ? 'text-brand-secondary' : 'text-primary')
              : 'text-on-surface-variant'
          }`}>
            {currentWeight && firstWeight
              ? `${(currentWeight - firstWeight) > 0 ? '+' : ''}${bodyWeightFromKg(Math.abs(currentWeight - firstWeight), unitSystem).toFixed(1)} ${weightUnit}`
              : '—'}
          </span>
        </div>
      </div>

      {/* Weight input */}
      {isEditingWeight ? (
        <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
          <input
            type="number" inputMode="decimal" step="0.1" min="20" max="300"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogWeight()}
            className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-sm text-tertiary placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
            placeholder={currentWeight ? String(bodyWeightFromKg(currentWeight, unitSystem)) : '72.5'}
            autoFocus
          />
          <span className="text-sm font-bold text-on-surface-variant">{weightUnit}</span>
          <button type="button" onClick={onLogWeight}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button type="button"
          onClick={() => { setIsEditingWeight(true); setWeightInput(currentWeight ? String(bodyWeightFromKg(currentWeight, unitSystem)) : ''); }}
          className="w-full pt-3 border-t border-outline-variant/10 text-center text-micro font-bold text-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {t.logWeight || 'Registrar peso'}
        </button>
      )}
    </section>
  );
}
