import uuid
from django.db import models
from django.conf import settings


class Transcription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='transcriptions')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transcriptions')
    audio_file = models.FileField(upload_to='audio/%Y/%m/%d/')
    transcript = models.TextField()
    language = models.CharField(max_length=10, blank=True, default='')
    duration_seconds = models.FloatField(default=0.0)
    segments = models.JSONField(default=list, blank=True)
    model_used = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['doctor', 'created_at']),
        ]

    def __str__(self):
        return f"Transcription {self.id} - {self.patient}"


class MedicalReport(models.Model):
    REPORT_TYPES = [
        ('consultation', 'Consultation'),
        ('epicrisis', 'Epicrisis'),
        ('follow_up', 'Follow-up'),
        ('discharge', 'Discharge Summary'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='reports')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    consultation_date = models.DateField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, default='consultation')
    subjective = models.TextField(blank=True, default='')
    objective = models.TextField(blank=True, default='')
    assessment = models.TextField(blank=True, default='')
    plan = models.TextField(blank=True, default='')
    raw_transcript = models.TextField(blank=True, default='')
    transcript_segments = models.JSONField(default=list, blank=True)
    excel_file = models.FileField(upload_to='reports/excel/%Y/%m/%d/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-consultation_date', '-created_at']
        indexes = [
            models.Index(fields=['patient', 'consultation_date']),
            models.Index(fields=['doctor', 'consultation_date']),
            models.Index(fields=['report_type']),
        ]

    def __str__(self):
        return f"Report {self.id} - {self.patient} ({self.get_report_type_display()})"