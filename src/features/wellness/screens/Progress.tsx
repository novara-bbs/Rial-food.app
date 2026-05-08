import { useState, useMemo } from 'react';
import PageShell from '../../../components/PageShell';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { type DailyArchive } from '../../../hooks/useDailyReset';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
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
import TopMealsCard from '../components/TopMealsCard';
import BienestarCard from '../components/BienestarCard';
import SectionCard from '@/components/SectionCard';
import { useLogSnapshot } from '../hooks/useLogSnapshot';
import { useProgressData } from '../hooks/useProgressData';
import { useReflectionForm, type WeeklyEntry } from '../hooks/useReflectionForm';
import type { BodySnapshot } from '../../../types/wellness';

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
  const [weeklyEntries, setWeeklyEntries] = useLocalStorageState<WeeklyEntry[]>('weeklyCheckIns', []);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const history = nutritionHistory as DailyArchive[];
  const snapshots = weightHistory as BodySnapshot[];
  const now = useMemo(() => new Date(), []);
  const todayDate = useMemo(() => now.toISOString().slice(0, 10), [now]);

  const {
    streaks,
    weekStats,
    weeklyScore,
    topMeals,
    weekInsight,
    selectedDayData,
    bienestar,
    loggedDates,
    rfDates,
  } = useProgressData({
    history,
    snapshots,
    realFeelLogs: realFeelLogs || [],
    dailyLog,
    dailyMacros,
    userProfile: userProfile ?? null,
    selectedDay,
    now,
    todayDate,
    unitSystem,
    t,
  });

  const weekStartISO = useMemo(() => {
    const ws = new Date(now);
    ws.setDate(now.getDate() - now.getDay());
    ws.setHours(0, 0, 0, 0);
    return ws.toISOString();
  }, [now]);

  const reflection = useReflectionForm({
    weekStartISO,
    history,
    realFeelLogs: realFeelLogs || [],
    dailyLog,
    now,
    setWeeklyEntries,
    t,
  });
  const latestEntry = weeklyEntries[0];

  const p = t.progress;

  const shareSnapshot = (snap: BodySnapshot) => {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    const idx = sorted.findIndex((s) => s.date === snap.date);
    const reference = idx > 0 ? sorted[idx - 1] : undefined;
    handleShareProgress({
      snapshot: snap,
      referenceSnapshot: reference,
      content: '',
      author: { id: 'self', name: userProfile?.name, img: userProfile?.avatar },
    });
    toast.success(p?.shared || 'Progreso compartido');
    navigateTo('community');
  };

  const shareComparePair = (before: BodySnapshot, after: BodySnapshot) => {
    handleShareProgress({
      snapshot: after,
      referenceSnapshot: before,
      content: '',
      author: { id: 'self', name: userProfile?.name, img: userProfile?.avatar },
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
          <TopMealsCard
            meals={topMeals}
            title={p?.topMeals || 'Tus comidas estrella'}
            viewAllLabel={p?.viewAllRecipes || 'Ver todas las recetas →'}
            onViewAll={() => navigateTo('food-dictionary')}
          />

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
            reflectionOpen={reflection.reflectionOpen}
            onToggle={() => reflection.setReflectionOpen(!reflection.reflectionOpen)}
            workedWell={reflection.workedWell}
            setWorkedWell={reflection.setWorkedWell}
            whatWasHard={reflection.whatWasHard}
            setWhatWasHard={reflection.setWhatWasHard}
            focusNext={reflection.focusNext}
            setFocusNext={reflection.setFocusNext}
            onSave={reflection.handleSave}
            onNavigateHistory={() => navigateTo('weekly-check-in')}
            t={{ reflectionTitle: p?.reflectionTitle, noReflections: p?.noReflections, viewHistory: p?.viewHistory }}
            tWeekly={t.weekly || {}}
          />

          {bienestar && (
            <BienestarCard
              bienestar={bienestar}
              title={p?.wellbeingTitle || 'Bienestar'}
              topCorrelationsLabel={p?.topCorrelations || 'Top correlaciones'}
              viewDiaryLabel={p?.viewDiary || 'Ver diario completo →'}
              onViewDiary={() => navigateTo('real-feel-diary')}
            />
          )}
        </>
      )}

      {/* ═══ BODY TAB ═══ */}
      {tab === 'body' && (
        <>
          <div
            role="tablist"
            aria-label={p?.body || 'Cuerpo'}
            className="flex border border-outline-variant/20 rounded-sm overflow-hidden"
          >
            {bodySubTabs.map((st) => (
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

export type { WeeklyEntry } from '../hooks/useReflectionForm';
