import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Activity, Mail, Lock, Shield, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('dr.sarah.jenkins@medireport.org');
  const [password, setPassword] = useState('DoctorSecret123!');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid medical email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      showSuccess('Welcome back, Dr. Jenkins!', 'Authentication Successful');
      navigate(from, { replace: true });
    } catch (err: any) {
      showError(
        err.response?.data?.detail || 'Invalid email or password. Please try again.',
        'Login Failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoDoctor = () => {
    setEmail('dr.sarah.jenkins@medireport.org');
    setPassword('DoctorSecret123!');
    setEmailError('');
    setPasswordError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-radial from-slate-800 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header Banner */}
        <div className="bg-[#2F5496] p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-blue-400/20 blur-xl"></div>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-3 ring-1 ring-white/20 shadow-inner">
            <Activity className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">MediReport</h1>
          <p className="text-blue-100 text-xs font-medium mt-1">
            Clinical AI Consultation & Report System
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Medical Email"
              type="email"
              placeholder="doctor@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              required
              icon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              required
              icon={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-[#2F5496] focus:ring-[#2F5496]"
                />
                <span>Remember this terminal</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert('For password recovery, contact your hospital IT administrator.')
                }
                className="text-[#2F5496] font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2 font-bold shadow-md"
            >
              Sign In to MediReport
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Demo Login</span>
              </span>
              <button
                onClick={fillDemoDoctor}
                className="text-xs text-[#2F5496] font-semibold hover:underline"
              >
                Auto-fill
              </button>
            </div>

            <button
              type="button"
              onClick={fillDemoDoctor}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#2F5496]/50 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">Dr. Sarah Jenkins</p>
                <p className="text-[11px] text-slate-500">dr.sarah.jenkins@medireport.org</p>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-[#2F5496]">
                Cardiology
              </span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() =>
                alert(
                  'Registration requires institutional verification. Contact your hospital admin or support@medireport.org'
                )
              }
              className="text-[#2F5496] font-bold hover:underline"
            >
              Request Access
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted HIPAA Medical Data Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
