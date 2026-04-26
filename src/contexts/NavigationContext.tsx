import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Opaque data payload attached to a navigation. Kept loose — each screen
 * defines the shape it expects and reads the fields it needs from
 * `screenData`. Introduced in P8 `[1.5.65]` so FoodDetail can receive
 * `{ familyId }` without a separate AppStateContext field.
 *
 * Rule: payloads are ephemeral. They are cleared on every navigation that
 * doesn't pass new data, so a screen can't rely on "sticky" data across
 * unrelated transitions.
 */
export type NavigationData = Record<string, unknown> | undefined;

interface NavItem {
  screen: string;
  data?: NavigationData;
}

interface NavigationContextType {
  currentScreen: string;
  previousScreen: string;
  screenData: NavigationData;
  historyLength: number;
  navigateTo: (screen: string, data?: NavigationData) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * Internal cap on the navigation history. 32 entries comfortably covers
 * every real-world flow (the Diccionario substitute drill-down maxes at ~5,
 * the deepest existing flow is Onboarding at ~8). The cap prevents runaway
 * memory if a screen were to push in a loop.
 */
const HISTORY_CAP = 32;

/**
 * P8 `[1.5.65]` + P10-post fix: full history stack replaces the single
 * `previousScreen` snapshot. Each entry preserves `{screen, data}` so that
 * `goBack()` restores BOTH the screen id AND the `screenData` payload —
 * fixes the chained-substitute drill-down bug where tapping through multiple
 * FoodDetail pages (A → B → C) and then pressing Back would lose the
 * previous family id and render the empty-state fallback.
 *
 * Public API preserved verbatim (`currentScreen`, `previousScreen`,
 * `navigateTo`, `goBack`) so the 20+ call sites across App.tsx +
 * AppStateContext + meal-handlers continue to work unchanged.
 * `previousScreen` is now a derived getter from history[length-2].
 */
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<NavItem[]>([{ screen: 'home' }]);

  const currentScreen = history[history.length - 1]?.screen ?? 'home';
  const screenData = history[history.length - 1]?.data;
  const previousScreen =
    history.length >= 2 ? history[history.length - 2].screen : currentScreen;

  const navigateTo = useCallback((screen: string, data?: NavigationData) => {
    setHistory(prev => {
      const top = prev[prev.length - 1];
      // Collapse immediate self-navigations without data — prevents runaway
      // history growth when a consumer calls navigateTo('home') already on home.
      // Substitute drill-down (same screen, different data) is preserved
      // because we still push when `data` differs.
      if (top && top.screen === screen && !data && !top.data) return prev;
      const next = [...prev, { screen, data }];
      // Cap the history to keep memory bounded; drop oldest entries first.
      return next.length > HISTORY_CAP ? next.slice(next.length - HISTORY_CAP) : next;
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const value = useMemo<NavigationContextType>(
    () => ({ currentScreen, previousScreen, screenData, historyLength: history.length, navigateTo, goBack }),
    [currentScreen, previousScreen, screenData, history.length, navigateTo, goBack],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
