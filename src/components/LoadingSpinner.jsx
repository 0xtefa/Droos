/**
 * Loading spinner components for various use cases.
 */

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <svg
      className={`animate-spin text-sky-600 ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function LoadingSpinner({ message = 'جاري التحميل...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <Spinner size="lg" />
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

export function FullPageLoader({ message = 'جاري التحميل...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl">
        <Spinner size="xl" />
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
}

export function ButtonSpinner({ className = '' }) {
  return <Spinner size="sm" className={className} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default LoadingSpinner;
