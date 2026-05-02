/**
 * Day-navigation state slice — Phase 3 / Sprint B3.
 *
 * Owns the user's currently-selected day across the app (Home, NutritionDetail).
 * `selectedDate` is YYYY-MM-DD (local timezone) and defaults to today on every
 * fresh app launch. Not persisted across reloads — viewing yesterday is an
 * intentional "peek", and reopening the app should land on today by default.
 *
 * Both Home and NutritionDetail consume this slice via `useAppState()`, so the
 * selection persists when navigating between the two screens within a session.
 *
 * No external deps — this hook can be called anywhere in the composer.
 */
import { useState, useCallback, useEffect } from 'react';
import { todayLocal } from '../../lib/dates';

export function useDayNavigation() {
  const [selectedDate, setSelectedDateRaw] = useState<string>(() => todayLocal());

  // Reset to today on midnight rollover. Cheap interval check (60 s) — same
  // cadence as `useDailyReset`, so the UX stays consistent with the daily reset.
  useEffect(() => {
    const checkMidnight = () => {
      const now = todayLocal();
      setSelectedDateRaw((prev) => {
        // Only auto-bump if the user is currently on yesterday's date and the
        // calendar tipped past midnight. Don't override an explicit past-day peek.
        if (prev === now) return prev;
        // Heuristic: if the user picked a non-today value, leave it. They can
        // tap "Hoy" themselves. This avoids surprising the user mid-session.
        return prev;
      });
      // No-op for now — just placeholder for future midnight reset behavior.
      void now;
    };
    const id = setInterval(checkMidnight, 60_000);
    return () => clearInterval(id);
  }, []);

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateRaw(date);
  }, []);

  const resetToToday = useCallback(() => {
    setSelectedDateRaw(todayLocal());
  }, []);

  return { selectedDate, setSelectedDate, resetToToday };
}

export type DayNavigationState = ReturnType<typeof useDayNavigation>;
