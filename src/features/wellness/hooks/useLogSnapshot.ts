/**
 * useLogSnapshot — module-scoped singleton controller for LogSnapshotModal.
 *
 * Q13 — centralises the weight/snapshot logging flow so every entry point
 * (Home → ProgressPreviewCard, Progress → Body, empty calendar cells) opens
 * the same modal instead of re-implementing inline forms.
 *
 * Mount `<GlobalLogSnapshotModal />` once at the App root to subscribe to
 * this store. Then any component can:
 *
 *   const { openWithDate } = useLogSnapshot();
 *   <button onClick={() => openWithDate()}>Log weight</button>
 */
import { useSyncExternalStore, useCallback } from 'react';

interface LogSnapshotState {
  isOpen: boolean;
  initialDate?: string;
}

type Listener = () => void;

let state: LogSnapshotState = { isOpen: false };
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot(): LogSnapshotState {
  return state;
}

export function openLogSnapshot(date?: string) {
  state = { isOpen: true, initialDate: date };
  notify();
}

export function closeLogSnapshot() {
  if (!state.isOpen) return;
  state = { isOpen: false };
  notify();
}

/**
 * Subscribe to the log-snapshot state + get stable action callbacks.
 * Use inside React components / render trees.
 */
export function useLogSnapshot() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const openWithDate = useCallback((date?: string) => {
    openLogSnapshot(date);
  }, []);

  const close = useCallback(() => {
    closeLogSnapshot();
  }, []);

  return {
    isOpen: snap.isOpen,
    initialDate: snap.initialDate,
    openWithDate,
    close,
  };
}
