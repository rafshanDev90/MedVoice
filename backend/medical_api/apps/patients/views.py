from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from medical_api.apps.patients.models import Patient
from medical_api.apps.patients.serializers import PatientSerializer
from medical_api.apps.reports.serializers import MedicalReportSerializer


class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filterset_fields = ['gender', 'blood_group']
    search_fields = ['first_name', 'last_name', 'medical_record_number', 'email', 'phone']

    def get_queryset(self):
        return Patient.objects.filter(doctor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)

    @action(detail=True, methods=['get'], url_path='reports', url_name='patient-reports')
    def patient_reports(self, request, pk=None):
        patient = self.get_object()
        reports = patient.reports.all()
        serializer = MedicalReportSerializer(reports, many=True)
        return Response(serializer.data)
