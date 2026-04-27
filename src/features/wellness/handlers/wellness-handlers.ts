import { toast } from 'sonner';
import type { DailyCheckIn } from '../../../types/wellness';
import type { ToleranceLog, RealFeelEntry, StoredRealFeelEntry } from '../../../types/wellness';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

export function createHandleAddToleranceLog(deps: {
  setToleranceLogs: (fn: (prev: ToleranceLog[]) => ToleranceLog[]) => void;
  navigateTo: (screen: string) => void;
}) {
  return (log: Omit<ToleranceLog, 'id'>) => {
    deps.setToleranceLogs((prev) => [{ ...log, id: String(Date.now()) }, ...prev]);
    deps.navigateTo('cocina');
  };
}

export function createHandleRealFeelLog(deps: {
  setRealFeelLogs: (fn: (prev: StoredRealFeelEntry[]) => StoredRealFeelEntry[]) => void;
  getDailyLog: () => DailyLogEntry[];
}) {
  return (entry: RealFeelEntry) => {
    const now = Date.now();
    const NINETY_MIN = 90 * 60 * 1000;
    const recentMeals = deps.getDailyLog().filter(meal => {
      // Parse time string "HH:MM" relative to today
      const [h, min] = (meal.time || '').split(':').map(Number);
      if (isNaN(h) || isNaN(min)) return false;
      const mealTime = new Date();
      mealTime.setHours(h, min, 0, 0);
      return now - mealTime.getTime() <= NINETY_MIN && now - mealTime.getTime() >= 0;
    });
    const mealIds = recentMeals.map(m => m.id);
    const ingredientIds = [...new Set(recentMeals.flatMap(m => m.ingredientIds || []))];

    // Clamp level to valid 1-5 range
    const level = entry.level != null
      ? Math.max(1, Math.min(5, Math.round(entry.level)))
      : 3;

    const stored: StoredRealFeelEntry = {
      ...entry,
      level,
      id: now,
      date: new Date().toISOString(),
      mealIds,
      ingredientIds,
    };

    deps.setRealFeelLogs((prev) => [stored, ...prev]);
  };
}

export function createHandleCheckIn(deps: {
  setCheckInStatus: (v: DailyCheckIn | null) => void;
  navigateTo: (screen: string) => void;
}) {
  return (status?: string) => {
    if (status) deps.setCheckInStatus({ status } as DailyCheckIn);
    deps.navigateTo('daily-check-in');
  };
}

export function createHandleCompleteCheckIn(deps: {
  setCheckInStatus: (v: DailyCheckIn | null) => void;
  navigateTo: (screen: string) => void;
}) {
  return (data: DailyCheckIn) => {
    deps.setCheckInStatus(data);
    toast.success('¡Check-in diario completado!');
    deps.navigateTo('home');
  };
}
