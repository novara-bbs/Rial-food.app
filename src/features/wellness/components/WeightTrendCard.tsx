import { TrendingUp, TrendingDown, Scale, Plus } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import { bodyWeightFromKg, getBodyWeightUnit, type UnitSystem } from '../../food/utils/units';
import { calcWeightTrend } from '../utils/weight-trend';
import type { BodySnapshot } from '../../../types/wellness';

interface WeightTrendCardProps {
  snapshots: BodySnapshot[];
  targetKg?: number | null;
  unitSystem: UnitSystem;
  onLog: () => void;
  t: {
    weightTrend?: string;
    thisWeek?: string;
    weightRawLabel?: string;
    trend7d?: string;
    trendHint?: string;
    start?: string;
    change?: string;
    noWeightData?: string;
    logWeight?: string;
  };
}

const CHART_W = 300;
const CHART_H = 120;
const PAD = 10;

function buildPath(values: number[], minKg: number, range: number): string {
  if (values.length < 2) return '';
  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (CHART_W - 2 * PAD);
    const y = PAD + (1 - (v - minKg) / range) * (CHART_H - 2 * PAD);
    return `${x},${y}`;
  });
  return `M${pts.join(' L')}`;
}

export default function WeightTrendCard({
  snapshots, targetKg, unitSystem, onLog, t,
}: WeightTrendCardProps) {
  const weightUnit = getBodyWeightUnit(unitSystem);
  const trend = calcWeightTrend(snapshots, targetKg ?? null);

  const last30 = trend.last30;
  const last30Ema = last30.length > 0
    ? trend.emaSeries.slice(trend.emaSeries.length - last30.length)
    : [];

  const rawKgs = last30.map(s => s.kg);
  const allVals = [...rawKgs, ...last30Ema];
  const minKg = allVals.length > 0 ? Math.min(...allVals) - 0.5 : 0;
  const maxKg = allVals.length > 0 ? Math.max(...allVals) + 0.5 : 1;
  const range = maxKg - minKg || 1;

  const rawPath = buildPath(rawKgs, minKg, range);
  const emaPath = buildPath(last30Ema, minKg, range);

  const deltaBadge = trend.emaWeekDelta !== null ? (
    <div className={`flex items-center gap-1 text-micro font-bold uppercase tracking-widest ${
      trend.emaWeekDelta > 0 ? 'text-brand-secondary' : trend.emaWeekDelta < 0 ? 'text-primary' : 'text-on-surface-variant'
    }`}>
      {trend.emaWeekDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : trend.emaWeekDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
      {trend.emaWeekDelta > 0 ? '+' : ''}{bodyWeightFromKg(Math.abs(trend.emaWeekDelta), unitSystem).toFixed(1)} {weightUnit} {t.thisWeek || 'esta semana'}
    </div>
  ) : undefined;

  const currentEmaDisplay = trend.currentEma !== null
    ? `${bodyWeightFromKg(trend.currentEma, unitSystem).toFixed(1)} ${weightUnit}`
    : '—';
  const currentDisplay = trend.current !== null
    ? `${bodyWeightFromKg(trend.current, unitSystem).toFixed(1)} ${weightUnit}`
    : '—';
  const changeKg = trend.current !== null && trend.first !== null
    ? trend.current - trend.first
    : null;

  return (
    <SectionCard
      padding="lg"
      spacing="lg"
      title={t.weightTrend || 'Tendencia de Peso'}
      icon={<Scale className="w-4 h-4 text-primary" />}
      action={deltaBadge}
    >
      {last30.length >= 2 ? (
        <div className="space-y-1.5">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-32" aria-hidden="true">
            {/* Faded raw line — acknowledges daily noise */}
            <path d={rawPath} fill="none" stroke="var(--on-surface-variant)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
            {/* Raw daily dots */}
            {last30.map((s, i) => {
              const x = PAD + (i / (last30.length - 1)) * (CHART_W - 2 * PAD);
              const y = PAD + (1 - (s.kg - minKg) / range) * (CHART_H - 2 * PAD);
              return <circle key={s.date} cx={x} cy={y} r="2" fill="var(--on-surface-variant)" fillOpacity="0.5" />;
            })}
            {/* EMA trend line — the visually dominant metric */}
            <path d={emaPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.trendHint && (
            <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant/70 text-center">
              {t.trendHint}
            </p>
          )}
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
          {t.noWeightData || 'Registra tu peso para ver la tendencia'}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-outline-variant/10">
        <div className="text-center">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">
            {t.trend7d || 'Tendencia 7d'}
          </span>
          <span className="font-headline font-black text-body-lg text-primary">
            {currentEmaDisplay}
          </span>
        </div>
        <div className="text-center">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">
            {t.weightRawLabel || 'Hoy'}
          </span>
          <span className="font-headline font-black text-body-lg text-tertiary">
            {currentDisplay}
          </span>
        </div>
        <div className="text-center">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.change || 'Cambio'}</span>
          <span className={`font-headline font-black text-body-lg ${
            changeKg !== null
              ? (changeKg > 0 ? 'text-brand-secondary' : changeKg < 0 ? 'text-primary' : 'text-on-surface-variant')
              : 'text-on-surface-variant'
          }`}>
            {changeKg !== null
              ? `${changeKg > 0 ? '+' : ''}${bodyWeightFromKg(Math.abs(changeKg), unitSystem).toFixed(1)} ${weightUnit}`
              : '—'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onLog}
        className="w-full min-h-11 pt-3 border-t border-outline-variant/10 text-center text-micro font-bold text-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> {t.logWeight || 'Registrar peso'}
      </button>
    </SectionCard>
  );
}
