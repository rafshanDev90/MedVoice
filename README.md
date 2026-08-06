# Medical Report System

A Django + React application that captures doctor dictation, transcribes speech to text, structures medical reports, and exports them to Excel files.

## Project Structure

```
medical_report_system/
├── API_DOCUMENTATION.md          # Content-driven API documentation
├── backend/
│   ├── medical_api/
│   │   ├── apps/
│   │   │   ├── auth/             # User authentication & health check
│   │   │   ├── patients/         # Patient management
│   │   │   └── reports/          # Reports, transcription, Excel export
│   │   ├── config/               # Django project settings & URLs
│   │   └── requirements/
│   │       ├── base.txt          # Core dependencies
│   │       └── dev.txt           # Dev dependencies
│   └── manage.py
├── frontend/                     # React frontend (to be set up)
└── .gitignore
```

## Open-Source Resources Used

### Speech-to-Text
- **faster-whisper** — CTranslate2-based Whisper for fast local transcription
- **OpenAI Whisper** — General-purpose multilingual STT model
- **RealtimeSTT** — Low-latency STT with voice activity detection
- **FunASR** — Industrial ASR toolkit with streaming support
- **SpeechRecognition** — Unified interface for multiple STT engines

### Excel Generation
- **XlsxWriter** — Create formatted Excel XLSX files
- **openpyxl** — Read/write Excel 2010 xlsx/xlsm files
- **django-tabular-export** — Export Django QuerySets to Excel/CSV
- **django-excel-extract** — Export Django model querysets to Excel
- **flat-fhir** — Convert FHIR JSON bundles to XLSX (healthcare-specific)

### API Framework
- **Django REST Framework** — Powerful API toolkit
- **drf-spectacular** — OpenAPI 3 schema generation
- **django-filter** — Filtering support for DRF

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/base.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Run development server
python manage.py runserver 8000
```

### API Documentation

See `API_DOCUMENTATION.md` for the full content-driven API specification.

Swagger UI is available at: `http://localhost:8000/api/v1/schema/swagger-ui/`

## Key Features

1. **Speech-to-Text Transcription** — Doctors dictate patient reports; faster-whisper converts speech to text locally
2. **SOAP Report Structuring** — Transcripts are automatically parsed into Subjective, Objective, Assessment, Plan sections
3. **Excel Export** — Reports are exported to formatted Excel files with multiple sheets (Patient Info, Report, Vitals, Medications)
4. **REST API** — Content-driven API with JWT authentication, filtering, and pagination
5. **OpenAPI Schema** — Auto-generated API documentation via drf-spectacular