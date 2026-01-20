import { createContext, useCallback, useContext, useState } from 'react';

/**
 * Toast notification system for user feedback.
 * Supports success, error, warning, and info toasts.
 */

const ToastContext = createContext(null);

const TOAST_DURATION = 4000;

const toastStyles = {
  success: {
    container: 'border-green-200 bg-green-50',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-600',
  },
  error: {
    container: 'border-red-200 bg-red-50',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-600',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50',
    icon: 'text-amber-600',
    title: 'text-amber-800',
    message: 'text-amber-600',
  },
  info: {
    container: 'border-sky-200 bg-sky-50',
    icon: 'text-sky-600',
    title: 'text-sky-800',
    message: 'text-sky-600',
  },
};

const toastIcons = {
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function ToastItem({ toast, onDismiss }) {
  const styles = toastStyles[toast.type] || toastStyles.info;
  const icon = toastIcons[toast.type] || toastIcons.info;

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 ${styles.container}`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold ${styles.title}`}>{toast.title}</p>
        )}
        {toast.message && (
          <p className={`text-sm ${styles.message} ${toast.title ? 'mt-1' : ''}`}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-white/50 ${styles.icon}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || TOAST_DURATION);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, title) => {
    return addToast({ type: 'success', message, title });
  }, [addToast]);

  const error = useCallback((message, title) => {
    return addToast({ type: 'error', message, title });
  }, [addToast]);

  const warning = useCallback((message, title) => {
    return addToast({ type: 'warning', message, title });
  }, [addToast]);

  const info = useCallback((message, title) => {
    return addToast({ type: 'info', message, title });
  }, [addToast]);

  const value = { addToast, dismissToast, success, error, warning, info };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-96">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
