/**
 * Profile state slice — owns user identity, preferences, and Pro status.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015).
 * This hook owns:
 *   - 5 persisted state vars (userProfile, isPro, isFirstTime, showAIBot, miseEnPlaceEnabled)
 *   - 1 idempotent migration (R8.3 foodDislikes[] → foodPreferences Record)
 *   - 3 Supabase sync effects (userProfile, isPro, isFirstTime)
 *
 * No external deps — this hook can be called first in the composer.
 */
import { useEffect } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { pushToCloud } from '../../lib/sync';
import type { UserProfile } from '../../types/user';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 32,
  height: 175,
  weight: 78,
  gender: 'female',
  goal: 'maintain',
  activity: 'active',
  trains: false,
  dietaryPreferences: [],
};

export function useProfileState() {
  const [isPro, setIsPro] = useLocalStorageState<boolean>('isPro', false);
  const [showAIBot, setShowAIBot] = useLocalStorageState<boolean>('showAIBot', true);
  const [isFirstTime, setIsFirstTime] = useLocalStorageState<boolean>('isFirstTime', true);
  // R5: pre-cook mise-en-place screen. Default true — user can opt-out per session.
  const [miseEnPlaceEnabled, setMiseEnPlaceEnabled] = useLocalStorageState<boolean>('miseEnPlacePreCook', true);
  const [userProfile, setUserProfile] = useLocalStorageState<UserProfile>('userProfile', DEFAULT_PROFILE);

  // R8.3 — migrate foodDislikes[] → foodPreferences Record (eager, idempotent).
  useEffect(() => {
    setUserProfile((prev: UserProfile) => {
      if (!prev?.foodDislikes?.length) return prev;
      if (prev.foodPreferences) return prev; // already migrated
      const foodPreferences: Record<string, 'like' | 'dislike'> = {};
      prev.foodDislikes.forEach((id: string) => {
        foodPreferences[id] = 'dislike';
      });
      return { ...prev, foodPreferences };
    });
  }, [setUserProfile]);

  // Supabase sync — no-op when offline / not signed in (sync.ts handles guards).
  useEffect(() => { pushToCloud('userProfile', userProfile); }, [userProfile]);
  useEffect(() => { pushToCloud('isPro', isPro); }, [isPro]);
  useEffect(() => { pushToCloud('isFirstTime', isFirstTime); }, [isFirstTime]);

  return {
    isPro, setIsPro,
    showAIBot, setShowAIBot,
    isFirstTime, setIsFirstTime,
    miseEnPlaceEnabled, setMiseEnPlaceEnabled,
    userProfile, setUserProfile,
  };
}

export type ProfileState = ReturnType<typeof useProfileState>;
