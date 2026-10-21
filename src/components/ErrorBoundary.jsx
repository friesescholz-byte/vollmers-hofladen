import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary abgefangen:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 text-ink">
          <div className="w-full max-w-md bg-canvas-card rounded-3xl p-6 sm:p-8 border border-ink-border shadow-elevated text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-subtle">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-forest block">
                Hinweis zur Ansicht
              </span>
              <h2 className="font-serif text-2xl text-ink font-semibold">
                Seite kurz neu laden
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Beim Laden dieser Ansicht ist ein kurzer Anzeigekonflikt aufgetreten. Bitte aktualisiere die Seite oder kehre zur Startseite zurück.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-subtle"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Seite neu laden</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-canvas border border-ink-border text-ink hover:bg-canvas-muted text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4 text-forest" />
                <span>Zur Startseite</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
