export type Gender = 'Male' | 'Female' | 'Other';

export type ReportStatus = 'Completed' | 'Pending' | 'In Progress' | 'Draft' | 'Cancelled';

export type ReportType = 
  | 'General Consultation'
  | 'Cardiology Follow-up'
  | 'Pediatric Checkup'
  | 'Neurology Exam'
  | 'Emergency Assessment'
  | 'Surgical Pre-Op'
  | 'Psychiatric Intake'
  | 'Routine Physical';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'doctor' | 'admin' | 'nurse';
  specialty?: string;
  license_number?: string;
  avatar_url?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number (e.g., MRN-84920)
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  blood_group: string;
  doctor?: string; // doctor's user id (owner)
  doctor_name?: string;
  created_at: string;
}

export interface SOAPReport {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Report {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  doctor_id: string;
  doctor_name: string;
  type: ReportType | string;
  date: string;
  duration: string; // e.g. "14 mins 20 secs"
  duration_seconds: number;
  word_count: number;
  status: ReportStatus;
  soap: SOAPReport;
  raw_transcript: string;
  created_at: string;
}

export interface DashboardStats {
  total_patients: number;
  consultations_this_week: number;
  reports_generated: number;
  avg_transcript_length: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface WSMessage {
  type: 'partial_transcript' | 'final_transcript' | 'soap_generated' | 'error' | 'connection_status';
  text?: string;
  partial_text?: string;
  final_text?: string;
  soap?: SOAPReport;
  error?: string;
  timestamp?: string;
}
