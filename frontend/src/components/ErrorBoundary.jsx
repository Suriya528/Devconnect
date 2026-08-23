import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Enterprise Error Boundary Captured Exception]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleClearCacheAndReload = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06090F] flex items-center justify-center px-4 py-12 text-white font-sans">
          <div className="max-w-lg w-full bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
            {/* Alert Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-2">Application Exception Encountered</h1>
            <p className="text-sm text-gray-400 mb-6">
              An unexpected client-side error occurred. Our resilience boundary has isolated the failure to protect your session data.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Recover Application State
              </button>

              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-xl transition-all border border-white/10 text-sm"
              >
                Reload Window
              </button>

              <button
                onClick={this.handleClearCacheAndReload}
                className="text-xs text-gray-500 hover:text-gray-400 mt-2 transition-colors underline"
              >
                Clear session cache & return to login
              </button>
            </div>

            {/* Diagnostic Details Toggle */}
            {this.state.error && (
              <div className="mt-6 pt-6 border-t border-white/10 text-left">
                <button
                  onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                  className="text-xs font-mono text-indigo-400 hover:underline mb-2 block"
                >
                  {this.state.showDetails ? 'Hide Diagnostics' : 'Show Technical Diagnostics'}
                </button>

                {this.state.showDetails && (
                  <pre className="text-[11px] font-mono bg-black/50 p-4 rounded-xl text-red-300 overflow-x-auto max-h-40 border border-red-500/20">
                    {this.state.error.toString()}
                    {'\n'}
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;