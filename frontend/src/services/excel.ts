import * as XLSX from 'xlsx';
import { Patient, Report } from '../types';

/**
 * Export a single medical report with Patient Info and Report sheets
 */
export function exportReportToExcel(report: Report, patient?: Patient) {
  const wb = XLSX.utils.book_new();

  // 1. Patient Info Sheet
  const patientData = [
    {
      'MRN': patient?.mrn || report.patient_mrn || 'N/A',
      'Name': patient?.full_name || report.patient_name || 'N/A',
      'Date of Birth': patient?.date_of_birth || 'N/A',
      'Gender': patient?.gender || 'N/A',
      'Phone': patient?.phone || 'N/A',
      'Email': patient?.email || 'N/A',
      'Address': patient?.address || 'N/A',
      'Emergency Contact': patient?.emergency_contact || 'N/A',
      'Blood Group': patient?.blood_group || 'N/A',
    },
  ];

  const wsPatient = XLSX.utils.json_to_sheet(patientData);
  XLSX.utils.book_append_sheet(wb, wsPatient, 'Patient Info');

  // 2. Report Sheet
  const reportData = [
    {
      'Report ID': report.id,
      'Report Type': report.type,
      'Date': report.date,
      'Doctor': report.doctor_name,
      'Duration': report.duration,
      'Status': report.status,
      'Subjective': report.soap?.subjective || '',
      'Objective': report.soap?.objective || '',
      'Assessment': report.soap?.assessment || '',
      'Plan': report.soap?.plan || '',
      'Raw Transcript': report.raw_transcript || '',
    },
  ];

  const wsReport = XLSX.utils.json_to_sheet(reportData);
  XLSX.utils.book_append_sheet(wb, wsReport, 'Report');

  // Generate filename: Report_[PatientName]_[Date].xlsx
  const safePatientName = (patient?.full_name || report.patient_name || 'Patient')
    .replace(/[^a-zA-Z0-9]/g, '_');
  const safeDate = (report.date || new Date().toISOString().split('T')[0])
    .replace(/[^a-zA-Z0-9]/g, '-');
  
  const filename = `Report_${safePatientName}_${safeDate}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export all reports for a patient into a single workbook
 */
export function exportPatientAllReportsToExcel(patient: Patient, reports: Report[]) {
  const wb = XLSX.utils.book_new();

  // Patient Info Sheet
  const patientData = [
    {
      'MRN': patient.mrn,
      'Name': patient.full_name,
      'Date of Birth': patient.date_of_birth,
      'Gender': patient.gender,
      'Phone': patient.phone,
      'Email': patient.email,
      'Address': patient.address,
      'Emergency Contact': patient.emergency_contact,
      'Blood Group': patient.blood_group,
      'Total Reports': reports.length,
    },
  ];

  const wsPatient = XLSX.utils.json_to_sheet(patientData);
  XLSX.utils.book_append_sheet(wb, wsPatient, 'Patient Info');

  // All Reports Sheet
  const reportsData = reports.map((r, index) => ({
    '#': index + 1,
    'Report ID': r.id,
    'Report Type': r.type,
    'Date': r.date,
    'Doctor': r.doctor_name,
    'Duration': r.duration,
    'Status': r.status,
    'Subjective': r.soap?.subjective || '',
    'Objective': r.soap?.objective || '',
    'Assessment': r.soap?.assessment || '',
    'Plan': r.soap?.plan || '',
  }));

  const wsReports = XLSX.utils.json_to_sheet(reportsData.length > 0 ? reportsData : [{ 'Status': 'No reports found' }]);
  XLSX.utils.book_append_sheet(wb, wsReports, 'All Reports');

  const safeName = patient.full_name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Medical_Records_${safeName}.xlsx`;
  XLSX.writeFile(wb, filename);
}
