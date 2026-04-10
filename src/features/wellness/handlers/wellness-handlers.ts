import { toast } from 'sonner';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

export function createHandleAddToleranceLog(deps: { setToleranceLogs: (fn: any) => void; navigateTo: (screen: string) => void }) {
  return (log: any) => {
    deps.setToleranceLogs((prev: any[]) => [{ ...log, id: Date.now() }, ...prev]);
    deps.navigateTo('cocina');
  };
}

export function createHandleRealFeelLog(deps: { setRealFeelLogs: (fn: any) => void; getDailyLog: () => DailyLogEntry[] }) {
  return (entry: any) => {
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

    deps.setRealFeelLogs((prev: any[]) => [{
      ...entry,
      id: now,
      date: new Date().toISOString(),
      mealIds,
      ingredientIds,
    }, ...prev]);
  };
}

export function createHandleCheckIn(deps: { setCheckInStatus: (v: any) => void; navigateTo: (screen: string) => void }) {
  return (status?: string) => {
    if (status) deps.setCheckInStatus({ status });
    deps.navigateTo('daily-check-in');
  };
}

export function createHandleCompleteCheckIn(deps: { setCheckInStatus: (v: any) => void; navigateTo: (screen: string) => void }) {
  return (data: any) => {
    deps.setCheckInStatus(data);
    toast.success('¡Check-in diario completado!');
    deps.navigateTo('home');
  };
}
