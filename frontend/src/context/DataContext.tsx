import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Patient, Report, DashboardStats } from '../types';
import { patientApi, reportApi, dashboardApi } from '../services/api';

interface DataContextType {
  patients: Patient[];
  reports: Report[];
  stats: DashboardStats;
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  // Patients
  addPatient: (patient: Omit<Patient, 'id' | 'mrn' | 'created_at'>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
  // Reports
  addReport: (report: Omit<Report, 'id' | 'created_at'>) => Promise<Report>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  getReportById: (id: string) => Report | undefined;
  getReportsByPatientId: (patientId: string) => Report[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_patients: 0,
    total_reports: 0,
    consultations_this_week: 0,
    total_transcriptions: 0,
    transcriptions_this_week: 0,
    avg_transcript_length: 0,
    recent_activity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedPatients, fetchedReports, fetchedStats] = await Promise.all([
        patientApi.getPatients(),
        reportApi.getReports(),
        dashboardApi.getStats(),
      ]);
      setPatients(fetchedPatients);
      setReports(fetchedReports);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Patients Actions
  const addPatient = async (patientData: Omit<Patient, 'id' | 'mrn' | 'created_at'>): Promise<Patient> => {
    const newPat = await patientApi.createPatient(patientData);
    setPatients((prev) => [newPat, ...prev]);
    setStats((prev) => ({ ...prev, total_patients: prev.total_patients + 1 }));
    return newPat;
  };

  const updatePatient = async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    const updated = await patientApi.updatePatient(id, updates);
    setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deletePatient = async (id: string): Promise<void> => {
    await patientApi.deletePatient(id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setStats((prev) => ({ ...prev, total_patients: Math.max(0, prev.total_patients - 1) }));
  };

  const getPatientById = (id: string) => {
    return patients.find((p) => p.id === id);
  };

  // Reports Actions
  const addReport = async (reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report> => {
    const newRep = await reportApi.createReport(reportData);
    setReports((prev) => [newRep, ...prev]);
    setStats((prev) => ({
      ...prev,
      total_reports: prev.total_reports + 1,
      consultations_this_week: prev.consultations_this_week + 1,
    }));
    return newRep;
  };

  const updateReport = async (id: string, updates: Partial<Report>): Promise<Report> => {
    const updated = await reportApi.updateReport(id, updates);
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteReport = async (id: string): Promise<void> => {
    await reportApi.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => ({ ...prev, total_reports: Math.max(0, prev.total_reports - 1) }));
  };

  const getReportById = (id: string) => {
    return reports.find((r) => r.id === id);
  };

  const getReportsByPatientId = (patientId: string) => {
    return reports.filter((r) => r.patient_id === patientId);
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        reports,
        stats,
        isLoading,
        refreshAll,
        addPatient,
        updatePatient,
        deletePatient,
        getPatientById,
        addReport,
        updateReport,
        deleteReport,
        getReportById,
        getReportsByPatientId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
