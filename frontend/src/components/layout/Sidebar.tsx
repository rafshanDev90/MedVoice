import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Mic,
  Settings,
  Activity,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Transcribe', path: '/transcribe', icon: Mic, badge: 'Live' },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <aside className="w-64 bg-[#1E293B] flex flex-col h-full shrink-0 select-none border-r border-slate-800">
      {/* Brand Logo Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#2F5496] rounded flex items-center justify-center text-white shrink-0 shadow-sm">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          Medi<span className="text-[#2F5496]">Report</span>
        </span>
      </div>

      {/* Main Navigation Links */}
      <nav className="mt-2 flex-1 space-y-1 px-3 overflow-y-auto">
        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2F5496] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Profile Card */}
      <div className="p-4 border-t border-slate-700/80 mt-auto bg-[#182232]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 overflow-hidden shrink-0 flex items-center justify-center">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-bold">
                {user?.first_name?.charAt(0) || 'D'}{user?.last_name?.charAt(0) || 'R'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.full_name || 'Dr. Sarah Miller'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.specialty || 'Cardiologist'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">{sidebarContent}</div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs bg-[#1E293B] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="font-bold text-white text-sm">Navigation</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

