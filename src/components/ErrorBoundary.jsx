import { Component } from 'react';

/**
 * Error Boundary component to catch JavaScript errors anywhere in the
 * child component tree and display a fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              حدث خطأ غير متوقع
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs text-red-700">
                <summary className="cursor-pointer font-medium">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleRetry}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-700"
              >
                حاول مرة أخرى
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A simpler functional wrapper for page-level error handling
 */
export function PageErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-red-800">
              تعذر تحميل هذه الصفحة
            </h2>
            <p className="mb-4 text-sm text-red-600">
              حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة لاحقاً.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
