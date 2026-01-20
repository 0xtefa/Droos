import { useEffect, useState } from 'react';
import { skipWaiting } from '../utils/serviceWorker';

/**
 * Component that shows when a new version of the app is available.
 * Prompts user to refresh to get the latest version.
 */
export default function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShowUpdate(true);
    };

    window.addEventListener('sw-update-available', handleUpdate);
    return () => {
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  const handleRefresh = () => {
    skipWaiting();
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-sky-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-sky-800">تحديث متاح</h3>
            <p className="mt-1 text-xs text-sky-600">
              يتوفر إصدار جديد من التطبيق. قم بالتحديث للحصول على أحدث الميزات.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleRefresh}
                className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-sky-700"
              >
                تحديث الآن
              </button>
              <button
                onClick={() => setShowUpdate(false)}
                className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 shadow-sm transition-colors hover:bg-sky-50"
              >
                لاحقًا
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
