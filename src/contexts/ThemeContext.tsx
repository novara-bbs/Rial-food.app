import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../lib/storage-keys';

export type Palette = 'volt' | 'ocean' | 'ember' | 'neutral';
export type ColorMode = 'auto' | 'light' | 'dark';
export type ResolvedMode = 'light' | 'dark';

export const PALETTES: Palette[] = ['volt', 'ocean', 'ember', 'neutral'];
export const COLOR_MODES: ColorMode[] = ['auto', 'light', 'dark'];

const STORAGE_KEY = STORAGE_KEYS.THEME;
const LEGACY_STORAGE_KEY = STORAGE_KEYS.THEME_LEGACY;

const ALL_THEME_CLASSES = [
  'theme-volt-dark',
  'theme-volt-light',
  'theme-ocean-dark',
  'theme-ocean-light',
  'theme-ember-dark',
  'theme-ember-light',
  'theme-neutral-dark',
  'theme-neutral-light',
];

const LEGACY_MAP: Record<string, { palette: Palette; mode: ColorMode }> = {
  dark: { palette: 'volt', mode: 'dark' },
  light: { palette: 'volt', mode: 'light' },
  'blue-dark': { palette: 'ocean', mode: 'dark' },
  'blue-light': { palette: 'ocean', mode: 'light' },
  'orange-dark': { palette: 'ember', mode: 'dark' },
  'orange-light': { palette: 'ember', mode: 'light' },
};

const DEFAULT_STATE: { palette: Palette; mode: ColorMode } = {
  palette: 'neutral',
  mode: 'auto',
};

function readInitialState(): { palette: Palette; mode: ColorMode } {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        PALETTES.includes(parsed.palette) &&
        COLOR_MODES.includes(parsed.mode)
      ) {
        return { palette: parsed.palette, mode: parsed.mode };
      }
    }
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && LEGACY_MAP[legacy]) {
      const migrated = LEGACY_MAP[legacy];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }
  } catch {
    // ignore — fall through to default
  }
  return DEFAULT_STATE;
}

function getSystemResolvedMode(): ResolvedMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveMode(mode: ColorMode, systemMode: ResolvedMode): ResolvedMode {
  return mode === 'auto' ? systemMode : mode;
}

export function themeClassName(palette: Palette, resolvedMode: ResolvedMode): string {
  return `theme-${palette}-${resolvedMode}`;
}

interface ThemeContextType {
  palette: Palette;
  mode: ColorMode;
  resolvedMode: ResolvedMode;
  themeClassName: string;
  setPalette: (p: Palette) => void;
  setMode: (m: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ palette, mode }, setState] = useState(readInitialState);
  const [systemMode, setSystemMode] = useState<ResolvedMode>(getSystemResolvedMode);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  const resolvedMode = resolveMode(mode, systemMode);
  const className = themeClassName(palette, resolvedMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ palette, mode }));
    } catch {
      // storage write failures are non-fatal
    }
    const root = document.documentElement;
    for (const cls of ALL_THEME_CLASSES) {
      if (cls !== className) root.classList.remove(cls);
    }
    root.classList.add(className);
  }, [palette, mode, className]);

  const value = useMemo<ThemeContextType>(
    () => ({
      palette,
      mode,
      resolvedMode,
      themeClassName: className,
      setPalette: (p) => setState((prev) => ({ ...prev, palette: p })),
      setMode: (m) => setState((prev) => ({ ...prev, mode: m })),
    }),
    [palette, mode, resolvedMode, className]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
