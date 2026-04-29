/**
 * Wellness state slice — owns body history + RealFeel + tolerance + check-in.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015).
 * This hook owns:
 *   - 4 persisted state vars (weightHistory, nutritionHistory, realFeelLogs,
 *     toleranceLogs)
 *   - 4 lazy-seed effects (preserve-if-nonempty)
 *   - 1 weeklyCheckIns seed (writes localStorage directly — WeeklyCheckIn
 *     screen owns its own useLocalStorageState slot, we just pre-populate)
 *   - 4 Supabase sync effects
 *   - 8 wellness handler factories (logWeight, updateSnapshot, deleteSnapshot,
 *     addToleranceLog, realFeelLog, checkIn, completeCheckIn, shareProgress)
 *
 * Cross-domain deps:
 *   - setUserProfile (profile) — logWeight + deleteSnapshot also adjust user weight
 *   - setCheckInStatus (vitals) — check-in handlers update today's status
 *   - setCommunityPosts (social) — shareProgress publishes a post
 *   - dailyLog (food) — realFeel handler annotates last meal
 *   - navigateTo — handler factories trigger screen changes
 */
import { useEffect, useMemo } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { STORAGE_KEYS } from '../../lib/storage-keys';
import { pushToCloud } from '../../lib/sync';
import { shouldReseed, setStoredSeedVersion } from '../../lib/seedVersion';
import { logger } from '../../lib/logger';
import {
  createHandleAddToleranceLog,
  createHandleRealFeelLog,
  createHandleCheckIn,
  createHandleCompleteCheckIn,
} from '../../features/wellness/handlers/wellness-handlers';
import {
  createHandleLogWeight,
  createHandleUpdateSnapshot,
  createHandleDeleteSnapshot,
} from '../../features/wellness/handlers/weight-handlers';
import { createHandleShareProgress } from '../../features/wellness/handlers/progress-share-handlers';
import type { DailyArchive } from '../../hooks/useDailyReset';
import type { BodySnapshot, ToleranceLog, StoredRealFeelEntry } from '../../types/wellness';
import type { DailyCheckIn as DailyCheckInType } from '../../types';
import type { CommunityPost } from '../../types/social';
import type { UserProfile } from '../../types/user';
import type { DailyLogEntry } from '../../features/food/handlers/meal-handlers';

interface UseWellnessStateDeps {
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setCheckInStatus: React.Dispatch<React.SetStateAction<DailyCheckInType | null>>;
  setCommunityPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  dailyLog: DailyLogEntry[];
  navigateTo: (screen: string, data?: Record<string, unknown>) => void;
}

export function useWellnessState({
  setUserProfile, setCheckInStatus, setCommunityPosts, dailyLog, navigateTo,
}: UseWellnessStateDeps) {
  // ── Tolerance journal ────────────────────────────────────────────────────
  const [toleranceLogs, setToleranceLogs] = useLocalStorageState<ToleranceLog[]>('toleranceLogs', []);
  useEffect(() => {
    if (!shouldReseed('toleranceLogs', 'toleranceLogs')) return;
    import('../../features/wellness/data/seed-tolerance')
      .then((m) => {
        setToleranceLogs((prev) =>
          prev.length === 0 ? (m.SEED_TOLERANCE_LOGS as ToleranceLog[]) : prev,
        );
        setStoredSeedVersion('toleranceLogs');
      })
      .catch((err) => logger.warn('seed.toleranceLogs load failed', { err }));
  }, [setToleranceLogs]);

  // ── RealFeel journal ─────────────────────────────────────────────────────
  const [realFeelLogs, setRealFeelLogs] = useLocalStorageState<StoredRealFeelEntry[]>('realFeelLogs', []);
  useEffect(() => {
    if (!shouldReseed('realFeelLogs', 'realFeelLogs')) return;
    import('../../features/wellness/data/seed-real-feel-logs')
      .then((m) => {
        setRealFeelLogs((prev) =>
          prev.length === 0 ? (m.SEED_REAL_FEEL_LOGS as StoredRealFeelEntry[]) : prev,
        );
        setStoredSeedVersion('realFeelLogs');
      })
      .catch((err) => logger.warn('seed.realFeelLogs load failed', { err }));
  }, [setRealFeelLogs]);

  // ── Body snapshots (weight + measurements + photos) ──────────────────────
  const [weightHistory, setWeightHistory] = useLocalStorageState<BodySnapshot[]>('weightHistory', []);
  useEffect(() => {
    if (!shouldReseed('weightHistory', 'weightHistory')) return;
    import('../../features/wellness/data/seed-body-snapshots')
      .then((m) => {
        setWeightHistory((prev: BodySnapshot[]) =>
          prev.length === 0 ? m.BODY_SNAPSHOT_SEED : prev,
        );
        setStoredSeedVersion('weightHistory');
      })
      .catch((err) => logger.warn('seed.weightHistory load failed', { err }));
  }, [setWeightHistory]);

  // ── Nutrition history (per-day archive) ──────────────────────────────────
  const [nutritionHistory, setNutritionHistory] = useLocalStorageState<DailyArchive[]>('nutritionHistory', []);
  useEffect(() => {
    if (!shouldReseed('nutritionHistory', 'nutritionHistory')) return;
    import('../../features/wellness/data/seed-nutrition-history')
      .then((m) => {
        setNutritionHistory((prev: DailyArchive[]) =>
          prev.length === 0 ? m.SEED_NUTRITION_HISTORY : prev,
        );
        setStoredSeedVersion('nutritionHistory');
      })
      .catch((err) => logger.warn('seed.nutritionHistory load failed', { err }));
  }, [setNutritionHistory]);

  // ── Weekly check-ins seed (special: writes localStorage directly because
  // the WeeklyCheckIn screen owns its own useLocalStorageState slot; we just
  // pre-populate the empty key so the screen has data on first open). ──────
  useEffect(() => {
    if (!shouldReseed('weeklyCheckIns', 'weeklyCheckIns')) return;
    import('../../features/wellness/data/seed-weekly-checkins')
      .then((m) => {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEYS.WEEKLY_CHECK_INS);
          const existing = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(existing) || existing.length === 0) {
            window.localStorage.setItem(STORAGE_KEYS.WEEKLY_CHECK_INS, JSON.stringify(m.SEED_WEEKLY_CHECKINS));
          }
        } catch {
          window.localStorage.setItem(STORAGE_KEYS.WEEKLY_CHECK_INS, JSON.stringify(m.SEED_WEEKLY_CHECKINS));
        }
        setStoredSeedVersion('weeklyCheckIns');
      })
      .catch((err) => logger.warn('seed.weeklyCheckIns load failed', { err }));
  }, []);

  // ── Supabase sync (no-op when offline / not signed in) ───────────────────
  useEffect(() => { pushToCloud('toleranceLogs', toleranceLogs); }, [toleranceLogs]);
  useEffect(() => { pushToCloud('realFeelLogs', realFeelLogs); }, [realFeelLogs]);
  useEffect(() => { pushToCloud('weightHistory', weightHistory); }, [weightHistory]);
  useEffect(() => { pushToCloud('nutritionHistory', nutritionHistory); }, [nutritionHistory]);

  // ── Memoized handler factories ───────────────────────────────────────────
  const handleLogWeight = useMemo(
    () => createHandleLogWeight({ setWeightHistory, setUserProfile }),
    [setWeightHistory, setUserProfile],
  );
  const handleUpdateSnapshot = useMemo(
    () => createHandleUpdateSnapshot({ setWeightHistory }),
    [setWeightHistory],
  );
  const handleDeleteSnapshot = useMemo(
    () => createHandleDeleteSnapshot({ setWeightHistory, setUserProfile }),
    [setWeightHistory, setUserProfile],
  );
  const handleAddToleranceLog = useMemo(
    () => createHandleAddToleranceLog({ setToleranceLogs, navigateTo }),
    [setToleranceLogs, navigateTo],
  );
  const handleRealFeelLog = useMemo(
    () => createHandleRealFeelLog({ setRealFeelLogs, getDailyLog: () => dailyLog }),
    [setRealFeelLogs, dailyLog],
  );
  const handleCheckIn = useMemo(
    () => createHandleCheckIn({ setCheckInStatus, navigateTo }),
    [setCheckInStatus, navigateTo],
  );
  const handleCompleteCheckIn = useMemo(
    () => createHandleCompleteCheckIn({ setCheckInStatus, navigateTo }),
    [setCheckInStatus, navigateTo],
  );
  const handleShareProgress = useMemo(
    () => createHandleShareProgress({ setCommunityPosts }),
    [setCommunityPosts],
  );

  return {
    toleranceLogs, setToleranceLogs,
    realFeelLogs, setRealFeelLogs,
    weightHistory, setWeightHistory,
    nutritionHistory, setNutritionHistory,
    handleLogWeight,
    handleUpdateSnapshot,
    handleDeleteSnapshot,
    handleAddToleranceLog,
    handleRealFeelLog,
    handleCheckIn,
    handleCompleteCheckIn,
    handleShareProgress,
  };
}

export type WellnessState = ReturnType<typeof useWellnessState>;
