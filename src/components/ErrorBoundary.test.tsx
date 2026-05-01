/**
 * Tests for the rewritten ErrorBoundary.
 * Sprint [1.5.175] — locks the new contract: i18n strings, three recovery
 * actions (Retry / Go home / Reload), retry counter caps at 2, disclosure of
 * error.message, and onReset callback wiring.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { I18nProvider } from '../i18n';

// Sentry is heavy and is also called from `lib/logger`; stub the surface area
// the production code (boundary + logger) touches.
vi.mock('@sentry/react', () => ({
  withScope: (cb: any) => cb({ setContext: vi.fn() }),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
}));

const Bomb = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error('boom');
  return <div data-testid="happy-child">happy</div>;
};

const renderWithI18n = (ui: React.ReactElement) =>
  render(<I18nProvider>{ui}</I18nProvider>);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    cleanup();
    // JSDOM navigator.language defaults to en-US — pin Spanish locale so the
    // matchers in this file (regex /reintentar/i, /qué pasó/i, …) hit.
    window.localStorage.setItem('rial-locale', 'es');
    // Silence the React-thrown-error console output.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error', () => {
    renderWithI18n(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('happy-child')).toBeTruthy();
  });

  it('renders fallback UI with title + 3 default buttons on crash', () => {
    renderWithI18n(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();
    // Three buttons: Retry, Go home, Reload (label text via i18n).
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /volver al inicio/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /recargar app/i })).toBeTruthy();
  });

  it('hides Reload button when hideReload is true', () => {
    renderWithI18n(
      <ErrorBoundary hideReload>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.queryByRole('button', { name: /recargar app/i })).toBeNull();
  });

  it('shows feature-contextual message when featureName is provided', () => {
    renderWithI18n(
      <ErrorBoundary featureName="Cocina">
        <Bomb />
      </ErrorBoundary>,
    );
    // featureMessage template: "Hubo un problema cargando {feature}."
    expect(screen.getByText(/cocina/i)).toBeTruthy();
  });

  it('toggles error.message disclosure', () => {
    renderWithI18n(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    const toggle = screen.getByRole('button', { name: /qué pasó/i });
    expect(screen.queryByText(/^boom$/)).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText(/^boom$/)).toBeTruthy();
  });

  it('Volver al inicio invokes onReset and clears the boundary', () => {
    const onReset = vi.fn();
    renderWithI18n(
      <ErrorBoundary onReset={onReset}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /volver al inicio/i }));
    expect(onReset).toHaveBeenCalledOnce();
    // Boundary state has been reset; if children re-render and still throw,
    // it will catch again — that's expected.
  });

  it('Reintentar disappears after 2 unsuccessful retries (cap)', () => {
    renderWithI18n(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    // Click 1
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    // Click 2
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    // After 2 retries, the button should be gone (cap MAX_SOFT_RETRIES=2).
    expect(screen.queryByRole('button', { name: /reintentar/i })).toBeNull();
    // The "retryExhausted" guidance should be visible.
    expect(screen.getByText(/persiste/i)).toBeTruthy();
  });

  it('Recargar app calls window.location.reload', () => {
    const reloadSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadSpy },
    });

    try {
      renderWithI18n(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>,
      );
      fireEvent.click(screen.getByRole('button', { name: /recargar app/i }));
      expect(reloadSpy).toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    }
  });
});
