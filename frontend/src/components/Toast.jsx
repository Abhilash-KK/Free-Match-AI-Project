import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning';

  return (
    <div className="fixed top-6 right-6 z-50 animate-bounce-in max-w-sm w-full">
      <div className={`p-4 rounded-2xl border shadow-2xl flex items-start justify-between space-x-3 backdrop-blur-xl transition-all ${
        isSuccess ? 'bg-slate-900/95 border-emerald-500/50 text-white shadow-emerald-500/10' :
        isError ? 'bg-slate-900/95 border-rose-500/50 text-white shadow-rose-500/10' :
        isWarning ? 'bg-slate-900/95 border-amber-500/50 text-white shadow-amber-500/10' :
        'bg-slate-900/95 border-blue-500/50 text-white shadow-blue-500/10'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
            isSuccess ? 'bg-emerald-500 text-white' :
            isError ? 'bg-rose-500 text-white' :
            isWarning ? 'bg-amber-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {isSuccess ? '✔' : isError ? '✖' : isWarning ? '⚠️' : 'ℹ️'}
          </div>
          <div>
            <h4 className="font-extrabold text-xs tracking-wide uppercase text-slate-300">
              {isSuccess ? 'SUCCESS' : isError ? 'ERROR' : isWarning ? 'WARNING' : 'NOTIFICATION'}
            </h4>
            <p className="text-xs font-semibold text-slate-100 mt-0.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg text-xs cursor-pointer">
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
