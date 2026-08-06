import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { exportReportToExcel } from '../services/excel';
import { SOAPReport } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  Download,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReportById, getPatientById, updateReport, deleteReport } = useData();
  const { showSuccess, showError } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

  const report = id ? getReportById(id) : undefined;
  const patient = report ? getPatientById(report.patient_id) : undefined;

  const [editedSoap, setEditedSoap] = useState<SOAPReport>({
    subjective: report?.soap?.subjective || '',
    objective: report?.soap?.objective || '',
    assessment: report?.soap?.assessment || '',
    plan: report?.soap?.plan || '',
  });

  if (!report) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs my-8">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Report Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          The requested medical report record ID could not be located.
        </p>
        <Button variant="primary" onClick={() => navigate('/reports')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Reports Repository
        </Button>
      </div>
    );
  }

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportReportToExcel(report, patient);
      showSuccess(`Generated Excel workbook Report_${report.patient_name.replace(/\s+/g, '_')}_${report.date}.xlsx`);
    } catch {
      showError('Failed to generate Excel download.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateReport(report.id, { soap: editedSoap });
      setIsEditing(false);
      showSuccess('Saved updated SOAP report sections.');
    } catch {
      showError('Failed to update report sections.');
    }
  };

  const handleDeleteReport = async () => {
    try {
      await deleteReport(report.id);
      showSuccess('Report deleted successfully.');
      navigate('/reports');
    } catch {
      showError('Failed to delete report.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
            title="Return to reports"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900">{report.type}</h1>
              <Badge status={report.status} />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Report ID: {report.id} • Created: {report.date}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            isLoading={isExporting}
            icon={<Download className="w-4 h-4 text-emerald-600" />}
          >
            Export to Excel
          </Button>

          {isEditing ? (
            <Button variant="primary" onClick={handleSaveEdit} icon={<Check className="w-4 h-4" />}>
              Save Changes
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)} icon={<Edit3 className="w-4 h-4" />}>
              Edit Report
            </Button>
          )}

          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} icon={<Trash2 className="w-4 h-4" />}>
            Delete Report
          </Button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#2F5496]" />
            <span>Consultation Session Info</span>
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Report Category:</span>
              <span className="font-bold text-slate-800">{report.type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Consultation Date:</span>
              <span className="font-medium text-slate-800">{report.date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Attending Doctor:</span>
              <span className="font-medium text-slate-800">{report.doctor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audio Duration / Word Count:</span>
              <span className="font-mono text-xs font-semibold text-[#2F5496]">
                {report.duration} ({report.word_count || 320} words)
              </span>
            </div>
          </div>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#2F5496]" />
              <span>Patient Profile</span>
            </span>

            {patient && (
              <Link
                to={`/patients/${patient.id}`}
                className="text-[#2F5496] hover:underline text-xs font-bold inline-flex items-center gap-1 lowercase"
              >
                view profile <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-bold text-slate-800">{report.patient_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Medical Record Number (MRN):</span>
              <span className="font-mono text-xs font-bold text-slate-700">{report.patient_mrn}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Date of Birth / Gender:</span>
              <span className="font-medium text-slate-800">
                {patient?.date_of_birth || 'N/A'} ({patient?.gender || 'N/A'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Phone:</span>
              <span className="font-medium text-slate-800">{patient?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: SOAP Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>SOAP Clinical Documentation</span>
          </h2>
          {isEditing && (
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 animate-pulse">
              Editing Mode Active
            </span>
          )}
        </div>

        {/* 4 SOAP Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subjective */}
          <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2F5496] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#2F5496] text-white flex items-center justify-center text-xs">
                S
              </span>
              <span>Subjective (S)</span>
            </h3>
            {isEditing ? (
              <textarea
                value={editedSoap.subjective}
                onChange={(e) => setEditedSoap({ ...editedSoap, subjective: e.target.value })}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              />
            ) : (
              <p className="text-xs font-normal text-slate-800 whitespace-pre-wrap leading-relaxed">
                {report.soap?.subjective || 'No subjective text recorded.'}
              </p>
            )}
          </div>

          {/* Objective */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs">
                O
              </span>
              <span>Objective (O)</span>
            </h3>
            {isEditing ? (
              <textarea
                value={editedSoap.objective}
                onChange={(e) => setEditedSoap({ ...editedSoap, objective: e.target.value })}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              />
            ) : (
              <p className="text-xs font-normal text-slate-800 whitespace-pre-wrap leading-relaxed">
                {report.soap?.objective || 'No objective text recorded.'}
              </p>
            )}
          </div>

          {/* Assessment */}
          <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs">
                A
              </span>
              <span>Assessment (A)</span>
            </h3>
            {isEditing ? (
              <textarea
                value={editedSoap.assessment}
                onChange={(e) => setEditedSoap({ ...editedSoap, assessment: e.target.value })}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              />
            ) : (
              <p className="text-xs font-normal text-slate-800 whitespace-pre-wrap leading-relaxed">
                {report.soap?.assessment || 'No assessment text recorded.'}
              </p>
            )}
          </div>

          {/* Plan */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">
                P
              </span>
              <span>Plan (P)</span>
            </h3>
            {isEditing ? (
              <textarea
                value={editedSoap.plan}
                onChange={(e) => setEditedSoap({ ...editedSoap, plan: e.target.value })}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              />
            ) : (
              <p className="text-xs font-normal text-slate-800 whitespace-pre-wrap leading-relaxed">
                {report.soap?.plan || 'No plan text recorded.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Raw Transcript Collapsible Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Volume2 className="w-4 h-4 text-[#2F5496]" />
            <span>Original Dictation Raw Transcript</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{isTranscriptExpanded ? 'Hide Transcript' : 'Show Full Transcript'}</span>
            {isTranscriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isTranscriptExpanded && (
          <div className="p-5 border-t border-slate-200 bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed space-y-2">
            <p className="text-slate-400 text-[11px]">--- WebSocket Stream Raw Audio Output Buffer ---</p>
            <p>{report.raw_transcript || 'No raw transcript recorded for this session.'}</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Medical Report?"
        subtitle="This action cannot be undone."
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete report #{report.id} for {report.patient_name}?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteReport}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
