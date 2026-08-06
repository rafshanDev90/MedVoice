from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from medical_api.apps.patients.models import Patient
from medical_api.apps.reports.models import MedicalReport, Transcription

User = get_user_model()


class ReportAPITests(APITestCase):
    def setUp(self):
        self.doctor = User.objects.create_user(
            username='dr_test', email='dr.test@medireport.org', password='Pass12345!',
            role='doctor', first_name='Test', last_name='Doctor',
        )
        self.other = User.objects.create_user(
            username='dr_other', email='dr.other@medireport.org', password='Pass12345!',
            role='doctor', first_name='Other', last_name='Doctor',
        )
        self.patient = Patient.objects.create(
            doctor=self.doctor, first_name='Jane', last_name='Doe',
            date_of_birth='1990-01-01', gender='Female', medical_record_number='MRN-TEST-01',
        )
        self.other_patient = Patient.objects.create(
            doctor=self.other, first_name='John', last_name='Doe',
            date_of_birth='1985-06-15', gender='Male', medical_record_number='MRN-TEST-02',
        )
        self.report = MedicalReport.objects.create(
            patient=self.patient, doctor=self.doctor, consultation_date='2026-08-06',
            report_type='consultation', subjective='Headache', objective='Normal',
            assessment='Migraine', plan='Rest',
        )
        self.login_url = '/api/v1/auth/login/'
        self.reports_url = '/api/v1/reports/'

    def _auth(self, user):
        r = self.client.post(self.login_url, {'username': user.username, 'password': 'Pass12345!'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")

    def test_anonymous_cannot_list_reports(self):
        r = self.client.get(self.reports_url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_doctor_sees_only_own_reports(self):
        self._auth(self.doctor)
        r = self.client.get(self.reports_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)
        self.assertEqual(r.data[0]['id'], str(self.report.id))

    def test_other_doctor_cannot_see_report(self):
        self._auth(self.other)
        r = self.client.get(self.reports_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_other_doctor_cannot_access_detail(self):
        self._auth(self.other)
        r = self.client.get(f'{self.reports_url}{self.report.id}/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_generate_report_validates_patient_ownership(self):
        self._auth(self.doctor)
        r = self.client.post(f'{self.reports_url}generate/', {
            'patient': str(self.other_patient.id),
            'consultation_date': '2026-08-06',
            'report_type': 'consultation',
            'raw_transcript': 'Patient has a headache.',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_report_auto_assigns_doctor(self):
        self._auth(self.doctor)
        r = self.client.post(self.reports_url, {
            'patient': str(self.patient.id),
            'consultation_date': '2026-08-06',
            'report_type': 'consultation',
            'subjective': 'Headache',
            'objective': 'Normal vitals',
            'assessment': 'Migraine',
            'plan': 'Rest and hydration',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['doctor_name'], 'dr_test')

    def test_update_report(self):
        self._auth(self.doctor)
        r = self.client.patch(f'{self.reports_url}{self.report.id}/', {
            'assessment': 'Tension headache',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['assessment'], 'Tension headache')

    def test_delete_report(self):
        self._auth(self.doctor)
        r = self.client.delete(f'{self.reports_url}{self.report.id}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MedicalReport.objects.count(), 0)