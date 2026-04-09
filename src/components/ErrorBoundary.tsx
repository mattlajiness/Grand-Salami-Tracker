import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
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
      let message = "Something went wrong.";
      try {
        const errInfo = JSON.parse(this.state.error?.message || "");
        if (errInfo.error && errInfo.error.includes("insufficient permissions")) {
          message = "You don't have permission to perform this action. Please make sure you are logged in.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
          <div className="dashboard-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-salami-red" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Application Error</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              {message}
            </p>
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
