import {
  TrendingUp, TrendingDown, Scale, Flame, BarChart3, Calendar,
  Plus, List, Grid3x3, Sparkles,
} from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { getLoggingStreak, type DailyArchive } from '../../../hooks/useDailyReset';
import { calcVitality } from '../../home/utils/homeWidgets';
import PageHeader from '../../../components/patterns/PageHeader';
import { bodyWeightFromKg, getBodyWeightUnit } from '../../food/utils/units';
import type { BodySnapshot } from '../../../types/wellness';
import BodyTimeline from '../components/BodyTimeline';
import BodyCalendar from '../components/BodyCalendar';
import LogSnapshotModal from '../components/LogSnapshotModal';
import { seedBodySnapshots } from '../data/seed-body-snapshots';
import { toast } from 'sonner';

type MainTab = 'body' | 'nutrition';
type BodyView = 'timeline' | 'calendar';

export default function Progress({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const {
    nutritionHistory, weightHistory, dailyMacros, dailyLog,
    realFeelLogs, mealPlan, userProfile, setWeightHistory,
  } = useAppState();
  const unitSystem = userProfile?.unitSystem ?? 'metric';
  const weightUnit = getBodyWeightUnit(unitSystem);

  const [mainTab, setMainTab] = useState<MainTab>('body');
  const [bodyView, setBodyView] = useState<BodyView>('timeline');
  const [logOpen, setLogOpen] = useState(false);

  const history = nutritionHistory as DailyArchive[];
  const snapshots = weightHistory as BodySnapshot[];
  const streak = getLoggingStreak(history);
  const todayStreak = dailyLog.length > 0 ? streak.current + 1 : streak.current;

  // ─── Dashboard Widgets ────────────────────────────────────────────────────────
  const dashboardWidgets = useMemo(() => {
    const { avgVitality, trend: vitalityTrend, entryCount: recent7Count } = calcVitality(realFeelLogs || []);
    const planValues: any[] = mealPlan ? Object.values(mealPlan) : [];
    const totalPlannedWeek: number = planValues.reduce(
      (sum: number, meals: any) => sum + (Array.isArray(meals) ? meals.length : 0),
      0,
    );
    return { avgVitality, vitalityTrend, recent7Count, totalPlannedWeek };
  }, [realFeelLogs, mealPlan]);

  // ─── Weight Trend (always visible in Body tab) ────────────────────────────────
  const sortedWeights = [...snapshots]
    .filter(s => s.kg > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const last30Weights = sortedWeights.slice(-30);
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].kg : null;
  const firstWeight = sortedWeights.length > 0 ? sortedWeights[0].kg : null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const recentWeights = sortedWeights.filter(w => w.date >= weekAgo);
  const weekDelta = recentWeights.length >= 2
    ? recentWeights[recentWeights.length - 1].kg - recentWeights[0].kg
    : null;

  const chartWidth = 300;
  const chartHeight = 100;
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

  // ─── Target progress ───────────────────────────────────────────────────────────
  const targetKg = userProfile?.targetWeight ?? null;
  const targetProgressPct: number | null =
    targetKg && currentWeight && firstWeight && firstWeight !== targetKg
      ? Math.min(100, Math.max(0, Math.round(
          Math.abs(currentWeight - firstWeight) / Math.abs(targetKg - firstWeight) * 100,
        )))
      : null;
  const targetDisplay = targetKg ? `${bodyWeightFromKg(targetKg, unitSystem)} ${weightUnit}` : null;

  // ─── Nutrition summary (only computed when Nutrition tab is active via useMemo) ──
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
  const proteinTarget = dailyMacros.target?.pro || 180;
  const proteinHitDays = thisWeekDays.filter(h => h.macros.consumed.pro >= proteinTarget).length;

  // ─── Consistency calendar (nutrition tab) ─────────────────────────────────────
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const loggedDates = new Set(history.filter(h => h.mealCount > 0).map(h => h.date));
  if (dailyLog.length > 0) loggedDates.add(now.toISOString().slice(0, 10));

  const p = t.progress;
  const TABS: Record<MainTab, string> = {
    body: p.tabBody ?? 'Cuerpo',
    nutrition: p.tabNutrition ?? 'Nutrición',
  };

  return (
    <PageShell maxWidth="narrow" spacing="lg">
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

      {/* ─── Main tabs: Cuerpo | Nutrición ─── */}
      <div className="flex bg-surface-container rounded-sm p-1 gap-1">
        {(Object.keys(TABS) as MainTab[]).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setMainTab(tab)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${
              mainTab === tab
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-tertiary'
            }`}
          >
            {TABS[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════ BODY TAB ══════════════ */}
      {mainTab === 'body' && (
        <>
          {/* Weight chart + stats — always visible */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" /> {p.weightTrend || 'Tendencia de Peso'}
              </h2>
              {weekDelta !== null && (
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${weekDelta > 0 ? 'text-brand-secondary' : weekDelta < 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {weekDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : weekDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                  {weekDelta > 0 ? '+' : ''}{bodyWeightFromKg(Math.abs(weekDelta), unitSystem).toFixed(1)} {weightUnit}
                </div>
              )}
            </div>

            {last30Weights.length >= 2 ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-24">
                <path d={weightPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {last30Weights.map((w, i) => {
                  const minKg = Math.min(...last30Weights.map(w2 => w2.kg)) - 0.5;
                  const maxKg = Math.max(...last30Weights.map(w2 => w2.kg)) + 0.5;
                  const range = maxKg - minKg || 1;
                  const x = chartPadding + (i / (last30Weights.length - 1)) * (chartWidth - 2 * chartPadding);
                  const y = chartPadding + (1 - (w.kg - minKg) / range) * (chartHeight - 2 * chartPadding);
                  return <circle key={w.date} cx={x} cy={y} r="2.5" fill="var(--primary)" />;
                })}
              </svg>
            ) : (
              <div className="h-20 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
                {p.noWeightData || 'Registra tu peso para ver la tendencia'}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-outline-variant/10">
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.current || 'Actual'}</span>
                <span className="font-headline font-black text-base text-tertiary">{currentWeight ? `${bodyWeightFromKg(currentWeight, unitSystem)} ${weightUnit}` : '—'}</span>
              </div>
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.start || 'Inicio'}</span>
                <span className="font-headline font-black text-base text-on-surface-variant">{firstWeight ? `${bodyWeightFromKg(firstWeight, unitSystem)} ${weightUnit}` : '—'}</span>
              </div>
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.change || 'Cambio'}</span>
                <span className={`font-headline font-black text-base ${currentWeight && firstWeight ? (currentWeight - firstWeight > 0 ? 'text-brand-secondary' : 'text-primary') : 'text-on-surface-variant'}`}>
                  {currentWeight && firstWeight ? `${(currentWeight - firstWeight) > 0 ? '+' : ''}${bodyWeightFromKg(Math.abs(currentWeight - firstWeight), unitSystem).toFixed(1)} ${weightUnit}` : '—'}
                </span>
              </div>
            </div>

            {targetProgressPct !== null && targetDisplay && (
              <div className="pt-2 border-t border-outline-variant/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                    {p.targetProgress || 'Progreso hacia objetivo'}
                  </span>
                  <span className="font-label text-[9px] font-bold text-primary uppercase tracking-widest">
                    {targetDisplay} · {targetProgressPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${targetProgressPct}%` }} />
                </div>
              </div>
            )}
          </section>

          {/* View toggle + Log CTA */}
          <div className="flex items-center gap-2">
            <div className="flex bg-surface-container rounded-sm p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setBodyView('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
                  bodyView === 'timeline' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-tertiary'
                }`}
              >
                <List className="w-3 h-3" aria-hidden="true" /> {p.timeline ?? 'Timeline'}
              </button>
              <button
                type="button"
                onClick={() => setBodyView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
                  bodyView === 'calendar' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-tertiary'
                }`}
              >
                <Grid3x3 className="w-3 h-3" aria-hidden="true" /> {p.calendarView ?? 'Calendario'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              className="ml-auto flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
              {p.logSnapshot ?? 'Registrar'}
            </button>
          </div>

          {/* Body view */}
          {bodyView === 'timeline'
            ? <BodyTimeline snapshots={snapshots} unitSystem={unitSystem} />
            : <BodyCalendar snapshots={snapshots} unitSystem={unitSystem} />
          }

          {/* Dev-only seed button */}
          {(import.meta as any).env?.DEV && snapshots.length === 0 && (
            <button
              type="button"
              onClick={() => {
                seedBodySnapshots(setWeightHistory);
                toast.success(p.seedLoaded ?? '30 días de datos de ejemplo cargados');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-secondary/10 border border-dashed border-brand-secondary/30 rounded-sm text-[10px] font-bold uppercase tracking-widest text-brand-secondary hover:bg-brand-secondary/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {p.loadSeedData ?? 'Cargar datos de ejemplo (dev)'}
            </button>
          )}
        </>
      )}

      {/* ══════════════ NUTRITION TAB ══════════════ */}
      {mainTab === 'nutrition' && (
        <>
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-4">
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
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{p.proteinTarget || 'Objetivo de proteína'}</span>
                  <span className="font-headline font-bold text-sm text-primary">{proteinHitDays}/{thisWeekDays.length} {p.days || 'días'}</span>
                </div>
              </>
            ) : (
              <div className="h-24 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
                {p.noNutritionData || 'Sin datos de esta semana'}
              </div>
            )}
          </section>

          <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-4">
            <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-secondary" /> {p.consistency || 'Consistencia'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container rounded-sm p-4 text-center">
                <span className="font-headline font-black text-3xl text-primary">{todayStreak}</span>
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">{p.currentStreak || 'Racha actual'}</span>
              </div>
              <div className="bg-surface-container rounded-sm p-4 text-center">
                <span className="font-headline font-black text-3xl text-on-surface-variant">{streak.best}</span>
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">{p.bestStreak || 'Mejor racha'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/10">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                {now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <span key={d} className="text-center text-[8px] font-bold text-on-surface-variant uppercase">{d}</span>
                ))}
                {Array.from({ length: (firstDayOfMonth + 6) % 7 }).map((_, i) => <div key={`empty-${i}`} />)}
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
        </>
      )}

      {/* Shared log modal (Body tab CTA) */}
      <LogSnapshotModal
        open={logOpen}
        onOpenChange={setLogOpen}
        unitSystem={unitSystem}
      />
    </PageShell>
  );
}
