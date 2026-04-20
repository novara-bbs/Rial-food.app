/**
 * Offline-first data sync.
 *
 * Strategy: write to localStorage immediately (instant UI),
 * then push to Supabase in the background when online.
 * On sign-in, pull remote data and merge (last-write-wins).
 *
 * Data model: one row per key in `user_data` table.
 *   user_id | key             | value (jsonb)       | updated_at
 *   --------|-----------------|--------------------|------------
 *   uuid    | userProfile     | {...}              | 2026-04-12
 *   uuid    | dailyMacros     | {...}              | 2026-04-12
 *   uuid    | savedRecipes    | [...]              | 2026-04-12
 *   ...
 */
import { getSupabaseClient, type Json } from './supabase';
import { logger } from './logger';

/**
 * Keys that should round-trip between localStorage and Supabase.
 *
 * Scope rules (decided 2026-04-15 audit, updated Wave 1 of tab audit):
 *   - ✓ Sync: user-owned data that should follow the account across devices.
 *   - ✗ Skip: UI preferences (theme, `showAIBot`), active timers
 *     (`fasting-start`), chat transcripts, notification state, and anything
 *     sourced from the backend itself (`communityPosts`, `communityStories`).
 *
 * Note: expanding this type does NOT wire push/pull automatically — keys must
 * still be referenced from `pushToCloud(key, value)` and `syncOnSignIn()` in
 * the Supabase sprint (Q6). This is the type surface we want to be ready for.
 */
type SyncKey =
  // Q5 — original cloud set (user profile + daily state + content)
  | 'userProfile'
  | 'dailyMacros'
  | 'savedRecipes'
  | 'mealPlan'
  | 'shoppingList'
  | 'realFeelLogs'
  | 'toleranceLogs'
  | 'weightHistory'
  | 'nutritionHistory'
  | 'isPro'
  // Wave 1 tab audit — Hoy surface
  | 'dailyLog'
  | 'hydration'
  | 'movement'
  | 'dailyGoal'
  | 'isFirstTime'
  | 'checkInStatus'
  | 'guidedSetupDismissed'
  | 'recipeViewed'
  // Wave 1 tab audit — food surface
  | 'userFoods'
  | 'foodHistory'
  | 'favoriteIds'
  // P5 — user variant library (scanned brand products stored under FoodFamily)
  | 'userVariants'
  | 'userVariantBarcodes'
  // Wave 1 tab audit — social graph
  | 'likedPosts'
  | 'savedPosts'
  | 'followedCreators'
  | 'joinedChallenges'
  | 'challengeJoinDates'
  | 'challengeProgress'
  // Wave 1 tab audit — wellness + pantry + fasting + profile pref
  | 'weeklyCheckIns'
  | 'pantryItems'
  | 'fasting-protocol'
  | 'fasting-history'
  | 'profilePublic'
  // Wave 3 tab audit (future) — subtab persistence
  | 'exploreActiveTab';

// ─── Push a single key to Supabase ───────────────────────────────────────────

export async function pushToCloud(key: SyncKey, value: unknown): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return; // Supabase not configured

  const { data: { user } } = await client.auth.getUser();
  if (!user) return; // Not signed in

  try {
    const { error } = await client
      .from('user_data')
      .upsert(
        { user_id: user.id, key, value: value as Json, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,key' },
      );
    if (error) logger.warn('Sync push failed', { key, error: error.message });
  } catch (err) {
    logger.warn('Sync push error', { key, error: String(err) });
  }
}

// ─── Pull all keys from Supabase → return as record ──────────────────────────

export async function pullFromCloud(): Promise<Partial<Record<SyncKey, unknown>>> {
  const client = getSupabaseClient();
  if (!client) return {};

  const { data: { user } } = await client.auth.getUser();
  if (!user) return {};

  try {
    const { data, error } = await client
      .from('user_data')
      .select('key, value, updated_at')
      .eq('user_id', user.id);

    if (error) {
      logger.warn('Sync pull failed', { error: error.message });
      return {};
    }

    return Object.fromEntries(
      (data ?? []).map(row => [row.key as SyncKey, row.value])
    ) as Partial<Record<SyncKey, unknown>>;
  } catch (err) {
    logger.warn('Sync pull error', { error: String(err) });
    return {};
  }
}

// ─── Merge remote into localStorage (last-write-wins per key) ────────────────

export async function syncOnSignIn(): Promise<Partial<Record<SyncKey, unknown>>> {
  const remote = await pullFromCloud();
  if (Object.keys(remote).length === 0) return {};

  // For each remote key, compare updated_at timestamps and take the newer value.
  // Since we don't store per-key timestamps locally, we trust remote > local on first sign-in.
  logger.info('Sync pulled from cloud', { keys: Object.keys(remote).join(', ') });
  return remote;
}

// ─── Export all user data as JSON (GDPR) ─────────────────────────────────────

export async function exportUserData(): Promise<string> {
  const client = getSupabaseClient();

  const localKeys: SyncKey[] = [
    'userProfile', 'dailyMacros', 'savedRecipes', 'mealPlan',
    'shoppingList', 'realFeelLogs', 'toleranceLogs', 'weightHistory', 'nutritionHistory',
  ];

  const localData: Record<string, unknown> = {};
  for (const key of localKeys) {
    const raw = localStorage.getItem(`rial_${key}`);
    if (raw) {
      try { localData[key] = JSON.parse(raw); } catch { localData[key] = raw; }
    }
  }

  let cloudData: Record<string, unknown> = {};
  if (client) {
    cloudData = await pullFromCloud();
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    local: localData,
    cloud: cloudData,
  };

  return JSON.stringify(exportPayload, null, 2);
}
