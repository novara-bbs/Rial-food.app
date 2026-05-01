/**
 * ErrorBoundary — global app-level (and feature-level via FeatureErrorBoundary).
 *
 * Sprint [1.5.175] rewrite. The previous version offered a single "Reintentar"
 * button that only flipped `hasError: false` — when the underlying state was
 * still corrupt (e.g. malformed entry in `dailyLog` localStorage), the same
 * crash repeated and the user was stuck. The new version offers three
 * recovery paths comparable to Notion / Linear / Stripe Dashboard:
 *
 *   • Reintentar (soft) — clears the boundary state. Hidden after 2 fails.
 *   • Volver al inicio  — invokes `onReset` (App.tsx clears modals + nav home).
 *   • Recargar app      — `window.location.reload()`. Hidden at feature scope.
 *
 * Plus a collapsible "¿Qué pasó?" disclosure showing `error.message` truncated
 * (full stack still goes to Sentry).
 *
 * The class component intentionally does NOT consume `useI18n()` — class
 * components can't call hooks. We pass the translations down via a tiny
 * functional wrapper (`I18nErrorBoundary`) so the rendered fallback is
 * locale-aware while the catch lifecycle remains in the class.
 */
import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw, RotateCcw } from 'lucide-react';
import { logger } from '../lib/logger';
import { useI18n, type Translations } from '../i18n';

const MAX_SOFT_RETRIES = 2;
const ERROR_MESSAGE_MAX_CHARS = 200;

interface Props {
  children: React.ReactNode;
  /** Override the entire fallback. When provided, the built-in UI is bypassed. */
  fallback?: React.ReactNode;
  /** Localised translations passed by the wrapper (class can't call hooks). */
  t: Translations;
  /**
   * Called when the user clicks "Volver al inicio". App.tsx wires this to
   * `navigateTo('home')` + closes any open modals. The boundary then resets
   * its own state.
   */
  onReset?: () => void;
  /** Surface name (e.g. "Home", "Cocina") for contextual messaging. */
  featureName?: string;
  /** Hide the "Recargar app" button — used by feature-level boundaries. */
  hideReload?: boolean;
  /** Compact in-place layout for feature-level usage. */
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  detailsOpen: boolean;
}

class ErrorBoundaryClass extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, retryCount: 0, detailsOpen: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        featureName: this.props.featureName ?? 'global',
        retryCount: this.state.retryCount,
      });
      scope.setContext('react', { componentStack: info.componentStack ?? '' });
      Sentry.captureException(error);
    });
    logger.error('ErrorBoundary caught error', {
      error: error.message,
      stack: info.componentStack ?? '',
      featureName: this.props.featureName ?? 'global',
    });
  }

  handleSoftRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
      detailsOpen: false,
    }));
  };

  handleGoHome = () => {
    try {
      this.props.onReset?.();
    } catch (err) {
      logger.error('ErrorBoundary onReset threw', { err: err instanceof Error ? err.message : String(err) });
    }
    this.setState({ hasError: false, error: null, detailsOpen: false });
  };

  handleHardReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  toggleDetails = () => {
    this.setState((prev) => ({ detailsOpen: !prev.detailsOpen }));
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const { t, featureName, hideReload, compact } = this.props;
    const { error, retryCount, detailsOpen } = this.state;
    const showRetry = retryCount < MAX_SOFT_RETRIES;
    const errorMessage = error?.message
      ? error.message.length > ERROR_MESSAGE_MAX_CHARS
        ? `${error.message.slice(0, ERROR_MESSAGE_MAX_CHARS)}…`
        : error.message
      : '';

    const containerClass = compact
      ? 'flex flex-col items-center justify-center py-10 px-6 text-center space-y-3'
      : 'flex flex-col items-center justify-center py-20 px-6 text-center space-y-4';

    const message = featureName
      ? t.errors.boundary.featureMessage.replace('{feature}', featureName)
      : t.errors.boundary.message;

    return (
      <div className={containerClass} role="alert" aria-live="polite" data-testid="error-boundary-fallback">
        <AlertTriangle className="w-10 h-10 text-brand-secondary" aria-hidden="true" />
        <h2 className="font-headline text-xl font-bold uppercase tracking-tighter text-tertiary">
          {t.errors.boundary.title}
        </h2>
        <p className="font-body text-sm text-on-surface-variant max-w-sm">
          {message}
        </p>

        {!showRetry && (
          <p className="font-body text-caption text-on-surface-variant max-w-sm">
            {t.errors.boundary.retryExhausted}
          </p>
        )}

        {errorMessage && (
          <div className="w-full max-w-sm">
            <button
              type="button"
              onClick={this.toggleDetails}
              aria-expanded={detailsOpen}
              className="inline-flex items-center gap-1.5 text-caption text-on-surface-variant hover:text-on-surface min-h-11 px-2"
            >
              {detailsOpen
                ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              }
              {t.errors.boundary.detailsToggle}
            </button>
            {detailsOpen && (
              <pre className="mt-1 p-3 bg-surface-container-low border border-outline-variant/30 rounded-sm text-caption text-on-surface-variant text-left overflow-x-auto whitespace-pre-wrap break-words">
                {errorMessage}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 w-full max-w-sm">
          {showRetry && (
            <button
              type="button"
              onClick={this.handleSoftRetry}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-3 min-h-11 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              {t.errors.boundary.retryAction}
            </button>
          )}
          <button
            type="button"
            onClick={this.handleGoHome}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 min-h-11 bg-surface-container-high border border-outline-variant text-on-surface rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            {t.errors.boundary.goHomeAction}
          </button>
          {!hideReload && (
            <button
              type="button"
              onClick={this.handleHardReload}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-3 min-h-11 text-on-surface-variant hover:text-on-surface rounded-sm font-headline text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              {t.errors.boundary.reloadAction}
            </button>
          )}
        </div>
      </div>
    );
  }
}

/**
 * Functional wrapper that injects locale-aware translations into the
 * class-based boundary. This is the public export consumed by App.tsx
 * and FeatureErrorBoundary.
 */
export default function ErrorBoundary(props: Omit<Props, 't'>) {
  const { t } = useI18n();
  return <ErrorBoundaryClass {...props} t={t} />;
}
