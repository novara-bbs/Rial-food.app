import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import es, { type Translations } from './locales/es';
import en from './locales/en';

export type Locale = 'es' | 'en';

const locales: Record<Locale, Translations> = { es, en };

function detectSystemLocale(): Locale {
  const lang = navigator.language || (navigator as any).userLanguage || 'es';
  const code = lang.split('-')[0].toLowerCase();
  if (code in locales) return code as Locale;
  return 'es'; // default fallback
}

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('rial-locale');
    if (saved && saved in locales) return saved as Locale;
    return detectSystemLocale();
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('rial-locale', l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value: I18nContextType = {
    locale,
    setLocale,
    t: locales[locale],
  };

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export type { Translations };
