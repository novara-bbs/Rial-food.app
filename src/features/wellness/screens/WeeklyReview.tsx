import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, CalendarDays, Target, Flame, Activity, Droplet, ChevronRight } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import SectionCard from '../../../components/SectionCard';
import PageHeader from '../../../components/patterns/PageHeader';
import { useAppState } from '../../../contexts/AppStateContext';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { getCorrelations, type CorrelationInsight } from '../utils/correlations';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import { calcWeekMacros } from '../utils/week-stats';
import DataSourceCaption from '../components/DataSourceCaption';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaySummary {
  date: string;
  label: string;
  rfLevel: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekBounds(): { weekStart: Date; weekEnd: Date } {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WeeklyReview({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { realFeelLogs, nutritionHistory, dailyMacros } = useAppState();

  const { weekStart, weekEnd } = useMemo(getWeekBounds, []);

  // ── Macro stats for the week (Q13: canonical calcWeekMacros) ───────────────
  const macroStats = useMemo(() => {
    const history = (nutritionHistory ?? []) as DailyArchive[];
    const target = dailyMacros?.target ?? { cal: 2000, pro: 120, carbs: 220, fats: 60 };
    const stats = calcWeekMacros(history, target, 0);
    return stats.daysLogged > 0 ? stats : null;
  }, [nutritionHistory, dailyMacros]);

  // ── Real Feel stats for the week ────────────────────────────────────────────
  const rfStats = useMemo(() => {
    const thisWeekLogs = (realFeelLogs as any[]).filter(l => {
      if (!l.date) return false;
      const d = new Date(l.date);
      return d >= weekStart && d <= weekEnd;
    });

    if (thisWeekLogs.length === 0) return null;

    const validLogs = thisWeekLogs.filter((l: any) => l.level != null && l.level >= 1);
    const avgLevel = validLogs.length > 0
      ? validLogs.reduce((s: number, l: any) => s + l.level, 0) / validLogs.length
      : 3;

    // Group by day to find best/worst
    const byDay: Record<string, number[]> = {};
    for (const log of thisWeekLogs) {
      const day = log.date?.slice(0, 10) ?? '';
      if (!byDay[day]) byDay[day] = [];
      if (log.level != null && log.level >= 1) byDay[day].push(log.level);
    }

    const daySummaries: DaySummary[] = Object.entries(byDay).map(([date, levels]) => ({
      date,
      label: formatDayLabel(date),
      rfLevel: Math.round(levels.reduce((s, v) => s + v, 0) / levels.length),
    }));

    daySummaries.sort((a, b) => a.date.localeCompare(b.date));

    const bestDay = daySummaries.reduce((best, d) => d.rfLevel > best.rfLevel ? d : best, daySummaries[0]);
    const worstDay = daySummaries.reduce((worst, d) => d.rfLevel < worst.rfLevel ? d : worst, daySummaries[0]);

    return {
      avgLevel: Math.round(avgLevel * 10) / 10,
      daysLogged: Object.keys(byDay).length,
      bestDay,
      worstDay: worstDay.rfLevel < bestDay.rfLevel ? worstDay : null,
    };
  }, [realFeelLogs, weekStart, weekEnd]);

  // ── Top correlations ────────────────────────────────────────────────────────
  const topInsights = useMemo<CorrelationInsight[]>(() => {
    const insights = getCorrelations(realFeelLogs as any[]);
    return insights.slice(0, 3);
  }, [realFeelLogs]);

  // ── Adherence colour ────────────────────────────────────────────────────────
  const adherenceColor = (pct: number) => {
    if (pct >= 90) return 'text-primary';
    if (pct >= 70) return 'text-brand-secondary';
    return 'text-error';
  };

  const toneColor: Record<string, string> = {
    positive: 'bg-primary/10 border-primary/20 text-primary',
    warning: 'bg-error/10 border-error/20 text-error',
    neutral: 'bg-surface-container-highest border-outline-variant/20 text-on-surface-variant',
  };

  const hasSomething = !!macroStats || !!rfStats;

  return (
    <PageShell maxWidth="default" spacing="lg">
      <PageHeader title={t.weeklyReview.title} onBack={onBack} />

      <div className="mb-4">
        <DataSourceCaption kind="auto" label={t.weeklyReview.dataSourceGlobal ?? 'agregado de esta semana'} />
      </div>

      <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-6">
        {t.weeklyReview.subtitle}
      </p>

      {!hasSomething && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <CalendarDays className="w-12 h-12 text-outline-variant" />
          <p className="font-headline text-lg font-bold text-tertiary">{t.weeklyReview.noData}</p>
          <p className="text-sm text-on-surface-variant max-w-xs">{t.weeklyReview.noDataDesc}</p>
        </div>
      )}

      {/* ── Macro Adherence ─────────────────────────────────────────────────── */}
      {macroStats && (
        <section className="mb-6">
          <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            {t.weeklyReview.macroAdherence}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: t.weeklyReview.calories, value: macroStats.avg.cal, pct: macroStats.adherence.cal, unit: 'kcal', Icon: Flame },
              { label: t.weeklyReview.protein, value: macroStats.avg.pro, pct: macroStats.adherence.pro, unit: 'g', Icon: Activity },
              { label: t.weeklyReview.carbs, value: macroStats.avg.carbs, pct: macroStats.adherence.carbs, unit: 'g', Icon: Droplet },
              { label: t.weeklyReview.fats, value: macroStats.avg.fats, pct: macroStats.adherence.fats, unit: 'g', Icon: Minus },
            ].map(({ label, value, pct, unit, Icon }) => (
              <SectionCard key={label} padding="sm" spacing="sm">
                <div className="flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5 text-on-surface-variant" aria-hidden="true" />
                  <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">{label}</span>
                </div>
                <p className="font-headline font-bold text-lg text-tertiary">{value}{unit}</p>
                <p className={`font-label text-xs font-bold ${adherenceColor(pct)}`}>{pct}% {t.weeklyReview.targetLabel}</p>
                {/* Progress bar */}
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-primary' : pct >= 70 ? 'bg-brand-secondary' : 'bg-error'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </SectionCard>
            ))}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 text-right">
            {macroStats.daysLogged} {t.weeklyReview.daysLogged} · {t.weeklyReview.avgLabel}
          </p>
        </section>
      )}

      {/* ── Real Feel Summary ───────────────────────────────────────────────── */}
      {rfStats && (
        <section className="mb-6">
          <div className="grid grid-cols-3 gap-2">
            <SectionCard padding="sm" spacing="sm" className="text-center col-span-1">
              <span className="font-headline font-bold text-2xl text-primary block">{rfStats.avgLevel}</span>
              <p className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
                {t.weeklyReview.avgRealFeel}
              </p>
            </SectionCard>
            {rfStats.bestDay && (
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 text-center">
                <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="font-headline font-bold text-xs text-primary">{rfStats.bestDay.label}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {t.weeklyReview.bestDay}
                </p>
              </div>
            )}
            {rfStats.worstDay && (
              <div className="bg-error/5 border border-error/20 rounded-sm p-3 text-center">
                <TrendingDown className="w-4 h-4 text-error mx-auto mb-1" />
                <p className="font-headline font-bold text-xs text-error">{rfStats.worstDay.label}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {t.weeklyReview.worstDay}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Top Correlations ────────────────────────────────────────────────── */}
      <section className="mb-6">
        <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          {t.weeklyReview.topInsights}
        </h3>

        {topInsights.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-4">
            {t.weeklyReview.noInsights}
          </p>
        ) : (
          <div className="space-y-2">
            {topInsights.map((insight) => (
              <div
                key={insight.id}
                className={`flex items-start gap-3 p-3 rounded-sm border text-left w-full ${toneColor[insight.tone]}`}
              >
                <span className="text-base leading-none mt-0.5" aria-hidden="true">{insight.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs">{insight.title}</p>
                  <p className="text-[10px] mt-0.5 opacity-80">{insight.detail}</p>
                </div>
                <span className="font-label text-[10px] font-bold opacity-60 shrink-0">
                  {Math.round(insight.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA: Plan next week ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => navigateTo('cocina')}
        className="w-full flex items-center justify-between px-5 py-4 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
      >
        <span>{t.weeklyReview.planNextWeek}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </PageShell>
  );
}
