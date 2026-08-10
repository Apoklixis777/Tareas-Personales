import { useState, useEffect } from 'react';

export function usePWAUpdate() {
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // In Vite Development Mode, unregister any service workers to prevent dev server double-loads
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
      return;
    }

    // Production Service Worker registration & update tracking
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check if there is already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setHasUpdate(true);
      }

      // Listen for new workers being installed
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setHasUpdate(true);
          }
        });
      });
    }).catch((err) => {
      console.error('Error registrando Service Worker:', err);
    });
  }, []);

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      window.location.reload();
    }
  };

  return { hasUpdate, updateApp };
}
