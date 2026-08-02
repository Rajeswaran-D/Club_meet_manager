import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-full flex items-center justify-center p-8 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-6" size={48} />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">
              An unexpected error occurred in this section of the application. 
              Our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-left bg-red-50 p-4 rounded-lg mb-6 overflow-auto text-xs text-red-800">
                <pre>{this.state.error?.toString()}</pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors shadow-sm"
            >
              <RefreshCw size={18} className="mr-2" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
