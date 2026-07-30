import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/api';

const BackendStatusBadge = () => {
  const [status, setStatus] = useState({ loading: true, online: false, message: '' });

  const verifyHealth = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    const res = await checkBackendHealth();
    if (res.online) {
      setStatus({
        loading: false,
        online: true,
        message: res.data.message || 'Django Backend Connected'
      });
    } else {
      setStatus({
        loading: false,
        online: false,
        message: 'Django Offline (Local Mode)'
      });
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-300 border border-slate-700/50 bg-slate-900/90 text-white">
      <span className="relative flex h-2.5 w-2.5">
        {status.online ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        )}
      </span>
      <span>
        {status.loading ? 'Checking Django Backend...' : (
          status.online ? (
            <span className="text-emerald-400 flex items-center gap-1">
              Python Django API Connected
            </span>
          ) : (
            <span className="text-amber-400">
              Django Offline (Local Mode)
            </span>
          )
        )}
      </span>
      <button 
        onClick={verifyHealth}
        title="Refresh Connection"
        className="ml-1 text-slate-400 hover:text-white transition-colors"
      >
        ↻
      </button>
    </div>
  );
};

export default BackendStatusBadge;
