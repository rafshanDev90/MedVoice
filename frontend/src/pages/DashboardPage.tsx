import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Calendar,
  FileText,
  Mic,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  UserPlus,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { stats, reports, addPatient } = useData();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  // Add Patient Modal State
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('1985-06-15');
  const [newPatientGender, setNewPatientGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newPatientPhone, setNewPatientPhone] = useState('+1 (555) 019-2831');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  // Chart data for weekly consultations
  const weeklyData = [
    { day: 'Mon', consultations: 4, transcripts: 3 },
    { day: 'Tue', consultations: 6, transcripts: 5 },
    { day: 'Wed', consultations: 8, transcripts: 7 },
    { day: 'Thu', consultations: 5, transcripts: 4 },
    { day: 'Fri', consultations: 9, transcripts: 8 },
    { day: 'Sat', consultations: 2, transcripts: 2 },
  ];

  const statusDistribution = [
    { name: 'Completed', value: reports.filter((r) => r.status === 'Completed').length || 4, color: '#10B981' },
    { name: 'Pending', value: reports.filter((r) => r.status === 'Pending').length || 1, color: '#F59E0B' },
    { name: 'In Progress', value: reports.filter((r) => r.status === 'In Progress').length || 1, color: '#2F5496' },
  ];

  const handleCreatePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    setIsSavingPatient(true);
    try {
      const created = await addPatient({
        full_name: newPatientName,
        date_of_birth: newPatientDob,
        gender: newPatientGender,
        phone: newPatientPhone,
        email: newPatientEmail || `${newPatientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        address: '100 Healthcare Way, Medical District',
        emergency_contact: 'Family Member - +1 (555) 999-0000',
        blood_group: 'O+',
      });
      showSuccess(`Patient ${created.full_name} (${created.mrn}) created successfully!`);
      setIsAddPatientOpen(false);
      setNewPatientName('');
    } finally {
      setIsSavingPatient(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-[#2F5496] to-[#1c325c] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shift Active • Clinical Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name || 'Dr. Sarah Jenkins'}
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl leading-relaxed">
              Real-time consultation speech streaming, automated SOAP reports, and patient record management.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsAddPatientOpen(true)}
              icon={<UserPlus className="w-4 h-4" />}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Add Patient
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/transcribe')}
              icon={<Mic className="w-4 h-4" />}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none shadow-md"
            >
              Start Dictation
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.total_patients}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2F5496] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% increase this month</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2F5496]"></div>
        </div>

        {/* Card 2: Consultations This Week */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultations Week</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.consultations_this_week}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Avg 14 min per session</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Card 3: Reports Generated */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports Generated</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.total_reports}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% SOAP Compliant</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Card 4: Avg Transcript Length */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Transcript Words</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.avg_transcript_length}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>High accuracy speech stream</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/transcribe')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-[#2F5496] transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#2F5496] text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800">New Dictation</span>
            <span className="text-[10px] text-slate-500">Voice to SOAP</span>
          </button>

          <button
            onClick={() => setIsAddPatientOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800">Add Patient</span>
            <span className="text-[10px] text-slate-500">Create MRN profile</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-500 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800">View Reports</span>
            <span className="text-[10px] text-slate-500">Search & export</span>
          </button>

          <button
            onClick={() => navigate('/patients')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-500 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800">Patient Directory</span>
            <span className="text-[10px] text-slate-500">Full directory</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts & Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Consultations Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2F5496]" />
                <span>Weekly Consultation Volume</span>
              </h3>
              <p className="text-xs text-slate-500">Dictated voice sessions & finalized SOAP reports</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              This Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="consultations" name="Consultations" fill="#2F5496" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transcripts" name="Dictations" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Report Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Report Status</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution of active reports</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Medical Reports</h2>
            <p className="text-xs text-slate-500">Last consultations recorded by Dr. Jenkins</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/reports')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            View All Reports
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Patient Name</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.slice(0, 5).map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/reports/${r.id}`)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex flex-col">
                      <span>{r.patient_name}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">{r.patient_mrn}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800">{r.type}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{r.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={r.status} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="text-[#2F5496] font-semibold text-xs hover:underline inline-flex items-center gap-1">
                      View Report <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title="Add New Patient"
        subtitle="Create a new medical record number profile in MediReport"
      >
        <form onSubmit={handleCreatePatientSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Eleanor Vance"
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={newPatientDob}
              onChange={(e) => setNewPatientDob(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={newPatientGender}
                onChange={(e) => setNewPatientGender(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#2F5496] focus:ring-2 focus:ring-[#2F5496]/20 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={newPatientPhone}
              onChange={(e) => setNewPatientPhone(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={newPatientEmail}
              onChange={(e) => setNewPatientEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddPatientOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingPatient}>
              Save Patient Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
