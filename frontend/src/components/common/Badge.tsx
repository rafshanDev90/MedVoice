import React from 'react';
import { ReportStatus } from '../../types';

interface BadgeProps {
  status: ReportStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in progress':
      case 'in_progress':
        return 'bg-blue-50 text-[#2F5496] border-blue-200';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDotStyle = (st: string) => {
    switch (st.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-amber-500';
      case 'in progress':
      case 'in_progress':
        return 'bg-[#2F5496] animate-pulse';
      case 'draft':
        return 'bg-slate-400';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${getBadgeStyle(
        status
      )} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle(status)}`} />
      <span>{status}</span>
    </span>
  );
};
