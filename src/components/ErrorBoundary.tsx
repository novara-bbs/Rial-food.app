import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-brand-secondary" />
          <h2 className="font-headline text-xl font-bold uppercase tracking-tighter text-tertiary">
            Algo salió mal
          </h2>
          <p className="font-body text-sm text-on-surface-variant max-w-sm">
            Ha ocurrido un error inesperado. Intenta recargar la página.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
