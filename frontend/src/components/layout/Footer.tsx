import React from 'react';
import { Wifi, ShieldCheck, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[11px] font-medium text-slate-400 shrink-0 uppercase tracking-wider select-none">
      <div className="flex items-center gap-3">
        <span className="text-slate-600 font-bold">MediReport Clinical v2.4.0</span>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold normal-case">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3.5 h-3.5" />
          <span>WebSocket Stream Active</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-500 normal-case">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F5496]" />
          <span>HIPAA Compliant</span>
        </div>
        <span className="text-slate-300">•</span>
        <a
          href="#support"
          onClick={(e) => {
            e.preventDefault();
            alert('MediReport Clinical Support: support@medireport.org | Hotline: 1-800-555-MEDI');
          }}
          className="flex items-center gap-1 text-[#2F5496] hover:underline font-semibold normal-case"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support & Help</span>
        </a>
      </div>
    </footer>
  );
};

