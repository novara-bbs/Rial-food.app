import { TrendingUp, TrendingDown, Scale, Flame, Target, BarChart3, Calendar, Plus, Check, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { getLoggingStreak, type DailyArchive } from '../../../hooks/useDailyReset';
import { calcVitality } from '../../home/utils/homeWidgets';
import PageHeader from '../../../components/patterns/PageHeader';
import { bodyWeightFromKg, bodyWeightToKg, getBodyWeightUnit } from '../../food/utils/units';

interface WeightEntry { date: string; kg: number; note?: string }

export default function Progress({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { nutritionHistory, weightHistory, setWeightHistory, dailyMacros, dailyLog, realFeelLogs, mealPlan, userProfile } = useAppState();
  const unitSystem = userProfile?.unitSystem ?? 'metric';
  const weightUnit = getBodyWeightUnit(unitSystem);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const history = nutritionHistory as DailyArchive[];
  const weights = weightHistory as WeightEntry[];
  const streak = getLoggingStreak(history);

  // Include today in streak if we have meals logged
  const todayStreak = dailyLog.length > 0 ? streak.current + 1 : streak.current;

  // ─── Weight Logging ─────────────────────────────────────────────────────────
  const todayDate = new Date().toISOString().slice(0, 10);
  const handleLogWeight = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || !setWeightHistory) return;
    const kg = bodyWeightToKg(val, unitSystem);
    if (kg < 20 || kg > 300) return;
    setWeightHistory((prev: any[]) => {
      const filtered = prev.filter((w: any) => w.date !== todayDate);
      return [...filtered, { date: todayDate, kg }];
    });
    setIsEditingWeight(false);
    setWeightInput('');
  };

  // ─── Dashboard Widgets ──────────────────────────────────────────────────────
  const dashboardWidgets = useMemo(() => {
    const { avgVitality, trend: vitalityTrend, entryCount: recent7Count } = calcVitality(realFeelLogs || []);
    const planValues: any[] = mealPlan ? Object.values(mealPlan) : [];
    const totalPlannedWeek: number = planValues.reduce((sum: number, meals: any) => sum + (Array.isArray(meals) ? meals.length : 0), 0);
    return { avgVitality, vitalityTrend, recent7Count, totalPlannedWeek };
  }, [realFeelLogs, mealPlan]);

  // ─── Weight Trend ───────────────────────────────────────────────────────────
  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const last30Weights = sortedWeights.slice(-30);
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].kg : null;
  const firstWeight = sortedWeights.length > 0 ? sortedWeights[0].kg : null;

  // Rate: compare last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const recentWeights = sortedWeights.filter(w => w.date >= weekAgo);
  const weekDelta = recentWeights.length >= 2
    ? recentWeights[recentWeights.length - 1].kg - recentWeights[0].kg
    : null;

  // SVG weight chart
  const chartWidth = 300;
  const chartHeight = 120;
  const chartPadding = 10;
  let weightPath = '';
  if (last30Weights.length >= 2) {
    const minKg = Math.min(...last30Weights.map(w => w.kg)) - 0.5;
    const maxKg = Math.max(...last30Weights.map(w => w.kg)) + 0.5;
    const range = maxKg - minKg || 1;
    const points = last30Weights.map((w, i) => {
      const x = chartPadding + (i / (last30Weights.length - 1)) * (chartWidth - 2 * chartPadding);
      const y = chartPadding + (1 - (w.kg - minKg) / range) * (chartHeight - 2 * chartPadding);
      return `${x},${y}`;
    });
    weightPath = `M${points.join(' L')}`;
  }

  // ─── Nutrition Summary ──────────────────────────────────────────────────────
  const thisWeekStart = new Date(now.getTime() - now.getDay() * 86_400_000).toISOString().slice(0, 10);
  const lastWeekStart = new Date(new Date(thisWeekStart).getTime() - 7 * 86_400_000).toISOString().slice(0, 10);

  const thisWeekDays = history.filter(h => h.date >= thisWeekStart);
  const lastWeekDays = history.filter(h => h.date >= lastWeekStart && h.date < thisWeekStart);

  const avg = (entries: DailyArchive[], key: 'cal' | 'pro' | 'carbs' | 'fats') => {
    if (entries.length === 0) return 0;
    return Math.round(entries.reduce((s, e) => s + (e.macros.consumed[key] || 0), 0) / entries.length);
  };

  const thisWeekAvg = { cal: avg(thisWeekDays, 'cal'), pro: avg(thisWeekDays, 'pro'), carbs: avg(thisWeekDays, 'carbs'), fats: avg(thisWeekDays, 'fats') };
  const lastWeekAvg = { cal: avg(lastWeekDays, 'cal'), pro: avg(lastWeekDays, 'pro'), carbs: avg(lastWeekDays, 'carbs'), fats: avg(lastWeekDays, 'fats') };

  // Protein adherence: days where protein >= target
  const proteinTarget = dailyMacros.target?.pro || 180;
  const proteinHitDays = thisWeekDays.filter(h => h.macros.consumed.pro >= proteinTarget).length;

  // ─── Streak Calendar ────────────────────────────────────────────────────────
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const loggedDates = new Set(history.filter(h => h.mealCount > 0).map(h => h.date));
  // Include today if meals logged
  if (dailyLog.length > 0) loggedDates.add(now.toISOString().slice(0, 10));

  const p = t.progress;

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-8 pb-24">
      <PageHeader onBack={onBack} label="" title={p.title || 'Tu Progreso'} />

      {/* ─── Dashboard Widgets ─── */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Real Score</span>
          <div className="flex items-center gap-1">
            <span className="font-headline font-black text-xl text-primary">{dashboardWidgets.avgVitality}</span>
            {dashboardWidgets.vitalityTrend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-brand-secondary" />}
            {dashboardWidgets.vitalityTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-error" />}
          </div>
          <span className="text-[9px] text-on-surface-variant">{dashboardWidgets.recent7Count} {p.entries}</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Plan</span>
          <span className="font-headline font-black text-xl text-brand-secondary">{dashboardWidgets.totalPlannedWeek}</span>
          <span className="text-[9px] text-on-surface-variant">{p.thisWeek || 'esta semana'}</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{p.currentStreak || 'Racha actual'}</span>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-brand-secondary" />
            <span className="font-headline font-black text-xl text-tertiary">{todayStreak}</span>
          </div>
          <span className="text-[9px] text-on-surface-variant">{p.days || 'días'}</span>
        </div>
      </section>

      {/* ─── Weight Trend ─── */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" /> {p.weightTrend || 'Tendencia de Peso'}
          </h2>
          {weekDelta !== null && (
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${weekDelta > 0 ? 'text-brand-secondary' : weekDelta < 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
              {weekDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : weekDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
              {weekDelta > 0 ? '+' : ''}{bodyWeightFromKg(Math.abs(weekDelta), unitSystem).toFixed(1)} {weightUnit} {p.thisWeek || 'esta semana'}
            </div>
          )}
        </div>

        {last30Weights.length >= 2 ? (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
            <path d={weightPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {last30Weights.map((w, i) => {
              const minKg = Math.min(...last30Weights.map(w2 => w2.kg)) - 0.5;
              const maxKg = Math.max(...last30Weights.map(w2 => w2.kg)) + 0.5;
              const range = maxKg - minKg || 1;
              const x = chartPadding + (i / (last30Weights.length - 1)) * (chartWidth - 2 * chartPadding);
              const y = chartPadding + (1 - (w.kg - minKg) / range) * (chartHeight - 2 * chartPadding);
              return <circle key={w.date} cx={x} cy={y} r="3" fill="var(--primary)" />;
            })}
          </svg>
        ) : (
          <div className="h-32 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
            {p.noWeightData || 'Registra tu peso para ver la tendencia'}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-outline-variant/10">
          <div className="text-center">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.current || 'Actual'}</span>
            <span className="font-headline font-black text-lg text-tertiary">{currentWeight ? `${bodyWeightFromKg(currentWeight, unitSystem)} ${weightUnit}` : '—'}</span>
          </div>
          <div className="text-center">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.start || 'Inicio'}</span>
            <span className="font-headline font-black text-lg text-on-surface-variant">{firstWeight ? `${bodyWeightFromKg(firstWeight, unitSystem)} ${weightUnit}` : '—'}</span>
          </div>
          <div className="text-center">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.change || 'Cambio'}</span>
            <span className={`font-headline font-black text-lg ${currentWeight && firstWeight ? (currentWeight - firstWeight > 0 ? 'text-brand-secondary' : 'text-primary') : 'text-on-surface-variant'}`}>
              {currentWeight && firstWeight ? `${(currentWeight - firstWeight) > 0 ? '+' : ''}${bodyWeightFromKg(Math.abs(currentWeight - firstWeight), unitSystem).toFixed(1)} ${weightUnit}` : '—'}
            </span>
          </div>
        </div>

        {/* Weight input */}
        {isEditingWeight ? (
          <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="20"
              max="300"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogWeight()}
              className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-sm text-tertiary placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              placeholder={currentWeight ? String(bodyWeightFromKg(currentWeight, unitSystem)) : '72.5'}
              autoFocus
            />
            <span className="text-sm font-bold text-on-surface-variant">{weightUnit}</span>
            <button type="button"
              onClick={handleLogWeight}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button type="button"
            onClick={() => { setIsEditingWeight(true); setWeightInput(currentWeight ? String(bodyWeightFromKg(currentWeight, unitSystem)) : ''); }}
            className="w-full pt-3 border-t border-outline-variant/10 text-center text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> {p.logWeight}
          </button>
        )}
      </section>

      {/* ─── Nutrition Summary ─── */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 space-y-4">
        <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-secondary" /> {p.nutritionSummary || 'Resumen Nutricional'}
        </h2>

        {thisWeekDays.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-3">
              {(['cal', 'pro', 'carbs', 'fats'] as const).map(key => {
                const labels: Record<string, string> = { cal: 'kcal', pro: 'Prot', carbs: 'Carbs', fats: 'Grasas' };
                const thisVal = thisWeekAvg[key];
                const lastVal = lastWeekAvg[key];
                const delta = lastVal > 0 ? Math.round(((thisVal - lastVal) / lastVal) * 100) : 0;
                return (
                  <div key={key} className="text-center bg-surface-container rounded-sm p-3">
                    <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant block mb-1">{labels[key]}</span>
                    <span className="font-headline font-black text-lg text-tertiary block">{thisVal}</span>
                    {lastVal > 0 && (
                      <span className={`text-[9px] font-bold ${delta > 0 ? 'text-brand-secondary' : delta < 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {delta > 0 ? '+' : ''}{delta}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Protein adherence */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                {p.proteinTarget || 'Objetivo de proteína'}
              </span>
              <span className="font-headline font-bold text-sm text-primary">
                {proteinHitDays}/{thisWeekDays.length} {p.days || 'días'}
              </span>
            </div>
          </>
        ) : (
          <div className="h-24 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
            {p.noNutritionData || 'Sin datos de esta semana'}
          </div>
        )}
      </section>

      {/* ─── Consistency ─── */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 space-y-4">
        <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
          <Flame className="w-4 h-4 text-brand-secondary" /> {p.consistency || 'Consistencia'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-sm p-4 text-center">
            <span className="font-headline font-black text-3xl text-primary">{todayStreak}</span>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">
              {p.currentStreak || 'Racha actual'}
            </span>
          </div>
          <div className="bg-surface-container rounded-sm p-4 text-center">
            <span className="font-headline font-black text-3xl text-on-surface-variant">{streak.best}</span>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">
              {p.bestStreak || 'Mejor racha'}
            </span>
          </div>
        </div>

        {/* Monthly calendar heatmap */}
        <div className="pt-3 border-t border-outline-variant/10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="text-[8px] text-on-surface-variant">{p.logged || 'Registrado'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-surface-container-highest" />
                <span className="text-[8px] text-on-surface-variant">{p.missed || 'Sin datos'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Day headers */}
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <span key={d} className="text-center text-[8px] font-bold text-on-surface-variant uppercase">{d}</span>
            ))}
            {/* Empty cells for offset */}
            {Array.from({ length: (firstDayOfMonth + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === now.toISOString().slice(0, 10);
              const isLogged = loggedDates.has(dateStr);
              const isFuture = day > now.getDate();
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-sm flex items-center justify-center text-[9px] font-bold ${
                    isFuture
                      ? 'bg-surface-container/50 text-on-surface-variant/30'
                      : isLogged
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-highest text-on-surface-variant/50'
                  } ${isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low' : ''}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
