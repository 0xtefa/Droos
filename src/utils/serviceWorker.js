/**
 * Service Worker registration and update utilities
 */

const SW_URL = '/sw.js';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    if (import.meta.env.DEV) console.log('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: '/',
    });

    if (import.meta.env.DEV) console.log('ServiceWorker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            dispatchUpdateEvent();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('ServiceWorker registration failed:', error);
    return null;
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

export function skipWaiting() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function clearCache() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}

function dispatchUpdateEvent() {
  window.dispatchEvent(new CustomEvent('sw-update-available'));
}

// Check if the app is running in standalone mode (installed PWA)
export function isPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// Check if the app can be installed
export function canInstall() {
  return 'BeforeInstallPromptEvent' in window;
}

// PWA install prompt handler
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-install-available'));
});

export async function promptInstall() {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return outcome === 'accepted';
}

export function isInstallAvailable() {
  return deferredPrompt !== null;
}
