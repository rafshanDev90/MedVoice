import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Report } from '../types';
import { exportReportToExcel } from '../services/excel';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { reports, deleteReport } = useData();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'date' | 'patient_name'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Delete Modal
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  // Filtered & Sorted Reports
  const processedReports = useMemo(() => {
    return reports
      .filter((r) => {
        const matchesSearch =
          r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.patient_mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.type.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const d1 = new Date(a.date).getTime();
          const d2 = new Date(b.date).getTime();
          return sortAsc ? d1 - d2 : d2 - d1;
        } else {
          return sortAsc
            ? a.patient_name.localeCompare(b.patient_name)
            : b.patient_name.localeCompare(a.patient_name);
        }
      });
  }, [reports, searchTerm, typeFilter, statusFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(processedReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedReports.slice(start, start + pageSize);
  }, [processedReports, currentPage, pageSize]);

  const handleExport = (report: Report) => {
    try {
      exportReportToExcel(report);
      showSuccess(`Exported report ${report.id} to Excel.`);
    } catch {
      showError('Failed to generate Excel download.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteReportId) return;
    try {
      await deleteReport(deleteReportId);
      showSuccess('Report deleted successfully.');
      setDeleteReportId(null);
    } catch {
      showError('Failed to delete report.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[#2F5496]" />
            <span>Medical Reports Repository</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, search, filter, and export generated SOAP consultation reports
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/transcribe')}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold"
        >
          New Report
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search patient, MRN, report ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2F5496] focus:ring-2 focus:ring-[#2F5496]/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Report Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2F5496]"
          >
            <option value="ALL">All Categories</option>
            <option value="General Consultation">General Consultation</option>
            <option value="Cardiology Follow-up">Cardiology Follow-up</option>
            <option value="Pediatric Checkup">Pediatric Checkup</option>
            <option value="Neurology Exam">Neurology Exam</option>
            <option value="Routine Physical">Routine Physical</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2F5496]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
          </select>

          {/* Sort Control */}
          <button
            onClick={() => {
              if (sortField === 'date') {
                setSortAsc(!sortAsc);
              } else {
                setSortField('date');
                setSortAsc(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort: {sortField === 'date' ? (sortAsc ? 'Oldest First' : 'Newest First') : 'Name'}</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Report ID</th>
                <th className="px-5 py-3.5">Patient Name</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Doctor</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReports.length > 0 ? (
                paginatedReports.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/reports/${r.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 group-hover:text-[#2F5496]">
                      <div className="flex flex-col">
                        <span>{r.patient_name}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">{r.patient_mrn}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{r.type}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{r.doctor_name}</td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{r.duration}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reports/${r.id}`);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#2F5496] transition-colors"
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(r);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        title="Export Excel"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteReportId(r.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-10 h-10 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">No Reports Found</p>
                      <p className="text-xs">Adjust your search parameters or dictation filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {processedReports.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, processedReports.length)} of {processedReports.length} reports
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="font-bold text-slate-800 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteReportId}
        onClose={() => setDeleteReportId(null)}
        title="Delete Medical Report?"
        subtitle="This action will remove the report from active records."
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete report ID #{deleteReportId}?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteReportId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Yes, Delete Report
          </Button>
        </div>
      </Modal>
    </div>
  );
};
