from django.contrib import admin
from .models import Transcription, MedicalReport


@admin.register(Transcription)
class TranscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'language', 'duration_seconds', 'model_used', 'created_at']
    list_filter = ['language', 'model_used', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'transcript']
    readonly_fields = ['id', 'transcript', 'language', 'duration_seconds', 'segments', 'model_used', 'created_at']


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'consultation_date', 'report_type', 'created_at']
    list_filter = ['report_type', 'consultation_date', 'doctor']
    search_fields = ['patient__first_name', 'patient__last_name', 'assessment', 'plan']
    readonly_fields = ['id', 'raw_transcript', 'transcript_segments', 'excel_file', 'created_at', 'updated_at']