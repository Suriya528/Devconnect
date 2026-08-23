import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineNotifier = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100000] px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl border transition-all duration-500 flex items-center gap-2.5 text-xs font-semibold tracking-wide ${
        isOffline
          ? 'bg-red-950/90 text-red-200 border-red-500/30 shadow-red-950/50 animate-bounce-short'
          : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30 shadow-emerald-950/50'
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
          <span>You are currently offline. Retrying connection...</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span>Connection restored.</span>
        </>
      )}
    </div>
  );
};

export default React.memo(OfflineNotifier);
