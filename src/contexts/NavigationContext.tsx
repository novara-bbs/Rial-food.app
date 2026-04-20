import React, { createContext, useContext, useState } from 'react';

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

interface NavigationContextType {
  currentScreen: string;
  previousScreen: string;
  screenData: NavigationData;
  navigateTo: (screen: string, data?: NavigationData) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [screenData, setScreenData] = useState<NavigationData>(undefined);

  const navigateTo = (screen: string, data?: NavigationData) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    setScreenData(data);
  };

  const goBack = () => navigateTo(previousScreen);

  return (
    <NavigationContext.Provider value={{ currentScreen, previousScreen, screenData, navigateTo, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
