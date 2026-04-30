/**
 * Onboarding draft persistence — resumable mid-flow.
 *
 * Writes are intentionally minimal: only `{ stepId, draft, version }`. The
 * `dirty` flag is runtime-only. Reads are version-gated: if the persisted
 * version doesn't match the current schema, we drop the draft and start
 * fresh (no migration code path until we actually need v2).
 *
 * All operations are wrapped in try/catch — corrupt JSON, full quota, or
 * private-mode storage must never crash the app at first-time mount.
 */

import { STORAGE_KEYS } from '../../../lib/storage-keys';
import {
  INITIAL_STATE,
  ONBOARDING_DRAFT_VERSION,
  type OnboardingState,
  type PersistedDraft,
} from './types';

const KEY = STORAGE_KEYS.ONBOARDING_DRAFT;

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Read the persisted draft. Returns `null` when:
 *  - no draft exists
 *  - the storage API is unavailable (SSR, private mode)
 *  - the JSON is corrupt
 *  - the schema version doesn't match (drops the draft as a side-effect)
 */
export function loadDraft(): OnboardingState | null {
  const storage = getStorage();
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearDraft();
    return null;
  }

  if (!isPersistedDraft(parsed)) {
    clearDraft();
    return null;
  }
  if (parsed.version !== ONBOARDING_DRAFT_VERSION) {
    clearDraft();
    return null;
  }

  return {
    stepId: parsed.stepId,
    draft: parsed.draft,
    version: parsed.version,
    dirty: false,
    // Resumed sessions start with a clean error state — the user is back at
    // a step they had previously navigated past, no need to re-show errors.
    submitAttemptedFor: {},
  };
}

/**
 * Persist the runtime state. Drops `dirty` from the wire format.
 * Silent on failure — quota exhaustion shouldn't break the flow.
 */
export function saveDraft(state: OnboardingState): void {
  const storage = getStorage();
  if (!storage) return;
  const payload: PersistedDraft = {
    stepId: state.stepId,
    draft: state.draft,
    version: state.version,
  };
  try {
    storage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota / disabled storage — ignore.
  }
}

/** Remove the persisted draft. Called on `onComplete` and on version mismatch. */
export function clearDraft(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}

/**
 * Initial state for the modal mount. Returns the rehydrated state if a
 * valid draft exists, else the fresh `INITIAL_STATE`.
 */
export function loadInitialState(): OnboardingState {
  return loadDraft() ?? INITIAL_STATE;
}

// ── Internals ──────────────────────────────────────────────────────────

function isPersistedDraft(value: unknown): value is PersistedDraft {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.stepId === 'string' &&
    typeof v.version === 'number' &&
    !!v.draft &&
    typeof v.draft === 'object'
  );
}
