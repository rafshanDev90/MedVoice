import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-[#2F5496] shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900',
          warning: 'border-amber-200 bg-amber-50/95 text-amber-900',
          error: 'border-red-200 bg-red-50/95 text-red-900',
          info: 'border-blue-200 bg-blue-50/95 text-blue-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xs transition-all duration-300 animate-in slide-in-from-top-2 ${
              borderStyles[toast.type]
            }`}
          >
            <div className="flex items-start gap-3">
              {icons[toast.type]}
              <div>
                {toast.title && <h4 className="font-semibold text-sm leading-tight mb-0.5">{toast.title}</h4>}
                <p className="text-xs font-normal opacity-90 leading-snug">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
