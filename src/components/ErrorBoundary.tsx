import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
          <div className="dashboard-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-salami-red" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Something went wrong</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
              The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-lg text-left text-xs font-mono mb-6 overflow-auto max-h-40 border border-red-500/20">
                <p className="font-black mb-1">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap opacity-70 text-[9px] leading-tight select-all">{this.state.error.stack}</pre>
                )}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-salami-red text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
