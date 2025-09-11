import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
          <div className="text-center text-white max-w-md">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-300 mb-6">
                We encountered an unexpected error. Don't worry, your game progress is safe!
              </p>
            </div>

            <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-mono text-red-200">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-white text-red-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Reload Game
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-400">
              <p>If the problem persists, please contact support.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 