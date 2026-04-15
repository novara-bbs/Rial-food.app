import { useState } from 'react';
import { Scale, Plus, Check, TrendingDown, TrendingUp, Minus, ChevronRight } from 'lucide-react';
import { bodyWeightFromKg, bodyWeightToKg, getBodyWeightUnit } from '../../food/utils/units';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import type { UnitSystem } from '../../food/utils/units';

interface ProgressPreviewCardProps {
  weightHistory: { date: string; kg: number; note?: string }[];
  unitSystem: UnitSystem;
  targetWeight?: number;
  onNavigateToProgress?: () => void;
}

/**
 * Q8 — replaces WeightQuickLog on Home.
 * Shows current weight, 7-day sparkline, delta from 7 days ago, target gap,
 * inline quick-log entry, and a "Ver detalles →" deep-link to Progress.
 */
export default function ProgressPreviewCard({
  weightHistory,
  unitSystem,
  targetWeight,
  onNavigateToProgress,
}: ProgressPreviewCardProps) {
  const { t } = useI18n();
  const { handleLogWeight } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const unit = getBodyWeightUnit(unitSystem);

  // Sort history newest-first
  const sorted = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const currentDisplay = latest ? bodyWeightFromKg(latest.kg, unitSystem) : null;

  // 7-day delta: compare latest to the entry closest to 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);
  const priorEntry = sorted.find(e => e.date <= sevenDaysAgoStr) ?? sorted[sorted.length - 1];
  const delta =
    latest && priorEntry && priorEntry.date !== latest.date
      ? +(bodyWeightFromKg(latest.kg, unitSystem) - bodyWeightFromKg(priorEntry.kg, unitSystem)).toFixed(1)
      : null;

  // Target gap
  const targetDisplay = targetWeight ? bodyWeightFromKg(targetWeight, unitSystem) : null;
  const toGoal =
    latest && targetWeight
      ? +(bodyWeightFromKg(latest.kg, unitSystem) - bodyWeightFromKg(targetWeight, unitSystem)).toFixed(1)
      : null;

  // Sparkline — last 7 entries, oldest→newest
  const sparkData = sorted.slice(0, 7).reverse();
  const sparkline =
    sparkData.length >= 2
      ? (() => {
          const vals = sparkData.map(e => bodyWeightFromKg(e.kg, unitSystem));
          const min = Math.min(...vals);
          const max = Math.max(...vals);
          const range = max - min || 1;
          const w = 64;
          const h = 22;
          const pts = vals
            .map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
            .join(' ');
          return (
            <svg width={w} height={h} className="opacity-70 shrink-0" aria-hidden="true">
              <polyline
                points={pts}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="text-primary"
              />
              {/* Latest dot */}
              {(() => {
                const lastPt = pts.split(' ').pop()!;
                const [cx, cy] = lastPt.split(',').map(Number);
                return <circle cx={cx} cy={cy} r="2.5" className="fill-primary" />;
              })()}
            </svg>
          );
        })()
      : null;

  const DeltaIcon =
    delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor =
    delta === null
      ? 'text-on-surface-variant'
      : delta > 0
        ? 'text-error'
        : delta < 0
          ? 'text-primary'
          : 'text-on-surface-variant';

  const handleLog = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 20 || val > 300) return;
    const kg = bodyWeightToKg(val, unitSystem);
    handleLogWeight({ kg });
    setIsEditing(false);
    setInputValue('');
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-sm space-y-3">
      {/* Top row: icon + weight + delta + sparkline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
            {t.home.weight ?? 'Peso'}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-headline font-bold text-sm text-tertiary uppercase">
              {currentDisplay !== null ? `${currentDisplay} ${unit}` : `— ${unit}`}
            </p>
            {delta !== null && (
              <span className={`flex items-center gap-0.5 text-[10px] font-bold ${deltaColor}`}>
                <DeltaIcon className="w-3 h-3" aria-hidden="true" />
                {delta > 0 ? '+' : ''}
                {delta}
              </span>
            )}
          </div>
        </div>
        {sparkline}
      </div>

      {/* Target gap row */}
      {targetDisplay !== null && toGoal !== null && (
        <div className="flex items-center gap-1.5 px-1">
          <div className="h-1 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
            {(() => {
              const startKg = sorted[sorted.length - 1]?.kg ?? latest?.kg ?? 0;
              const endKg = targetWeight ?? 0;
              const currentKg = latest?.kg ?? 0;
              const total = Math.abs(startKg - endKg);
              const done = total > 0 ? Math.min(Math.abs(startKg - currentKg) / total, 1) : 0;
              return (
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${done * 100}%` }}
                />
              );
            })()}
          </div>
          <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest shrink-0 whitespace-nowrap">
            {Math.abs(toGoal)} {unit} {t.home.toGoal ?? 'para objetivo'}
          </span>
        </div>
      )}

      {/* Inline log form */}
      {isEditing && (
        <div className="pt-2 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={currentDisplay !== null ? String(currentDisplay) : '70.0'}
              aria-label={`${t.home.weight ?? 'Peso'} (${unit})`}
              className="flex-1 bg-surface-container-highest border border-outline-variant/30 rounded-sm px-3 py-2 text-sm font-mono text-tertiary focus:outline-none focus:border-primary"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleLog();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <span className="text-xs font-bold text-on-surface-variant uppercase">{unit}</span>
            <button
              type="button"
              onClick={handleLog}
              className="w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
              aria-label={t.home.logWeight ?? 'Confirmar'}
            >
              <Check className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom action row */}
      <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/10">
        <button
          type="button"
          onClick={() => {
            if (!isEditing && currentDisplay !== null) setInputValue(String(currentDisplay));
            setIsEditing(!isEditing);
          }}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          {isEditing ? (t.home.close ?? 'Cerrar') : (t.home.logWeight ?? 'Registrar peso')}
        </button>
        {onNavigateToProgress && (
          <button
            type="button"
            onClick={onNavigateToProgress}
            className="flex items-center gap-1 ml-auto text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          >
            {t.home.viewDetails ?? 'Ver detalles'}
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
