from datetime import timedelta

from django.db.models import Avg, FloatField
from django.db.models.functions import Length
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from medical_api.apps.patients.models import Patient
from medical_api.apps.reports.models import MedicalReport, Transcription


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    doctor = request.user
    now = timezone.now()
    week_ago = now - timedelta(days=7)

    total_patients = Patient.objects.filter(doctor=doctor).count()

    reports = MedicalReport.objects.filter(doctor=doctor)
    total_reports = reports.count()
    reports_this_week = reports.filter(created_at__gte=week_ago).count()

    transcriptions = Transcription.objects.filter(doctor=doctor)
    total_transcriptions = transcriptions.count()
    transcriptions_this_week = transcriptions.filter(created_at__gte=week_ago).count()

    avg_transcript_length = 0
    if total_transcriptions:
        avg_result = transcriptions.aggregate(
            avg_length=Avg(Length("transcript", output_field=FloatField()))
        )
        avg_transcript_length = int(avg_result["avg_length"] or 0)

    recent_reports = list(
        reports.filter(created_at__gte=week_ago)
        .values("id", "patient__first_name", "report_type", "created_at")[:10]
    )

    return Response(
        {
            "total_patients": total_patients,
            "total_reports": total_reports,
            "consultations_this_week": reports_this_week,
            "total_transcriptions": total_transcriptions,
            "transcriptions_this_week": transcriptions_this_week,
            "avg_transcript_length": avg_transcript_length,
            "recent_activity": recent_reports,
        }
    )
