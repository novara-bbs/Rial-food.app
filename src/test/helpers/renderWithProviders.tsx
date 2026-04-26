/**
 * Test helper: render a component wrapped in the providers it expects.
 *
 * Default locale is forced to 'en' so assertions don't depend on
 * navigator.language detection (jsdom defaults vary by host).
 *
 * Usage:
 *   renderWithProviders(<MyComponent ... />, { locale: 'es' })
 */
import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { I18nProvider, type Locale } from '@/i18n';
import { Tabs } from '@/components/ui/tabs';

interface ProviderOptions {
  locale?: Locale;
  /** Wrap the component in a Tabs container (for TabsContent children). */
  inTabs?: { defaultValue: string };
}

export function renderWithProviders(
  ui: ReactElement,
  { locale = 'en', inTabs, ...options }: ProviderOptions & RenderOptions = {},
): RenderResult {
  // Pin the locale BEFORE I18nProvider runs (it reads localStorage at init).
  window.localStorage.setItem('rial-locale', locale);

  const wrappedUi: ReactNode = inTabs
    ? <Tabs defaultValue={inTabs.defaultValue}>{ui}</Tabs>
    : ui;

  function Wrapper({ children }: { children: ReactNode }) {
    return <I18nProvider>{children}</I18nProvider>;
  }

  return render(wrappedUi, { wrapper: Wrapper, ...options });
}
