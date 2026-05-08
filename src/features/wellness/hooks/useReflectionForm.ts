/**
 * useReflectionForm — encapsulates the weekly reflection form state and the
 * save handler. Extracted from Progress.tsx to keep the screen focused on
 * orchestration. Persists entries to localStorage via the caller-provided
 * setter so this hook stays decoupled from useLocalStorageState.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import type { Translations } from '../../../i18n';
import type { DailyArchive } from '../../../hooks/useDailyReset';

export interface WeeklyEntry {
  id: number;
  weekStart: string;
  workedWell: string;
  whatWasHard: string;
  focusNextWeek: string;
  avgVitality: number;
  mealsLogged: number;
  consistencyDays: number;
}

function getWeekStartISO(date: Date): string {
  const ws = new Date(date);
  ws.setDate(date.getDate() - date.getDay());
  ws.setHours(0, 0, 0, 0);
  return ws.toISOString().slice(0, 10);
}

export interface UseReflectionFormInputs {
  weekStartISO: string;
  history: DailyArchive[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  realFeelLogs: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dailyLog: any[];
  now: Date;
  setWeeklyEntries: (updater: (prev: WeeklyEntry[]) => WeeklyEntry[]) => void;
  t: Translations;
  onSaved?: () => void;
}

export function useReflectionForm({
  weekStartISO,
  history,
  realFeelLogs,
  dailyLog,
  now,
  setWeeklyEntries,
  t,
  onSaved,
}: UseReflectionFormInputs) {
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [workedWell, setWorkedWell] = useState('');
  const [whatWasHard, setWhatWasHard] = useState('');
  const [focusNext, setFocusNext] = useState('');

  const handleSave = () => {
    if (!workedWell.trim() && !whatWasHard.trim() && !focusNext.trim()) {
      toast.error(t.weekly?.fillOneField || 'Completa al menos un campo');
      return;
    }
    const thisWeekStart = getWeekStartISO(now);
    const thisWeekArchives = history.filter((h) => h.date >= thisWeekStart);
    const mealsLogged = thisWeekArchives.reduce((s, h) => s + h.mealCount, 0) + dailyLog.length;

    const thisWeekRF = (realFeelLogs || []).filter((l) => l.date && l.date.slice(0, 10) >= thisWeekStart);
    const avgVitality = thisWeekRF.length > 0
      ? Math.round((thisWeekRF.reduce((s, l) => s + (l.level || 3), 0) / thisWeekRF.length) * 20)
      : 0;
    const consistencyDays = new Set(thisWeekArchives.map((h) => h.date)).size + (dailyLog.length > 0 ? 1 : 0);

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
    setWeeklyEntries((prev) => [entry, ...prev.filter((e) => e.weekStart !== weekStartISO)]);
    toast.success(t.weekly?.reflectionSaved || 'Reflexión guardada');
    setReflectionOpen(false);
    setWorkedWell('');
    setWhatWasHard('');
    setFocusNext('');
    onSaved?.();
  };

  return {
    reflectionOpen,
    setReflectionOpen,
    workedWell,
    setWorkedWell,
    whatWasHard,
    setWhatWasHard,
    focusNext,
    setFocusNext,
    handleSave,
  };
}
