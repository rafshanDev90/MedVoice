from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from medical_api.apps.patients.models import Patient
from .models import Transcription, MedicalReport
from .serializers import (
    TranscriptionSerializer,
    TranscriptionCreateSerializer,
    MedicalReportSerializer,
    MedicalReportCreateSerializer,
    SOAPSerializer,
)
from .services import transcribe_audio, generate_excel_report, parse_soap_from_transcript


class TranscriptionViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == 'create':
            return TranscriptionCreateSerializer
        return TranscriptionSerializer

    def get_queryset(self):
        return Transcription.objects.filter(doctor=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.validated_data['patient']
        if patient.doctor != request.user:
            raise PermissionDenied('Patient does not belong to you.')
        audio_file = serializer.validated_data['audio_file']
        language = serializer.validated_data.get('language', '')
        model_size = serializer.validated_data.get('model_size', 'base')

        transcript, segments, duration, detected_language, model_used = transcribe_audio(
            audio_file, language=language, model_size=model_size
        )

        transcription = Transcription.objects.create(
            patient=patient,
            doctor=request.user,
            audio_file=audio_file,
            transcript=transcript,
            duration_seconds=duration,
            language=detected_language,
            segments=segments,
            model_used=model_used,
        )
        return Response(TranscriptionSerializer(transcription).data, status=status.HTTP_201_CREATED)


class MedicalReportViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filterset_fields = ['patient', 'doctor', 'report_type', 'consultation_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'assessment', 'plan']

    def get_queryset(self):
        return MedicalReport.objects.select_related('patient', 'doctor').filter(
            doctor=self.request.user
        )

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MedicalReportCreateSerializer
        return MedicalReportSerializer

    def perform_create(self, serializer):
        patient = serializer.validated_data['patient']
        if patient.doctor != self.request.user:
            raise PermissionDenied('Patient does not belong to you.')
        serializer.save(doctor=self.request.user)

    @action(detail=True, methods=['get'], url_path='export/excel', url_name='export-excel')
    def export_excel(self, request, pk=None):
        report = self.get_object()
        excel_path = generate_excel_report(report)

        with open(excel_path, 'rb') as f:
            response = Response(
                f.read(),
                status=status.HTTP_200_OK,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            response['Content-Disposition'] = f'attachment; filename="report_{report.id}.xlsx"'
            return response

    @action(detail=False, methods=['post'], url_path='generate', url_name='generate-report')
    def generate_report(self, request):
        serializer = MedicalReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patient = serializer.validated_data['patient']
        if patient.doctor != request.user:
            return Response(
                {'detail': 'Patient does not belong to you.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        raw_transcript = serializer.validated_data.get('raw_transcript', '')

        soap = parse_soap_from_transcript(raw_transcript) if raw_transcript else {}

        report = MedicalReport.objects.create(
            patient=patient,
            doctor=request.user,
            consultation_date=serializer.validated_data.get('consultation_date'),
            report_type=serializer.validated_data.get('report_type', 'consultation'),
            subjective=soap.get('subjective', ''),
            objective=soap.get('objective', ''),
            assessment=soap.get('assessment', ''),
            plan=soap.get('plan', ''),
            raw_transcript=raw_transcript,
        )

        return Response(MedicalReportSerializer(report).data, status=status.HTTP_201_CREATED)