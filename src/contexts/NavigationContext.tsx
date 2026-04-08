import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  currentScreen: string;
  previousScreen: string;
  navigateTo: (screen: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');

  const navigateTo = (screen: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => navigateTo(previousScreen);

  return (
    <NavigationContext.Provider value={{ currentScreen, previousScreen, navigateTo, goBack }}>
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
