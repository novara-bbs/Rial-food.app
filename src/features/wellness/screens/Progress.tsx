import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Heart, UtensilsCrossed } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { type DailyArchive } from '../../../hooks/useDailyReset';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { calcVitality } from '../../home/utils/homeWidgets';
import { getCorrelations, type CorrelationInsight } from '../utils/correlations';
import PageHeader from '../../../components/patterns/PageHeader';
import { toast } from 'sonner';
import WeeklyScoreCard from '../components/WeeklyScoreCard';
import WeeklyInsightsCard from '../components/WeeklyInsightsCard';
import ConsistencyCalendar from '../components/ConsistencyCalendar';
import InlineReflection from '../components/InlineReflection';
import WeightTrendCard from '../components/WeightTrendCard';
import BodyTimeline from '../components/BodyTimeline';
import BodyCalendar from '../components/BodyCalendar';
import BodyConstantsGrid from '../components/BodyConstantsGrid';
import RitmoSection from '../components/RitmoSection';
import SectionCard from '@/components/SectionCard';
import { calcStreaks } from '../utils/streaks';
import { calcWeekMacros, type MacroTarget } from '../utils/week-stats';
import { calcWeightTrend } from '../utils/weight-trend';
import { calcTopMeals } from '../utils/top-meals';
import { buildWeekInsight } from '../utils/week-insights';
import { bodyWeightFromKg, getBodyWeightUnit } from '../../food/utils/units';
import { useLogSnapshot } from '../hooks/useLogSnapshot';
import type { BodySnapshot } from '../../../types/wellness';

interface WeeklyEntry {
  id: number;
  weekStart: string;
  workedWell: string;
  whatWasHard: string;
  focusNextWeek: string;
  avgVitality: number;
  mealsLogged: number;
  consistencyDays: number;
}

const EMOJI_MAP = ['😴', '😕', '😐', '😊', '💪'];

/** DST-safe week start using Date math. */
function getWeekStartISO(date: Date): string {
  const ws = new Date(date);
  ws.setDate(date.getDate() - date.getDay());
  ws.setHours(0, 0, 0, 0);
  return ws.toISOString().slice(0, 10);
}

export default function Progress({ onBack }: { onBack: () => void }) {
  const { t, locale } = useI18n();
  const { navigateTo } = useNavigation();
  const {
    nutritionHistory, weightHistory, dailyMacros, dailyLog, realFeelLogs,
    userProfile, hydration, movement, handleShareProgress,
  } = useAppState();
  const unitSystem = userProfile?.unitSystem ?? 'metric';
  const { openWithDate } = useLogSnapshot();

  const [tab, setTab] = useState<'body' | 'nutrition'>('nutrition');
  const [bodySubTab, setBodySubTab] = useState<'summary' | 'history' | 'calendar'>('summary');
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [workedWell, setWorkedWell] = useState('');
  const [whatWasHard, setWhatWasHard] = useState('');
  const [focusNext, setFocusNext] = useState('');
  const [weeklyEntries, setWeeklyEntries] = useLocalStorageState<WeeklyEntry[]>('weeklyCheckIns', []);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const history = nutritionHistory as DailyArchive[];
  const snapshots = weightHistory as BodySnapshot[];
  const now = useMemo(() => new Date(), []);
  const todayDate = useMemo(() => now.toISOString().slice(0, 10), [now]);

  // ─── Canonical streaks (Q13 coherence) ──────────────────────────────────────
  const todayHasRealFeel = (realFeelLogs || []).some(
    (l) => l.date && l.date.slice(0, 10) === todayDate,
  );
  const streaks = useMemo(
    () => calcStreaks({
      history,
      realFeelLogs: realFeelLogs || [],
      todayHasMeals: dailyLog.length > 0,
      todayHasRealFeel,
      now,
    }),
    [history, realFeelLogs, dailyLog.length, todayHasRealFeel, now],
  );

  // ─── This Week Stats via canonical helper (Q13 coherence) ───────────────────
  const weekStats = useMemo(() => {
    const target: MacroTarget = dailyMacros.target ?? { cal: 2400, pro: 180, carbs: 250, fats: 65 };
    const curr = calcWeekMacros(history, target, 0, now);
    const prev = calcWeekMacros(history, target, 1, now);

    const thisAvg = curr.avg;
    const lastAvg = prev.avg;

    // proteinHitDays keeps the 90%-of-target threshold that WeeklyScoreCard expects.
    const proteinHitDays = history
      .filter(h => h.date >= curr.weekStart && h.date <= curr.weekEnd)
      .filter(h => (h.macros?.consumed?.pro || 0) >= (target.pro || 180) * 0.9)
      .length;

    const calDelta = curr.deltaVsPrev.cal ?? 0;

    const bars = (['cal', 'pro', 'carbs', 'fats'] as const).map(key => {
      const targetVal = target[key] || 1;
      const pct = Math.min(150, Math.round((thisAvg[key] / targetVal) * 100));
      return { key, pct, avg: thisAvg[key], target: targetVal };
    });

    return { thisAvg, lastAvg, calDelta, proteinHitDays, daysLogged: curr.daysLogged, bars };
  }, [history, dailyMacros, now]);

  // ─── Weekly Score (0-100) ───────────────────────────────────────────────────
  const weeklyScore = useMemo(() => {
    if (weekStats.daysLogged === 0) return 0;
    const adherence = weekStats.bars.reduce((s, b) => s + Math.min(100, b.pct), 0) / 4;
    const consistency = (weekStats.daysLogged / 7) * 100;
    const proteinPct = (weekStats.proteinHitDays / weekStats.daysLogged) * 100;
    return Math.round(adherence * 0.4 + consistency * 0.3 + proteinPct * 0.3);
  }, [weekStats]);

  // ─── Top Meals This Week (canonical util — shared with WeeklyInsightsCard) ──
  const topMeals = useMemo(
    () => calcTopMeals(history, dailyLog, now, 0, 3),
    [history, dailyLog, now],
  );

  // ─── Weekly Insight (narrative recap — PR 6a) ──────────────────────────────
  const weightTrend = useMemo(
    () => calcWeightTrend(snapshots, userProfile?.targetWeight ?? null, now),
    [snapshots, userProfile?.targetWeight, now],
  );
  const weekInsight = useMemo(() => {
    const target: MacroTarget = dailyMacros.target ?? { cal: 2400, pro: 180, carbs: 250, fats: 65 };
    const canonicalWeekStats = calcWeekMacros(history, target, 0, now);
    const unit = getBodyWeightUnit(unitSystem);
    const p2 = t.progress;
    return buildWeekInsight({
      weekStats: canonicalWeekStats,
      trend: weightTrend,
      mealStreak: streaks.mealLog,
      topMeal: topMeals[0] ?? null,
      userName: userProfile?.name,
      goalType: userProfile?.goal as 'loss' | 'gain' | 'maintain' | undefined,
      copy: {
        positive: p2?.weekInsightPositive,
        neutral: p2?.weekInsightNeutral,
        lowData: p2?.weekInsightLowData,
        lowDataWithName: p2?.weekInsightLowDataWithName,
        trendLabel: p2?.trendChip,
        streakLabel: p2?.streakChip,
        topMealLabel: p2?.topMealChip,
      },
      formatWeightDelta: (kg: number) => `${bodyWeightFromKg(kg, unitSystem).toFixed(1)} ${unit}`,
    });
  }, [history, dailyMacros, weightTrend, streaks.mealLog, topMeals, userProfile, unitSystem, t.progress, now]);

  // ─── Day Detail (for calendar tap) ──────────────────────────────────────────
  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    if (selectedDay === todayDate) {
      const todayCal = dailyLog.reduce((s, e) => s + (e.macros?.cal || 0), 0);
      const todayPro = dailyLog.reduce((s, e) => s + (e.macros?.pro || 0), 0);
      const rf = (realFeelLogs || []).find((l) => l.date && l.date.slice(0, 10) === todayDate);
      return { date: todayDate, cal: todayCal, pro: todayPro, mealCount: dailyLog.length, rfLevel: rf?.level };
    }
    const archive = history.find(h => h.date === selectedDay);
    if (!archive) return null;
    const rf = (realFeelLogs || []).find((l) => l.date && l.date.slice(0, 10) === selectedDay);
    return { date: archive.date, cal: archive.macros.consumed.cal, pro: archive.macros.consumed.pro, mealCount: archive.mealCount, rfLevel: rf?.level };
  }, [selectedDay, history, dailyLog, realFeelLogs, todayDate]);

  // ─── Bienestar (conditional on RF data) ─────────────────────────────────────
  const bienestar = useMemo(() => {
    const logs = realFeelLogs || [];
    if (logs.length < 3) return null;
    const { trend } = calcVitality(logs);
    const recent14 = logs.slice(0, 14);
    const rawAvg = recent14.reduce((s, l) => s + (l.level || 3), 0) / recent14.length;
    const correlations = getCorrelations(logs).slice(0, 2);
    const sparkData = [...recent14].reverse().map((l) => l.level || 3);
    return { rawAvg, trend, correlations, sparkData };
  }, [realFeelLogs]);

  // ─── Calendar Data ──────────────────────────────────────────────────────────
  const loggedDates = useMemo(() => {
    const set = new Set(history.filter(h => h.mealCount > 0).map(h => h.date));
    if (dailyLog.length > 0) set.add(todayDate);
    return set;
  }, [history, dailyLog, todayDate]);
  const rfDates = useMemo(
    () => new Set((realFeelLogs || []).map((l) => l.date ? l.date.slice(0, 10) : null).filter((d): d is string => d !== null)),
    [realFeelLogs],
  );

  // ─── Reflection ─────────────────────────────────────────────────────────────
  const weekStartDate = useMemo(() => {
    const ws = new Date(now);
    ws.setDate(now.getDate() - now.getDay());
    ws.setHours(0, 0, 0, 0);
    return ws;
  }, [now]);
  const weekStartISO = weekStartDate.toISOString();
  const latestEntry = weeklyEntries[0];

  const handleSaveReflection = () => {
    if (!workedWell.trim() && !whatWasHard.trim() && !focusNext.trim()) {
      toast.error(t.weekly?.fillOneField || 'Completa al menos un campo');
      return;
    }
    const thisWeekStart = getWeekStartISO(now);
    const thisWeekArchives = history.filter(h => h.date >= thisWeekStart);
    const mealsLogged = thisWeekArchives.reduce((s, h) => s + h.mealCount, 0) + dailyLog.length;

    const thisWeekRF = (realFeelLogs || []).filter((l) => l.date && l.date.slice(0, 10) >= thisWeekStart);
    const avgVitality = thisWeekRF.length > 0
      ? Math.round((thisWeekRF.reduce((s, l) => s + (l.level || 3), 0) / thisWeekRF.length) * 20)
      : 0;
    const consistencyDays = new Set(thisWeekArchives.map(h => h.date)).size + (dailyLog.length > 0 ? 1 : 0);

    const entry: WeeklyEntry = {
      id: Date.now(),
      weekStart: weekStartISO,
      workedWell: workedWell.trim(),
      whatWasHard: whatWasHard.trim(),
      focusNextWeek: focusNext.trim(),
      avgVitality,
      mealsLogged,
      consistencyDays,
    };
    setWeeklyEntries(prev => [entry, ...prev.filter(e => e.weekStart !== weekStartISO)]);
    toast.success(t.weekly?.reflectionSaved || 'Reflexión guardada');
    setReflectionOpen(false);
    setWorkedWell('');
    setWhatWasHard('');
    setFocusNext('');
  };

  const p = t.progress;

  // ─── Share a snapshot (routes through canonical handleShareProgress) ────────
  const shareSnapshot = (snap: BodySnapshot) => {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    const idx = sorted.findIndex(s => s.date === snap.date);
    const reference = idx > 0 ? sorted[idx - 1] : undefined;
    handleShareProgress({
      snapshot: snap,
      referenceSnapshot: reference,
      content: '',
      author: {
        id: 'self',
        name: userProfile?.name,
        img: userProfile?.avatar,
      },
    });
    toast.success(p?.shared || 'Progreso compartido');
    navigateTo('community');
  };

  // ─── Share a before/after pair (PR 6b) ─────────────────────────────────────
  const shareComparePair = (before: BodySnapshot, after: BodySnapshot) => {
    handleShareProgress({
      snapshot: after,
      referenceSnapshot: before,
      content: '',
      author: {
        id: 'self',
        name: userProfile?.name,
        img: userProfile?.avatar,
      },
    });
    toast.success(p?.shared || 'Progreso compartido');
    navigateTo('community');
  };

  const barLabels: Record<string, string> = { cal: 'kcal', pro: 'Prot', carbs: 'Carbs', fats: p?.fats || 'Grasas' };
  const dayHeaders: string[] = p?.dayHeaders || (locale === 'en' ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['D', 'L', 'M', 'X', 'J', 'V', 'S']);

  const bodySubTabs = [
    { id: 'summary' as const, label: p?.bodySummary || 'Resumen' },
    { id: 'history' as const, label: p?.bodyHistory || 'Historial' },
    { id: 'calendar' as const, label: p?.bodyCalendar || 'Calendario' },
  ];

  return (
    <PageShell maxWidth="narrow" spacing="lg">
      <PageHeader onBack={onBack} label="" title={p?.title || 'Tu Progreso'} />

      <WeeklyScoreCard
        weeklyScore={weeklyScore}
        weekStats={weekStats}
        hydration={hydration}
        movement={movement}
        barLabels={barLabels}
        t={{ thisWeekTitle: p?.thisWeekTitle, proteinTarget: p?.proteinTarget, daysLogged: p?.days }}
      />

      <WeeklyInsightsCard
        insight={weekInsight}
        title={p?.weeklyInsights || 'Resumen semanal'}
      />

      {/* ─── Tabs (Nutrition first — app core) ─── */}
      <div className="flex border border-outline-variant/20 rounded-sm overflow-hidden">
        <button type="button"
          onClick={() => setTab('nutrition')}
          className={`flex-1 py-3 font-headline text-micro font-bold uppercase tracking-widest transition-colors ${
            tab === 'nutrition' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
          }`}
        >
          {p?.nutrition || 'Nutrición'}
        </button>
        <button type="button"
          onClick={() => setTab('body')}
          className={`flex-1 py-3 font-headline text-micro font-bold uppercase tracking-widest transition-colors ${
            tab === 'body' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
          }`}
        >
          {p?.body || 'Cuerpo'}
        </button>
      </div>

      {/* ═══ NUTRITION TAB ═══ */}
      {tab === 'nutrition' && (
        <>
          {topMeals.length > 0 && (
            <SectionCard
              title={p?.topMeals || 'Tus comidas estrella'}
              icon={<UtensilsCrossed className="w-4 h-4 text-primary" />}
            >
              <div className="space-y-2">
                {topMeals.map((meal, i) => {
                  const medal = ['🥇', '🥈', '🥉'][i] || '';
                  return (
                    <div key={meal.name} className="flex items-center gap-3 p-2.5 bg-surface-container rounded-sm">
                      <span className="text-base shrink-0">{medal}</span>
                      <span className="flex-1 font-headline text-micro font-bold uppercase text-tertiary truncate">{meal.name}</span>
                      <span className="font-label text-micro text-on-surface-variant shrink-0">×{meal.count}</span>
                      <span className="font-label text-micro font-bold text-primary shrink-0">{Math.round(meal.totalCal / meal.count)} kcal</span>
                    </div>
                  );
                })}
              </div>
              <button type="button"
                onClick={() => navigateTo('food-dictionary')}
                className="w-full text-center text-micro font-bold text-primary uppercase tracking-widest hover:underline pt-2 border-t border-outline-variant/10"
              >
                {p?.viewAllRecipes || 'Ver todas las recetas →'}
              </button>
            </SectionCard>
          )}

          <ConsistencyCalendar
            todayStreak={streaks.mealLog.current}
            bestStreak={streaks.mealLog.best}
            loggedDates={loggedDates}
            rfDates={rfDates}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            selectedDayData={selectedDayData}
            onNavigateAddMeal={() => navigateTo('add-meal')}
            locale={locale}
            now={now}
            todayDate={todayDate}
            dayHeaders={dayHeaders}
            t={{
              consistency: p?.consistency,
              currentStreak: p?.currentStreak,
              bestStreak: p?.bestStreak,
              mealDot: p?.mealDot,
              rfDot: p?.rfDot,
              mealCount: p?.mealCount,
            }}
          />

          <InlineReflection
            latestEntry={latestEntry}
            reflectionOpen={reflectionOpen}
            onToggle={() => setReflectionOpen(!reflectionOpen)}
            workedWell={workedWell}
            setWorkedWell={setWorkedWell}
            whatWasHard={whatWasHard}
            setWhatWasHard={setWhatWasHard}
            focusNext={focusNext}
            setFocusNext={setFocusNext}
            onSave={handleSaveReflection}
            onNavigateHistory={() => navigateTo('weekly-check-in')}
            t={{ reflectionTitle: p?.reflectionTitle, noReflections: p?.noReflections, viewHistory: p?.viewHistory }}
            tWeekly={t.weekly || {}}
          />

          {bienestar && (
            <SectionCard
              spacing="lg"
              title={p?.wellbeingTitle || 'Bienestar'}
              icon={<Heart className="w-4 h-4 text-brand-secondary" />}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl">{EMOJI_MAP[Math.round(bienestar.rawAvg) - 1] || '😐'}</span>
                  <div>
                    <span className="font-headline font-black text-title text-primary">{bienestar.rawAvg.toFixed(1)}</span>
                    <span className="text-on-surface-variant text-sm ml-0.5">/5</span>
                  </div>
                </div>
                {bienestar.sparkData.length >= 3 && (
                  <svg viewBox="0 0 100 30" className="flex-1 h-8" aria-hidden="true">
                    <polyline
                      fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      points={bienestar.sparkData.map((v: number, i: number) => {
                        const x = (i / (bienestar.sparkData.length - 1)) * 100;
                        const y = 28 - ((v - 1) / 4) * 26;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </svg>
                )}
                <div className="shrink-0">
                  {bienestar.trend === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
                  {bienestar.trend === 'down' && <TrendingDown className="w-4 h-4 text-error" />}
                </div>
              </div>

              {bienestar.correlations.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-outline-variant/10">
                  <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
                    {p?.topCorrelations || 'Top correlaciones'}
                  </span>
                  {bienestar.correlations.map((cor: CorrelationInsight) => (
                    <div key={cor.id} className="flex items-center gap-3 p-2 bg-surface-container rounded-sm">
                      <span className="text-lg shrink-0">{cor.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-headline text-micro font-bold uppercase text-tertiary truncate">{cor.title}</p>
                        <p className="text-micro text-on-surface-variant truncate">{cor.detail}</p>
                      </div>
                      <span className={`font-label text-micro font-bold ${cor.confidence >= 0.7 ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {Math.round(cor.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button type="button"
                onClick={() => navigateTo('real-feel-diary')}
                className="w-full text-center text-micro font-bold text-primary uppercase tracking-widest hover:underline pt-2 border-t border-outline-variant/10"
              >
                {p?.viewDiary || 'Ver diario completo →'}
              </button>
            </SectionCard>
          )}
        </>
      )}

      {/* ═══ BODY TAB ═══ */}
      {tab === 'body' && (
        <>
          {/* Sub-tabs: Resumen | Historial | Calendario */}
          <div
            role="tablist"
            aria-label={p?.body || 'Cuerpo'}
            className="flex border border-outline-variant/20 rounded-sm overflow-hidden"
          >
            {bodySubTabs.map(st => (
              <button
                key={st.id}
                type="button"
                role="tab"
                aria-selected={bodySubTab === st.id}
                onClick={() => setBodySubTab(st.id)}
                className={`flex-1 min-h-11 py-2.5 font-headline text-micro font-bold uppercase tracking-widest transition-colors ${
                  bodySubTab === st.id ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {bodySubTab === 'summary' && (
            <>
              <WeightTrendCard
                snapshots={snapshots}
                targetKg={userProfile?.targetWeight ?? null}
                unitSystem={unitSystem}
                onLog={() => openWithDate()}
                t={{
                  weightTrend: p?.weightTrend,
                  thisWeek: p?.thisWeek,
                  weightRawLabel: p?.weightRawLabel,
                  trend7d: p?.trend7d,
                  trendHint: p?.trendHint,
                  start: p?.start,
                  change: p?.change,
                  noWeightData: p?.noWeightData,
                  logWeight: p?.logWeight,
                }}
              />
              <RitmoSection
                history={history}
                realFeelLogs={realFeelLogs || []}
                title={p?.ritmoTitle || 'Ritmo diario'}
                captionLabel={p?.dataSourceAutoRitmo || 'sumado desde Home'}
                labels={{
                  hydration: p?.ritmoHydration || 'Hidratación',
                  movement: p?.ritmoMovement || 'Movimiento',
                  vitality: p?.ritmoVitality || 'Real Feel',
                }}
                emptyLabel={p?.ritmoEmpty || 'Sin datos aún'}
                daysLabel={p?.days || 'días'}
              />
              <SectionCard title={p?.constants?.sectionTitle || 'Constantes'}>
                <BodyConstantsGrid
                  snapshots={snapshots}
                  heightCm={userProfile?.height}
                  unitSystem={unitSystem}
                  labels={{
                    weight: p?.constants?.weight || 'Peso',
                    bmi: p?.constants?.bmi || 'IMC',
                    bodyFat: p?.constants?.bodyFat || 'Grasa corporal',
                    waist: p?.constants?.waist || 'Cintura',
                    hips: p?.constants?.hips || 'Caderas',
                    chest: p?.constants?.chest || 'Pecho',
                  }}
                  copy={{
                    noData: p?.constants?.noData,
                    noRange: p?.constants?.noRange,
                    noTrends: p?.constants?.noTrends,
                    stable: p?.constants?.stable,
                  }}
                />
              </SectionCard>
            </>
          )}

          {bodySubTab === 'history' && (
            <BodyTimeline
              snapshots={snapshots}
              unitSystem={unitSystem}
              onShare={shareSnapshot}
              onShareCompare={shareComparePair}
              shareLabel={p?.shareSnapshot}
              goalType={userProfile?.goal as 'loss' | 'gain' | 'maintain' | undefined}
              onLogSnapshot={() => openWithDate()}
            />
          )}

          {bodySubTab === 'calendar' && (
            <BodyCalendar snapshots={snapshots} unitSystem={unitSystem} />
          )}
        </>
      )}
    </PageShell>
  );
}
