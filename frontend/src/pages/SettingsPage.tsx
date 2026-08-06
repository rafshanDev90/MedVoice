import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  Settings,
  User,
  Lock,
  Bell,
  Globe,
  Check,
  Shield,
  Activity,
  Server,
  Key,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || 'Dr. Sarah Jenkins');
  const [email, setEmail] = useState(user?.email || 'dr.sarah.jenkins@medireport.org');
  const [specialty, setSpecialty] = useState(user?.specialty || 'Internal Medicine & Cardiology');
  const [licenseNumber, setLicenseNumber] = useState(user?.license_number || 'MD-94021-CA');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // System & WebSocket Server Config State
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/api/v1/transcribe/stream/');
  const [restApiUrl, setRestApiUrl] = useState('http://localhost:8000/api/v1');

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soapAutoSave, setSoapAutoSave] = useState(true);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      const parts = fullName.trim().split(' ');
      updateProfile({
        full_name: fullName,
        first_name: parts[0] || 'Dr.',
        last_name: parts.slice(1).join(' ') || 'Doctor',
        email,
        specialty,
        license_number: licenseNumber,
      });
      setIsSavingProfile(false);
      showSuccess('Updated clinical user profile information.');
    }, 600);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showError('Please enter current password');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password updated successfully.');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#2F5496]" />
          <span>System & Account Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage practitioner profile, credentials, security, and WebSocket backend connection parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-[#2F5496]" />
              <h2 className="text-base font-bold text-slate-900">Practitioner Profile</h2>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <Input
                label="Full Clinical Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Medical Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Medical License #"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>

              <Input
                label="Clinical Specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={isSavingProfile} icon={<Check className="w-4 h-4" />}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-[#2F5496]" />
              <h2 className="text-base font-bold text-slate-900">Password & Security</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="secondary" isLoading={isChangingPassword} icon={<Key className="w-4 h-4" />}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: WebSocket & Notification Prefs */}
        <div className="space-y-6">
          {/* WebSocket Server Connection Config */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Server className="w-5 h-5 text-[#2F5496]" />
              <h2 className="text-base font-bold text-slate-900">Backend Connection</h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              MediReport communicates with your Django REST API & WebSocket server for audio streaming.
            </p>

            <div className="space-y-3">
              <Input
                label="WebSocket Audio Stream URL"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                helperText="Binary speech chunking stream"
              />

              <Input
                label="Django REST API Base URL"
                value={restApiUrl}
                onChange={(e) => setRestApiUrl(e.target.value)}
                helperText="HTTP REST JSON API"
              />

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Web Speech Fallback Ready
                </div>
                <p className="text-[11px] opacity-90">
                  If backend WebSocket is unreachable, native browser speech recognition operates automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-5 h-5 text-[#2F5496]" />
              <h2 className="text-base font-bold text-slate-900">Preferences</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Auto-save SOAP Drafts</p>
                  <p className="text-slate-500 text-[11px]">Save generated reports automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={soapAutoSave}
                  onChange={(e) => setSoapAutoSave(e.target.checked)}
                  className="w-4 h-4 text-[#2F5496] rounded border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Email Report Notifications</p>
                  <p className="text-slate-500 text-[11px]">Receive daily consultation summaries</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#2F5496] rounded border-slate-300"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
