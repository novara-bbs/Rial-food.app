import type { DailyArchive } from '../../../hooks/useDailyReset';

interface WeightEntry { date: string; kg: number; note?: string }

/** Calculate Real Score (vitality 0-100) and trend from RealFeel logs */
export function calcVitality(realFeelLogs: any[]): { avgVitality: number; trend: 'up' | 'down' | 'flat'; entryCount: number } {
  const logs = realFeelLogs || [];
  const recent7 = logs.slice(0, 7);
  const avgVitality = recent7.length > 0
    ? Math.round((recent7.reduce((s: number, l: any) => s + (l.level || 3), 0) / recent7.length) * 20)
    : 0;
  const prev7 = logs.slice(7, 14);
  const prevAvg = prev7.length > 0
    ? Math.round((prev7.reduce((s: number, l: any) => s + (l.level || 3), 0) / prev7.length) * 20)
    : 0;
  const trend: 'up' | 'down' | 'flat' = recent7.length > 0 && prev7.length > 0
    ? avgVitality > prevAvg + 5 ? 'up' : avgVitality < prevAvg - 5 ? 'down' : 'flat'
    : 'flat';
  return { avgVitality, trend, entryCount: recent7.length };
}

/** Calculate weekly progress metrics from nutrition history */
export function calcWeeklyProgress(history: DailyArchive[], weights: WeightEntry[], proteinTarget: number): {
  calAvg: number; proteinHitDays: number; totalDays: number; weekDelta: number | null;
} {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const thisWeekStart = new Date(now.getTime() - dayOfWeek * 86_400_000).toISOString().slice(0, 10);
  const thisWeekDays = history.filter(h => h.date >= thisWeekStart);
  const calAvg = thisWeekDays.length > 0
    ? Math.round(thisWeekDays.reduce((s, e) => s + (e.macros.consumed.cal || 0), 0) / thisWeekDays.length)
    : 0;
  const proteinHitDays = thisWeekDays.filter(h => (h.macros.consumed as any).pro >= proteinTarget).length;

  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const recentWeights = sortedWeights.filter(w => w.date >= weekAgo);
  const weekDelta = recentWeights.length >= 2
    ? recentWeights[recentWeights.length - 1].kg - recentWeights[0].kg
    : null;

  return { calAvg, proteinHitDays, totalDays: thisWeekDays.length, weekDelta };
}
