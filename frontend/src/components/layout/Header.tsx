import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  Plus,
  FileText,
  Users as PatientsIcon,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebarMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebarMobile }) => {
  const { user, logout } = useAuth();
  const { patients, reports } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredReports = searchQuery.trim()
    ? reports.filter(
        (r) =>
          r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
      {/* Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input Box */}
      <div ref={searchRef} className="flex-1 max-w-md relative hidden sm:block">
        <div className="relative flex items-center">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search patients, reports, records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#2F5496] focus:bg-white text-[#1E293B] placeholder-slate-400 transition-all"
          />
        </div>

        {/* Dropdown Results */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 p-2">
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Patients ({filteredPatients.length})
            </div>
            {filteredPatients.length > 0 ? (
              filteredPatients.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    navigate(`/patients/${p.id}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm"
                >
                  <PatientsIcon className="w-4 h-4 text-[#2F5496] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{p.full_name}</p>
                    <p className="text-xs text-slate-500">{p.mrn} • {p.gender}, DOB: {p.date_of_birth}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-3 py-1.5 text-xs text-slate-400 italic">No matching patients</p>
            )}

            <div className="border-t border-slate-100 my-1"></div>

            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reports ({filteredReports.length})
            </div>
            {filteredReports.length > 0 ? (
              filteredReports.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    navigate(`/reports/${r.id}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm"
                >
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{r.type}</p>
                    <p className="text-xs text-slate-500">{r.patient_name} • {r.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-3 py-1.5 text-xs text-slate-400 italic">No matching reports</p>
            )}
          </div>
        )}
      </div>

      {/* Actions & Avatar Menu */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-800">Notifications</span>
                <span className="text-xs text-[#2F5496] font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                  <p className="font-semibold text-slate-800">System Ready</p>
                  <p className="text-slate-600 mt-0.5">
                    Real-time WebSocket stream manager active on ws://localhost:8000/api/v1/transcribe/stream/
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate('/transcribe')}
          className="bg-[#2F5496] text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </button>

        {/* User Profile Avatar Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'}
              alt={user?.full_name || 'User avatar'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="font-bold text-slate-900">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-100 text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-100 text-left"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>System Config</span>
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

