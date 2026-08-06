import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { exportReportToExcel, exportPatientAllReportsToExcel } from '../services/excel';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Droplet,
  Plus,
  Mic,
  Download,
  FileText,
  Edit2,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatientById, getReportsByPatientId, deletePatient } = useData();
  const { showSuccess, showError } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const patient = id ? getPatientById(id) : undefined;
  const patientReports = id ? getReportsByPatientId(id) : [];

  if (!patient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs my-8">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Patient Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          The requested Medical Record ID could not be located in the database.
        </p>
        <Button variant="primary" onClick={() => navigate('/patients')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Patient Directory
        </Button>
      </div>
    );
  }

  const handleExportAll = () => {
    try {
      exportPatientAllReportsToExcel(patient, patientReports);
      showSuccess(`Exported all records for ${patient.full_name} to Excel.`);
    } catch {
      showError('Failed to generate Excel file.');
    }
  };

  const handleExportSingleReport = (report: any) => {
    try {
      exportReportToExcel(report, patient);
      showSuccess(`Exported ${report.type} report to Excel.`);
    } catch {
      showError('Failed to generate Excel file.');
    }
  };

  const handleDeletePatient = async () => {
    try {
      await deletePatient(patient.id);
      showSuccess(`Patient ${patient.full_name} record removed.`);
      navigate('/patients');
    } catch {
      showError('Failed to delete patient record.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
            title="Return to list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{patient.full_name}</h1>
              <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-blue-50 text-[#2F5496] border border-blue-200">
                {patient.mrn}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered Patient • {patient.gender}, DOB: {patient.date_of_birth}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportAll}
            icon={<Download className="w-4 h-4 text-emerald-600" />}
            size="sm"
          >
            Export All to Excel
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/transcribe?patient_id=${patient.id}`)}
            icon={<Mic className="w-4 h-4 text-[#2F5496]" />}
            size="sm"
          >
            Transcribe Consultation
          </Button>

          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
            size="sm"
          >
            Delete Profile
          </Button>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#2F5496]" />
            <span>Clinical Demographics & Contact Info</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Blood Group:</span>
            <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
              <Droplet className="w-3 h-3 fill-current" /> {patient.blood_group}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                <p className="font-bold text-slate-800">{patient.full_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth / Age</p>
                <p className="font-medium text-slate-800">{patient.date_of_birth} (Gender: {patient.gender})</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                <p className="font-medium text-slate-800">{patient.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="font-medium text-slate-800">{patient.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</p>
                <p className="font-medium text-slate-800">{patient.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Emergency Contact</p>
                <p className="font-medium text-slate-800">{patient.emergency_contact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Consultation & SOAP Report History ({patientReports.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Recorded clinical reports for this patient</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/transcribe?patient_id=${patient.id}`)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Report
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Report Type</th>
                <th className="px-6 py-3.5">Attending Doctor</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientReports.length > 0 ? (
                patientReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">{r.date}</td>
                    <td className="px-6 py-4 font-bold text-[#2F5496] whitespace-nowrap">
                      <Link to={`/reports/${r.id}`} className="hover:underline flex items-center gap-1">
                        {r.type} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{r.doctor_name}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {r.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/reports/${r.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportSingleReport(r)}
                        icon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Export
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">No Consultation Reports Found</p>
                    <p className="text-xs mt-0.5">Start a live voice dictation session for {patient.full_name}.</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/transcribe?patient_id=${patient.id}`)}
                      icon={<Mic className="w-4 h-4" />}
                      className="mt-3"
                    >
                      Start Voice Dictation
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete Patient Profile for ${patient.full_name}?`}
        subtitle="Permanent record deletion"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to permanently remove {patient.full_name} ({patient.mrn})?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePatient}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
