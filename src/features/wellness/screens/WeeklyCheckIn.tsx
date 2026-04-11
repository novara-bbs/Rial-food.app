import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Target, ClipboardList, Utensils } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { useAppState } from '../../../contexts/AppStateContext';
import { useI18n } from '../../../i18n';
import { DailyArchive } from '../../../hooks/useDailyReset';
import PageHeader from '../../../components/patterns/PageHeader';

interface WeeklyEntry {
  id: number;
  weekStart: string; // ISO date
  workedWell: string;
  whatWasHard: string;
  focusNextWeek: string;
  avgVitality: number; // 0-100
  mealsLogged: number;
  consistencyDays: number;
}

export default function WeeklyCheckIn({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { realFeelLogs, mealPlan, nutritionHistory, dailyMacros } = useAppState();
  const [weeklyEntries, setWeeklyEntries] = useLocalStorageState<WeeklyEntry[]>('weeklyCheckIns', []);
  const [viewingPast, setViewingPast] = useState(false);
  const [pastIndex, setPastIndex] = useState(0);

  const [workedWell, setWorkedWell] = useState('');
  const [whatWasHard, setWhatWasHard] = useState('');
  const [focusNext, setFocusNext] = useState('');

  // Compute this week's stats
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekLogs = realFeelLogs.filter((l: any) => l.date && new Date(l.date) >= weekStart);
  const avgVitality = thisWeekLogs.length > 0
    ? Math.round((thisWeekLogs.reduce((s: number, l: any) => s + (l.level || 3), 0) / thisWeekLogs.length) * 20)
    : 0;
  const consistencyDays = new Set(thisWeekLogs.map((l: any) => l.date ? new Date(l.date).toDateString() : null).filter(Boolean)).size;
  const totalPlannedThisWeek = Object.values(mealPlan || {}).reduce((s: number, meals: any) => s + (meals?.length || 0), 0);

  // Nutrition trends from archived history
  const nutritionTrends = useMemo(() => {
    const history = nutritionHistory as DailyArchive[];
    if (history.length === 0) return null;

    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekStr = prevWeekStart.toISOString().slice(0, 10);

    const thisWeek = history.filter(h => h.date >= weekStartStr);
    const prevWeek = history.filter(h => h.date >= prevWeekStr && h.date < weekStartStr);

    const avg = (entries: DailyArchive[], key: 'cal' | 'pro' | 'carbs' | 'fats') => {
      if (entries.length === 0) return 0;
      return Math.round(entries.reduce((s, e) => s + (e.macros.consumed[key] || 0), 0) / entries.length);
    };

    const thisAvg = { cal: avg(thisWeek, 'cal'), pro: avg(thisWeek, 'pro'), carbs: avg(thisWeek, 'carbs'), fats: avg(thisWeek, 'fats') };
    const prevAvg = { cal: avg(prevWeek, 'cal'), pro: avg(prevWeek, 'pro'), carbs: avg(prevWeek, 'carbs'), fats: avg(prevWeek, 'fats') };

    const target = dailyMacros?.target || { cal: 2400, pro: 180, carbs: 250, fats: 65 };
    const proteinDaysHit = thisWeek.filter(d => (d.macros.consumed.pro || 0) >= target.pro * 0.9).length;

    return {
      thisWeekDays: thisWeek.length,
      prevWeekDays: prevWeek.length,
      thisAvg,
      prevAvg,
      proteinDaysHit,
      totalDaysThisWeek: thisWeek.length,
    };
  }, [nutritionHistory, weekStart, dailyMacros]);

  const TrendIcon = ({ current, previous }: { current: number; previous: number }) => {
    if (previous === 0) return <Minus className="w-3 h-3 text-on-surface-variant" />;
    const diff = ((current - previous) / previous) * 100;
    if (diff > 5) return <TrendingUp className="w-3 h-3 text-primary" />;
    if (diff < -5) return <TrendingDown className="w-3 h-3 text-error" />;
    return <Minus className="w-3 h-3 text-on-surface-variant" />;
  };

  const handleSave = () => {
    if (!workedWell.trim() && !whatWasHard.trim() && !focusNext.trim()) {
      toast.error(t.weekly.fillOneField);
      return;
    }
    const entry: WeeklyEntry = {
      id: Date.now(),
      weekStart: weekStart.toISOString(),
      workedWell: workedWell.trim(),
      whatWasHard: whatWasHard.trim(),
      focusNextWeek: focusNext.trim(),
      avgVitality,
      mealsLogged: thisWeekLogs.length,
      consistencyDays,
    };
    setWeeklyEntries(prev => [entry, ...prev]);
    toast.success(t.weekly.reflectionSaved);
    onBack();
  };

  const pastEntry = weeklyEntries[pastIndex];

  const vitalityLabel = (v: number) => v >= 75 ? t.weekly.vitalityHigh : v >= 50 ? t.weekly.vitalityMedium : v > 0 ? t.weekly.vitalityLow : '—';

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-6 pb-24">
      <PageHeader onBack={onBack} title={t.weekly.title} />

      {/* Toggle: current / history */}
      <div className="flex border border-outline-variant/20 rounded-sm overflow-hidden">
        <button type="button"
          onClick={() => setViewingPast(false)}
          className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${!viewingPast ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}
        >
          {t.weekly.thisWeek}
        </button>
        <button type="button"
          onClick={() => setViewingPast(true)}
          className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${viewingPast ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}
        >
          {t.weekly.history} ({weeklyEntries.length})
        </button>
      </div>

      {!viewingPast ? (
        <>
          {/* This week's stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">{t.weekly.vitality}</span>
              <span className="font-headline font-black text-2xl text-primary">{avgVitality > 0 ? avgVitality : '—'}</span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">/100</span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">{t.weekly.logs}</span>
              <span className="font-headline font-black text-2xl text-brand-secondary">{thisWeekLogs.length}</span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">{t.weekly.rfEntries}</span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">{t.weekly.consistency}</span>
              <span className="font-headline font-black text-2xl text-tertiary">{consistencyDays}/7</span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">{t.weekly.days}</span>
            </div>
          </div>

          {/* Nutrition summary */}
          {nutritionTrends && nutritionTrends.thisWeekDays > 0 && (
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-3">
              <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary flex items-center gap-2">
                <Utensils className="w-4 h-4 text-primary" /> {t.weekly.nutritionSummary}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{t.weekly.avgCalories}</span>
                  <span className="font-headline font-bold text-sm text-tertiary flex items-center gap-1">
                    {nutritionTrends.thisAvg.cal}
                    <TrendIcon current={nutritionTrends.thisAvg.cal} previous={nutritionTrends.prevAvg.cal} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{t.weekly.avgProtein}</span>
                  <span className="font-headline font-bold text-sm text-primary flex items-center gap-1">
                    {nutritionTrends.thisAvg.pro}g
                    <TrendIcon current={nutritionTrends.thisAvg.pro} previous={nutritionTrends.prevAvg.pro} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{t.weekly.avgCarbs}</span>
                  <span className="font-headline font-bold text-sm text-tertiary flex items-center gap-1">
                    {nutritionTrends.thisAvg.carbs}g
                    <TrendIcon current={nutritionTrends.thisAvg.carbs} previous={nutritionTrends.prevAvg.carbs} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{t.weekly.avgFats}</span>
                  <span className="font-headline font-bold text-sm text-tertiary flex items-center gap-1">
                    {nutritionTrends.thisAvg.fats}g
                    <TrendIcon current={nutritionTrends.thisAvg.fats} previous={nutritionTrends.prevAvg.fats} />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                  {t.weekly.proteinTarget.replace('{count}', String(nutritionTrends.proteinDaysHit)).replace('{total}', String(nutritionTrends.totalDaysThisWeek))}
                </span>
                {nutritionTrends.prevWeekDays > 0 && (
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                    {t.weekly.vsLastWeek}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reflection fields */}
          <div className="space-y-4">
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-widest text-primary block mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> {t.weekly.workedWellLabel}
              </label>
              <textarea
                value={workedWell}
                onChange={e => setWorkedWell(e.target.value)}
                placeholder={t.weekly.workedWellPlaceholder}
                rows={3}
                className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-widest text-error block mb-2">
                <XCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> {t.weekly.whatWasHardLabel}
              </label>
              <textarea
                value={whatWasHard}
                onChange={e => setWhatWasHard(e.target.value)}
                placeholder={t.weekly.whatWasHardPlaceholder}
                rows={3}
                className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-widest text-brand-secondary block mb-2">
                <Target className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> {t.weekly.focusNextLabel}
              </label>
              <textarea
                value={focusNext}
                onChange={e => setFocusNext(e.target.value)}
                placeholder={t.weekly.focusNextPlaceholder}
                rows={3}
                className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <button type="button"
            onClick={handleSave}
            className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            {t.weekly.saveReflection}
          </button>
        </>
      ) : (
        /* Past entries */
        <div className="space-y-6">
          {weeklyEntries.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-10 h-10 text-on-surface-variant/40 mb-4" />
              <p className="text-on-surface-variant font-body">{t.weekly.noReflections}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button type="button"
                  onClick={() => setPastIndex(Math.min(pastIndex + 1, weeklyEntries.length - 1))}
                  disabled={pastIndex >= weeklyEntries.length - 1}
                  className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                  {t.weekly.weekOf} {new Date(pastEntry.weekStart).toLocaleDateString()}
                </span>
                <button type="button"
                  onClick={() => setPastIndex(Math.max(pastIndex - 1, 0))}
                  disabled={pastIndex <= 0}
                  className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{t.weekly.vitality}</span>
                  <span className="font-headline font-black text-xl text-primary">{pastEntry.avgVitality}</span>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{t.weekly.logs}</span>
                  <span className="font-headline font-black text-xl text-brand-secondary">{pastEntry.mealsLogged}</span>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{t.weekly.days}</span>
                  <span className="font-headline font-black text-xl text-tertiary">{pastEntry.consistencyDays}/7</span>
                </div>
              </div>

              {pastEntry.workedWell && (
                <div className="bg-surface-container-low border border-primary/20 rounded-sm p-4">
                  <p className="font-label text-[9px] uppercase tracking-widest text-primary mb-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t.weekly.workedWell}</p>
                  <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.workedWell}</p>
                </div>
              )}
              {pastEntry.whatWasHard && (
                <div className="bg-surface-container-low border border-error/20 rounded-sm p-4">
                  <p className="font-label text-[9px] uppercase tracking-widest text-error mb-2 flex items-center gap-1"><XCircle className="w-3 h-3" /> {t.weekly.wasHard}</p>
                  <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.whatWasHard}</p>
                </div>
              )}
              {pastEntry.focusNextWeek && (
                <div className="bg-surface-container-low border border-brand-secondary/20 rounded-sm p-4">
                  <p className="font-label text-[9px] uppercase tracking-widest text-brand-secondary mb-2 flex items-center gap-1"><Target className="w-3 h-3" /> {t.weekly.focus}</p>
                  <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.focusNextWeek}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
