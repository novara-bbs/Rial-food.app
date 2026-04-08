import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

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
          <div className="text-4xl">⚠️</div>
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
