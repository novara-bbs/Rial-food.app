import { Droplets, Footprints, Timer, Calendar as CalendarIcon } from 'lucide-react';

interface BarData {
  key: string;
  pct: number;
  avg: number;
  target: number;
}

interface WeeklyScoreCardProps {
  weeklyScore: number;
  weekStats: {
    thisAvg: { cal: number; pro: number; carbs: number; fats: number };
    lastAvg: { cal: number; pro: number; carbs: number; fats: number };
    calDelta: number;
    proteinHitDays: number;
    daysLogged: number;
    bars: BarData[];
  };
  hydration: { consumed: number; target: number } | undefined;
  movement: { steps: number; target: number; activeMinutes: number; activeTarget: number } | undefined;
  barLabels: Record<string, string>;
  t: { thisWeekTitle?: string; proteinTarget?: string; daysLogged?: string };
}

function adherenceBarColor(pct: number): string {
  if (pct >= 90) return 'bg-primary';
  if (pct >= 70) return 'bg-brand-secondary';
  return 'bg-error';
}
function adherenceTextColor(pct: number): string {
  if (pct >= 90) return 'text-primary';
  if (pct >= 70) return 'text-brand-secondary';
  return 'text-error';
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-primary';
  if (score >= 60) return 'text-brand-secondary';
  return 'text-error';
}
function scoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-primary';
  if (score >= 60) return 'stroke-brand-secondary';
  return 'stroke-error';
}

export default function WeeklyScoreCard({ weeklyScore, weekStats, hydration, movement, barLabels, t }: WeeklyScoreCardProps) {
  return (
    <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-4">
      <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-tertiary">
        {t.thisWeekTitle || 'Esta Semana'}
      </h3>

      {/* Score ring + stats */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
            <circle cx="36" cy="36" r="30" fill="none" strokeWidth="5" className="stroke-surface-container-highest" />
            <circle cx="36" cy="36" r="30" fill="none" strokeWidth="5"
              className={scoreRingColor(weeklyScore)}
              strokeLinecap="round"
              strokeDasharray={`${(weeklyScore / 100) * 188.5} 188.5`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-headline font-black text-xl leading-none ${scoreColor(weeklyScore)}`}>{weeklyScore}</span>
            <span className="text-micro text-on-surface-variant">/100</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-headline font-bold text-sm text-tertiary">{weekStats.thisAvg.cal}</span>
            <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">kcal</span>
            {weekStats.calDelta !== 0 && (
              <span className={`text-micro font-bold ${weekStats.calDelta > 0 ? 'text-brand-secondary' : 'text-primary'}`}>
                {weekStats.calDelta > 0 ? '▲' : '▼'}{Math.abs(weekStats.calDelta)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-headline font-bold text-sm text-primary">
              {weekStats.proteinHitDays}/{weekStats.daysLogged || '—'}
            </span>
            <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
              {t.proteinTarget || 'Proteína'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-brand-secondary" />
            <span className="font-headline font-bold text-sm text-tertiary">{weekStats.daysLogged}/7</span>
            <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
              {t.daysLogged || 'días'}
            </span>
          </div>
        </div>
      </div>

      {/* Today's activity */}
      <div className="flex items-center gap-4 pt-2 border-t border-outline-variant/10">
        <div className="flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-label text-micro font-bold text-on-surface-variant">
            {hydration?.consumed ?? 0}/{hydration?.target ?? 8}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Footprints className="w-3.5 h-3.5 text-brand-secondary" />
          <span className="font-label text-micro font-bold text-on-surface-variant">
            {(movement?.steps ?? 0).toLocaleString()}/{(movement?.target ?? 8000).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Timer className="w-3.5 h-3.5 text-tertiary" />
          <span className="font-label text-micro font-bold text-on-surface-variant">
            {movement?.activeMinutes ?? 0}/{movement?.activeTarget ?? 30} min
          </span>
        </div>
      </div>

      {/* Adherence bars with raw avg + delta */}
      <div className="space-y-2 pt-2 border-t border-outline-variant/10">
        {weekStats.bars.map(bar => {
          const lastVal = weekStats.lastAvg[bar.key as keyof typeof weekStats.lastAvg];
          const delta = lastVal > 0 ? Math.round(((bar.avg - lastVal) / lastVal) * 100) : 0;
          const unit = bar.key === 'cal' ? '' : 'g';
          return (
            <div key={bar.key} className="flex items-center gap-2">
              <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant w-10">{barLabels[bar.key]}</span>
              <span className="font-label text-micro font-bold text-tertiary w-10 text-right">{bar.avg}{unit}</span>
              <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${adherenceBarColor(bar.pct)}`}
                  style={{ width: `${Math.min(100, bar.pct)}%` }}
                />
              </div>
              <span className={`font-label text-micro font-bold w-8 text-right ${adherenceTextColor(bar.pct)}`}>
                {bar.pct}%
              </span>
              {delta !== 0 && (
                <span className={`text-micro font-bold w-8 ${delta > 0 ? 'text-brand-secondary' : 'text-primary'}`}>
                  {delta > 0 ? '+' : ''}{delta}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
