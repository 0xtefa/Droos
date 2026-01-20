import { useEffect, useState } from 'react';
import { isInstallAvailable, promptInstall } from '../utils/serviceWorker';

/**
 * Component that prompts users to install the PWA.
 * Only shows when the app can be installed.
 */
export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    // Check if install is already available
    if (isInstallAvailable()) {
      setShowPrompt(true);
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-green-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">تثبيت التطبيق</h3>
            <p className="mt-1 text-xs text-green-600">
              ثبّت تطبيق دروس على جهازك للوصول السريع والاستخدام بدون اتصال.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstall}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-green-700"
              >
                تثبيت
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm transition-colors hover:bg-green-50"
              >
                ليس الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
