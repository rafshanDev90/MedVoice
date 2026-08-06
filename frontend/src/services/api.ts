import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens, LoginCredentials, Patient, Report, User, DashboardStats } from '../types';
import { INITIAL_REPORTS } from '../data/initialData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Token refresh failed - clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Mock Storage key helper for full offline / client fallback state
const STORAGE_KEYS = {
  REPORTS: 'medireport_reports',
  USER: 'medireport_user',
};

function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// Ensure initial seed data in localStorage
if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
  setStoredData(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
}

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> {
    const response = await apiClient.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { tokens: { access, refresh }, user };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/', {
        refresh: localStorage.getItem('refresh_token'),
      });
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  getCurrentUser(): User | null {
    return getStoredData<User | null>(STORAGE_KEYS.USER, null);
  },
};

// Patient API
export const patientApi = {
  async getPatients(): Promise<Patient[]> {
    const response = await apiClient.get('/patients/');
    return response.data;
  },

  async getPatientById(id: string): Promise<Patient> {
    const response = await apiClient.get(`/patients/${id}/`);
    return response.data;
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'mrn' | 'created_at'>): Promise<Patient> {
    const response = await apiClient.post('/patients/', patientData);
    return response.data;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const response = await apiClient.patch(`/patients/${id}/`, updates);
    return response.data;
  },

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}/`);
  },
};

// Report API
export const reportApi = {
  async getReports(): Promise<Report[]> {
    try {
      const response = await apiClient.get('/reports/');
      return response.data;
    } catch {
      return getStoredData<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
  },

  async getReportById(id: string): Promise<Report | null> {
    try {
      const response = await apiClient.get(`/reports/${id}/`);
      return response.data;
    } catch {
      const reports = getStoredData<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      return reports.find((r) => r.id === id) || null;
    }
  },

  async createReport(reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report> {
    const newReport: Report = {
      ...reportData,
      id: 'rep-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post('/reports/', newReport);
      return response.data;
    } catch {
      const reports = getStoredData<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      const updated = [newReport, ...reports];
      setStoredData(STORAGE_KEYS.REPORTS, updated);
      return newReport;
    }
  },

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    try {
      const response = await apiClient.patch(`/reports/${id}/`, updates);
      return response.data;
    } catch {
      const reports = getStoredData<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      const index = reports.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Report not found');
      const updatedReport = { ...reports[index], ...updates };
      reports[index] = updatedReport;
      setStoredData(STORAGE_KEYS.REPORTS, reports);
      return updatedReport;
    }
  },

  async deleteReport(id: string): Promise<void> {
    try {
      await apiClient.delete(`/reports/${id}/`);
    } catch {
      const reports = getStoredData<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      const filtered = reports.filter((r) => r.id !== id);
      setStoredData(STORAGE_KEYS.REPORTS, filtered);
    }
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/dashboard/stats/');
      return response.data;
    } catch {
      const patients = await patientApi.getPatients().catch(() => [] as Patient[]);
      const reports = getStoredData<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      const totalWords = reports.reduce((acc, r) => acc + (r.word_count || 0), 0);

      return {
        total_patients: patients.length,
        consultations_this_week: reports.length + 3,
        reports_generated: reports.length,
        avg_transcript_length: reports.length ? Math.round(totalWords / reports.length) : 0,
      };
    }
  },
};
