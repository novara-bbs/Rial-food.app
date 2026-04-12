/**
 * Vitest global test setup.
 * Runs before every test file.
 */
import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// ─── localStorage mock ──────────────────────────────────
const localStorageStore: Record<string, string> = {};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => localStorageStore[key] ?? null,
    setItem: (key: string, value: string) => { localStorageStore[key] = value; },
    removeItem: (key: string) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
    get length() { return Object.keys(localStorageStore).length; },
    key: (i: number) => Object.keys(localStorageStore)[i] ?? null,
  },
  writable: true,
});

// ─── navigator.onLine default ───────────────────────────
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true,
});

// ─── Suppress console.warn in tests (schema validation warnings) ──
const originalWarn = console.warn.bind(console);
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[Schema validation failed]')) return;
    originalWarn(...args);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});
