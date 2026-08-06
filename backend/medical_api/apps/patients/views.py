from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from medical_api.apps.patients.models import Patient
from medical_api.apps.patients.serializers import PatientSerializer, PatientListSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filterset_fields = ['first_name', 'last_name', 'gender', 'medical_record_number']
    search_fields = ['first_name', 'last_name', 'medical_record_number']

    def get_serializer_class(self):
        if self.action == 'list':
            return PatientListSerializer
        return PatientSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'], url_path='reports', url_name='patient-reports')
    def patient_reports(self, request, pk=None):
        patient = self.get_object()
        reports = patient.reports.all()
        from reports.serializers import MedicalReportSerializer
        serializer = MedicalReportSerializer(reports, many=True)
        return Response(serializer.data)