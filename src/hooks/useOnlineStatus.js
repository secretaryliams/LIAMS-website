import { useState, useEffect } from 'react';

/**
 * React hook to listen to browser online/offline status in real-time.
 * Performs full event listener cleanup to prevent memory leaks.
 * 
 * @returns {boolean} True if the browser has internet connectivity, false otherwise.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => 
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Pre-emptive double-check
    setIsOnline(window.navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
