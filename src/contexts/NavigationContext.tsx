import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

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
  /** scrollY captured when the user navigated AWAY from this entry. */
  scrollY?: number;
}

interface NavigationContextType {
  currentScreen: string;
  previousScreen: string;
  screenData: NavigationData;
  /** The scrollY to restore when landing on the current screen (0 for new visits). */
  scrollYToRestore: number;
  navigateTo: (screen: string, data?: NavigationData) => void;
  goBack: () => void;
  /** App.tsx registers a fn that reads the current main scroll so NavigationContext
   *  can capture it synchronously before the DOM swap on navigateTo. */
  registerScrollCapture: (fn: (() => number) | null) => void;
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
 *
 * [1.5.107] Fase 2 scroll: `scrollYToRestore` + `registerScrollCapture` enable
 * native-style scroll restoration on goBack without coupling the context to DOM.
 * scrollCapture is called synchronously inside navigateTo — before setHistory —
 * so the scroll is captured before React swaps DOM children and clamps scrollTop.
 */
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<NavItem[]>([{ screen: 'home' }]);
  const scrollCaptureRef = useRef<(() => number) | null>(null);

  const currentScreen = history[history.length - 1]?.screen ?? 'home';
  const screenData = history[history.length - 1]?.data;
  const previousScreen =
    history.length >= 2 ? history[history.length - 2].screen : currentScreen;
  const scrollYToRestore = history[history.length - 1]?.scrollY ?? 0;

  const registerScrollCapture = useCallback((fn: (() => number) | null) => {
    scrollCaptureRef.current = fn;
  }, []);

  const navigateTo = useCallback((screen: string, data?: NavigationData) => {
    // Capture scroll BEFORE setHistory — this is the only point where we can
    // read the real scrollTop before React swaps the DOM and clamps it.
    const scrollY = scrollCaptureRef.current?.() ?? 0;
    setHistory(prev => {
      const top = prev[prev.length - 1];
      // Collapse immediate self-navigations without data — prevents runaway
      // history growth when a consumer calls navigateTo('home') already on home.
      // Substitute drill-down (same screen, different data) is preserved
      // because we still push when `data` differs.
      if (top && top.screen === screen && !data && !top.data) return prev;
      // Save current scroll to the outgoing entry, then push the new one.
      const updatedTop: NavItem = { ...top, scrollY };
      const next = [...prev.slice(0, -1), updatedTop, { screen, data }];
      // Cap the history to keep memory bounded; drop oldest entries first.
      return next.length > HISTORY_CAP ? next.slice(next.length - HISTORY_CAP) : next;
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const value = useMemo<NavigationContextType>(
    () => ({ currentScreen, previousScreen, screenData, scrollYToRestore, navigateTo, goBack, registerScrollCapture }),
    [currentScreen, previousScreen, screenData, scrollYToRestore, navigateTo, goBack, registerScrollCapture],
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
