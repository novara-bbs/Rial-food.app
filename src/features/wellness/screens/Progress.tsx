import {
  TrendingUp, TrendingDown, Scale, Flame, BarChart3,
  Plus, List, Grid3x3, CalendarCheck,
} from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import { todayLocal } from '../../../lib/dates';
import { calcVitality } from '../../home/utils/homeWidgets';
import { calcWeekMacros } from '../utils/week-stats';
import { calcStreaks } from '../utils/streaks';
import { calcWeightTrend } from '../utils/weight-trend';
import PageHeader from '../../../components/patterns/PageHeader';
import SectionCard from '../../../components/SectionCard';
import StatTile from '../../../components/StatTile';
import SegmentedTabs from '../../../components/SegmentedTabs';
import Sparkline from '../../../components/Sparkline';
import DayGridCalendar from '../../../components/DayGridCalendar';
import { bodyWeightFromKg, getBodyWeightUnit } from '../../food/utils/units';
import type { BodySnapshot } from '../../../types/wellness';
import BodyTimeline from '../components/BodyTimeline';
import BodyCalendar from '../components/BodyCalendar';
import LogSnapshotModal from '../components/LogSnapshotModal';
import DataSourceCaption from '../components/DataSourceCaption';
import RitmoSection from '../components/RitmoSection';
import LatestReflectionCard from '../components/LatestReflectionCard';

type MainTab = 'body' | 'nutrition';
type BodyView = 'timeline' | 'calendar';

export default function Progress({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const {
    nutritionHistory, weightHistory, dailyMacros, dailyLog,
    realFeelLogs, mealPlan, userProfile, handleShareProgress,
  } = useAppState();
  const unitSystem = userProfile?.unitSystem ?? 'metric';
  const weightUnit = getBodyWeightUnit(unitSystem);

  const [mainTab, setMainTab] = useState<MainTab>('body');
  const [bodyView, setBodyView] = useState<BodyView>('timeline');
  const [logOpen, setLogOpen] = useState(false);

  const history = nutritionHistory as DailyArchive[];
  const snapshots = weightHistory as BodySnapshot[];

  // ─── Streaks (canonical meal-log streak shared by Home + Profile) ────────────
  const streaks = calcStreaks({
    history,
    realFeelLogs: realFeelLogs || [],
    todayHasMeals: dailyLog.length > 0,
  });
  const mealStreak = streaks.mealLog;

  // ─── Dashboard widgets ───────────────────────────────────────────────────────
  const dashboardWidgets = useMemo(() => {
    const { avgVitality, trend: vitalityTrend, entryCount: recent7Count } = calcVitality(realFeelLogs || []);
    const planValues: Array<unknown> = mealPlan ? Object.values(mealPlan) : [];
    const totalPlannedWeek: number = planValues.reduce<number>(
      (sum, meals) => sum + (Array.isArray(meals) ? meals.length : 0),
      0,
    );
    return { avgVitality, vitalityTrend, recent7Count, totalPlannedWeek };
  }, [realFeelLogs, mealPlan]);

  // ─── Weight trend (Body tab) ─────────────────────────────────────────────────
  const targetKg = userProfile?.targetWeight ?? null;
  const trend = useMemo(() => calcWeightTrend(snapshots, targetKg), [snapshots, targetKg]);

  const targetProgressPct = trend.targetProgressPct != null
    ? Math.round(trend.targetProgressPct * 100)
    : null;
  const targetDisplay = targetKg ? `${bodyWeightFromKg(targetKg, unitSystem)} ${weightUnit}` : null;

  // ─── Nutrition summary (this week vs. previous) ──────────────────────────────
  const macroTarget = {
    cal: dailyMacros.target?.cal ?? 2400,
    pro: dailyMacros.target?.pro ?? 180,
    carbs: dailyMacros.target?.carbs ?? 250,
    fats: dailyMacros.target?.fats ?? 65,
  };
  const weekStats = useMemo(() => calcWeekMacros(history, macroTarget, 0), [history, macroTarget]);
  const prevWeekStats = useMemo(() => calcWeekMacros(history, macroTarget, 1), [history, macroTarget]);

  // ─── Consistency calendar data map ───────────────────────────────────────────
  const consistencyData = useMemo(() => {
    const m = new Map<string, { logged: true }>();
    (history || []).filter(h => h.mealCount > 0).forEach(h => m.set(h.date, { logged: true }));
    if (dailyLog.length > 0) {
      const today = todayLocal();
      m.set(today, { logged: true });
    }
    return m;
  }, [history, dailyLog.length]);

  const p = t.progress;

  const MAIN_TABS = [
    { id: 'body' as const, label: p.tabBody ?? 'Cuerpo' },
    { id: 'nutrition' as const, label: p.tabNutrition ?? 'Nutrición' },
  ];

  const BODY_VIEWS = [
    { id: 'timeline' as const, label: p.timeline ?? 'Timeline', icon: <List className="w-3 h-3" aria-hidden="true" /> },
    { id: 'calendar' as const, label: p.calendarView ?? 'Calendario', icon: <Grid3x3 className="w-3 h-3" aria-hidden="true" /> },
  ];

  // Goal-aware weight coloring: for gain/muscle goals, weight up = positive (primary)
  const isGainGoal = userProfile?.goal === 'gain' || userProfile?.goal === 'muscle';
  const weightUpColor = isGainGoal ? 'text-primary' : 'text-brand-secondary';
  const weightDownColor = isGainGoal ? 'text-brand-secondary' : 'text-primary';

  // Trend chip for the weight section header
  const weekDelta = trend.weekDelta;
  const weekDeltaNode = weekDelta !== null ? (
    <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${weekDelta > 0 ? weightUpColor : weekDelta < 0 ? weightDownColor : 'text-on-surface-variant'}`}>
      {weekDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : weekDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
      {weekDelta > 0 ? '+' : ''}{bodyWeightFromKg(Math.abs(weekDelta), unitSystem).toFixed(1)} {weightUnit}
    </div>
  ) : null;

  const kcalDelta = weekStats.deltaVsPrev.cal;
  const proDelta = weekStats.deltaVsPrev.pro;

  return (
    <PageShell maxWidth="narrow" spacing="lg">
      <PageHeader onBack={onBack} label="" title={p.title || 'Tu Progreso'} />

      {/* ─── Dashboard Widgets ─── */}
      <DataSourceCaption
        kind="auto"
        label={p.dataSourceAutoDashboard ?? 'resumen de tu actividad'}
        className="mt-1"
      />
      <section className="grid grid-cols-3 gap-3">
        <StatTile
          label="Real Score"
          value={dashboardWidgets.avgVitality}
          valueColor="primary"
          trend={dashboardWidgets.vitalityTrend === 'up' ? 'up' : dashboardWidgets.vitalityTrend === 'down' ? 'down' : undefined}
          subtle={`${dashboardWidgets.recent7Count} ${p.entries ?? 'entradas'}`}
        />
        <StatTile
          label="Plan"
          value={dashboardWidgets.totalPlannedWeek}
          valueColor="secondary"
          subtle={p.plannedMeals ?? 'planificadas'}
        />
        <StatTile
          label={p.currentStreak || 'Racha actual'}
          value={mealStreak.current}
          valueColor="tertiary"
          icon={<Flame className="w-4 h-4 text-brand-secondary" aria-hidden="true" />}
          subtle={p.days || 'días'}
        />
      </section>

      {/* ─── Main tabs: Cuerpo | Nutrición ─── */}
      <SegmentedTabs
        options={MAIN_TABS}
        value={mainTab}
        onChange={setMainTab}
        ariaLabel={p.title ?? 'Progreso'}
      />

      {/* ══════════════ BODY TAB ══════════════ */}
      {mainTab === 'body' && (
        <>
          {/* Weight chart + stats */}
          <SectionCard
            icon={<Scale className="w-4 h-4 text-primary" aria-hidden="true" />}
            title={p.weightTrend || 'Tendencia de Peso'}
            caption={<DataSourceCaption kind="manual" label={p.dataSourceManualWeight ?? 'registra una entrada cuando te peses'} />}
            action={weekDeltaNode}
          >
            {trend.last30.length >= 2 ? (
              <Sparkline
                values={trend.last30.map(w => w.kg)}
                color="var(--primary)"
                height={100}
                strokeWidth={2.5}
                dotRadius={2.5}
                svgClassName="w-full h-24"
                ariaLabel={p.weightTrend ?? 'Tendencia de Peso'}
              />
            ) : (
              <div className="h-20 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
                {p.noWeightData || 'Registra tu peso para ver la tendencia'}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-outline-variant/10">
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.current || 'Actual'}</span>
                <span className="font-headline font-black text-base text-tertiary">
                  {trend.current !== null ? `${bodyWeightFromKg(trend.current, unitSystem)} ${weightUnit}` : '—'}
                </span>
              </div>
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.start || 'Inicio'}</span>
                <span className="font-headline font-black text-base text-on-surface-variant">
                  {trend.first !== null ? `${bodyWeightFromKg(trend.first, unitSystem)} ${weightUnit}` : '—'}
                </span>
              </div>
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.change || 'Cambio'}</span>
                <span className={`font-headline font-black text-base ${trend.current !== null && trend.first !== null ? (trend.current - trend.first > 0 ? weightUpColor : weightDownColor) : 'text-on-surface-variant'}`}>
                  {trend.current !== null && trend.first !== null
                    ? `${(trend.current - trend.first) > 0 ? '+' : ''}${bodyWeightFromKg(Math.abs(trend.current - trend.first), unitSystem).toFixed(1)} ${weightUnit}`
                    : '—'}
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
                <DataSourceCaption kind="manual" label={p.dataSourceManualTarget ?? 'basado en tu último pesaje'} />
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${targetProgressPct}%` }} />
                </div>
              </div>
            )}
          </SectionCard>

          {/* View toggle + Log CTA */}
          <div className="flex items-center gap-2">
            <SegmentedTabs
              options={BODY_VIEWS}
              value={bodyView}
              onChange={setBodyView}
              size="sm"
              ariaLabel={p.tabBody ?? 'Cuerpo'}
            />
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
            ? (
              <BodyTimeline
                snapshots={snapshots}
                unitSystem={unitSystem}
                onShare={handleShareProgress ? (snap) => {
                  const sortedAsc = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
                  const reference = sortedAsc.find(s => s.date < snap.date) ?? sortedAsc[0];
                  const delta = reference && reference.date !== snap.date
                    ? +(snap.kg - reference.kg).toFixed(1)
                    : undefined;
                  const content = delta != null
                    ? `${delta < 0 ? '−' : '+'}${Math.abs(delta).toFixed(1)} ${weightUnit} desde ${new Date(reference.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}.`
                    : `Hoy: ${bodyWeightFromKg(snap.kg, unitSystem)} ${weightUnit}.`;
                  handleShareProgress({
                    snapshot: snap,
                    referenceSnapshot: reference && reference.date !== snap.date ? reference : undefined,
                    content,
                    author: { name: userProfile?.name || 'Tú', img: userProfile?.avatar },
                  });
                } : undefined}
                shareLabel={p.shareSnapshot ?? 'Compartir con la comunidad'}
              />
            )
            : <BodyCalendar snapshots={snapshots} unitSystem={unitSystem} />
          }
        </>
      )}

      {/* ══════════════ NUTRITION TAB ══════════════ */}
      {mainTab === 'nutrition' && (
        <>
          <SectionCard
            icon={<BarChart3 className="w-4 h-4 text-brand-secondary" aria-hidden="true" />}
            title={p.nutritionSummary || 'Resumen Nutricional'}
            caption={<DataSourceCaption kind="auto" label={p.dataSourceAutoMacros ?? 'se actualiza con cada comida'} />}
          >
            {weekStats.daysLogged > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-3">
                  {(['cal', 'pro', 'carbs', 'fats'] as const).map(key => {
                    const labels: Record<string, string> = { cal: 'kcal', pro: 'Prot', carbs: 'Carbs', fats: 'Grasas' };
                    const thisVal = weekStats.avg[key];
                    const lastVal = prevWeekStats.avg[key];
                    const delta = lastVal > 0 ? Math.round(((thisVal - lastVal) / lastVal) * 100) : 0;
                    const trendKey: 'up' | 'down' | 'flat' | undefined =
                      lastVal > 0
                        ? delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
                        : undefined;
                    return (
                      <StatTile
                        key={key}
                        label={labels[key]}
                        value={thisVal}
                        valueColor="tertiary"
                        variant="raised"
                        size="sm"
                        trend={lastVal > 0 ? trendKey : undefined}
                        trendValue={lastVal > 0 ? `${delta > 0 ? '+' : ''}${delta}%` : undefined}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{p.proteinTarget || 'Objetivo de proteína'}</span>
                  <span className="font-headline font-bold text-sm text-primary">{weekStats.hitDays.pro}/{weekStats.daysLogged} {p.days || 'días'}</span>
                </div>
                {(kcalDelta !== null || proDelta !== null) && (
                  <p className="text-[10px] text-on-surface-variant">
                    {p.vsPrevWeek ?? 'vs. semana pasada'}:
                    {kcalDelta !== null && <> kcal {kcalDelta > 0 ? '+' : ''}{kcalDelta}%</>}
                    {proDelta !== null && <> · prot {proDelta > 0 ? '+' : ''}{proDelta}%</>}
                  </p>
                )}
              </>
            ) : (
              <div className="h-24 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
                {p.noNutritionData || 'Sin datos de esta semana'}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={<Flame className="w-4 h-4 text-brand-secondary" aria-hidden="true" />}
            title={p.consistency || 'Consistencia'}
            caption={<DataSourceCaption kind="auto" label={p.dataSourceAutoStreak ?? 'calculado al cerrar el día'} />}
          >
            <div className="grid grid-cols-2 gap-4">
              <StatTile
                label={p.currentStreak || 'Racha actual'}
                value={mealStreak.current}
                valueColor="primary"
                variant="raised"
                size="md"
                icon={<Flame className="w-4 h-4 text-brand-secondary" aria-hidden="true" />}
              />
              <StatTile
                label={p.bestStreak || 'Mejor racha'}
                value={mealStreak.best}
                valueColor="on-surface-variant"
                variant="raised"
                size="md"
              />
            </div>

            <div className="pt-3 border-t border-outline-variant/10">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5 mb-3">
                <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <DayGridCalendar<{ logged: true }>
                mode="month"
                data={consistencyData}
                prevMonthLabel={p.prevMonth ?? 'Mes anterior'}
                nextMonthLabel={p.nextMonth ?? 'Mes siguiente'}
                onSelectEmpty={() => navigateTo('add-meal')}
                cellClassName={({ payload, isFuture }) =>
                  isFuture
                    ? 'bg-surface-container/50 text-on-surface-variant/30'
                    : payload
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-on-surface-variant/50'
                }
                cellAriaLabel={({ date, payload }) => `${date.slice(-2)} ${payload ? '(logged)' : ''}`}
                renderCell={({ date }) => <span>{Number(date.slice(-2))}</span>}
                emptyState={
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-on-surface-variant">{p.consistencyCalendarEmpty ?? 'Aún no has registrado comidas'}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo('add-meal')}
                      className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      {p.logFirstMeal ?? 'Registrar primera comida'}
                    </button>
                  </div>
                }
              />
            </div>
          </SectionCard>

          {/* Weekly reflection — surfaces weeklyCheckIns inside the expected tab */}
          <LatestReflectionCard />

          {/* Ritmo diario — collapsible sparklines for Health-seeker ICP */}
          <RitmoSection
            history={history}
            realFeelLogs={realFeelLogs || []}
            title={p.ritmoTitle ?? 'Ritmo diario'}
            captionLabel={p.dataSourceAutoRitmo ?? 'sumado desde Home'}
            emptyLabel={p.ritmoEmpty ?? 'Sin datos aún — registra hidratación o movimiento en Home'}
            daysLabel={p.days || 'días'}
            labels={{
              hydration: p.ritmoHydration ?? 'Hidratación',
              movement: p.ritmoMovement ?? 'Movimiento',
              vitality: p.ritmoVitality ?? 'Real Feel',
            }}
          />
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
