import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Heart, UtensilsCrossed } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { getLoggingStreak, type DailyArchive } from '../../../hooks/useDailyReset';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { calcVitality } from '../../home/utils/homeWidgets';
import { getCorrelations } from '../utils/correlations';
import PageHeader from '../../../components/patterns/PageHeader';
import { bodyWeightFromKg, bodyWeightToKg, getBodyWeightUnit } from '../../food/utils/units';
import { toast } from 'sonner';
import WeeklyScoreCard from '../components/WeeklyScoreCard';
import ConsistencyCalendar from '../components/ConsistencyCalendar';
import InlineReflection from '../components/InlineReflection';
import WeightTrendCard from '../components/WeightTrendCard';

interface WeightEntry { date: string; kg: number; note?: string }
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

/** B1 fix: DST-safe week start using Date math instead of multiplication */
function getWeekStartISO(date: Date): string {
  const ws = new Date(date);
  ws.setDate(date.getDate() - date.getDay());
  ws.setHours(0, 0, 0, 0);
  return ws.toISOString().slice(0, 10);
}

export default function Progress({ onBack }: { onBack: () => void }) {
  const { t, locale } = useI18n();
  const { navigateTo } = useNavigation();
  const { nutritionHistory, weightHistory, setWeightHistory, dailyMacros, dailyLog, realFeelLogs, userProfile, hydration, movement } = useAppState();
  const unitSystem = userProfile?.unitSystem ?? 'metric';
  const weightUnit = getBodyWeightUnit(unitSystem);

  const [tab, setTab] = useState<'body' | 'nutrition'>('nutrition');
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [workedWell, setWorkedWell] = useState('');
  const [whatWasHard, setWhatWasHard] = useState('');
  const [focusNext, setFocusNext] = useState('');
  const [weeklyEntries, setWeeklyEntries] = useLocalStorageState<WeeklyEntry[]>('weeklyCheckIns', []);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const history = nutritionHistory as DailyArchive[];
  const weights = weightHistory as WeightEntry[];
  const streak = getLoggingStreak(history);
  const todayStreak = dailyLog.length > 0 ? streak.current + 1 : streak.current;
  const now = new Date();
  const todayDate = now.toISOString().slice(0, 10);

  // ─── This Week Stats ────────────────────────────────────────────────────────
  const weekStats = useMemo(() => {
    const thisWeekStart = getWeekStartISO(now);
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekStart = getWeekStartISO(lastWeekDate);

    const thisWeekDays = history.filter(h => h.date >= thisWeekStart);
    const lastWeekDays = history.filter(h => h.date >= lastWeekStart && h.date < thisWeekStart);

    const avg = (entries: DailyArchive[], key: 'cal' | 'pro' | 'carbs' | 'fats') => {
      if (entries.length === 0) return 0;
      return Math.round(entries.reduce((s, e) => s + (e.macros.consumed[key] || 0), 0) / entries.length);
    };

    const thisAvg = { cal: avg(thisWeekDays, 'cal'), pro: avg(thisWeekDays, 'pro'), carbs: avg(thisWeekDays, 'carbs'), fats: avg(thisWeekDays, 'fats') };
    const lastAvg = { cal: avg(lastWeekDays, 'cal'), pro: avg(lastWeekDays, 'pro'), carbs: avg(lastWeekDays, 'carbs'), fats: avg(lastWeekDays, 'fats') };

    const target = dailyMacros.target ?? { cal: 2400, pro: 180, carbs: 250, fats: 65 };
    const proteinHitDays = thisWeekDays.filter(h => h.macros.consumed.pro >= (target.pro || 180) * 0.9).length;
    const calDelta = lastAvg.cal > 0 ? Math.round(((thisAvg.cal - lastAvg.cal) / lastAvg.cal) * 100) : 0;

    const bars = (['cal', 'pro', 'carbs', 'fats'] as const).map(key => {
      const targetVal = target[key] || 1;
      const pct = Math.min(150, Math.round((thisAvg[key] / targetVal) * 100));
      return { key, pct, avg: thisAvg[key], target: targetVal };
    });

    return { thisAvg, lastAvg, calDelta, proteinHitDays, daysLogged: thisWeekDays.length, bars };
  }, [history, dailyMacros]);

  // ─── Weekly Score (0-100) ───────────────────────────────────────────────────
  const weeklyScore = useMemo(() => {
    if (weekStats.daysLogged === 0) return 0;
    const adherence = weekStats.bars.reduce((s, b) => s + Math.min(100, b.pct), 0) / 4;
    const consistency = (weekStats.daysLogged / 7) * 100;
    const proteinPct = (weekStats.proteinHitDays / weekStats.daysLogged) * 100;
    return Math.round(adherence * 0.4 + consistency * 0.3 + proteinPct * 0.3);
  }, [weekStats]);

  // ─── Top Meals This Week ────────────────────────────────────────────────────
  const topMeals = useMemo(() => {
    const thisWeekStart = getWeekStartISO(now);
    const weekArchives = history.filter(h => h.date >= thisWeekStart);
    const counts: Record<string, { name: string; count: number; totalCal: number }> = {};

    for (const archive of weekArchives) {
      const entries = archive.dailyLog || [];
      for (const entry of entries) {
        const name = entry.title || entry.name;
        if (!name) continue;
        if (!counts[name]) counts[name] = { name, count: 0, totalCal: 0 };
        counts[name].count += 1;
        counts[name].totalCal += entry.macros?.cal || 0;
      }
    }
    // Also count today's log (not yet archived)
    for (const entry of dailyLog) {
      const name = (entry as any).title || (entry as any).name;
      if (!name) continue;
      if (!counts[name]) counts[name] = { name, count: 0, totalCal: 0 };
      counts[name].count += 1;
      counts[name].totalCal += (entry as any).macros?.cal || 0;
    }

    return Object.values(counts)
      .sort((a, b) => b.count - a.count || b.totalCal - a.totalCal)
      .slice(0, 3);
  }, [history, dailyLog]);

  // ─── Day Detail (for calendar tap) ──────────────────────────────────────────
  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    if (selectedDay === todayDate) {
      const todayCal = dailyLog.reduce((s: number, e: any) => s + (e.macros?.cal || 0), 0);
      const todayPro = dailyLog.reduce((s: number, e: any) => s + (e.macros?.pro || 0), 0);
      const rf = (realFeelLogs || []).find((l: any) => l.date && l.date.slice(0, 10) === todayDate);
      return { date: todayDate, cal: todayCal, pro: todayPro, mealCount: dailyLog.length, rfLevel: rf?.level };
    }
    const archive = history.find(h => h.date === selectedDay);
    if (!archive) return null;
    const rf = (realFeelLogs || []).find((l: any) => l.date && l.date.slice(0, 10) === selectedDay);
    return { date: archive.date, cal: archive.macros.consumed.cal, pro: archive.macros.consumed.pro, mealCount: archive.mealCount, rfLevel: rf?.level };
  }, [selectedDay, history, dailyLog, realFeelLogs]);

  // ─── Bienestar (conditional on RF data) ─────────────────────────────────────
  // B5 fix: standardize on rawAvg (1-5 scale) everywhere
  const bienestar = useMemo(() => {
    const logs = realFeelLogs || [];
    if (logs.length < 3) return null;
    const { trend } = calcVitality(logs);
    const recent14 = logs.slice(0, 14);
    const rawAvg = recent14.reduce((s: number, l: any) => s + (l.level || 3), 0) / recent14.length;
    const correlations = getCorrelations(logs).slice(0, 2);
    const sparkData = [...recent14].reverse().map((l: any) => l.level || 3);
    return { rawAvg, trend, correlations, sparkData };
  }, [realFeelLogs]);

  // ─── Weight ─────────────────────────────────────────────────────────────────
  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].kg : null;
  const firstWeight = sortedWeights.length > 0 ? sortedWeights[0].kg : null;
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const recentWeights = sortedWeights.filter(w => w.date >= weekAgo);
  const weekDelta = recentWeights.length >= 2 ? recentWeights[recentWeights.length - 1].kg - recentWeights[0].kg : null;

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

  // ─── Calendar Data ──────────────────────────────────────────────────────────
  const loggedDates = useMemo(() => {
    const set = new Set(history.filter(h => h.mealCount > 0).map(h => h.date));
    if (dailyLog.length > 0) set.add(todayDate);
    return set;
  }, [history, dailyLog]);
  const rfDates = useMemo(() => new Set((realFeelLogs || []).map((l: any) => l.date ? l.date.slice(0, 10) : null).filter(Boolean)), [realFeelLogs]);

  // ─── Reflection ─────────────────────────────────────────────────────────────
  const weekStartDate = useMemo(() => {
    const ws = new Date(now);
    ws.setDate(now.getDate() - now.getDay());
    ws.setHours(0, 0, 0, 0);
    return ws;
  }, []);
  const weekStartISO = weekStartDate.toISOString();
  const latestEntry = weeklyEntries[0];

  const handleSaveReflection = () => {
    if (!workedWell.trim() && !whatWasHard.trim() && !focusNext.trim()) {
      toast.error(t.weekly?.fillOneField || 'Completa al menos un campo');
      return;
    }
    // B4 fix: count meals from history, not RF logs
    const thisWeekStart = getWeekStartISO(now);
    const thisWeekArchives = history.filter(h => h.date >= thisWeekStart);
    const mealsLogged = thisWeekArchives.reduce((s, h) => s + h.mealCount, 0) + dailyLog.length;

    const thisWeekRF = (realFeelLogs || []).filter((l: any) => l.date && l.date.slice(0, 10) >= thisWeekStart);
    const avgVitality = thisWeekRF.length > 0
      ? Math.round((thisWeekRF.reduce((s: number, l: any) => s + (l.level || 3), 0) / thisWeekRF.length) * 20)
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
  const barLabels: Record<string, string> = { cal: 'kcal', pro: 'Prot', carbs: 'Carbs', fats: p?.fats || 'Grasas' };
  // B3 fix: i18n day headers
  const dayHeaders: string[] = (p as any)?.dayHeaders || (locale === 'en' ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['D', 'L', 'M', 'X', 'J', 'V', 'S']);

  return (
    <PageShell maxWidth="narrow" spacing="lg">
      <PageHeader onBack={onBack} label="" title={p?.title || 'Tu Progreso'} />

      {/* ─── Esta Semana (merged: score + stats + activity + adherence w/ deltas) ─── */}
      <WeeklyScoreCard
        weeklyScore={weeklyScore}
        weekStats={weekStats}
        hydration={hydration}
        movement={movement}
        barLabels={barLabels}
        t={{ thisWeekTitle: p?.thisWeekTitle, proteinTarget: p?.proteinTarget, daysLogged: p?.days }}
      />

      {/* ─── Tabs (Nutrition first — app core) ─── */}
      <div className="flex border border-outline-variant/20 rounded-sm overflow-hidden">
        <button type="button"
          onClick={() => setTab('nutrition')}
          className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${
            tab === 'nutrition' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
          }`}
        >
          {p?.nutrition || 'Nutrición'}
        </button>
        <button type="button"
          onClick={() => setTab('body')}
          className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${
            tab === 'body' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
          }`}
        >
          {p?.body || 'Cuerpo'}
        </button>
      </div>

      {/* ═══ NUTRITION TAB ═══ */}
      {tab === 'nutrition' && (
        <>
          {/* R2: Nutrition Summary section REMOVED — merged into WeeklyScoreCard adherence bars */}

          {/* Top Meals This Week */}
          {topMeals.length > 0 && (
            <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-3">
              <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-primary" /> {p?.topMeals || 'Tus comidas estrella'}
              </h2>
              <div className="space-y-2">
                {topMeals.map((meal, i) => {
                  const medal = ['🥇', '🥈', '🥉'][i] || '';
                  return (
                    <div key={meal.name} className="flex items-center gap-3 p-2.5 bg-surface-container rounded-sm">
                      <span className="text-base shrink-0">{medal}</span>
                      <span className="flex-1 font-headline text-xs font-bold uppercase text-tertiary truncate">{meal.name}</span>
                      <span className="font-label text-[9px] text-on-surface-variant shrink-0">×{meal.count}</span>
                      <span className="font-label text-[9px] font-bold text-primary shrink-0">{Math.round(meal.totalCal / meal.count)} kcal</span>
                    </div>
                  );
                })}
              </div>
              <button type="button"
                onClick={() => navigateTo('food-dictionary')}
                className="w-full text-center text-[10px] font-bold text-primary uppercase tracking-widest hover:underline pt-2 border-t border-outline-variant/10"
              >
                {p?.viewAllRecipes || 'Ver todas las recetas →'}
              </button>
            </section>
          )}

          {/* Consistency Calendar */}
          <ConsistencyCalendar
            todayStreak={todayStreak}
            bestStreak={streak.best}
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

          {/* Inline Reflection */}
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

          {/* Bienestar Section (conditional on ≥3 RF entries) — B5 fix: /5 scale */}
          {bienestar && (
            <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-4">
              <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-secondary" /> {p?.wellbeingTitle || 'Bienestar'}
              </h2>

              {/* Score /5 + mini sparkline */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl">{EMOJI_MAP[Math.round(bienestar.rawAvg) - 1] || '😐'}</span>
                  <div>
                    <span className="font-headline font-black text-2xl text-primary">{bienestar.rawAvg.toFixed(1)}</span>
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

              {/* Top 2 correlations */}
              {bienestar.correlations.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-outline-variant/10">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                    {p?.topCorrelations || 'Top correlaciones'}
                  </span>
                  {bienestar.correlations.map((cor: any) => (
                    <div key={cor.id} className="flex items-center gap-3 p-2 bg-surface-container rounded-sm">
                      <span className="text-lg shrink-0">{cor.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-headline text-xs font-bold uppercase text-tertiary truncate">{cor.title}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{cor.detail}</p>
                      </div>
                      <span className={`font-label text-[9px] font-bold ${cor.confidence >= 0.7 ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {Math.round(cor.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button type="button"
                onClick={() => navigateTo('real-feel-diary')}
                className="w-full text-center text-[10px] font-bold text-primary uppercase tracking-widest hover:underline pt-2 border-t border-outline-variant/10"
              >
                {p?.viewDiary || 'Ver diario completo →'}
              </button>
            </section>
          )}
        </>
      )}

      {/* ═══ BODY TAB ═══ */}
      {tab === 'body' && (
        <WeightTrendCard
          weights={weights}
          currentWeight={currentWeight}
          firstWeight={firstWeight}
          weekDelta={weekDelta}
          isEditingWeight={isEditingWeight}
          setIsEditingWeight={setIsEditingWeight}
          weightInput={weightInput}
          setWeightInput={setWeightInput}
          onLogWeight={handleLogWeight}
          unitSystem={unitSystem}
          weightUnit={weightUnit}
          bodyWeightFromKg={bodyWeightFromKg}
          t={{
            weightTrend: p?.weightTrend,
            thisWeek: p?.thisWeek,
            current: p?.current,
            start: p?.start,
            change: p?.change,
            noWeightData: p?.noWeightData,
            logWeight: p?.logWeight,
          }}
        />
      )}
    </PageShell>
  );
}
