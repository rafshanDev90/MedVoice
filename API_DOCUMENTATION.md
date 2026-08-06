# Medical Report System — Content-Driven API Documentation

## Overview

This document describes the content-driven REST API for the Medical Report System. Doctors dictate patient reports via speech, and the system transcribes the audio, structures the content, and saves the report to an Excel file. The backend is built with Django and Django REST Framework, and the frontend uses React.

---

## Open-Source Resources Used

### Speech-to-Text (STT)

| Resource | Description | License | Stars |
|----------|-------------|---------|-------|
| [OpenAI Whisper](https://github.com/openai/whisper) | General-purpose speech recognition model; multilingual, supports translation | MIT | 106k+ |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | CTranslate2-based Whisper; 2-4x faster inference, same accuracy | MIT | — |
| [RealtimeSTT](https://github.com/KoljaB/RealtimeSTT) | Low-latency STT with VAD, wake word, real-time transcription | MIT | 10k+ |
| [FunASR](https://github.com/modelscope/FunASR) | Industrial ASR toolkit; streaming, VAD, punctuation, speaker diarization | MIT | 19k+ |
| [onnx-asr](https://github.com/istupakov/onnx-asr) | Lightweight ONNX-based ASR; no PyTorch/FFmpeg needed | MIT | 334 |
| [SpeechRecognition](https://github.com/Uberi/speech_recognition) | Unified interface for multiple STT engines (Whisper, Vosk, Sphinx, etc.) | BSD-3 | 8.9k+ |

### Excel File Generation

| Resource | Description | License |
|----------|-------------|---------|
| [XlsxWriter](https://github.com/jmcnamara/XlsxWriter) | Create Excel XLSX files with formatting, charts, formulas | BSD-2 |
| [openpyxl](https://openpyxl.readthedocs.io/) | Read/write Excel 2010 xlsx/xlsm/xltx/xltm files | MIT |
| [django-tabular-export](https://github.com/LibraryOfCongress/django-tabular-export) | Export Django QuerySets to XLSX/CSV | BSD |
| [django-excel-extract](https://github.com/DmitryTok/django-excel-extract) | Export Django model querysets to Excel with custom formatting | MIT |
| [sheetkit](https://github.com/Prevalex/sheetkit) | Compact Python library for Excel automation | MIT |
| [flat-fhir](https://pypi.org/project/flat-fhir/) | Convert FHIR JSON bundles to XLSX spreadsheets (healthcare-specific) | MIT |

### Django REST Framework & API Documentation

| Resource | Description | License |
|----------|-------------|---------|
| [Django REST Framework](https://www.django-rest-framework.org/) | Powerful toolkit for building Web APIs | BSD-3 |
| [drf-spectacular](https://github.com/tfranzel/drf-spectacular) | OpenAPI 3 schema generation for DRF | MIT |
| [django-filter](https://github.com/carltongibson/django-filter) | Filtering support for DRF | BSD-3 |

### Reference Medical Projects

| Project | Description | Stack |
|---------|-------------|-------|
| [MediScribe](https://github.com/Sabalpp/MediScribe) | Real-time AI medical interpreter | Django + React |
| [ArkenAI-MedicalReportGenerationPlatform](https://github.com/mahmoud0alabsi/ArkenAI-MedicalReportGenerationPlatform) | AI-powered medical report generation from audio | Django |
| [open-medical-scribe](https://github.com/BirgerMoell/open-medical-scribe) | Privacy-first medical scribe with pluggable providers | Python |
| [MediTech](https://github.com/Afnanksalal/MediTech) | EMR with AI audio processing | Django + Sanic |
| [stt-to-medical](https://github.com/LaansDole/stt-to-medical) | WhisperX + Temporal medical processing pipeline | FastAPI |
| [VocaMed](https://github.com/alaayasmine/VocaMed) | AI-powered medical scribe with SOAP report generation | FastAPI |

---

## API Endpoints

### Base URL

```
http://localhost:8000/api/v1/
```

### Authentication

All endpoints (except health check) require JWT authentication.

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <token>` |

---

### 1. Health Check

```
GET /api/v1/health/
```

**Response (200)**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "stt_engine": "faster-whisper",
  "excel_engine": "xlsxwriter"
}
```

---

### 2. Patient Management

#### Create Patient

```
POST /api/v1/patients/
```

Requires `Authorization: Bearer <token>`. The logged-in doctor is auto-assigned as the patient's owner.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | Yes* | Patient full name (e.g., "John Doe"); alternative to `first_name`/`last_name` |
| `first_name` | string | No* | First name (when not using `full_name`) |
| `last_name` | string | No | Last name |
| `date_of_birth` | date | Yes | Patient date of birth (YYYY-MM-DD) |
| `gender` | string | Yes | Male / Female / Other |
| `phone` | string | No | Contact phone |
| `email` | string | No | Contact email |
| `address` | string | No | Home address |
| `emergency_contact` | string | No | Emergency contact |
| `blood_group` | string | No | Blood group (e.g., A+, O-) |
| `mrn` | string | No | Hospital MRN. Auto-generated as `MRN-XXXXX` if omitted or taken |

*Either `full_name` or `first_name` is required.

**Response (201)**

```json
{
  "id": 1,
  "mrn": "MRN-35570",
  "full_name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1985-03-15",
  "gender": "Male",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St",
  "emergency_contact": "Jane Doe",
  "blood_group": "O+",
  "doctor": 2,
  "doctor_name": "dr_smith",
  "created_at": "2026-08-06T12:00:00Z",
  "updated_at": "2026-08-06T12:00:00Z"
}
```

#### List Patients

```
GET /api/v1/patients/
```

Requires `Authorization: Bearer <token>`. Returns only the logged-in doctor's patients. No pagination — returns the full list as a JSON array.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name, MRN, email, or phone |
| `gender` | string | Filter by gender (Male / Female / Other) |
| `blood_group` | string | Filter by blood group |

**Response (200)**

```json
[
  {
    "id": 1,
    "mrn": "MRN-35570",
    "full_name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1985-03-15",
    "gender": "Male",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St",
    "emergency_contact": "Jane Doe",
    "blood_group": "O+",
    "doctor": 2,
    "doctor_name": "dr_smith",
    "created_at": "2026-08-06T12:00:00Z",
    "updated_at": "2026-08-06T12:00:00Z"
  }
]
```

#### Get Patient Detail

```
GET /api/v1/patients/{id}/
```

Requires `Authorization: Bearer <token>`. Returns 404 if the patient belongs to a different doctor.

**Response (200)** — Same as create response above.

#### Update Patient

```
PATCH /api/v1/patients/{id}/
PUT /api/v1/patients/{id}/
```

Requires `Authorization: Bearer <token>`. Accepts any subset of the create fields. Returns the updated patient object.

#### Delete Patient

```
DELETE /api/v1/patients/{id}/
```

Requires `Authorization: Bearer <token>`. Returns 204 No Content.

#### List Patient Reports

```
GET /api/v1/patients/{id}/reports/
```

Requires `Authorization: Bearer <token>`. Returns all medical reports for the patient. Returns 404 if the patient belongs to a different doctor.

**Response (200)**

```json
[]
```

---

### 3. Speech Transcription

#### Transcribe Audio

```
POST /api/v1/transcribe/
```

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio_file` | file | Yes | Audio file (WAV, MP3, M4A, FLAC) |
| `language` | string | No | Language code (e.g., `en`, `es`). Auto-detected if omitted |
| `model_size` | string | No | Whisper model: `tiny`, `base`, `small`, `medium`, `large` (default: `base`) |

**Response (200)**

```json
{
  "id": "txn_abc123",
  "transcript": "Patient reports chest pain for the last 3 days...",
  "language": "en",
  "duration_seconds": 45.2,
  "segments": [
    {
      "start": 0.0,
      "end": 12.5,
      "text": "Patient reports chest pain for the last 3 days."
    },
    {
      "start": 12.5,
      "end": 45.2,
      "text": "No history of hypertension or diabetes."
    }
  ]
}
```

#### Transcribe Stream (WebSocket)

```
WS /api/v1/transcribe/stream/
```

**Frames (Client → Server)**

| Type | Payload |
|------|---------|
| `audio_metadata` | `{"format": "wav", "sample_rate": 16000, "channels": 1}` |
| `audio_chunk` | Binary PCM audio data (250ms chunks) |
| `end_stream` | `{}` |

**Frames (Server → Client)**

| Type | Payload |
|------|---------|
| `partial` | `{"text": "Patient reports...", "segment_index": 0}` |
| `final` | `{"text": "Full transcript text", "segments": [...]}` |

---

### 4. Medical Report Generation

#### Generate Report from Transcript

```
POST /api/v1/reports/generate/
```

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | integer | Yes | Patient ID |
| `doctor_id` | integer | Yes | Doctor (user) ID |
| `transcript` | string | Yes | Transcribed text from STT |
| `consultation_date` | date | Yes | Date of consultation |
| `report_type` | string | No | `epicrisis`, `consultation`, `follow_up`, `discharge` (default: `consultation`) |

**Response (201)**

```json
{
  "id": 1,
  "patient_id": 1,
  "doctor_id": 2,
  "consultation_date": "2026-08-06",
  "report_type": "consultation",
  "subjective": "Patient reports chest pain...",
  "objective": "Vitals: BP 120/80, HR 72...",
  "assessment": "Possible angina...",
  "plan": "Order ECG, prescribe aspirin...",
  "raw_transcript": "Patient reports chest pain...",
  "created_at": "2026-08-06T12:00:00Z"
}
```

#### List Reports

```
GET /api/v1/reports/
```

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `patient_id` | integer | Filter by patient |
| `doctor_id` | integer | Filter by doctor |
| `report_type` | string | Filter by type |
| `date_from` | date | Start date filter |
| `date_to` | date | End date filter |
| `page` | integer | Pagination page |
| `page_size` | integer | Items per page |

#### Get Report Detail

```
GET /api/v1/reports/{id}/
```

#### Update Report

```
PUT /api/v1/reports/{id}/
```

#### Delete Report

```
DELETE /api/v1/reports/{id}/
```

---

### 5. Excel Report Export

#### Export Single Report to Excel

```
GET /api/v1/reports/{id}/export/excel/
```

**Response:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

The Excel file contains the following sheets:

| Sheet | Content |
|-------|---------|
| `Patient Info` | Patient demographics (name, DOB, gender, MRN, contact) |
| `Report` | Full report content (SOAP sections, transcript, metadata) |
| `Vitals` | Vital signs if recorded |
| `Medications` | Prescribed medications if any |

#### Export Patient Reports to Excel

```
GET /api/v1/patients/{id}/reports/export/excel/
```

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `date_from` | date | Start date filter |
| `date_to` | date | End date filter |

**Response:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### Export All Reports to Excel

```
GET /api/v1/reports/export/excel/
```

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `date_from` | date | Start date filter |
| `date_to` | date | End date filter |
| `doctor_id` | integer | Filter by doctor |

**Response:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

---

### 6. Doctor Dashboard

#### Get Doctor's Patients

```
GET /api/v1/doctors/{doctor_id}/patients/
```

**Response (200)**

```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "medical_record_number": "MRN-001",
      "last_visit": "2026-08-06"
    }
  ]
}
```

#### Get Doctor's Reports Summary

```
GET /api/v1/doctors/{doctor_id}/report-summary/
```

**Response (200)**

```json
{
  "total_reports": 120,
  "reports_this_week": 8,
  "reports_this_month": 35,
  "avg_transcript_length": 342,
  "most_common_report_type": "consultation"
}
```

---

## Data Models

### Patient

| Field | Type | Description |
|-------|------|-------------|
| `id` | AutoField | Primary key |
| `doctor` | ForeignKey | Owning doctor (auto-assigned from JWT user) |
| `first_name` | CharField | Patient first name |
| `last_name` | CharField | Patient last name |
| `date_of_birth` | DateField | Date of birth |
| `gender` | CharField | Male / Female / Other |
| `phone` | CharField | Contact phone |
| `email` | EmailField | Contact email |
| `address` | TextField | Home address |
| `emergency_contact` | CharField | Emergency contact |
| `blood_group` | CharField | Blood group (e.g., A+, O-) |
| `medical_record_number` | CharField | Unique hospital MRN (auto-generated `MRN-XXXXX`) |
| `created_at` | DateTimeField | Auto-generated |
| `updated_at` | DateTimeField | Auto-updated |

### MedicalReport

| Field | Type | Description |
|-------|------|-------------|
| `id` | AutoField | Primary key |
| `patient` | ForeignKey | Reference to Patient |
| `doctor` | ForeignKey | Reference to User (doctor) |
| `consultation_date` | DateField | Date of consultation |
| `report_type` | CharField | epicrisis / consultation / follow_up / discharge |
| `subjective` | TextField | S — Patient's description of symptoms |
| `objective` | TextField | O — Clinical findings and vitals |
| `assessment` | TextField | A — Diagnosis and clinical assessment |
| `plan` | TextField | P — Treatment plan and next steps |
| `raw_transcript` | TextField | Original transcribed speech |
| `transcript_segments` | JSONField | Timestamped segments |
| `excel_file` | FileField | Generated Excel report file |
| `created_at` | DateTimeField | Auto-generated |
| `updated_at` | DateTimeField | Auto-updated |

### Transcription

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUIDField | Primary key |
| `patient` | ForeignKey | Reference to Patient |
| `doctor` | ForeignKey | Reference to User |
| `audio_file` | FileField | Original audio file |
| `transcript` | TextField | Full transcribed text |
| `language` | CharField | Detected language code |
| `duration_seconds` | FloatField | Audio duration |
| `segments` | JSONField | Timestamped transcription segments |
| `model_used` | CharField | STT model used |
| `created_at` | DateTimeField | Auto-generated |

---

## Excel Report Structure

The generated Excel file follows this structure:

### Sheet 1: Patient Info

| Column | Description |
|--------|-------------|
| Patient Name | Full name |
| Date of Birth | YYYY-MM-DD |
| Gender | M / F / Other |
| Medical Record Number | MRN |
| Phone | Contact number |
| Email | Contact email |
| Address | Home address |

### Sheet 2: Report

| Column | Description |
|--------|-------------|
| Report Type | consultation / epicrisis / etc. |
| Consultation Date | YYYY-MM-DD |
| Doctor | Doctor name |
| Subjective (S) | Patient's description |
| Objective (O) | Clinical findings |
| Assessment (A) | Diagnosis |
| Plan (P) | Treatment plan |
| Raw Transcript | Full transcribed text |

### Sheet 3: Vitals (if available)

| Column | Description |
|--------|-------------|
| Parameter | BP, HR, Temp, etc. |
| Value | Measurement value |
| Unit | Unit of measurement |
| Recorded At | Timestamp |

### Sheet 4: Medications (if available)

| Column | Description |
|--------|-------------|
| Medication | Drug name |
| Dosage | Dosage amount |
| Frequency | How often |
| Duration | Treatment duration |
| Notes | Additional instructions |

---

## Content-Driven Architecture

The API follows a content-driven design where:

1. **Speech Input** — Doctor speaks about the patient; audio is captured and sent to the STT engine
2. **Transcription** — The STT engine (faster-whisper) converts speech to text with timestamps
3. **Content Structuring** — The transcript is parsed into SOAP (Subjective, Objective, Assessment, Plan) sections
4. **Report Generation** — A structured MedicalReport is created with the parsed content
5. **Excel Export** — The report is exported to a formatted Excel file with multiple sheets
6. **Frontend Display** — React frontend fetches the report data and displays it

### Content Flow

```
Doctor Speech → Audio Capture → STT Engine → Transcript → SOAP Parser → MedicalReport → Excel Export
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid authentication token |
| `PERMISSION_DENIED` | 403 | User does not have permission |
| `PATIENT_NOT_FOUND` | 404 | Patient does not exist |
| `REPORT_NOT_FOUND` | 404 | Report does not exist |
| `INVALID_AUDIO` | 400 | Audio file is invalid or unsupported format |
| `TRANSCRIPTION_FAILED` | 500 | STT engine failed to transcribe |
| `EXCEL_EXPORT_FAILED` | 500 | Excel file generation failed |
| `VALIDATION_ERROR` | 400 | Request body validation failed |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/v1/transcribe/` | 10 requests per minute |
| `/api/v1/reports/export/excel/` | 5 requests per minute |
| All other endpoints | 100 requests per minute |

---

## Versioning

The API uses URL path versioning: `/api/v1/`. Future versions will be `/api/v2/`, etc.

---

## Deployment Notes

### Recommended Production Stack

- **Python**: 3.11+
- **Django**: 5.x
- **Django REST Framework**: 3.15+
- **Database**: PostgreSQL
- **STT Engine**: faster-whisper (CTranslate2 backend)
- **Excel Engine**: XlsxWriter
- **API Schema**: drf-spectacular for OpenAPI 3
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Deployment**: Gunicorn + Nginx, or Docker

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Django secret key | — |
| `DJANGO_DEBUG` | Debug mode | `False` |
| `DATABASE_URL` | PostgreSQL connection URL | — |
| `WHISPER_MODEL_SIZE` | Whisper model size | `base` |
| `WHISPER_DEVICE` | Device for inference | `cpu` |
| `WHISPER_COMPUTE_TYPE` | Compute type (int8, float16) | `int8` |
| `EXCEL_TEMPLATE_DIR` | Directory for Excel templates | `./templates/excel/` |
| `MEDIA_ROOT` | Directory for uploaded files | `./media/` |
| `STATIC_ROOT` | Directory for static files | `./static/` |
